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
from app.utils import split_into_batches, flush_print


class BuildCache:
    """
    Stores information that can be re-used during the database
    building to avoid having to query it twice.
    """
    def __init__(self):
        self._mesh_ids: Optional[dict[int, int]] = None

        self.max_journals_size = 1_000_000
        self._journal_ids: list[dict[str, int]] = []

        self.max_authors_size = 5_000_000
        self._author_ids: list[dict[str, int]] = []

        self.max_affiliations_size = 1_000_000
        self._affiliation_ids: list[dict[str, int]] = []

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

    def _count_items(self, ids: list[dict[Any, int]]) -> int:
        count = 0
        for id_dict in ids:
            count += len(id_dict)

        return count

    def _add(self, ids: dict[Any, int], dest_ids: list[dict[Any, int]], max_size: int):
        """
        Adds a new set of IDs to the cache, and removes old entries if the cache is full.
        """
        dest_ids.append(ids)
        while len(dest_ids) > 1 and self._count_items(dest_ids) > max_size:
            del dest_ids[0]

    def _get(self, key: Any, dest_ids: list[dict[Any, int]]) -> Optional[int]:
        if len(dest_ids) == 0:
            return None

        # If it's in the latest set of IDs, then we don't need to move the value if we find it.
        latest_id_dict = dest_ids[-1]
        value = latest_id_dict.get(key)
        if value is not None:
            return value

        # Look for the value in the rest of the ID dictionaries.
        for index in reversed(range(0, len(dest_ids) - 1)):
            id_dict = dest_ids[index]
            value = id_dict.get(key)
            if value is None:
                continue

            # Move the value to the latest ID set.
            del id_dict[key]
            latest_id_dict[key] = value
            return value

        return None

    def add_journal_ids(self, journal_ids: dict[str, int]):
        self._add(journal_ids, self._journal_ids, self.max_journals_size)

    def add_author_ids(self, author_ids: dict[str, int]):
        self._add(author_ids, self._author_ids, self.max_authors_size)

    def add_affiliation_ids(self, affiliation_ids: dict[str, int]):
        self._add(
            affiliation_ids, self._affiliation_ids, self.max_affiliations_size)

    def get_journal_id(self, key: str) -> Optional[int]:
        return self._get(key, self._journal_ids)

    def get_author_id(self, key: str) -> Optional[int]:
        return self._get(key, self._author_ids)

    def get_affiliation_id(self, key: str) -> Optional[int]:
        return self._get(key, self._affiliation_ids)


class BuildPacket:
    """
    Represents a packet of articles and associated data to be inserted into
    the PubMed database. This works by splitting up the insertion of data
    into independent stages. These stages depend on the previous stage,
    but each stage can be run for a new packet after it has been completed
    for the current packet. This allows pipelining the data insertion.
    """
    NUM_STAGES: Final[int] = 3

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

        self._orphaned_article_author_ids: Optional[list[int]] = None

        self.articles: list[DBArticle] = articles
        self._article_ids: Optional[list[int]] = None
        self._article_author_ids: Optional[list[list[int]]] = None

        self._stage: int = 0

    def ensure_completed(self):
        """ Raises an exception if this packet has not finished being processed. """
        self._expect_stage(BuildPacket.NUM_STAGES)

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
            self._stage_1a_journals(cache, debug=debug)
            self._stage_1b_authors(cache, debug=debug)
            self._stage_1c_affiliations(cache, debug=debug)
        elif stage == 2:
            self._stage_2a_remove_old_articles(debug=debug)
            self._stage_2b_insert_articles(cache, debug=debug)
        elif stage == 3:
            self._stage_3a_connect_article_authors(debug=debug)
            self._stage_3b_affiliate_authors(debug=debug)
            self._stage_3c_delete_orphaned_article_authors(debug=debug)
        else:
            raise Exception(f"Unknown stage {stage}")

        self._update_stage(stage)

    def _stage_1a_journals(self, cache: BuildCache, *, debug: bool = False):
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
            if debug:
                flush_print(f".. Stage 1a: Inserting journals... ({len(journal_data)} journals)")

            start_time = time.time()

            if len(journal_data) > 0:
                queried_journal_ids = session.write_transaction(run_journal_insertion_query)
                cache.add_journal_ids(queried_journal_ids)
                journal_ids.update(queried_journal_ids)

            self._journal_ids = journal_ids

            if debug:
                flush_print(f".. Stage 1a: Inserting journals took {time.time() - start_time:.2f} seconds")

    def _stage_1b_authors(self, cache: BuildCache, *, debug: bool = False):
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
            if debug:
                flush_print(f".. Stage 1b: Inserting authors... ({len(author_data)} authors)")

            start_time = time.time()

            if len(author_data) > 0:
                queried_author_ids = session.write_transaction(run_author_insertion_query)
                cache.add_author_ids(queried_author_ids)
                author_ids.update(queried_author_ids)

            self._author_ids = author_ids

            if debug:
                flush_print(f".. Stage 1b: Inserting authors took {time.time() - start_time:.2f} seconds")

    def _stage_1c_affiliations(self, cache: BuildCache, *, debug: bool = False):
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
            if debug:
                flush_print(f".. Stage 1c: Inserting affiliations... ({len(affiliation_data)} affiliations)")

            start_time = time.time()
            if len(affiliation_data) > 0:
                queried_affiliation_ids = session.write_transaction(run_affiliation_insertion_query)
                cache.add_affiliation_ids(queried_affiliation_ids)
                affiliation_ids.update(queried_affiliation_ids)

            self._affiliation_ids = affiliation_ids

            if debug:
                flush_print(f".. Stage 1c: Inserting affiliations took {time.time() - start_time:.2f} seconds")

    def _stage_2a_remove_old_articles(self, *, debug: bool = False, max_batch_size: int = 1_000):
        """
        Removes old articles so that we can create their new versions.
        """
        # Prepare the list of PubMed IDs for deletion.
        pmids: list[int] = []
        for article in self.articles:
            pmids.append(article.pmid)

        def run_collect_articles_to_delete_query(session: neo4j.Session) -> tuple[list[int], list[int]]:
            """ Fetches all articles and article authors to delete from the pmids list. """
            results = session.run(
                """
                CYPHER planner=dp
                MATCH (article_node:Article)
                WHERE article_node.pmid IN $pmids
                CALL {
                    WITH article_node
                    MATCH (article_author_node:ArticleAuthor) -[:AUTHOR_OF]-> (article_node)
                    RETURN COLLECT(id(article_author_node)) AS orphan_article_author_ids
                }
                RETURN id(article_node) AS article_id, orphan_article_author_ids
                """,
                pmids=pmids
            )
            article_ids: list[int] = []
            orphaned_article_author_ids: list[int] = []
            for record in results:
                article_id, orphaned_ids = record
                article_ids.append(article_id)
                orphaned_article_author_ids.extend(orphaned_ids)

            return article_ids, orphaned_article_author_ids

        # Collect the articles to delete.
        with neo4j_conn.new_session() as session:
            if debug:
                flush_print(f".. Stage 2a: Finding old articles...")

            start_time = time.time()
            article_ids, orphaned_article_author_ids = session.write_transaction(run_collect_articles_to_delete_query)
            self._orphaned_article_author_ids = orphaned_article_author_ids

            if debug:
                flush_print(f".. Stage 2a: Finding old articles took {time.time() - start_time:.2f} seconds")

        # We batch the articles as otherwise we can hit maximum memory issues with Neo4J...
        article_batches = split_into_batches(article_ids, max_batch_size=max_batch_size)
        for batch_no, batch in enumerate(article_batches):
            self._stage_2a_remove_old_articles_batch(
                batch_no, len(article_batches), batch, debug=debug
            )

    def _stage_2a_remove_old_articles_batch(
            self, batch_no: int, total_batches: int, article_ids: list[int], *, debug: bool = False):
        """
        Deletes one batch of articles.
        """
        def run_article_deletion_query(tx: neo4j.Transaction):
            """ Deletes the articles. """
            tx.run(
                """
                CYPHER planner=dp
                UNWIND $article_ids AS article_id
                MATCH (article_node:Article)
                WHERE id(article_node) = article_id
                DETACH DELETE article_node
                """,
                article_ids=article_ids
            ).consume()

        # Delete the old article authors.
        with neo4j_conn.new_session() as session:
            if debug:
                flush_print(
                    f".. Stage 2a (batch {batch_no + 1} / {total_batches}): "
                    f"Deleting old articles... ({len(article_ids)} articles)"
                )

            start_time = time.time()
            session.write_transaction(run_article_deletion_query)

            if debug:
                flush_print(
                    f".. Stage 2a (batch {batch_no + 1} / {total_batches}): "
                    f"Deleting old articles took {time.time() - start_time:.2f} seconds"
                )

    def _stage_2b_insert_articles(self, cache: BuildCache, *, debug: bool = False, max_batch_size: int = 8_000):
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
            batch_article_ids, batch_article_author_ids = self._stage_2b_insert_articles_batch(
                batch_no, len(article_batches), batch, debug=debug
            )
            article_ids.extend(batch_article_ids)
            article_author_ids.extend(batch_article_author_ids)

        self._article_ids = article_ids
        self._article_author_ids = article_author_ids

    def _stage_2b_insert_articles_batch(
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
            if debug:
                flush_print(
                    f".. Stage 2b (batch {batch_no + 1} / {total_batches}): "
                    f"Creating articles... ({len(article_data)} articles)"
                )

            start_time = time.time()
            article_ids, article_author_ids = session.write_transaction(run_article_creation_query)

            if debug:
                flush_print(
                    f".. Stage 2b (batch {batch_no + 1} / {total_batches}): "
                    f"Creating articles took {time.time() - start_time:.2f} seconds"
                )

            return article_ids, article_author_ids

    def _stage_3a_connect_article_authors(self, *, debug: bool = False, max_batch_size: int = 30_000):
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
            self._stage_3a_connect_article_authors_batch(
                batch_no, len(article_author_batches), batch, debug=debug
            )

    def _stage_3a_connect_article_authors_batch(
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
            if debug:
                flush_print(
                    f".. Stage 3a (batch {batch_no + 1} / {total_batches}): "
                    f"Connecting article authors... ({len(article_author_data)} article authors)"
                )

            start_time = time.time()
            session.write_transaction(run_article_author_connect_query)

            if debug:
                flush_print(
                    f".. Stage 3a (batch {batch_no + 1} / {total_batches}): "
                    f"Connecting article authors to authors took {time.time() - start_time:.2f} seconds"
                )

    def _stage_3b_affiliate_authors(self, *, debug: bool = False, max_batch_size: int = 10_000):
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
            self._stage_3b_affiliate_authors_batch(
                batch_no, len(affiliation_batches), batch, debug=debug
            )

    def _stage_3b_affiliate_authors_batch(
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
            if debug:
                flush_print(
                    f".. Stage 3b (batch {batch_no + 1} / {total_batches}): "
                    f"Affiliating authors... ({len(affiliation_data)} affiliations)"
                )

            start_time = time.time()
            session.write_transaction(run_affiliate_authors_query)

            if debug:
                flush_print(
                    f".. Stage 3b (batch {batch_no + 1} / {total_batches}): "
                    f"Affiliating authors took {time.time() - start_time:.2f} seconds")

    def _stage_3c_delete_orphaned_article_authors(self, *, debug: bool = False, max_batch_size: int = 10_000):
        """
        Removes old article authors from deleted articles.
        """
        # Get the list of article author IDs for deletion.
        orphaned_article_author_ids: list[int] = self._orphaned_article_author_ids

        # We batch the article authors as otherwise we can hit maximum memory issues with Neo4J...
        article_author_batches = split_into_batches(orphaned_article_author_ids, max_batch_size)
        for batch_no, batch in enumerate(article_author_batches):
            self._stage_3c_delete_orphaned_article_authors_batch(
                batch_no, len(article_author_batches), batch, debug=debug
            )

    def _stage_3c_delete_orphaned_article_authors_batch(
            self, batch_no: int, total_batches: int, orphaned_article_author_ids: list[int], *, debug: bool = False):
        """
        Removes one batch of old article authors.
        """
        def run_article_author_deletion_query(tx: neo4j.Transaction):
            """ Deletes the article authors. """
            tx.run(
                """
                CYPHER planner=dp
                UNWIND $orphaned_article_author_ids AS article_author_id
                MATCH (article_author_node:ArticleAuthor)
                WHERE id(article_author_node) = article_author_id
                DETACH DELETE article_author_node
                """,
                orphaned_article_author_ids=orphaned_article_author_ids
            ).consume()

        # Delete the old article authors.
        with neo4j_conn.new_session() as session:
            if debug:
                flush_print(
                    f".. Stage 3c (batch {batch_no + 1} / {total_batches}): "
                    f"Deleting old article authors... ({len(orphaned_article_author_ids)} article authors)"
                )

            start_time = time.time()
            session.write_transaction(run_article_author_deletion_query)

            if debug:
                flush_print(
                    f".. Stage 3c (batch {batch_no + 1} / {total_batches}): "
                    f"Deleting old article authors took {time.time() - start_time:.2f} seconds"
                )

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
            self, cache: BuildCache,
            input_queue: Queue[Optional[tuple[int, BuildPacket]]],
            *, output_queue_size=1, debug: bool = False):

        self.cache: BuildCache = cache
        self.debug: bool = debug
        self.input_queue: Queue[Optional[tuple[int, BuildPacket]]] = input_queue
        self.output_queue: Queue[Optional[tuple[int, BuildPacket]]] = Queue(output_queue_size)
        self.thread: Optional[Thread] = None
        self.utilisation_metrics: list[float] = []

    def process(self, id_and_packet: Optional[tuple[int, BuildPacket]]) -> list[Optional[tuple[int, BuildPacket]]]:
        """ Override to process a packet in the pipeline. """
        raise NotImplementedError(f"The process method has not been defined for {type(self).__name__}")

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
            input_id_and_packet = self.input_queue.get()
            wait_duration = time.time() - wait_start

            process_start = time.time()
            output_id_and_packets = self.process(input_id_and_packet)
            process_duration = time.time() - process_start

            wait_start = time.time()
            for output_id_and_packet in output_id_and_packets:
                self.output_queue.put(output_id_and_packet)
            wait_duration += time.time() - wait_start

            if process_duration + wait_duration > 0:
                self.utilisation_metrics.append(process_duration / (process_duration + wait_duration))

    def get_utilisation(self, *, window: int = 10) -> float:
        """ Gets the percentage of time that this pipeline stage is working. """
        metric_sum = 0
        metric_count = 0
        for metric in self.utilisation_metrics[-window:]:
            metric_sum += metric
            metric_count += 1

        return metric_sum / max(1, metric_count)


class BuildPipelineFilterStage(BuildPipelineStage):
    """
    Filters a window of packets to remove articles that are included
    more than once in nearby packets. This is important due to the
    way that we use multiple threads to delete and insert the articles
    into the database. If an article shows up twice in close packets,
    then it may attempt to delete and insert the same article at the
    same time, which can cause a deadlock. This avoids that issue by
    filtering out all articles that are added in close future packets.
    This seems to be only a big issue for the daily update files.
    """
    def __init__(
            self, window_size: int, cache: BuildCache,
            input_queue: Queue[Optional[tuple[int, BuildPacket]]],
            *, output_queue_size=1, debug: bool = False):

        super().__init__(cache, input_queue, output_queue_size=output_queue_size, debug=debug)
        self.window_size: int = window_size
        self.window: list[tuple[int, BuildPacket]] = []

    def _filter(self, packet: BuildPacket) -> tuple[int, BuildPacket]:
        """
        Removes all articles in the build packet that exist in any
        packet in the window.
        """
        # Create a set of all the article PMIDs in the packets in the window.
        window_pmids: set[int] = set()
        for _, other_packet in self.window:
            for article in other_packet.articles:
                window_pmids.add(article.pmid)

        # Remove articles from the packet that contain any articles with the
        # same PMIDs as articles in other packets in the window.
        filtered_articles = list(filter(lambda a: a.pmid not in window_pmids, packet.articles))
        removed_articles_count = len(packet.articles) - len(filtered_articles)
        return removed_articles_count, BuildPacket.prepare(filtered_articles)

    def _take(self) -> tuple[int, tuple[int, BuildPacket]]:
        """
        Removes, filters, and returns the next build packet.
        """
        if len(self.window) == 0:
            raise ValueError("No remaining packets")

        packet_id, input_packet = self.window.pop(0)
        removed_articles_count, output_packet = self._filter(input_packet)
        return removed_articles_count, (packet_id, output_packet)

    def process(
            self, input_id_and_packet: Optional[tuple[int, BuildPacket]]
    ) -> list[Optional[tuple[int, BuildPacket]]]:
        """
        Adds the input packet to the window of packets, filters the next packet to be removed from
        the packet, and returns it if applicable.
        """
        # Filter and return all remaining packets at the end of the queue.
        if input_id_and_packet is None:
            output: list[Optional[tuple[int, BuildPacket]]] = []
            removed_articles_count = 0
            while len(self.window) > 0:
                packet_removed_articles_count, output_id_and_packet = self._take()
                removed_articles_count += packet_removed_articles_count
                output.append(output_id_and_packet)

            output.append(None)
            if self.debug:
                flush_print(
                    f"Filter Stage: Complete and output {len(output) - 1} packets" +
                    (" (packet\\s " + ", ".join([str(t[0]) for t in output[:-1]]) + ")" if len(output) > 1 else "") +
                    (f" with {removed_articles_count} articles filtered away" if removed_articles_count > 0 else "")
                )

            return output

        # Add the packet to the end of the window.
        self.window.append(input_id_and_packet)

        # If the window is not full, return no items.
        if len(self.window) < self.window_size:
            if self.debug:
                flush_print(f"Filter Stage: Append packet {input_id_and_packet[0]} to window")
            return []

        # Return the packet at the front of the window.
        removed_articles_count, output_id_and_packet = self._take()
        if self.debug:
            flush_print(
                f"Filter Stage: Append packet {input_id_and_packet[0]} to window, "
                f"output packet {output_id_and_packet[0]}" +
                (f" with {removed_articles_count} articles filtered away" if removed_articles_count > 0 else "")
            )

        return [output_id_and_packet]


class BuildPipelineProcessingStage(BuildPipelineStage):
    """
    Performs a processing stage in the build pipeline.
    """
    def __init__(
            self, stage: int, cache: BuildCache,
            input_queue: Queue[Optional[tuple[int, BuildPacket]]],
            *, output_queue_size=1, debug: bool = False):

        super().__init__(cache, input_queue, output_queue_size=output_queue_size, debug=debug)
        self.stage: int = stage

    def process(self, id_and_packet: Optional[tuple[int, BuildPacket]]) -> list[Optional[tuple[int, BuildPacket]]]:
        """
        Performs one or all stages of packet processing.
        """
        if id_and_packet is None:
            return [None]

        packet_id, packet = id_and_packet
        if self.debug:
            flush_print(f"Stage {self.stage}: Receive {packet_id}")

        if self.stage >= 0:
            packet.run_stage(self.stage, self.cache, debug=self.debug)
        else:
            # Careful mode: run all stages in a single thread.
            for stage in range(1, BuildPacket.NUM_STAGES + 1):
                packet.run_stage(stage, self.cache, debug=self.debug)

        if self.debug:
            flush_print(f"Stage {self.stage}: Complete {packet_id}")

        return [id_and_packet]


class BuildPipeline:
    """
    Starts and manages feeding packets of articles through
    a pipeline to insert them into the database.
    """
    def __init__(self, *, queue_size=1, debug: bool = False, careful: bool = False):
        self._input_queue: Queue[Optional[tuple[int, BuildPacket]]] = Queue(queue_size)
        self.stages: list[BuildPipelineStage] = []
        self.cache: BuildCache = BuildCache()

        # Create the pipeline stages.
        filter_stage = BuildPipelineFilterStage(
            BuildPacket.NUM_STAGES, self.cache, self._input_queue,
            output_queue_size=queue_size, debug=debug
        )
        self.stages.append(filter_stage)
        if not careful:
            # Use a thread per processing stage.
            next_input_queue = filter_stage.output_queue
            for stage in range(1, BuildPacket.NUM_STAGES + 1):
                pipeline_stage = BuildPipelineProcessingStage(
                    stage, self.cache, next_input_queue,
                    output_queue_size=queue_size, debug=debug
                )
                next_input_queue = pipeline_stage.output_queue
                self.stages.append(pipeline_stage)
        else:
            # Only use one thread for processing in careful mode.
            self.stages.append(BuildPipelineProcessingStage(
                -1, self.cache, filter_stage.output_queue,
                output_queue_size=queue_size, debug=debug
            ))

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
