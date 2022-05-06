"""
Allows dumping data into SQLite to speed up iteration
over the ~33 million records.
"""
from typing import Optional

import atomics
import neo4j
from app.pubmed.model import Article, Author
from config import NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD, NEO4J_DATABASE


class IdCounter:
    """ Increments IDs to use for database nodes. """
    id: atomics.atomic = atomics.atomic(width=4, atype=atomics.INT)

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

        # TODO : Save these in the database for re-use.
        # Is there any way we could lock to make sure that we never
        # extract to the database from two sources at once?
        self.author_id_counter = IdCounter()
        self.article_id_counter = IdCounter()

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

        # Create a connection to the database to create its constraints.
        with self.new_session() as session:
            self.create_constraints(session)

        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.driver is None:
            return

        self.driver.close()
        self.driver = None

    def new_session(self) -> neo4j.Session:
        return self.driver.session(database=self.database)

    def create_constraints(self, session: neo4j.Session):
        """
        This method creates all the constraints required for the database.
        Uniqueness constraints implicitly create an index for the constraint as well.
        """

        # Authors.
        session.run(
            "CREATE CONSTRAINT unique_author_names IF NOT EXISTS "
            "FOR (a:Author) REQUIRE a.full_name IS UNIQUE"
        ).consume()
        session.run(
            "CREATE CONSTRAINT unique_author_ids IF NOT EXISTS "
            "FOR (a:Author) REQUIRE a.id IS UNIQUE"
        ).consume()

        # Articles.
        session.run(
            "CREATE CONSTRAINT unique_article_ids IF NOT EXISTS "
            "FOR (a:Article) REQUIRE a.id IS UNIQUE"
        ).consume()

    def insert_article_batch(self, articles: list[Article]):
        """
        Inserts a batch of articles into the database, including their authors.
        """
        with self.new_session() as session:
            session.write_transaction(self._insert_article_batch, articles)

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
                    "full_name": author.full_name,
                    "is_collective": author.is_collective
                })

            articles_data.append({
                "id": self.article_id_counter.next(),
                "title": article.title,
                "authors": authors_data
            })

        tx.run(
            """
            UNWIND $articles AS article
                CALL {
                    WITH article
                    CREATE (a:Article {id: article.id, title: article.title})
                    RETURN a
                }

            UNWIND article.authors AS author
                CALL {
                    WITH author
                    MERGE (b:Author {full_name: author.full_name})
                    ON CREATE
                        SET
                            b.id = author.id,
                            b.is_collective = author.is_collective
                    RETURN b
                }
                CREATE (b)-[:AUTHOR_OF]->(a)
            """,
            articles=articles_data
        ).consume()
