"""
Allows dumping data into SQLite to speed up iteration
over the ~33 million records.
"""
import time
from app.pubmed.model import PubmedCacheConn, Author, Article, ArticleAuthor


def extract_article(pubmed_article_dict: dict) -> Article:
    citation_dict = pubmed_article_dict["MedlineCitation"]
    article_dict = citation_dict["Article"]

    return Article(
        title=article_dict["ArticleTitle"]
    )


def extract_author(author_dict: dict) -> Author:
    return Author(
        last_name=author_dict.get("LastName"),
        fore_name=author_dict.get("ForeName"),
        initials=author_dict.get("Initials"),
        suffix=author_dict.get("Suffix"),
        collective_name=author_dict.get("CollectiveName")
    )


def extract_to_pubmed_cache(conn: PubmedCacheConn, data, *, print_every=5000):
    """
    Takes in a parsed PubMed data file object, and adds information
    from it to the PubMed cache db.
    """
    start = time.time()

    entries = data["PubmedArticle"]

    for index, pubmed_article_dict in enumerate(entries):
        citation_dict = pubmed_article_dict["MedlineCitation"]
        article_dict = citation_dict["Article"]

        # Create the article.
        article = extract_article(pubmed_article_dict)
        article_id = article.insert(conn)

        # Create its authors. Some articles can contain duplicate authors, hence the set.
        author_relationships = set()
        if "AuthorList" in article_dict:
            for author_dict in article_dict["AuthorList"]:
                author = extract_author(author_dict)
                author_id = author.insert(conn)
                author_relationships.add((article_id, author_id))

        # Link the authors to the article.
        ArticleAuthor.insert_many(conn, author_relationships)

        if (index + 1) % print_every == 0:
            print("PubMedSync: {} / {}...".format(index + 1, len(entries)))

    print("PubMedSync: Processed {} articles in {:.2f} seconds".format(
        len(entries), time.time() - start
    ))
