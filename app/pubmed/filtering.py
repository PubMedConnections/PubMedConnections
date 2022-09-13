import datetime
from typing import Any, Optional, Iterable

import neo4j


class PubMedFilterLimitError(Exception):
    """
    An error that is raised when a PubMed filter hits the maximum number of nodes.
    """
    def __init__(self, message: str):
        super().__init__(message)


class PubMedFilterValueError(Exception):
    """
    An error that is raised when a PubMed filter is invalid.
    """
    def __init__(self, filter_name: str, message: str):
        super().__init__(message)
        self.filter_name = filter_name


class PubMedFilterResults:
    """
    Stores the results of a PubMedFilterBuilder query.
    """
    def __init__(
            self,
            journal_ids: Optional[Iterable[int]] = None,
            mesh_ids: Optional[Iterable[int]] = None,
            article_ids: Optional[Iterable[int]] = None,
            author_ids: Optional[Iterable[int]] = None
    ):
        self.journal_ids: Optional[list[int]] = list(journal_ids) if journal_ids is not None else None
        self.mesh_ids: Optional[list[int]] = list(mesh_ids) if mesh_ids is not None else None
        self.article_ids: Optional[list[int]] = list(article_ids) if article_ids is not None else None
        self.author_ids: Optional[list[int]] = list(author_ids) if author_ids is not None else None


class PubMedFilterQuery:
    """
    A query that is filtered based upon the properties of
    MeSH headings, articles, and authors.
    """
    def __init__(
            self, query: str, variables: dict[str, Any], node_limit: int,
            query_journals, query_mesh, query_articles, query_authors
    ):
        self.query = query
        self.variables = variables
        self.node_limit = node_limit
        self.query_journals = query_journals
        self.query_mesh = query_mesh
        self.query_articles = query_articles
        self.query_authors = query_authors

    def run(self, session: neo4j.Session) -> PubMedFilterResults:
        """
        Runs the transaction to fetch the IDs of all matching nodes.
        """
        results = session.run(self.query, **self.variables)

        # Determine the indices of the elements in the results tuple.
        next_tuple_index = 0

        if self.query_journals:
            journal_index = next_tuple_index
            next_tuple_index += 1
            journal_ids = set()
        else:
            journal_index = -1
            journal_ids = None

        if self.query_mesh:
            mesh_index = next_tuple_index
            next_tuple_index += 1
            mesh_ids = set()
        else:
            mesh_index = -1
            mesh_ids = None

        if self.query_articles:
            article_index = next_tuple_index
            next_tuple_index += 1
            article_ids = set()
        else:
            article_index = -1
            article_ids = None

        if self.query_authors:
            author_index = next_tuple_index
            next_tuple_index += 1
            author_ids = set()
        else:
            author_index = -1
            author_ids = None

        num_records = 0
        for record in results:
            num_records += 1
            if self.query_journals:
                journal_ids.add(record[journal_index])
            if self.query_mesh:
                mesh_ids.add(record[mesh_index])
            if self.query_articles:
                article_ids.add(record[article_index])
            if self.query_authors:
                author_ids.add(record[author_index])

        if self.node_limit is not None and num_records >= self.node_limit:
            raise PubMedFilterLimitError(f"The limit of {self.node_limit} matching nodes was reached")

        return PubMedFilterResults(journal_ids, mesh_ids, article_ids, author_ids)


class PubMedFilterBuilder:
    """
    A helper for building a set of PubMed filters to
    filter MeSH headings, articles, and authors.
    """
    def __init__(self):
        self._node_limit: Optional[int] = None
        self._journal_filters: list[str] = []
        self._mesh_filters: list[str] = []
        self._article_filters: list[str] = []
        self._author_filters: list[str] = []
        self._variable_values: dict[str, Any] = {}

    def _next_filter_var(self, value) -> str:
        """ Adds a new input variable for the filter into the query. """
        name = f"_filter_var{len(self._variable_values) + 1}"
        self._variable_values[name] = value
        return f"${name}"

    def _create_text_filter(self, field: str, filter_name: str, filter_value: str) -> str:
        """
        Creates a filter to match text in a field.
        """
        filter_value = filter_value.lower()
        if len(filter_value) == 0:
            raise PubMedFilterValueError(filter_name, f"{filter_name} cannot be empty")

        return f"toLower({field}) CONTAINS {self._next_filter_var(filter_value)}"

    def add_journal_name_filter(self, journal_name: str):
        """ Adds a filter for the name of the journal that articles are published in. """
        self._journal_filters.append(self._create_text_filter("journal.title", "journal", journal_name))

    def add_mesh_descriptor_id_filter(self, mesh_desc_ids: list[int]):
        """ Adds a filter by an article's Mesh Heading categorisations. """
        if len(mesh_desc_ids) == 0:
            raise PubMedFilterValueError("mesh", "There are no matching MeSH headings")

        self._mesh_filters.append(
            f"mesh_heading.id IN {self._next_filter_var(mesh_desc_ids)}"
        )

    def add_article_name_filter(self, article_name: str):
        """ Adds a filter by the name of articles. """
        self._article_filters.append(self._create_text_filter("article.title", "article", article_name))

    def add_author_name_filter(self, author_name: str):
        """ Adds a filter by the name of authors. """
        self._author_filters.append(self._create_text_filter("author.name", "author", author_name))

    def add_first_author_filter(self):
        """ Adds a filter to only select first authors of articles. """
        self._author_filters.append("author_rel.is_first_author")

    def add_last_author_filter(self):
        """ Adds a filter to only select last authors of articles. """
        self._author_filters.append("author_rel.is_last_author")

    def add_published_after_filter(self, boundary_date: datetime.date):
        """ Adds a filter for all articles published after the given date. """
        self._article_filters.append(
            f"article.date >= {self._next_filter_var(boundary_date)}"
        )

    def add_published_before_filter(self, boundary_date: datetime.date):
        """ Adds a filter for all articles published before the given date. """
        self._article_filters.append(
            f"article.date <= {self._next_filter_var(boundary_date)}"
        )

    def set_node_limit(self, node_limit: Optional[int]):
        """
        Sets the maximum number of nodes of each type to find.
        If this limit is hit, then a PubMedFilterLimitError
        will be raised.
        """
        if node_limit <= 0:
            raise PubMedFilterValueError("graph_size", f"The requested graph size must be positive, not {node_limit}")

        self._node_limit = node_limit

    def build(
            self, *, force_journals=False, force_mesh=False, force_articles=False, force_authors=False
    ) -> PubMedFilterQuery:
        """
        Builds this list of filters into a Cypher query.
        """
        query = "CYPHER planner=dp\n"
        contains_journal_filters = len(self._journal_filters) > 0
        contains_mesh_filters = len(self._mesh_filters) > 0
        contains_article_filters = len(self._article_filters) > 0
        contains_author_filters = len(self._author_filters) > 0

        # Querying authors by MeSH heading requires querying the articles.
        query_journals = force_journals or contains_journal_filters
        query_authors = force_authors or contains_author_filters
        query_articles = force_articles or contains_article_filters or query_authors
        query_mesh = force_mesh or contains_mesh_filters

        if not query_journals and not query_authors and not query_articles and not query_mesh:
            raise ValueError("Not querying for anything. Set some filters, or force query of some results")

        # Journal filters.
        if query_journals:
            query += "MATCH (journal:Journal)\n"
        if contains_journal_filters:
            query += "WHERE\n\t"
            query += "\n\tAND ".join(self._journal_filters) + "\n"

        # MeSH filters.
        if query_mesh:
            query += "MATCH (mesh_heading:MeshHeading)\n"
        if contains_mesh_filters:
            query += "WHERE\n\t"
            query += "\n\tAND ".join(self._mesh_filters) + "\n"

        # Article filters.
        if query_articles:
            left = ""
            right = ""
            if query_journals:
                left = "(journal) <-[article_published_in:PUBLISHED_IN]- "
            if query_mesh:
                right = " -[article_categorised_by:CATEGORISED_BY]-> (mesh_heading)"

            query += f"MATCH {left}(article:Article){right}\n"
        if contains_article_filters:
            query += "WHERE\n\t"
            query += "\n\tAND ".join(self._article_filters) + "\n"

        # Author filters.
        if query_authors:
            if query_articles:
                query += "MATCH (author:Author) -[author_rel:AUTHOR_OF]-> (article)\n"
            else:
                query += "MATCH (author:Author)\n"

        if contains_author_filters:
            query += "WHERE\n\t"
            query += "\n\tAND ".join(self._author_filters) + "\n"

        # Return values.
        return_values = []
        if query_journals:
            return_values.append("id(journal) AS journal_id")
        if query_mesh:
            return_values.append("mesh_heading.id AS mesh_id")
        if query_articles:
            return_values.append("id(article) AS article_id")
        if query_authors:
            return_values.append("id(author) AS author_id")

        # Return.
        query += "RETURN\n\t" + ",\n\t".join(return_values) + "\n"

        # Limits.
        if self._node_limit is not None:
            query += f"LIMIT {self._node_limit}\n"

        return PubMedFilterQuery(
            query, self._variable_values, self._node_limit,
            query_journals, query_mesh, query_articles, query_authors
        )
