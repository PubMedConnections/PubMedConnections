"""
Allows dumping data into SQLite to speed up iteration
over the ~33 million records.
"""
import time

from app.pubmed.model import PubmedCacheConn, Author, Article, ArticleAuthor


def add_to_pubmed_cache(conn: PubmedCacheConn, articles: list[Article]):
    """
    Takes in a parsed PubMed data file object, and adds information
    from it to the PubMed cache db.
    """
    last_report_time = time.time()
    for index, article in enumerate(articles):
        with conn.new_transaction() as tx:
            # Create the article.
            # article_id = article.insert(conn)

            # Create its authors. Some articles can contain duplicate authors, hence the set.
            # author_relationships = []
            for author in article.authors:
                author.insert(tx)
                # author_relationships.append((article_id, author_id))

            # Link the authors to the article.
            # ArticleAuthor.insert_many(conn, author_relationships)

        if index % 100 == 0:
            print("{} / {}:  {:.3f} seconds".format(index, len(articles), time.time() - last_report_time))
            last_report_time = time.time()
