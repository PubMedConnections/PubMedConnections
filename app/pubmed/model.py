"""
This package contains the database models for the
PubMed cache database.
"""
import atomics
import neo4j
from typing import Iterable, Optional, Final
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
            Author.create_constraints(session)
            Article.create_constraints(session)

        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.driver is None:
            return

        self.driver.close()
        self.driver = None

    def new_session(self) -> neo4j.Session:
        return self.driver.session(database=self.database)


class Author:
    """
    An author of a PubMed article.
    """
    id_counter: Final[IdCounter] = IdCounter()

    def __init__(self,
                 full_name: str = None,
                 is_collective: bool = False,
                 *,
                 author_id: int = None):

        self.author_id = author_id
        self.full_name = full_name
        self.is_collective = is_collective

    @staticmethod
    def generate_from_name_pieces(last_name: str, fore_name: str, suffix: str,
                                  initials: str, collective_name: str) -> 'Author':

        if collective_name is not None:
            return Author(collective_name, True)

        last = " {}".format(last_name) if last_name is not None else ""
        suffix = " {}".format(suffix) if suffix is not None else ""
        if fore_name is not None:
            first = fore_name
        elif initials is not None:
            first = " ".join(initials)
        else:
            first = ""

        full_name = first + last + suffix
        if len(full_name) == 0:
            raise ValueError("No name pieces supplied")

        return Author(full_name, False)

    @staticmethod
    def create_constraints(session: neo4j.Session):
        # Uniqueness constraints implicitly create an index for the constraint as well.
        session.run(
            "CREATE CONSTRAINT unique_author_names IF NOT EXISTS "
            "FOR (a:Author) REQUIRE a.full_name IS UNIQUE"
        ).consume()
        session.run(
            "CREATE CONSTRAINT unique_author_ids IF NOT EXISTS "
            "FOR (a:Author) REQUIRE a.id IS UNIQUE"
        ).consume()

    def __str__(self):
        return self.full_name

    def __repr__(self):
        if self.is_collective:
            return "<Author Collective {}>".format(self.full_name)

        return "<Author {}>".format(self.full_name)


class Article:
    """
    A PubMed article.
    """
    id_counter: Final[IdCounter] = IdCounter()

    def __init__(self,
                 title: str = None,
                 *,
                 article_id: int = None):

        self.article_id = article_id
        self.title = title
        self._authors = None

    @staticmethod
    def generate(english_title: str, original_title: str):
        """
        Generates an article entry given its information from PubMed.
        """
        return Article(Article.generate_title(english_title, original_title))

    @staticmethod
    def generate_title(english_title: str, original_title: str):
        """
        Generates a title without formatting information.
        """
        if english_title is None:
            return original_title if original_title is not None else "<Unknown Title>"

        result = ""
        brackets = 0
        for ch in english_title:
            if ch == "[" or ch == "]":
                continue
            if ch == "(":
                brackets += 1
            elif ch == ")":
                brackets -= 1
            elif brackets <= 0:
                result += ch

        return result

    @property
    def authors(self) -> list[Author]:
        """ Returns all the Authors of this article. """
        if self._authors is None:
            raise ValueError("The authors of this article have not been read from the database")
        return self._authors

    @authors.setter
    def authors(self, authors: list[Author]):
        """ Sets the Authors of this article. """
        self._authors = authors

    @staticmethod
    def create_constraints(session: neo4j.Session):
        # Uniqueness constraints implicitly create an index for the constraint as well.
        session.run(
            "CREATE CONSTRAINT unique_article_ids IF NOT EXISTS "
            "FOR (a:Article) REQUIRE a.id IS UNIQUE"
        ).consume()

    @staticmethod
    def insert_many(tx: neo4j.Transaction, articles: list['Article']):
        articles_data = []
        for article in articles:
            authors_data = []
            for author in article.authors:
                authors_data.append({
                    "id": Author.id_counter.next(),
                    "full_name": author.full_name,
                    "is_collective": author.is_collective
                })

            articles_data.append({
                "id": Article.id_counter.next(),
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

    def __str__(self):
        if self.article_id is not None:
            prefix = "{}: ".format(self.article_id)
        else:
            prefix = ""

        return prefix + self.title

    def __repr__(self):
        return "<Article {}>".format(str(self))
