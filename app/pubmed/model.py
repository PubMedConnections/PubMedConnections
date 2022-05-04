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
        self.conn: Optional[neo4j.Session] = None
        self.reset_on_connect: bool = reset_on_connect

    def __enter__(self):
        if self.driver is not None:
            raise ValueError("Already created connection!")

        self.driver = neo4j.GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

        # Create a default connection first to create the database.
        with self.driver.session() as conn:
            if self.reset_on_connect:
                conn.run("CREATE OR REPLACE DATABASE {}".format(self.database))
            else:
                conn.run("CREATE DATABASE {} IF NOT EXISTS".format(self.database))

            conn.run("CREATE INDEX author_names IF NOT EXISTS FOR (a:Author) ON (a.full_name)")

        # Connect to the database.
        self.conn = self.driver.session(database=self.database)
        self.conn.__enter__()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.driver is None:
            return

        try:
            self.conn.__exit__(exc_type, exc_val, exc_tb)
            self.conn = None
        finally:
            self.driver.close()
            self.driver = None

    def check_connected(self):
        if self.conn is None:
            raise ValueError("This connection has not been opened!")

    def new_transaction(self):
        self.check_connected()
        return self.conn.begin_transaction()


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

    def insert(self, tx: neo4j.Transaction):
        author_id = Author.id_counter.next()
        tx.run(
            """
            MERGE (a:Author {full_name: $full_name})
            ON CREATE
                SET
                    a.id = $id,
                    a.is_collective = $is_collective
            """,
            id=author_id, full_name=self.full_name, is_collective=self.is_collective
        )

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
                 english_title: str = None,
                 original_title: str = None,
                 *,
                 article_id: int = None):

        self.article_id = article_id
        self.english_title = english_title
        self.original_title = original_title
        self.title = self.generate_title()
        self._authors = None

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

    def generate_title(self):
        """
        Generates a title without formatting information.
        """
        if self.english_title is None:
            return self.original_title if self.original_title is not None else "<Unknown Title>"

        result = ""
        brackets = 0
        for ch in self.english_title:
            if ch == "[" or ch == "]":
                continue
            if ch == "(":
                brackets += 1
            elif ch == ")":
                brackets -= 1
            elif brackets <= 0:
                result += ch

        return result

    def insert(self, conn: PubmedCacheConn) -> int:
        cursor = conn.cursor()
        cursor.execute(
            """
                INSERT INTO articles (english_title, original_title)
                VALUES (?, ?)
            """, (self.english_title, self.original_title)
        )
        self.article_id = cursor.lastrowid
        return self.article_id

    def __str__(self):
        if self.article_id is not None:
            prefix = "{}: ".format(self.article_id)
        else:
            prefix = ""

        return prefix + self.title

    def __repr__(self):
        return "<Article {}>".format(str(self))


class ArticleAuthor:
    """
    Relates authors to articles.
    """
    def __init__(self, article_id: int, author_id: int):
        self.article_id = article_id
        self.author_id = author_id

    @staticmethod
    def select_by_article(conn: PubmedCacheConn, article_id: int) -> list['ArticleAuthor']:
        cursor = conn.cursor()
        cursor.execute("SELECT author_id FROM article_authors WHERE article_id=?", (article_id,))
        for row in cursor:
            yield ArticleAuthor(article_id, row[0])

    @staticmethod
    def select_by_author(conn: PubmedCacheConn, author_id: int) -> list['ArticleAuthor']:
        cursor = conn.cursor()
        cursor.execute("SELECT article_id FROM article_authors WHERE author_id=?", (author_id,))
        for row in cursor:
            yield ArticleAuthor(row[0], author_id)

    @staticmethod
    def insert_many(conn: PubmedCacheConn, article_and_author_id_pairs: Iterable[tuple[int, int]]):
        conn.cursor().executemany(
            """
            INSERT INTO article_authors (article_id, author_id)
            VALUES (?, ?)
            """, article_and_author_id_pairs
        )
