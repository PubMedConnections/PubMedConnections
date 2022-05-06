"""
Allows dumping data into SQLite to speed up iteration
over the ~33 million records.
"""
import queue
import threading
import time
from queue import Queue

import atomics
import neo4j

from app.pubmed.model import PubmedCacheConn, Article, Author


def write_article_batch_to_neo4j(tx: neo4j.Transaction, articles: list[Article]):
    """ Writes the given article to the Neo4J transaction. """
    authors = []
    for article in articles:
        authors.extend(article.authors)

    Author.insert_many(tx, authors)


def add_to_pubmed_cache(conn: PubmedCacheConn, articles: list[Article]):
    """
    Writes the given list of articles read from a PubMed data file to the database.
    """
    with conn.new_session() as session:
        session.write_transaction(write_article_batch_to_neo4j, articles)
