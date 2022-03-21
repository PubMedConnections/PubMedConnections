"""
This package contains the database models for the
PubMed cache database.
"""
import sqlite3
from typing import Iterable

from config import PUBMED_DB_FILE


class PubmedCacheConn:
    """
    Can be used to connect to the pubmed cache SQLite database.
    """
    def __init__(self):
        self.conn = None

    def __enter__(self):
        if self.conn is not None:
            raise ValueError("Already created connection!")

        self.conn = sqlite3.connect(PUBMED_DB_FILE, isolation_level="DEFERRED")

        # Parameters to optimise for bulk data.
        self.conn.cursor().execute("PRAGMA cache_size = -524288")  # 512 MB in KBs
        self.conn.cursor().execute("PRAGMA mmap_size = 536870912")  # 512 MB in bytes

        # Turns off some safety measures to speed up performance.
        self.conn.cursor().execute("PRAGMA synchronous = ON")
        self.conn.cursor().execute("PRAGMA journal_mode = WAL")

        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.conn is None:
            return

        self.conn.commit()
        self.conn.close()
        self.conn = None

    def __getattr__(self, attr):
        """ Delegate accesses to the cursor object. """
        return getattr(self.conn, attr)

    def check_connected(self):
        if self.conn is None:
            raise ValueError("This connection has not been opened!")

    def create_all_tables(self):
        self.check_connected()
        Article.create_table(self)
        Author.create_table(self)
        ArticleAuthor.create_table(self)


class ArticleAuthor:
    """
    Relates authors to articles.
    """
    def __init__(self, article_id: int, author_id: int):
        self.article_id = article_id
        self.author_id = author_id

    @staticmethod
    def create_table(conn: PubmedCacheConn):
        conn.cursor().execute("""
            CREATE TABLE IF NOT EXISTS article_authors (
                article_id INTEGER NOT NULL,
                author_id INTEGER NOT NULL,
                PRIMARY KEY (article_id, author_id),
                FOREIGN KEY (article_id)
                    REFERENCES articles (article_id)
                        ON DELETE CASCADE
                        ON UPDATE NO ACTION,
                FOREIGN KEY (author_id)
                    REFERENCES authors (author_id)
                        ON DELETE CASCADE
                        ON UPDATE NO ACTION
            )
        """)

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


class Author:
    """
    An author of a PubMed article.
    """
    def __init__(self,
                 last_name: str = None,
                 fore_name: str = None,
                 suffix: str = None,
                 initials: str = None,
                 collective_name: str = None,
                 *,
                 author_id: int = None):

        self.author_id = author_id
        self.last_name = last_name
        self.fore_name = fore_name
        self.suffix = suffix
        self.initials = initials
        self.collective_name = collective_name
        self.full_name = self.generate_full_name()

    def generate_full_name(self):
        if self.collective_name is not None:
            return self.collective_name

        last = " {}".format(self.last_name) if self.last_name is not None else ""
        suffix = " {}".format(self.suffix) if self.suffix is not None else ""
        if self.fore_name is not None:
            first = self.fore_name
        elif self.initials is not None:
            first = " ".join(self.initials)
        else:
            first = ""

        return first + last + suffix

    @staticmethod
    def create_table(conn: PubmedCacheConn):
        conn.cursor().execute("""
            CREATE TABLE IF NOT EXISTS authors (
                author_id INTEGER PRIMARY KEY NOT NULL,
                full_name VARCHAR UNIQUE NOT NULL,
                last_name VARCHAR,
                fore_name VARCHAR,
                suffix VARCHAR,
                initials VARCHAR,
                collective_name VARCHAR
            )
        """)

    def insert(self, conn: PubmedCacheConn) -> int:
        cursor = conn.cursor()

        # This query is made to add more information to the author if possible
        # when a duplicate author is found.
        cursor.execute(
            """
            INSERT OR IGNORE INTO
                authors (full_name, last_name, fore_name, suffix, initials, collective_name)
                VALUES (?, ?, ?, ?, ?, ?)
            """,
            (self.full_name, self.last_name, self.fore_name,
             self.suffix, self.initials, self.collective_name)
        )
        cursor.execute("SELECT author_id FROM authors WHERE full_name=?", (self.full_name,))
        for author_id, in cursor:
            self.author_id = author_id
            return author_id

        raise ValueError("Unable to find author_id")

    def __str__(self):
        return self.full_name

    def __repr__(self):
        if self.collective_name is not None:
            return "<Author Collective {}>".format(self.collective_name)

        return "<Author {}>".format(str(self))


class Article:
    """
    A PubMed article.
    """
    def __init__(self,
                 title: str,
                 *,
                 article_id: int = None):

        if title is None:
            raise ValueError("title cannot be None")

        self.article_id = article_id
        self.title = title

    @staticmethod
    def create_table(conn: PubmedCacheConn):
        conn.cursor().execute("""
            CREATE TABLE IF NOT EXISTS articles (
                article_id INTEGER PRIMARY KEY NOT NULL,
                title VARCHAR NOT NULL
            )
        """)

    def insert(self, conn: PubmedCacheConn) -> int:
        cursor = conn.cursor()
        cursor.execute(
            """
                INSERT INTO articles (title)
                VALUES (?)
            """, (self.title,)
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
        return "<Article {}{}>".format(str(self))
