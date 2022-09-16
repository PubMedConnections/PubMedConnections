"""
Allows dumping data into SQLite to speed up iteration
over the ~33 million records.
"""
import datetime
import time
from typing import Optional

import atomics
import neo4j
from app.pubmed.model import Article, DBMetadata, MeSHHeading, Author, ArticleAuthorRelation
from config import NEO4J_URI, NEO4J_REQUIRES_AUTH


class IdCounter:
    """
    Increments IDs to use for database nodes. This is a bit dodgy,
    but we only ever add to the database from one process, so it
    should be fine. This is required as Neo4J does not have its
    own auto-incrementing IDs.
    """
    id: atomics.atomic = atomics.atomic(width=4, atype=atomics.INT)

    def __init__(self, initial_id: int = None):
        if initial_id is not None:
            self.id.store(initial_id)

    def next(self) -> int:
        return self.id.fetch_inc()


class PubMedCacheConn:
    """
    Can be used to connect to the pubmed cache Neo4J database.
    """
    def __init__(self, database: Optional[str] = None):
        self.database: Optional[str] = database
        self.driver: Optional[neo4j.Driver] = None

        # We store metadata about the database within a Metadata node.
        self.metadata: Optional[DBMetadata] = None

        # We maintain our own counters for the IDs of authors. This is required as we
        # cannot trust the IDs generated by Neo4J as they can change, nor the IDs from
        # PubMed as they often don't exist.
        self.author_id_counter: Optional[IdCounter] = None

        # We cache the MeSH headings, as they should almost never change.
        self._mesh_headings: Optional[list[MeSHHeading]] = None

    def clear_cached_mesh_headings(self):
        """
        Clears the cached MeSH headings.
        """
        self._mesh_headings = None

    def __enter__(self):
        if self.driver is not None:
            raise ValueError("Already created connection!")

        if NEO4J_REQUIRES_AUTH:
            from config import NEO4J_USER, NEO4J_PASSWORD
            self.driver = neo4j.GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD), max_connection_lifetime=1000 * 60 * 60 * 24)
        else:
            self.driver = neo4j.GraphDatabase.driver(NEO4J_URI, max_connection_lifetime=1000 * 60 * 60 * 24)

        # Create a connection to the database to create its constraints and grab metadata.
        with self.new_session() as session:
            self._create_constraints(session)
            self._fetch_metadata(session)

        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.driver is None:
            return

        self.driver.close()
        self.driver = None

    def new_session(self) -> neo4j.Session:
        return self.driver.session(database=self.database)

    def _create_constraints(self, session: neo4j.Session):
        """
        This method creates all the constraints required for the database.
        Uniqueness constraints implicitly create an index for the constraint as well.
        """

        # MeSH Headings.
        session.run(
            "CREATE CONSTRAINT unique_mesh_heading_ids IF NOT EXISTS "
            "FOR (h:MeshHeading) REQUIRE h.id IS UNIQUE"
        ).consume()

        # Authors.
        session.run(
            "CREATE CONSTRAINT unique_author_names IF NOT EXISTS "
            "FOR (a:Author) REQUIRE a.name IS UNIQUE"
        ).consume()
        session.run(
            "CREATE CONSTRAINT unique_author_ids IF NOT EXISTS "
            "FOR (a:Author) REQUIRE a.id IS UNIQUE"
        ).consume()

        # Journals.
        session.run(
            "CREATE CONSTRAINT unique_journal_ids IF NOT EXISTS "
            "FOR (j:Journal) REQUIRE j.id IS UNIQUE"
        ).consume()

        # Articles.
        session.run(
            "CREATE CONSTRAINT unique_article_pmids IF NOT EXISTS "
            "FOR (a:Article) REQUIRE a.pmid IS UNIQUE"
        ).consume()

        # We don't want to start inserting data until the indices are created.
        session.run("CALL db.awaitIndexes").consume()

    def _fetch_metadata(self, session: neo4j.Session):
        """
        Fetches the values to use for the author and article counters from the database.
        """
        self.author_id_counter = IdCounter(self._fetch_max_id(session, "Author") + 1)

    def _fetch_max_id(self, session: neo4j.Session, label: str) -> int:
        """
        Fetches the maximum ID of any nodes matching the given label, or 0 if no nodes could be found.
        """
        result = session.run(
            """
            MATCH (n:{})
            RETURN max(n.id)
            """.format(label)
        ).single()[0]

        # If there are no nodes, then None will be returned.
        return 0 if result is None else result

    def insert_article_batch(self, articles: list[Article], *, max_batch_size=10000):
        """
        Inserts a batch of articles into the database, including their authors.
        """
        if len(articles) == 0:
            return

        # We batch the articles as otherwise we can hit maximum memory issues with Neo4J...
        required_batches = (len(articles) + max_batch_size - 1) // max_batch_size
        articles_per_batch = (len(articles) + required_batches - 1) // required_batches
        total_articles_inserted = 0
        for batch_no in range(required_batches):
            start_index = batch_no * articles_per_batch
            end_index = len(articles) if batch_no == required_batches - 1 else (batch_no + 1) * articles_per_batch
            batch = articles[start_index:end_index]
            total_articles_inserted += len(batch)
            with self.new_session() as session:
                session.write_transaction(self._insert_article_batch, batch)

        # Just to be sure...
        assert total_articles_inserted == len(articles)

    def _insert_article_batch(self, tx: neo4j.Transaction, articles: list[Article]):
        """
        Inserts a batch of articles into the database, including their authors.
        """
        articles_data = []
        for article in articles:
            author_relations = []
            for author_relation in article.author_relations:
                author = author_relation.author
                author_relations.append({
                    "author": {
                        "id": self.author_id_counter.next(),
                        "name": author.full_name,
                        "is_collective": author.is_collective
                    },
                    "author_position": author_relation.author_position,
                    "is_first_author": author_relation.is_first_author,
                    "is_last_author": author_relation.is_last_author
                })

            journal = article.journal
            articles_data.append({
                "pmid": article.pmid,
                "date": article.date,
                "title": article.title,
                "journal": {
                    "id": journal.identifier,
                    "title": journal.title,
                    "volume": journal.non_null_volume,
                    "issue": journal.non_null_issue
                },
                "author_relations": author_relations,
                "refs": article.reference_pmids,
                "mesh_desc_ids": article.mesh_descriptor_ids
            })

        tx.run(
            """
            CYPHER planner=dp
            
            // Loop through all the articles we want to insert.
            UNWIND $articles AS article
            WITH article, article.journal as journal, article.author_relations as author_relations

                // Make sure the journal exists.
                CALL {
                    WITH journal
                    MERGE (journal_node:Journal {id: journal.id})
                    ON CREATE
                        SET journal_node.title = journal.title
                    RETURN journal_node
                }

                // Insert the article.
                CALL {
                    WITH article
                    MERGE (article_node:Article {pmid: article.pmid})
                    ON CREATE
                        SET
                            article_node.title = article.title,
                            article_node.date = article.date
                    ON MATCH
                        SET
                            article_node.title = article.title,
                            article_node.date = article.date
                    RETURN article_node
                }
                
                // If there was already an old version of the article,
                // then delete any relationships that it had.
                CALL {
                    WITH article_node
                    MATCH (article_node) -[r]-> ()
                    DELETE r
                }
                CALL {
                    WITH article_node
                    MATCH () -[r]-> (article_node)
                    DELETE r
                }

                // Add the journal of the article.
                CALL {
                    WITH article_node, journal_node, journal
                    CREATE (article_node)-[:PUBLISHED_IN {
                        volume: journal.volume,
                        issue: journal.issue
                    }]->(journal_node)
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
                    UNWIND article.mesh_desc_ids as mesh_id
                    MATCH (mesh_node:MeshHeading)
                    WHERE mesh_node.id = mesh_id
                    CREATE (article_node)-[:CATEGORISED_BY]->(mesh_node)
                }

            // Add all of the authors of the article.
            UNWIND author_relations AS author_relation
            WITH article_node, author_relation, author_relation.author AS author
                CALL {
                    WITH author
                    MERGE (author_node:Author {name: author.name})
                    ON CREATE
                        SET
                            author_node.id = author.id,
                            author_node.is_collective = author.is_collective
                    RETURN author_node
                }
                CREATE (author_node)-[:AUTHOR_OF {
                    author_position: author_relation.author_position,
                    is_first_author: author_relation.is_first_author,
                    is_last_author: author_relation.is_last_author
                }]->(article_node)
            """,
            articles=articles_data
        ).consume()

    @staticmethod
    def read_author_node(node: neo4j.graph.Node) -> Author:
        """ Reads an author node into an Author model object. """
        return Author(
            node["name"],
            node["is_collective"],
            author_id=node["id"]
        )

    @staticmethod
    def read_article_node(node: neo4j.graph.Node) -> Article:
        """ Reads an article node into an Article model object. """
        return Article(
            node["pmid"],
            node["date"].to_native(),
            node["title"]
        )

    @staticmethod
    def read_article_author_relation(
            article: Article, author: Author, rel: neo4j.graph.Relationship
    ) -> ArticleAuthorRelation:
        """ Reads an article-author relationship into an ArticleAuthorRelation model object. """
        return ArticleAuthorRelation(
            article,
            author,
            rel["author_position"],
            rel["is_first_author"],
            rel["is_last_author"]
        )

    def insert_mesh_heading_batch(self, headings: list[MeSHHeading], *, max_batch_size=500):
        """
        Inserts a batch of headings into the database.
        """
        if len(headings) == 0:
            return

        # We batch the articles as otherwise we can hit maximum memory issues with Neo4J...
        required_batches = (len(headings) + max_batch_size - 1) // max_batch_size
        headings_per_batch = (len(headings) + required_batches - 1) // required_batches
        total_headings_inserted = 0
        for batch_no in range(required_batches):
            start_index = batch_no * headings_per_batch
            end_index = len(headings) if batch_no == required_batches - 1 else (batch_no + 1) * headings_per_batch
            batch = headings[start_index:end_index]
            total_headings_inserted += len(batch)
            with self.new_session() as session:
                session.write_transaction(self._insert_mesh_heading_batch, batch)

        # Just to be sure...
        assert total_headings_inserted == len(headings)

    def _insert_mesh_heading_batch(self, tx: neo4j.Transaction, headings: list[MeSHHeading]):
        """
        Inserts a batch of headings into the database.
        """
        headings_data = []
        for heading in headings:
            headings_data.append({
                "desc_id": heading.descriptor_id,
                "name": heading.name,
                "tree_numbers": heading.tree_numbers
            })

        tx.run(
            """
            UNWIND $headings AS heading
            MERGE (heading_node:MeshHeading {id: heading.desc_id})
            ON CREATE
                SET
                    heading_node.name = heading.name,
                    heading_node.tree_numbers = heading.tree_numbers
            ON MATCH
                SET
                    heading_node.name = heading.name,
                    heading_node.tree_numbers = heading.tree_numbers
            """,
            headings=headings_data
        ).consume()

    def get_mesh_headings(self) -> list[MeSHHeading]:
        """
        Fetches the MeSH headings from the database.
        """
        if self._mesh_headings is not None:
            return self._mesh_headings

        with self.new_session() as session:
            results = session.run(
                """
                MATCH (m:MeshHeading)
                RETURN m.id, m.name, m.tree_numbers
                """
            )
            mesh_headings = []
            for id, name, tree_numbers in results:
                mesh_headings.append(MeSHHeading(id, name, tree_numbers))

        self._mesh_headings = mesh_headings
        return mesh_headings

    def fetch_db_metadata(self) -> Optional[DBMetadata]:
        """
        Fetches the most recent DBMetadata.
        """
        with self.new_session() as session:
            results = session.run(
                """
                CALL {
                    MATCH (base:DBMetadata)
                    RETURN base
                    ORDER BY base.version DESC
                    LIMIT 1
                }
                CALL {
                    WITH base
                    MATCH (base) -[:META_MESH_SOURCE]-> (meta:DBMetadataMeshFile)
                    RETURN COLLECT(meta) as meta
                }
                CALL {
                    WITH base
                    MATCH (base) -[:META_DATA_SOURCE]-> (data: DBMetadataDataFile)
                    RETURN COLLECT(data) as data
                }
                RETURN base, meta, data
                """
            ).single()
            result = None if results is None or len(results) < 1 else results[0]

        if result is None:
            return None

        base, meta, data = tuple(results)
        return DBMetadata.from_dicts(base, meta, data)

    def write_db_metadata(self, metadata: DBMetadata):
        with self.new_session() as session:
            session.write_transaction(
                self._write_db_metadata,
                metadata
            )

    def _write_db_metadata(self, tx: neo4j.Transaction, metadata: DBMetadata):
        base_data = metadata.to_dict()
        mesh_data = [f.to_processed_dict() for f in [metadata.mesh_file] if f.processed]
        processed_data = [f.to_processed_dict() for f in metadata.data_files if f.processed]
        tx.run(
            """
            CALL {  // Create the current metadata version node.
                MERGE (base: DBMetadata {version: $base_data.version})
                SET base = $base_data
                RETURN base
            }
            CALL {  // Create the nodes that represent the MeSH files.
                WITH base
                UNWIND $mesh_data AS mesh_file WITH base, mesh_file
                MERGE (mesh: DBMetadataMeshFile {
                    year: mesh_file.year,
                    file: mesh_file.file,
                    md5_hash: mesh_file.md5_hash
                })
                CREATE (mesh) <-[:META_MESH_SOURCE]- (base)
            }
            CALL {  // Create the nodes that represent the PubMed data files.
                WITH base
                UNWIND $processed_data AS processed_data_file WITH base, processed_data_file
                MERGE (data: DBMetadataDataFile {
                    category: processed_data_file.category,
                    year: processed_data_file.year,
                    file: processed_data_file.file,
                    md5_hash: processed_data_file.md5_hash,
                    no_articles: processed_data_file.no_articles
                })
                CREATE (data) <-[:META_DATA_SOURCE]- (base)
            }
            """,
            base_data=base_data, mesh_data=mesh_data, processed_data=processed_data
        ).consume()

    def push_new_db_metadata(self, meta: DBMetadata):
        """
        Pushes the new state of the metadata to the database.
        Updates the version and the modification time of the
        metadata object.
        """
        latest_meta = self.fetch_db_metadata()
        if latest_meta is None:
            version = 1
        else:
            version = latest_meta.version + 1

        meta.update_version(version)
        self.write_db_metadata(meta)

    def delete_entire_database_contents(self):
        """
        DANGEROUS FUNCTION: Deletes the entire contents of the Neo4J database!
        """
        with self.new_session() as session:
            session.run(
                """
                MATCH (n)
                CALL {
                    WITH n
                    DETACH DELETE n
                } IN TRANSACTIONS OF 100000 ROWS;
                """
            ).consume()

    def count_nodes(self) -> int:
        """
        Counts the number of nodes in the database.
        """
        with self.new_session() as session:
            return session.run(
                """
                MATCH (n) RETURN COUNT(n)
                """
            ).single()[0]
