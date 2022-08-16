"""
Contains functions to extract PubMed data from XML files.
"""
import datetime
import sys
import traceback
from typing import Optional

from lxml import etree

from app.pubmed.medline_dates import parse_month, parse_medline_date
from app.pubmed.model import Author, Article, Journal, MeshHeading, ArticleAuthorRelation
from app.pubmed.warning_log import WarningLog


def extract_single_node_by_tag(node: etree.Element, tag: str):
    for child in node:
        if child.tag == tag:
            return child
    return None


def extract_date(date_node: etree.Element) -> datetime.date:
    """
    Extracts a date from one of <DateCreated>, <DateCompleted>, or <DateRevised>.
    """
    medline_date = None
    year: Optional[int] = None
    month: Optional[int] = None
    day: Optional[int] = None
    for node in date_node:
        tag = node.tag
        if tag == "Year":
            year = int(node.text)
        elif tag == "Month":
            month = parse_month(node.text)
        elif tag == "Day":
            day = int(node.text)
        elif tag == "MedlineDate":
            medline_date = node.text

    if year is None:
        if medline_date is not None:
            return parse_medline_date(medline_date)
        raise Exception("Date must contain either a <Year> or a <MedlineDate>")

    if month is None:
        month = 1
    if day is None:
        day = 1

    return datetime.date(year, month, day)


def extract_author(author_node: etree.Element) -> Author:
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


def extract_authors(article: Article, author_list_node: etree.Element) -> list[ArticleAuthorRelation]:
    """
    Reads all the authors from an <AuthorList>.
    """
    seen_authors = set()  # Some articles can contain duplicate authors, hence the set.
    authors: list[tuple[int, Author]] = []
    position = 0
    if author_list_node is not None:
        for author_node in author_list_node:
            if author_node.tag != "Author":
                continue

            position += 1
            author = extract_author(author_node)
            if author.full_name not in seen_authors:
                seen_authors.add(author.full_name)
                authors.append((position, author))

    author_relations = []
    for author_position, author in authors:
        is_first_author = (author_position == 1)
        is_last_author = (author_position == position)
        author_relations.append(ArticleAuthorRelation(
            article, author, author_position, is_first_author, is_last_author
        ))

    return author_relations


def canonicalize_issn(issn: str) -> str:
    if len(issn) == 8:
        return issn
    if len(issn) == 9 and issn[4] == "-":
        return issn[:4] + issn[5:]

    raise Exception("Unrecognised ISSN: {}".format(issn))


def extract_journal_issue(journal_issue_node: etree.Element):
    """
    Extracts the volume and issue from a <JournalIssue>
    """
    volume = None
    issue = None
    pub_date_node = None
    for node in journal_issue_node:
        tag = node.tag
        if tag == "Volume":
            volume = node.text
        elif tag == "Issue":
            issue = node.text
        elif tag == "PubDate":
            pub_date_node = node

    if pub_date_node is None:
        raise Exception("Journal is missing a <PubDate>")

    date = extract_date(pub_date_node)
    return volume, issue, date


def extract_journal(journal_node: etree.Element) -> Journal:
    """
    Extracts a journal from <Journal>.
    """
    issn = None
    issn_linking = None
    iso_abbrev = None
    journal_issue_node = None
    title = None
    for node in journal_node:
        tag = node.tag
        if tag == "ISSN":
            issn = canonicalize_issn(node.text)
        elif tag == "ISSNLinking":
            issn_linking = canonicalize_issn(node.text)
        elif tag == "JournalIssue":
            journal_issue_node = node
        elif tag == "Title":
            title = node.text
        elif tag == "ISOAbbreviation":
            iso_abbrev = node.text

    if journal_issue_node is None:
        raise Exception("Journal is missing a <JournalIssue>")
    if title is None:
        raise Exception("Journal is missing a <Title>")

    issn = issn_linking if issn is None else issn

    volume, issue, date = extract_journal_issue(journal_issue_node)
    return Journal.generate(iso_abbrev, issn, title, volume, issue, date)


def extract_article(pmid: int, date: datetime.date, article_node: etree.Element):
    """
    Extracts the details of an article from an <Article> node.
    """
    english_title = None
    original_title = None
    author_list_node = None
    journal_node = None
    for node in article_node:
        tag = node.tag
        if tag == "ArticleTitle":
            english_title = node.text
        elif tag == "VernacularTitle":
            original_title = node.text
        elif tag == "AuthorList":
            author_list_node = node
        elif tag == "Journal":
            journal_node = node

    if journal_node is None:
        raise Exception("Article is missing <Journal>")

    article = Article.generate(
        pmid=pmid,
        date=date,
        english_title=english_title,
        original_title=original_title
    )
    article.journal = extract_journal(journal_node)

    if author_list_node is not None:
        article.author_relations = extract_authors(article, author_list_node)
    else:
        article.author_relations = []

    return article


def extract_mesh_heading_list(heading_list_node: etree.Element):
    """
    Extracts the list of MeSH headings listed within a <MeshHeadingList> node.
    """
    descriptor_ids = []
    for heading_node in heading_list_node:
        if heading_node.tag != "MeshHeading":
            continue

        # We only want to keep MeSH headings that are a major topic of the article.
        descriptor_node = extract_single_node_by_tag(heading_node, "DescriptorName")
        if descriptor_node is None or descriptor_node.attrib["MajorTopicYN"] != "Y":
            continue

        descriptor_id_str = descriptor_node.attrib["UI"]
        descriptor_ids.append(extract_mesh_descriptor_id(descriptor_id_str))

    return descriptor_ids


def extract_citation(citation_node: etree.Element) -> Article:
    """
    Extracts the details of an article from a <MedlineCitation> node.
    """
    pmid = None
    date_created_node = None
    date_completed_node = None
    date_revised_node = None
    article_node = None
    mesh_descriptor_ids: list[int] = []
    for node in citation_node:
        tag = node.tag
        if tag == "PMID":
            # This ignores the versioning of articles.
            pmid = int(node.text)
        elif tag == "Article":
            article_node = node
        elif tag == "DateCreated":
            date_created_node = node
        elif tag == "DateCompleted":
            date_completed_node = node
        elif tag == "DateRevised":
            date_revised_node = node
        elif tag == "MeshHeadingList":
            mesh_descriptor_ids = extract_mesh_heading_list(node)

    # We want the earliest date we have available.
    date_node = date_created_node
    if date_node is None:
        date_node = date_completed_node
    if date_node is None:
        date_node = date_revised_node

    if pmid is None:
        raise Exception("Citation is missing a <PMID>")
    if article_node is None:
        raise Exception("Citation is missing an <Article>")
    if date_node is None:
        raise Exception("Citation does not contain a <DateCreated>, <DateCompleted>, nor a <DateRevised>")

    date = extract_date(date_node)
    article = extract_article(pmid, date, article_node)
    article.mesh_descriptor_ids = mesh_descriptor_ids
    return article


def extract_pmid_node(log: WarningLog, id_node: etree.Element, context: str) -> Optional[int]:
    """
    Attempts to extract a PMID from an <ArticleId> or <PMID> node.
    If the PMID takes a special value such as "NOT_FOUND", then
    None will be returned. If parsing the PMID fails, then None
    is returned and a warning is added to the log.
    """
    value: Optional[str] = id_node.text
    if value is None or "NOT_FOUND" in value or "INVALID_JOURNAL" in value:
        return None

    try:
        return int(value)
    except ValueError:
        # At least one reference has a DOI string marked as a PMID...
        log.append(f"Invalid PMID detected while {context}: {value}")
        return None


def extract_article_pmid_from_list(log: WarningLog, id_list_node: etree.Element) -> Optional[int]:
    """ Extracts the PMID of an article from an <ArticleIdList> node. """
    for node in id_list_node:
        if node.tag != "ArticleId":
            continue

        attrib = node.attrib
        if "IdType" in attrib and attrib["IdType"] == "pubmed":
            pmid = extract_pmid_node(log, node, "parsing PMID from ID list")
            if pmid is not None:
                return pmid

    return None


def extract_pubmed_data(log: WarningLog, pubmed_data_node: etree.Element, article: Article):
    """ Extracts information from a <PubmedData> node to add into the given article. """
    reference_pmids: list[int] = []

    reference_list_node = extract_single_node_by_tag(pubmed_data_node, "ReferenceList")
    if reference_list_node is not None:
        for reference_node in reference_list_node:
            id_list_node = extract_single_node_by_tag(reference_node, "ArticleIdList")
            if id_list_node is None:
                continue

            pmid = extract_article_pmid_from_list(log, id_list_node)
            if pmid is not None:
                reference_pmids.append(pmid)

    article.reference_pmids = reference_pmids


def extract_pubmed_article(log: WarningLog, pubmed_article_node: etree.Element) -> Optional[Article]:
    """ Tries to extract an article from the given <PubmedArticle> node. """
    citation_node = None
    pubmed_data_node = None
    for node in pubmed_article_node:
        tag = node.tag
        if tag == "MedlineCitation":
            citation_node = node
        elif tag == "PubmedData":
            pubmed_data_node = node

    if citation_node is None:
        raise Exception("<PubmedArticle> is missing a <MedlineCitation>")
    if pubmed_data_node is None:
        raise Exception("<PubmedArticle> is missing a <PubmedData>")

    if "Status" not in citation_node.attrib:
        raise Exception("<MedlineCitation> is missing a Status attribute")

    # Skip articles that are not indexed in PubMed.
    status = citation_node.attrib["Status"].lower()
    if status in ["in-data-review", "publisher"]:
        return None
    elif status not in ["in-process", "medline", "oldmedline", "pubmed-not-medline", "completed"]:
        raise Exception(f"Unrecognised Status value, {status}")

    # Check for information contained in the comment corrections about this article.
    is_retraction: bool = False
    retracted_pmid: Optional[int] = None

    is_update: bool = False
    updated_pmids: list[int] = []
    cited_pmids: list[int] = []
    related_pmids: list[int] = []

    comments_list_node = extract_single_node_by_tag(citation_node, "CommentsCorrectionsList")
    if comments_list_node is not None:
        for comment_node in comments_list_node:
            if comment_node.tag != "CommentsCorrections":
                continue
            if "RefType" not in comment_node.attrib:
                log.append("<CommentsCorrections> node is missing a RefType")
                continue

            ref_type = comment_node.attrib["RefType"].lower()
            comment_is_retraction: bool = False
            comment_is_update: bool = False
            comment_is_citation: bool = False
            if ref_type == "retractionof":
                comment_is_retraction = True
            elif ref_type in ["reprintof", "updateof", "republishedfrom", "erratumfor"]:
                comment_is_update = True
            elif ref_type in ["reprintof", "updateof", "republishedfrom", "erratumfor"]:
                comment_is_citation = True

            is_retraction = is_retraction or comment_is_retraction
            is_update = is_update or comment_is_update

            pmid_node = extract_single_node_by_tag(comment_node, "PMID")
            if pmid_node is None:
                continue

            pmid = extract_pmid_node(log, pmid_node, "parsing comment corrections")
            if pmid is None:
                continue

            if comment_is_retraction:
                retracted_pmid = pmid

    # TODO : Use the content of the comment corrections

    # Retractions should not be saved as their own articles.
    if is_retraction:
        return None

    article = extract_citation(citation_node)
    extract_pubmed_data(log, pubmed_data_node, article)
    return article


def extract_articles(log: WarningLog, tree: etree.ElementTree) -> list[Article]:
    """
    Takes in a parsed PubMed data file object, and extracts
    the data that we are interested in from it.
    """
    root: etree.Element = tree.getroot()
    articles = []
    for index, pubmed_article_node in enumerate(root):
        if pubmed_article_node.tag != "PubmedArticle":
            continue

        try:
            article = extract_pubmed_article(log.group(f"index={index}"), pubmed_article_node)
            if article is not None:
                articles.append(article)

        except Exception as e:
            traceback.print_exc()
            try:
                with open("error.node.txt", "wt") as f:
                    f.write("{}: {}\n\nOccurred while extracting data around:\n{}".format(
                        type(e).__name__, str(e),
                        etree.tostring(
                            pubmed_article_node,
                            pretty_print=True,
                            encoding="utf8"
                        ).decode("utf8")
                    ))

            except Exception as e2:
                traceback.print_exc()

    return articles


def extract_mesh_descriptor_id(descriptor_id_str: str) -> int:
    """ Converts descriptor ID strings (e.g. 'D000016') into a number ID (e.g. 16). """
    if len(descriptor_id_str) == 0:
        raise Exception("Empty descriptor ID")
    if descriptor_id_str[0] != "D":
        raise Exception("Expected descriptor ID to start with 'D', {}".format(descriptor_id_str))

    return int(descriptor_id_str[1:])


def extract_mesh_headings(tree) -> list[MeshHeading]:
    """
    Extracts a list of mesh headings from the XML tree.
    """
    root = tree.getroot()
    headings = []
    for index, mesh_heading_node in enumerate(root):
        if mesh_heading_node.tag != "DescriptorRecord":
            continue

        descriptor_id_str = extract_single_node_by_tag(mesh_heading_node, "DescriptorUI").text
        descriptor_id = extract_mesh_descriptor_id(descriptor_id_str)
        descriptor = extract_single_node_by_tag(mesh_heading_node, "DescriptorName")
        descriptor_name = extract_single_node_by_tag(descriptor, "String").text

        tree_list = extract_single_node_by_tag(mesh_heading_node, "TreeNumberList")
        tree_numbers: list[str] = []
        if tree_list is not None:
            for child in tree_list:
                if child.tag == "TreeNumber":
                    tree_numbers.append(child.text)

        headings.append(MeshHeading(descriptor_id, descriptor_name, tree_numbers))

    return headings
