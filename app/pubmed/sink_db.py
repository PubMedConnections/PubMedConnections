"""
Allows dumping data into SQLite to speed up iteration
over the ~33 million records.
"""
from app.pubmed.model import PubmedCacheConn, Author, Article, ArticleAuthor


def add_to_pubmed_cache(conn: PubmedCacheConn, articles: list[Article]):
    """
    Takes in a parsed PubMed data file object, and adds information
    from it to the PubMed cache db.
    """
    for article in articles:
        # Create the article.
        article_id = article.insert(conn)

        # Create its authors. Some articles can contain duplicate authors, hence the set.
        author_relationships = []
        for author in article.authors:
            author_id = author.insert(conn)
            author_relationships.append((article_id, author_id))

        # Link the authors to the article.
        ArticleAuthor.insert_many(conn, author_relationships)
