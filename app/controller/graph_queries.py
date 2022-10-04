"""
Contains queries to extract graphs from the database.
"""
import datetime
import sys
from typing import Any, Optional

from app import neo4j_conn, PubMedCacheConn
from app.pubmed.filtering import PubMedFilterBuilder, PubMedFilterQuerySettings, PubMedFilterValueError, \
    PubMedFilterLimitError
from app.pubmed.model import DBArticleAuthor, DBAuthor, DBArticle


def parse_date(filter_key: str, date_str: str) -> datetime.datetime:
    try:
        return datetime.datetime.strptime(date_str, '%Y-%m-%d')
    except ValueError as e:
        raise PubMedFilterValueError(filter_key, f"The {filter_key} filter contains an invalid date")


def parse_dates(filters):
    if "published_after" in filters:
        filters["published_after"] = parse_date("published_after", filters["published_after"])

    if "published_before" in filters:
        filters["published_before"] = parse_date("published_after", filters["published_before"])

    return filters


def construct_query_settings(filters: dict[str, Any]) -> PubMedFilterQuerySettings:
    """
    Constructs the query settings from those explicitly set within filters.
    These settings will have to be modified further by the endpoint that is using them.
    """
    settings = PubMedFilterQuerySettings()
    if "graph_size" in filters:
        settings.node_limit = filters["graph_size"]
        del filters["graph_size"]
    else:
        settings.node_limit = 1000

    return settings


def construct_graph_filter(filters: dict[str, Any]) -> PubMedFilterBuilder:
    """
    Constructs a PubMedFilterBuilder that applies a set of filters to the PubMed graph
    to fetch a set of IDs corresponding to the nodes that match the filters.
    These IDs can then later be used to build graphs for visualisation.
    """
    filter_builder = PubMedFilterBuilder()
    if "journal" in filters:
        journal_name = filters["journal"]
        del filters["journal"]
        if len(journal_name.strip()) > 0:
            filter_builder.add_journal_name_filter(journal_name)

    if "mesh_heading" in filters:
        mesh_name = filters["mesh_heading"]
        del filters["mesh_heading"]

        # Find all the matching MeSH headings.
        if len(mesh_name.strip()) > 0:
            filter_builder.add_mesh_name_filter(mesh_name)

    if "author" in filters:
        author_name = filters["author"]
        del filters["author"]
        if len(author_name.strip()) > 0:
            filter_builder.add_author_name_filter(author_name)

    if "affiliation" in filters:
        affiliation_name = filters["affiliation"]
        del filters["affiliation"]
        if len(affiliation_name.strip()) > 0:
            filter_builder.add_affiliation_filter(affiliation_name)

    if "first_author" in filters:
        restrict_to_first_author = filters["first_author"]
        del filters["first_author"]
        if restrict_to_first_author:
            filter_builder.add_first_author_filter()

    if "last_author" in filters:
        restrict_to_last_author = filters["last_author"]
        del filters["last_author"]
        if restrict_to_last_author:
            filter_builder.add_last_author_filter()

    if "article" in filters:
        article_name = filters["article"]
        del filters["article"]
        if len(article_name.strip()) > 0:
            filter_builder.add_article_name_filter(article_name)

    if "published_after" in filters:
        filter_date = filters["published_after"]
        del filters["published_after"]
        boundary_date = datetime.date(year=filter_date.year, month=filter_date.month, day=filter_date.day)
        filter_builder.add_published_after_filter(boundary_date)

    if "published_before" in filters:
        filter_date = filters["published_before"]
        del filters["published_before"]
        boundary_date = datetime.date(year=filter_date.year, month=filter_date.month, day=filter_date.day)
        filter_builder.add_published_before_filter(boundary_date)

    if len(filters) != 0:
        print("Unknown filters present: " + str(filters), file=sys.stderr)

    return filter_builder


def query_graph(filters: dict[str, Any]) -> 'CoAuthorGraph':
    """
    Builds a graph from the given filter options.
    """
    graph_type = "author_coauthors_open"
    if "graph_type" in filters:
        graph_type = filters["graph_type"]
        del filters["graph_type"]

    if graph_type == "author_coauthors_open":
        return query_coauthor_graph(filters, True)
    elif graph_type == "author_coauthors_closed":
        return query_coauthor_graph(filters, False)
    else:
        raise PubMedFilterValueError("graph_type", f"Unknown graph type {graph_type}")


class CoAuthorGraphRecord:
    """
    A single record in a co-author graph (author + potential coauthor).
    """
    def __init__(
            self,
            author_id: int, author: DBAuthor, article_author: DBArticleAuthor,
            article_id: int, article: DBArticle,
            article_coauthor: Optional[DBArticleAuthor], coauthor_id: Optional[int], coauthor: Optional[DBAuthor]):

        self.author_id: int = author_id
        self.author: DBAuthor = author
        self.article_author: DBArticleAuthor = article_author
        self.article_id: int = article_id
        self.article: DBArticle = article
        self.article_coauthor: Optional[DBArticleAuthor] = article_coauthor
        self.coauthor_id: Optional[int] = coauthor_id
        self.coauthor: Optional[DBAuthor] = coauthor


class CoAuthorGraph:
    """
    A graph where authors are represented as nodes,
    and co-authorship of an article is represented as edges.
    """
    def __init__(self, records: list[CoAuthorGraphRecord]):
        self.records: list[CoAuthorGraphRecord] = records

    @property
    def author_ids(self) -> set[int]:
        author_ids: set[int] = set()
        for record in self.records:
            author_ids.add(record.author_id)
            if record.coauthor_id is not None:
                author_ids.add(record.coauthor_id)

        return author_ids

    @property
    def authors_with_coauthors_ids(self):
        author_ids: set[int] = set()
        for record in self.records:
            if record.coauthor_id is not None:
                author_ids.add(record.author_id)
                author_ids.add(record.coauthor_id)

        return author_ids

    @property
    def article_ids(self) -> set[int]:
        article_ids: set[int] = set()
        for record in self.records:
            article_ids.add(record.article_id)

        return article_ids


def query_coauthor_graph(filters: dict[str, Any], open: bool) -> CoAuthorGraph:
    """
    Builds a co-author graph based upon a set of filters
    that returns the central authors to expand upon.
    """
    query_settings = construct_query_settings(filters)
    query_settings.query_authors = True
    graph_filter = construct_graph_filter(filters)

    with neo4j_conn.new_session() as session:
        # Query for the authors that match the filters.
        filter_results = neo4j_conn.filter_query_cache.get_or_run(graph_filter.build(query_settings), session)

        # Query for the co-author graph.
        co_author_graph_results = session.run(
            """
            CYPHER planner=dp
            MATCH (author:Author)
            WHERE id(author) IN $author_ids
            MATCH (author) -[:IS_AUTHOR]-> (article_author:ArticleAuthor) -[:AUTHOR_OF]-> (article:Article)
            WHERE id(article) in $article_ids
            OPTIONAL MATCH (article) <-[:AUTHOR_OF]- (article_coauthor:ArticleAuthor) <-[IS_AUTHOR]- (coauthor:Author)
            WHERE author <> coauthor
            """
            + (" AND id(coauthor) IN $author_ids" if not open else "") +
            """
            RETURN id(author), author, article_author, id(article), article, article_coauthor, id(coauthor), coauthor
            """,
            author_ids=filter_results.author_ids,
            article_ids=filter_results.article_ids
        )

        # Read all the results into model objects.
        records: list[CoAuthorGraphRecord] = []
        for record in co_author_graph_results:
            author_id, author, article_author, article_id, article, article_coauthor, coauthor_id, coauthor = record

            author = PubMedCacheConn.read_author_node(author)
            article_author = PubMedCacheConn.read_article_author_node(article_author)
            article = PubMedCacheConn.read_article_node(article)

            if coauthor_id is not None:
                coauthor = PubMedCacheConn.read_author_node(coauthor)
                article_coauthor = PubMedCacheConn.read_article_author_node(article_coauthor)
            else:
                coauthor = None
                coauthor_id = None
                article_coauthor = None

            records.append(CoAuthorGraphRecord(
                author_id, author, article_author, article_id, article, article_coauthor, coauthor_id, coauthor
            ))

        graph = CoAuthorGraph(records)
        if len(graph.author_ids) >= query_settings.node_limit:
            raise PubMedFilterLimitError(f"The limit of {query_settings.node_limit} nodes was reached")

        return graph
