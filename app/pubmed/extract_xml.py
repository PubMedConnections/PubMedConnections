"""
Contains functions to extract PubMed data from XML files.
"""
import traceback
from lxml import etree
from app.pubmed.model import PubmedCacheConn, Author, Article, ArticleAuthor


def extract_single_node_by_tag(node, tag: str):
    for child in node:
        if child.tag == tag:
            return child
    return None


def extract_article(article_node) -> Article:
    english_title = None
    original_title = None
    for node in article_node:
        tag = node.tag
        if tag == "ArticleTitle":
            english_title = node.text
        elif tag == "VernacularTitle":
            original_title = node.text

    return Article(
        english_title,
        original_title
    )


def extract_author(author_node) -> Author:
    last_name = None
    fore_name = None
    initials = None
    suffix = None
    collective_name = None
    for node in author_node:
        tag = node.tag
        if tag == "LastName":
            last_name = node.text
        elif tag == "ForeName":
            fore_name = node.text
        elif tag == "Initials":
            initials = node.text
        elif tag == "Suffix":
            suffix = node.text
        elif tag == "CollectiveName":
            collective_name = node.text

    return Author.generate_from_name_pieces(last_name, fore_name, initials, suffix, collective_name)


def extract_articles(tree) -> list[Article]:
    """
    Takes in a parsed PubMed data file object, and extracts
    the data that we are interested in from it.
    """
    root = tree.getroot()
    articles = []
    for index, pubmed_article_node in enumerate(root):
        if pubmed_article_node.tag != "PubmedArticle":
            continue

        try:
            citation_node = extract_single_node_by_tag(pubmed_article_node, "MedlineCitation")
            article_node = extract_single_node_by_tag(citation_node, "Article")

            # Create the article.
            article = extract_article(article_node)

            # Create its authors. Some articles can contain duplicate authors, hence the set.
            seen_authors = set()
            authors_node = extract_single_node_by_tag(article_node, "AuthorList")
            authors = []
            if authors_node is not None:
                for author_node in authors_node:
                    author = extract_author(author_node)
                    if author.full_name not in seen_authors:
                        seen_authors.add(author.full_name)
                        authors.append(author)

            # Link the authors to the article.
            article.authors = authors

            articles.append(article)
        except Exception as e:
            traceback.print_exc()
            try:
                with open("error.node.txt", "wt") as f:
                    f.write("{} occurred while extracting data around\n{}".format(
                        type(e).__name__,
                        etree.tostring(
                            pubmed_article_node,
                            pretty_print=True,
                            encoding="utf8"
                        ).decode("utf8")
                    ))
            except Exception as e2:
                traceback.print_exc()

    return articles
