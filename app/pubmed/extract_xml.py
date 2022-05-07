"""
Contains functions to extract PubMed data from XML files.
"""
import datetime
import traceback
from typing import Optional

from lxml import etree

from app.pubmed.model import Author, Article


def extract_single_node_by_tag(node, tag: str):
    for child in node:
        if child.tag == tag:
            return child
    return None


def extract_date(date_node) -> Optional[datetime.date]:
    """
    Extracts a date from one of <DateCreated>, <DateCompleted>, or <DateRevised>.
    """
    year: Optional[int] = None
    month: Optional[int] = None
    day: Optional[int] = None
    for piece_node in date_node:
        tag = piece_node.tag
        if tag == "Year":
            year = int(piece_node.text)
        elif tag == "Month":
            month = int(piece_node.text)
        elif tag == "Day":
            day = int(piece_node.text)

    if year is None:
        return None
    if month is None:
        month = 1
    if day is None:
        day = 1

    return datetime.date(year, month, day)


def extract_author(author_node) -> Author:
    """
    Extracts an author's information from an <Author> node.
    This does its best to canonicalize the names of authors into a standard format.
    """
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


def extract_authors(author_list_node) -> list[Author]:
    # Create its authors. Some articles can contain duplicate authors, hence the set.
    seen_authors = set()
    authors = []
    if author_list_node is not None:
        for author_node in author_list_node:
            if author_node.tag != "Author":
                continue

            author = extract_author(author_node)
            if author.full_name not in seen_authors:
                seen_authors.add(author.full_name)
                authors.append(author)

    return authors


def extract_article(citation_node) -> Optional[Article]:
    """
    Extracts the details of an article from a <MedlineCitation> node.
    """
    pmid = None
    date_created = None
    date_completed = None
    date_revised = None
    article_node = None
    for node in citation_node:
        tag = node.tag
        if tag == "PMID":
            # This ignores the versioning of articles.
            pmid = int(node.text)
        elif tag == "Article":
            article_node = node
        elif tag == "DateCreated":
            date_created = extract_date(node)
        elif date_created is None and tag == "DateCompleted":
            date_completed = extract_date(node)
        elif date_created is None and date_completed is None and tag == "DateRevised":
            date_revised = extract_date(node)

    # We want the earliest date we have available.
    date = date_created or date_completed or date_revised

    # We discard articles with minimal available metadata.
    if pmid is None or date is None or article_node is None:
        return None

    english_title = None
    original_title = None
    author_list_node = None
    for node in article_node:
        tag = node.tag
        if tag == "ArticleTitle":
            english_title = node.text
        elif tag == "VernacularTitle":
            original_title = node.text
        elif tag == "AuthorList":
            author_list_node = node

    article = Article.generate(
        pmid=pmid,
        date=date,
        english_title=english_title,
        original_title=original_title
    )
    if article is None:
        return None

    article.authors = extract_authors(author_list_node)
    return article


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
            article = extract_article(citation_node)
            if article is None:
                continue

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
