"""
Allows dumping data into SQLite to speed up iteration
over the ~33 million records.
"""
from typing import Optional

import atomics
import neo4j
from app.pubmed.model import Article, DBMetadata, MeshHeading
from app.utils import or_else
from config import NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD, NEO4J_DATABASE


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


class PubmedCacheConn:
    """
    Can be used to connect to the pubmed cache Neo4J database.
    """
    def __init__(self, database: Optional[str] = None, *, reset_on_connect: bool = False):
        self.database: str = database if database is not None else NEO4J_DATABASE
        self.driver: Optional[neo4j.Driver] = None
        self.reset_on_connect: bool = reset_on_connect

        # We store metadata about the database within a Metadata node.
        self.metadata: Optional[DBMetadata] = None

        # We maintain our own counters for the IDs of authors. This is required as we
        # cannot trust the IDs generated by Neo4J as they can change, nor the IDs from
        # PubMed as they often don't exist.
        self.author_id_counter: Optional[IdCounter] = None

    def __enter__(self):
        if self.driver is not None:
            raise ValueError("Already created connection!")

        self.driver = neo4j.GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

        # Create a default connection first to create the database.
        with self.driver.session() as session:
            if self.reset_on_connect:
                session.run("CREATE OR REPLACE DATABASE {}".format(self.database)).consume()
            else:
                session.run("CREATE DATABASE {} IF NOT EXISTS".format(self.database)).consume()

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
            "FOR (h:MeSHHeading) REQUIRE h.id IS UNIQUE"
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

    def insert_article_batch(self, articles: list[Article], *, max_batch_size=16000):
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
            authors_data = []
            for author in article.authors:
                authors_data.append({
                    "id": self.author_id_counter.next(),
                    "name": author.full_name,
                    "is_collective": author.is_collective
                })

            journal = article.journal
            articles_data.append({
                "pmid": article.pmid,
                "date": article.date,
                "title": article.title,
                "journal": {
                    "id": journal.identifier,
                    "title": journal.title,
                    "volume": journal.volume,
                    "issue": journal.issue,
                    "date": journal.date
                },
                "authors": authors_data,
                "refs": article.reference_pmids
            })

        tx.run(
            """
            UNWIND $articles AS article WITH article, article.journal as journal, article.authors as authors
                CALL {
                    WITH journal
                    MERGE (journal_node:Journal {id: journal.id})
                    ON CREATE
                        SET
                            journal_node.title = journal.title
                    RETURN journal_node
                }
                CALL {
                    WITH article
                    MERGE (article_node:Article {pmid: article.pmid})
                    ON CREATE
                        SET
                            article_node.title = article.title,
                            article_node.date = article.date
                    RETURN article_node
                }
                CALL {
                    WITH article_node, journal_node, journal
                    CREATE (article_node)-[:PUBLISHED_IN {
                        volume: journal.volume,
                        issue: journal.issue,
                        date: journal.date
                    }]->(journal_node)
                }
                CALL {
                    WITH article_node, article
                    UNWIND article.refs as ref_pmid
                    MATCH (ref_node:Article)
                    WHERE ref_node.pmid = ref_pmid
                    CREATE (article_node)-[:REFERENCES]->(ref_node)
                }

            UNWIND authors AS author
                CALL {
                    WITH author
                    MERGE (author_node:Author {name: author.name})
                    ON CREATE
                        SET
                            author_node.id = author.id,
                            author_node.is_collective = author.is_collective
                    RETURN author_node
                }
                CREATE (author_node)-[:AUTHOR_OF]->(article_node)
            """,
            articles=articles_data
        ).consume()

    def insert_mesh_heading_batch(self, headings: list[MeshHeading], *, max_batch_size=500):
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

    def _insert_mesh_heading_batch(self, tx: neo4j.Transaction, headings: list[MeshHeading]):
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
            MERGE (heading_node:MeSHHeading {id: heading.desc_id})
            ON CREATE
                SET
                    heading_node.name = heading.name,
                    heading_node.tree_numbers = heading.tree_numbers
            """,
            headings=headings_data
        ).consume()
