"""
Controls the insertion of PubMed data into a Neo4J database.
"""
import time
from queue import Queue
from threading import Thread
from typing import Optional, Final, Any

import neo4j

from app import neo4j_conn
from app.pubmed.model import DBArticle, DBJournal, DBAuthor, DBAffiliation
from app.utils import split_into_batches


class BuildCache:
    """
    Stores information that can be re-used during the database
    building to avoid having to query it twice.
    """
    def __init__(self):
        self._mesh_ids: Optional[dict[int, int]] = None

        self.max_journals_size = 2_000_000
        self._journal_ids: dict[str, int] = {}
        self._journal_id_last_access_times: dict[str, float] = {}

        self.max_authors_size = 10_000_000
        self._author_ids: dict[str, int] = {}
        self._author_id_last_access_times: dict[str, float] = {}

        self.max_affiliations_size = 2_000_000
        self._affiliation_ids: dict[str, int] = {}
        self._affiliation_id_last_access_times: dict[str, float] = {}

    def fetch_mesh_ids(self):
        """
        Fetches the IDs of all MeSH headings so that we
        don't have to query them during build.
        """
        if self._mesh_ids is not None:
            return

        with neo4j_conn.new_session() as session:
            results = session.run(
                """
                MATCH (n:MeshHeading)
                RETURN id(n), n.id
                """
            )
            mesh_ids: dict[int, int] = {}
            for record in results:
                mesh_node_id, mesh_id = record
                mesh_ids[mesh_id] = mesh_node_id

            self._mesh_ids = mesh_ids

    def get_mesh_ids(self) -> dict[int, int]:
        """
        Returns a map between MeSH IDs and their Neo4J node IDs.
        """
        if self._mesh_ids is None:
            raise Exception("MeSH IDs have not yet been fetched")

        return self._mesh_ids

    def _add(
            self,
            ids: dict[Any, int],
            dest_ids: dict[Any, int],
            dest_last_access_times: dict[Any, float],
            max_size: int):
        """
        Adds a new set of IDs to the cache, and removes old entries if the cache is full.
        """
        current_access_time = time.time()
        for key, value in ids.items():
            dest_ids[key] = value
            dest_last_access_times[key] = current_access_time

        while len(dest_ids) > max_size:
            oldest_keys: list[Any] = []
            oldest_access_time: Optional[float] = None
            for key, access_time in dest_last_access_times.items():
                if oldest_access_time is None or access_time < oldest_access_time:
                    oldest_keys.clear()
                    oldest_keys.append(key)
                    oldest_access_time = access_time
                elif access_time == oldest_access_time:
                    oldest_keys.append(key)

            if len(oldest_keys) == 0:
                raise Exception("Unexpected error occurred")

            oldest_keys = oldest_keys[:len(dest_ids) - max_size]
            for key in oldest_keys:
                del dest_ids[key]
                del dest_last_access_times[key]

    def _get(self, key: Any, dest_ids: dict[Any, int], dest_last_access_times: dict[Any, float]) -> Optional[int]:
        if key not in dest_ids:
            return None

        dest_last_access_times[key] = time.time()
        return dest_ids[key]

    def add_journal_ids(self, journal_ids: dict[str, int]):
        self._add(journal_ids, self._journal_ids, self._journal_id_last_access_times, self.max_journals_size)

    def add_author_ids(self, author_ids: dict[str, int]):
        self._add(author_ids, self._author_ids, self._author_id_last_access_times, self.max_authors_size)

    def add_affiliation_ids(self, affiliation_ids: dict[str, int]):
        self._add(
            affiliation_ids, self._affiliation_ids, self._affiliation_id_last_access_times, self.max_affiliations_size)

    def get_journal_id(self, key: str) -> Optional[int]:
        return self._get(key, self._journal_ids, self._journal_id_last_access_times)

    def get_author_id(self, key: str) -> Optional[int]:
        return self._get(key, self._author_ids, self._author_id_last_access_times)

    def get_affiliation_id(self, key: str) -> Optional[int]:
        return self._get(key, self._affiliation_ids, self._affiliation_id_last_access_times)


class BuildPacket:
    """
    Represents a packet of articles and associated data to be inserted into
    the PubMed database. This works by splitting up the insertion of data
    into independent stages. These stages depend on the previous stage,
    but each stage can be run for a new packet after it has been completed
    for the current packet. This allows pipelining the data insertion.
    """
    NUM_STAGES: Final[int] = 6

    def __init__(
            self,
            journals: dict[str, DBJournal],
            authors: dict[str, DBAuthor],
            affiliations: dict[str, DBAffiliation],
            articles: list[DBArticle]):

        self.journals: dict[str, DBJournal] = journals
        self._journal_ids: Optional[dict[str, int]] = None

        self.authors: dict[str, DBAuthor] = authors
        self._author_ids: Optional[dict[str, int]] = None

        self.affiliations: dict[str, DBAffiliation] = affiliations
        self._affiliation_ids: Optional[dict[str, int]] = None

        self.articles: list[DBArticle] = articles
        self._article_ids: Optional[list[int]] = None
        self._article_author_ids: Optional[list[list[int]]] = None

        self._stage: int = 0

    def _expect_stage(self, stage: int):
        """ Checks that we are at the correct stage before running a stage. """
        if self._stage != stage:
            raise Exception(
                f"Expected to be at stage {stage} before running stage {stage + 1}. Stage was {self._stage}")

    def _update_stage(self, new_stage: int):
        """ Updates the stage number, ensuring that we were at the correct stage beforehand. """
        self._expect_stage(new_stage - 1)
        self._stage = new_stage

    def run_stage(self, stage: int, cache: BuildCache, *, debug: bool = False):
        """ Runs the given stage for this build packet. """
        self._expect_stage(stage - 1)

        if stage == 1:
            self._stage_1_journals(cache, debug=debug)
        elif stage == 2:
            self._stage_2_authors(cache, debug=debug)
        elif stage == 3:
            self._stage_3_affiliations(cache, debug=debug)
        elif stage == 4:
            self._stage_4a_remove_old_articles(debug=debug)
            self._stage_4b_insert_articles(cache, debug=debug)
        elif stage == 5:
            self._stage_5_connect_article_authors(debug=debug)
        elif stage == 6:
            self._stage_6_affiliate_authors(debug=debug)
        else:
            raise Exception(f"Unknown stage {stage}")

        self._update_stage(stage)

    def _stage_1_journals(self, cache: BuildCache, *, debug: bool = False):
        """
        Inserts the journals into the database.
        """
        # Prepare the journal data for insertion.
        journal_ids: dict[str, int] = {}
        journal_data: list[dict] = []
        for journal in self.journals.values():
            known_id = cache.get_journal_id(journal.identifier)
            if known_id is not None:
                journal_ids[journal.identifier] = known_id
                continue

            journal_data.append({
                "id": journal.identifier,
                "title": journal.title
            })

        def run_journal_insertion_query(tx: neo4j.Transaction) -> dict[str, int]:
            """ Inserts a set of journals and returns their node IDs. """
            result = tx.run(
                """
                CYPHER planner=dp
                UNWIND $journal_data AS journal
                MERGE (journal_node:Journal {id: journal.id})
                ON CREATE
                    SET journal_node.title = journal.title
                RETURN id(journal_node)
                """,
                journal_data=journal_data
            )
            journal_ids: dict[str, int] = {}
            for data, record in zip(journal_data, result):
                journal_ids[data["id"]] = record[0]

            return journal_ids

        # Insert the journals and save their IDs.
        with neo4j_conn.new_session() as session:
            start_time = time.time()

            if len(journal_data) > 0:
                queried_journal_ids = session.write_transaction(run_journal_insertion_query)
                cache.add_journal_ids(queried_journal_ids)
                journal_ids.update(queried_journal_ids)

            self._journal_ids = journal_ids
            if debug:
                print(f".. Stage 1: Inserting journals took {time.time() - start_time:.2f} seconds")

    def _stage_2_authors(self, cache: BuildCache, *, debug: bool = False):
        """
        Inserts the authors (not ArticleAuthors) into the database.
        """
        # Prepare the author data for insertion.
        author_ids: dict[str, int] = {}
        author_data: list[dict] = []
        for author in self.authors.values():
            known_id = cache.get_author_id(author.full_name)
            if known_id is not None:
                author_ids[author.full_name] = known_id
                continue

            author_data.append({
                "name": author.full_name,
                "id": author.author_id,
                "is_collective": author.is_collective
            })

        def run_author_insertion_query(tx: neo4j.Transaction) -> dict[str, int]:
            """ Inserts a set of authors and returns their node IDs. """
            result = tx.run(
                """
                CYPHER planner=dp
                UNWIND $author_data AS author
                MERGE (author_node:Author {name: author.name})
                ON CREATE
                    SET
                        author_node.id = author.id,
                        author_node.is_collective = author.is_collective
                RETURN id(author_node)
                """,
                author_data=author_data
            )
            author_ids: dict[str, int] = {}
            for data, record in zip(author_data, result):
                author_ids[data["name"]] = record[0]

            return author_ids

        # Insert the authors and save their IDs.
        with neo4j_conn.new_session() as session:
            start_time = time.time()

            if len(author_data) > 0:
                queried_author_ids = session.write_transaction(run_author_insertion_query)
                cache.add_author_ids(queried_author_ids)
                author_ids.update(queried_author_ids)

            self._author_ids = author_ids
            if debug:
                print(f".. Stage 2: Inserting authors took {time.time() - start_time:.2f} seconds")

    def _stage_3_affiliations(self, cache: BuildCache, *, debug: bool = False):
        """
        Inserts the affiliations into the database.
        """
        # Prepare the affiliation data for insertion.
        affiliation_ids: dict[str, int] = {}
        affiliation_data: list[dict] = []
        for affiliation in self.affiliations.values():
            known_id = cache.get_affiliation_id(affiliation.name)
            if known_id is not None:
                affiliation_ids[affiliation.name] = known_id
                continue

            affiliation_data.append({
                "name": affiliation.name,
            })

        def run_affiliation_insertion_query(tx: neo4j.Transaction) -> dict[str, int]:
            """ Inserts a set of affiliations and returns their node IDs. """
            result = tx.run(
                """
                CYPHER planner=dp
                UNWIND $affiliation_data AS affiliation
                MERGE (affiliation_node:Affiliation {name: affiliation.name})
                RETURN id(affiliation_node)
                """,
                affiliation_data=affiliation_data
            )
            affiliation_ids: dict[str, int] = {}
            for data, record in zip(affiliation_data, result):
                affiliation_ids[data["name"]] = record[0]

            return affiliation_ids

        # Insert the affiliations and save their IDs.
        with neo4j_conn.new_session() as session:
            start_time = time.time()
            if len(affiliation_data) > 0:
                queried_affiliation_ids = session.write_transaction(run_affiliation_insertion_query)
                cache.add_affiliation_ids(queried_affiliation_ids)
                affiliation_ids.update(queried_affiliation_ids)

            self._affiliation_ids = affiliation_ids
            if debug:
                print(f".. Stage 3: Inserting affiliations took {time.time() - start_time:.2f} seconds")

    def _stage_4a_remove_old_articles(self, *, debug: bool = False):
        """
        Removes old articles so that we can create their new versions.
        """
        # Prepare the list of PubMed IDs for deletion.
        pmids: list[int] = []
        for article in self.articles:
            pmids.append(article.pmid)

        def run_article_deletion_query(tx: neo4j.Transaction):
            """ Deletes the articles from the pmids list. """
            tx.run(
                """
                CYPHER planner=dp
                MATCH (article_node:Article)
                WHERE article_node.pmid IN $pmids
                CALL {
                    WITH article_node
                    MATCH (article_author_node:ArticleAuthor) -[:AUTHOR_OF]-> (article_node)
                    DETACH DELETE article_author_node
                }
                DETACH DELETE article_node
                """,
                pmids=pmids
            ).consume()

        # Delete the old articles.
        with neo4j_conn.new_session() as session:
            start_time = time.time()
            session.write_transaction(run_article_deletion_query)
            if debug:
                print(f".. Stage 4a: Deleting old articles took {time.time() - start_time:.2f} seconds")

    def _stage_4b_insert_articles(self, cache: BuildCache, *, debug: bool = False, max_batch_size: int = 10_000):
        """ Inserts the articles of this packet. """
        # Prepare the article data to insert.
        article_data: list[dict] = []
        mesh_ids: dict[int, int] = cache.get_mesh_ids()
        for article in self.articles:
            journal = article.journal
            article_author_data: list[dict] = []
            for article_author in article.article_authors:
                author_id = self._author_ids[article_author.author.full_name]
                article_author_data.append({
                    "author_id": author_id,
                    "author_position": article_author.author_position,
                    "is_first_author": article_author.is_first_author,
                    "is_last_author": article_author.is_last_author
                })

            article_data.append({
                "pmid": article.pmid,
                "date": article.date,
                "title": article.title,
                "article_authors": article_author_data,
                "journal_id": self._journal_ids[journal.identifier],
                "journal_vol": journal.volume,
                "journal_issue": journal.issue,
                "refs": article.reference_pmids,
                "mesh_ids": [mesh_ids[desc_id] for desc_id in article.mesh_descriptor_ids]
            })

        # We batch the articles as otherwise we can hit maximum memory issues with Neo4J...
        article_batches = split_into_batches(article_data, max_batch_size=max_batch_size)
        article_ids, article_author_ids = [], []
        for batch_no, batch in enumerate(article_batches):
            batch_article_ids, batch_article_author_ids = self._stage_4b_insert_articles_batch(
                batch_no, len(article_batches), batch, debug=debug
            )
            article_ids.extend(batch_article_ids)
            article_author_ids.extend(batch_article_author_ids)

        self._article_ids = article_ids
        self._article_author_ids = article_author_ids

    def _stage_4b_insert_articles_batch(
            self, batch_no: int, total_batches: int, article_data: list[dict], *, debug: bool = False
    ) -> tuple[list[int], list[list[int]]]:
        """
        Inserts one batch of articles.
        """
        def run_article_creation_query(tx: neo4j.Transaction) -> tuple[list[int], list[list[int]]]:
            """
            Creates the articles and their article authors in the database,
            and returns a list of their node IDs.
            """
            result = tx.run(
                """
                CYPHER planner=dp
                UNWIND $article_data AS article
                MATCH (journal_node:Journal)
                WHERE id(journal_node) = article.journal_id
                // Create the article itself.
                CALL {
                    WITH article, journal_node
                    CREATE (article_node:Article {
                        pmid: article.pmid,
                        title: article.title,
                        date: article.date
                    }) -[:PUBLISHED_IN {
                        volume: article.journal_vol,
                        issue: article.journal_issue
                    }]-> (journal_node)
                    RETURN article_node
                }
                // Add the references from this article to other articles.
                CALL {
                    WITH article_node, article
                    UNWIND article.refs as ref_pmid
                    MATCH (ref_node:Article)
                    WHERE ref_node.pmid = ref_pmid
                    CREATE (article_node)-[:CITES]->(ref_node)
                }
                // Add the mesh headings of the article.
                CALL {
                    WITH article_node, article
                    UNWIND article.mesh_ids as mesh_id
                    MATCH (mesh_node:MeshHeading)
                    WHERE id(mesh_node) = mesh_id
                    CREATE (article_node)-[:CATEGORISED_BY]->(mesh_node)
                }
                // Add the ArticleAuthors.
                UNWIND article.article_authors AS article_author
                CREATE (article_author_node:ArticleAuthor {
                    author_position: article_author.author_position,
                    is_first_author: article_author.is_first_author,
                    is_last_author: article_author.is_last_author
                })-[:AUTHOR_OF]->(article_node)
                RETURN id(article_node), id(article_author_node)
                """,
                article_data=article_data
            )
            article_ids: list[int] = []
            article_author_ids: list[list[int]] = []

            current_article_author_list = []
            last_article_id = None
            for record in result:
                article_id, article_author_id = record
                if last_article_id is not None and article_id != last_article_id:
                    article_author_ids.append(current_article_author_list)
                    current_article_author_list = []

                last_article_id = article_id
                if article_id not in article_ids:
                    article_ids.append(article_id)
                current_article_author_list.append(article_author_id)

            if last_article_id is not None:
                article_author_ids.append(current_article_author_list)

            if len(article_ids) != len(article_author_ids):
                raise Exception(f"Something went wrong ({len(article_ids)} != {len(article_author_ids)})")

            return article_ids, article_author_ids

        # Create the articles.
        with neo4j_conn.new_session() as session:
            start_time = time.time()
            article_ids, article_author_ids = session.write_transaction(run_article_creation_query)
            if debug:
                print(
                    f".. Stage 4b (batch {batch_no + 1} / {total_batches}): "
                    f"Creating articles took {time.time() - start_time:.2f} seconds")

            return article_ids, article_author_ids

    def _stage_5_connect_article_authors(self, *, debug: bool = False, max_batch_size: int = 50_000):
        """
        Creates the ArticleAuthors for the articles in the packet.
        """
        # Prepare the article author data to insert.
        article_author_data: list[dict] = []
        for article, article_author_ids in zip(self.articles, self._article_author_ids):
            for article_author, article_author_id in zip(article.article_authors, article_author_ids):
                author_id = self._author_ids[article_author.author.full_name]
                article_author_data.append({
                    "author_id": author_id,
                    "article_author_id": article_author_id
                })

        # We batch the articles as otherwise we can hit maximum memory issues with Neo4J...
        article_author_batches = split_into_batches(article_author_data, max_batch_size)
        for batch_no, batch in enumerate(article_author_batches):
            self._stage_5_connect_article_authors_batch(
                batch_no, len(article_author_batches), batch, debug=debug
            )

    def _stage_5_connect_article_authors_batch(
            self, batch_no: int, total_batches: int, article_author_data: list[dict], *, debug: bool = False):
        """
        Creates the IS_AUTHOR relationships between ArticleAuthors and Authors.
        """
        def run_article_author_connect_query(tx: neo4j.Transaction):
            """
            Creates the article authors in the database, and returns
            a list of their node IDs for each article.
            """
            tx.run(
                """
                CYPHER planner=dp
                UNWIND $article_author_data AS article_author
                MATCH (article_author_node:ArticleAuthor)
                WHERE id(article_author_node) = article_author.article_author_id
                MATCH (author_node:Author)
                WHERE id(author_node) = article_author.author_id
                CREATE (author_node)-[:IS_AUTHOR]->(article_author_node)
                """,
                article_author_data=article_author_data
            ).consume()

        # Create the article authors.
        with neo4j_conn.new_session() as session:
            start_time = time.time()
            session.write_transaction(run_article_author_connect_query)
            if debug:
                print(
                    f".. Stage 5 (batch {batch_no + 1} / {total_batches}): "
                    f"Connecting article authors to authors took {time.time() - start_time:.2f} seconds")

    def _stage_6_affiliate_authors(self, *, debug: bool = False, max_batch_size: int = 50_000):
        """
        Creates the affiliation relationships between ArticleAuthors and Affiliations.
        """
        # Prepare the list of PubMed IDs for deletion.
        affiliation_data: list[dict] = []
        for article, article_author_ids in zip(self.articles, self._article_author_ids):
            for article_author, article_author_id in zip(article.article_authors, article_author_ids):
                if article_author.affiliation is None:
                    continue

                affiliation_id = self._affiliation_ids[article_author.affiliation.name]
                affiliation_data.append({
                    "article_author_id": article_author_id,
                    "affiliation_id": affiliation_id
                })

        # We batch the articles as otherwise we can hit maximum memory issues with Neo4J...
        affiliation_batches = split_into_batches(affiliation_data, max_batch_size)
        for batch_no, batch in enumerate(affiliation_batches):
            self._stage_6_affiliate_authors_batch(
                batch_no, len(affiliation_batches), batch, debug=debug
            )

    def _stage_6_affiliate_authors_batch(
            self, batch_no: int, total_batches: int, affiliation_data: list[dict], *, debug: bool = False):
        """
        Inserts one batch of article authors.
        """
        def run_affiliate_authors_query(tx: neo4j.Transaction):
            """ Creates the affiliation relationships between authors and affiliations. """
            tx.run(
                """
                CYPHER planner=dp
                UNWIND $affiliation_data AS affiliation
                MATCH (article_author_node:ArticleAuthor)
                WHERE id(article_author_node) = affiliation.article_author_id
                MATCH (affiliation_node:Affiliation)
                WHERE id(affiliation_node) = affiliation.affiliation_id
                CREATE (article_author_node)-[:AFFILIATED_WITH]->(affiliation_node)
                """,
                affiliation_data=affiliation_data
            ).consume()

        # Affiliate authors.
        with neo4j_conn.new_session() as session:
            start_time = time.time()
            session.write_transaction(run_affiliate_authors_query)
            if debug:
                print(
                    f".. Stage 6 (batch {batch_no + 1} / {total_batches}): "
                    f"Affiliating authors took {time.time() - start_time:.2f} seconds")

    @staticmethod
    def prepare(articles: list[DBArticle]) -> 'BuildPacket':
        """
        Prepares a build packet for inserting the given articles into the database.
        """
        seen_pmids: set[int] = set()
        deduplicated_articles: list[DBArticle] = []
        for article in articles:
            # Articles with no authors breaks the insertion of article authors.
            if len(article.article_authors) == 0:
                continue

            if article.pmid in seen_pmids:
                # Remove the old article with the same PMID.
                deduplicated_articles = [a for a in deduplicated_articles if a.pmid != article.pmid]
            else:
                seen_pmids.add(article.pmid)

            deduplicated_articles.append(article)
        articles = deduplicated_articles

        journals: dict[str, DBJournal] = {}
        for article in articles:
            journal = article.journal
            if journal.identifier not in journals:
                journals[journal.identifier] = journal

        authors: dict[str, DBAuthor] = {}
        for index, article in enumerate(articles):
            for article_author in article.article_authors:
                author = article_author.author
                if author.full_name not in authors:
                    authors[author.full_name] = author

        affiliations: dict[str, DBAffiliation] = {}
        for index, article in enumerate(articles):
            for article_author in article.article_authors:
                affiliation = article_author.affiliation
                if affiliation is not None and affiliation.name not in affiliations:
                    affiliations[affiliation.name] = affiliation

        return BuildPacket(journals, authors, affiliations, articles)


class BuildPipelineStage:
    """
    Performs a single stage in a build pipeline.
    """
    def __init__(
            self, stage: int, cache: BuildCache,
            input_queue: Queue[Optional[tuple[int, BuildPacket]]],
            *, output_queue_size=1, debug: bool = False):

        self.stage: int = stage
        self.cache: BuildCache = cache
        self.debug: bool = debug
        self.input_queue: Queue[Optional[tuple[int, BuildPacket]]] = input_queue
        self.output_queue: Queue[Optional[tuple[int, BuildPacket]]] = Queue(output_queue_size)
        self.thread: Optional[Thread] = None
        self.utilisation_metrics: list[float] = []

    def start(self):
        def do_run():
            self.run()

        self.cache.fetch_mesh_ids()
        self.thread = Thread(target=do_run)
        self.thread.daemon = True
        self.thread.start()

    def run(self):
        while True:
            wait_start = time.time()
            id_and_packet = self.input_queue.get()
            wait_duration = time.time() - wait_start

            if id_and_packet is not None:
                process_start = time.time()
                packet_id, packet = id_and_packet
                if self.debug:
                    print(f"Stage {self.stage}: Receive {packet_id}")

                packet.run_stage(self.stage, self.cache, debug=self.debug)
                if self.debug:
                    print(f"Stage {self.stage}: Complete {packet_id}")
                process_duration = time.time() - process_start

                wait_start = time.time()
                self.output_queue.put(id_and_packet)
                wait_duration += time.time() - wait_start

                if process_duration + wait_duration > 0:
                    self.utilisation_metrics.append(process_duration / (process_duration + wait_duration))
            else:
                self.output_queue.put(None)
                break

    def get_utilisation(self, *, window: int = 10) -> float:
        """ Gets the percentage of time that this pipeline stage is working. """
        metric_sum = 0
        metric_count = 0
        for metric in self.utilisation_metrics[-window:]:
            metric_sum += metric
            metric_count += 1

        return metric_sum / max(1, metric_count)


class BuildPipeline:
    """
    Starts and manages feeding packets of articles through
    a pipeline to insert them into the database.
    """
    def __init__(self, *, queue_size=1, debug: bool = False):
        self._input_queue: Queue[Optional[tuple[int, BuildPacket]]] = Queue(queue_size)
        self.stages: list[BuildPipelineStage] = []
        self.cache: BuildCache = BuildCache()

        # Create the pipeline stages.
        next_input_queue = self._input_queue
        for stage in range(1, BuildPacket.NUM_STAGES + 1):
            output_queue_size = (0 if stage == BuildPacket.NUM_STAGES else queue_size)
            pipeline_stage = BuildPipelineStage(
                stage, self.cache, next_input_queue,
                output_queue_size=output_queue_size,
                debug=debug
            )
            next_input_queue = pipeline_stage.output_queue
            self.stages.append(pipeline_stage)

        self.output_queue = self.stages[-1].output_queue

    def start(self):
        self.cache.fetch_mesh_ids()
        for stage in self.stages:
            stage.start()

    def push(self, packet_id: int, articles: list[DBArticle]):
        """ Pushes a new packet of articles into the pipeline. """
        packet = BuildPacket.prepare(articles)
        self._input_queue.put((packet_id, packet))

    def finish(self):
        """ Pushes None into the pipeline to signal to all stages to stop. """
        self._input_queue.put(None)

    def get_utilisation_str(self) -> str:
        """ Returns a string reporting the utilisation of each pipeline stage. """
        return " -> ".join(f"{100 * stage.get_utilisation():.0f}%" for stage in self.stages)
