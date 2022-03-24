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
    def __init__(self, *, safe=True):
        self.conn = None
        self.safe = safe

    def __enter__(self):
        if self.conn is not None:
            raise ValueError("Already created connection!")

        self.conn = sqlite3.connect(PUBMED_DB_FILE, isolation_level=None)
        cursor = self.conn.cursor()

        # Parameters to optimise for bulk data.
        # cursor.execute("PRAGMA cache_size = -524288")  # 512 MB in KBs
        # cursor.execute("PRAGMA mmap_size = 536870912")  # 512 MB in bytes

        # Turns off some safety measures to speed up performance.
        if not self.safe:
            cursor.execute("PRAGMA synchronous = OFF")
            cursor.execute("PRAGMA journal_mode = OFF")
        else:
            cursor.execute("PRAGMA synchronous = ON")
            cursor.execute("PRAGMA journal_mode = WAL")

        # We manage the transactions ourselves.
        cursor.execute("BEGIN TRANSACTION")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.conn is None:
            return

        cursor = self.conn.cursor()
        cursor.execute("COMMIT")

        self.conn.close()
        self.conn = None

    def commit_transaction(self):
        """ Commits the current transaction and starts a new one. """
        cursor = self.conn.cursor()
        cursor.execute("COMMIT")
        cursor.execute("BEGIN TRANSACTION")

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
    def create_table(conn: PubmedCacheConn):
        conn.cursor().execute("""
            CREATE TABLE IF NOT EXISTS authors (
                author_id INTEGER PRIMARY KEY NOT NULL,
                full_name VARCHAR UNIQUE NOT NULL,
                is_collective BOOLEAN NOT NULL
            )
        """)

    def insert(self, conn: PubmedCacheConn) -> int:
        cursor = conn.cursor()

        # This query is made to add more information to the author if possible
        # when a duplicate author is found.
        cursor.execute(
            """
            INSERT OR IGNORE INTO
                authors (full_name, is_collective)
                VALUES (?, ?)
            """,
            (self.full_name, self.is_collective)
        )
        cursor.execute("SELECT author_id FROM authors WHERE full_name=?", (self.full_name,))
        for author_id, in cursor:
            self.author_id = author_id
            return author_id

        raise ValueError("Unable to find author_id")

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

    @staticmethod
    def create_table(conn: PubmedCacheConn):
        conn.cursor().execute("""
            CREATE TABLE IF NOT EXISTS articles (
                article_id INTEGER PRIMARY KEY NOT NULL,
                english_title VARCHAR,
                original_title VARCHAR
            )
        """)

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
