import datetime
from typing import Any, Optional, Iterable, cast

import re
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
    def __init__(self, filter_key: str, message: str):
        super().__init__(message)
        self.filter_key = filter_key


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


class PubMedFilterQuerySettings:
    """
    Holds the settings used to build a query.
    """
    def __init__(
            self, node_limit: Optional[int] = None,
            query_journals: bool = False,
            query_mesh: bool = False,
            query_articles: bool = False,
            query_article_citations: bool = False,
            query_authors: bool = False):

        self.node_limit: Optional[int] = node_limit
        self.query_journals: bool = query_journals
        self.query_mesh: bool = query_mesh
        self.query_articles: bool = query_articles
        self.query_article_citations: bool = query_article_citations
        self.query_authors: bool = query_authors

    def copy(self) -> 'PubMedFilterQuerySettings':
        """
        Returns a copy of these settings that may be modified
        without affecting this object.
        """
        return PubMedFilterQuerySettings(
            self.node_limit, self.query_journals, self.query_mesh,
            self.query_articles, self.query_article_citations, self.query_authors
        )

    def is_empty_query(self) -> bool:
        """ Returns whether these settings would lead to a query that queries nothing. """
        return not (self.query_journals or
                    self.query_mesh or
                    self.query_articles or
                    self.query_article_citations or
                    self.query_authors)

    def __eq__(self, other):
        """
        Returns whether this query is equivalent to the other query.
        """
        if type(self) != type(other):
            return False

        other = cast(PubMedFilterQuerySettings, other)
        return (self.node_limit == other.node_limit and
                self.query_journals == other.query_journals and
                self.query_mesh == other.query_mesh and
                self.query_articles == other.query_articles and
                self.query_article_citations == other.query_article_citations and
                self.query_authors == other.query_authors)


class PubMedFilterQuery:
    """
    A query that is filtered based upon the properties of
    MeSH headings, articles, and authors.
    """
    def __init__(self, settings: PubMedFilterQuerySettings, query: str, variables: dict[str, Any]):
        self.settings = settings
        self.query = query
        self.variables = variables

    def __eq__(self, other):
        """
        Returns whether this query is equivalent to the other query.
        """
        if type(self) != type(other):
            return False

        other = cast(PubMedFilterQuery, other)
        return self.settings == other.settings and self.query == other.query and self.variables == other.variables

    def run(self, session: neo4j.Session) -> PubMedFilterResults:
        """
        Runs the transaction to fetch the IDs of all matching nodes.
        """
        settings = self.settings
        results = session.run(self.query, **self.variables)

        # Determine the indices of the elements in the results tuple.
        next_tuple_index = 0

        if settings.query_journals:
            journal_index = next_tuple_index
            next_tuple_index += 1
            journal_ids = set()
        else:
            journal_index = -1
            journal_ids = None

        if settings.query_mesh:
            mesh_index = next_tuple_index
            next_tuple_index += 1
            mesh_ids = set()
        else:
            mesh_index = -1
            mesh_ids = None

        if settings.query_articles:
            article_index = next_tuple_index
            next_tuple_index += 1
            article_ids = set()
        else:
            article_index = -1
            article_ids = None

        if settings.query_authors:
            author_index = next_tuple_index
            next_tuple_index += 1
            author_ids = set()
        else:
            author_index = -1
            author_ids = None

        num_records = 0
        for record in results:
            num_records += 1
            if settings.query_journals:
                journal_ids.add(record[journal_index])
            if settings.query_mesh:
                mesh_ids.add(record[mesh_index])
            if settings.query_articles:
                article_ids.add(record[article_index])
            if settings.query_authors:
                author_ids.add(record[author_index])

        if settings.node_limit is not None and num_records >= settings.node_limit:
            raise PubMedFilterLimitError(f"The limit of {settings.node_limit} nodes was reached")

        return PubMedFilterResults(journal_ids, mesh_ids, article_ids, author_ids)


class PubMedFilterBuilder:
    """
    A helper for building a set of PubMed filters to
    filter MeSH headings, articles, and authors.
    """
    def __init__(self):
        self._journal_filters: list[str] = []
        self._mesh_filters: list[str] = []
        self._article_filters: list[str] = []
        self._article_citations_filters: list[str] = []
        self._author_filters: list[str] = []
        self._author_of_rel_filters: list[str] = []
        self._variable_values: dict[str, Any] = {}

    def get_parameter_map(self):
        """
        Returns a parameter map that can be used for queries
        built with multiple calls to build on this builder.
        """
        return self._variable_values

    def _next_filter_var(self, value) -> str:
        """
        Adds a new input variable for the filter into the query if
        variable use is enabled, or otherwise adds the value in-situ.
        """
        name = f"_filter_var{len(self._variable_values) + 1}"
        self._variable_values[name] = value
        return f"${name}"

    def _create_text_filter(
            self,
            field: str,
            filter_key: str,
            filter_value: str,
            *,
            escape_chars: str = "\\",
            quote_chars: str = "'\"",
            separator_chars: str = ";",
            wildcard_chars: str = "*"
    ) -> str:
        """
        Creates a filter to approximately match text in a field.
        Supports exact matching, matching multiple authors, and the use of wildcards.
        """
        if len(filter_value) == 0:
            raise PubMedFilterValueError(filter_key, f"{filter_key} should not be empty")

        # Parse the text pieces to match.
        pieces = [[""]]
        exact_pieces = []
        quoted = False
        escape_next = False
        last_escape_char = None
        for index, ch in enumerate(filter_value):
            next_ch = (filter_value[index + 1] if index + 1 < len(filter_value) else None)
            escaped = escape_next
            escape_next = False

            # If the first character of a piece is a quote, then treat it as an exact match without wildcards.
            if ch in quote_chars:
                if not escaped:
                    # We only allow starting an exact quotation after whitespace.
                    if len(pieces[-1]) == 1 and len(pieces[-1][0].strip()) == 0:
                        quoted = True
                        pieces[-1][0] = ""  # Quotation ignores the preceding whitespace.
                        continue
                else:
                    escaped = False

            # If a quotation mark is found before the next separator (or EOF), then mark the end of quoting.
            if quoted and ch in quote_chars and (next_ch is None or next_ch in separator_chars):
                if not escaped:
                    quoted = False
                    assert len(pieces[-1]) == 1
                    # Move the piece to the exact_pieces array and delete it from the pieces list.
                    exact_pieces.append(pieces[-1][0])
                    del pieces[-1]
                    continue
                else:
                    escaped = False

            # If we are in an exact match quote, then treat all special characters as escaped.
            if quoted:
                escaped = True

            # Allow escaping special characters to ignore their special meaning.
            if ch in escape_chars:
                if not escaped:
                    escape_next = True
                    last_escape_char = ch
                    continue
                else:
                    escaped = False

            # Allow separators to match multiple pieces of text.
            if ch in separator_chars:
                if not escaped:
                    pieces.append([""])
                    continue
                else:
                    escaped = False

            # Allow wildcards to match more varying text patterns.
            if ch in wildcard_chars:
                if not escaped:
                    pieces[-1].append("")
                    continue
                else:
                    escaped = False

            # If the escape wasn't used, then treat it like a normal character.
            if not quoted and escaped:
                pieces[-1][-1] += last_escape_char

            # Add the character to the last piece.
            pieces[-1][-1] += ch

        # Construct the conditions from the pieces.
        conditions = []
        for exact_piece in exact_pieces:
            conditions.append(f"{field} = {self._next_filter_var(exact_piece)}")

        for inexact_piece in pieces:
            # Strip whitespace from the start and end of the piece.
            inexact_piece[0] = inexact_piece[0].lstrip()
            inexact_piece[-1] = inexact_piece[-1].rstrip()

            # No wildcards if the length is 1.
            if len(inexact_piece) == 1:
                term = inexact_piece[0].lower()
                conditions.append(f"toLower({field}) CONTAINS {self._next_filter_var(term)}")
            else:
                regex = ".*".join(re.escape(term.lower()) for term in inexact_piece)
                conditions.append(f"toLower({field}) =~ {self._next_filter_var(regex)}")

        return "(" + " OR ".join(conditions) + ")"
    
    def _create_exact_text_filter(self, field: str, filter_key: str, filter_value: str, use_variables: bool = True) -> str:
        """
        Creates a filter to exactly match text in a field.
        """
        return f"{field} = {self._next_filter_var(filter_value)}"

    def add_journal_name_filter(self, journal_name: str):
        """ Adds a filter for the name of the journal that articles are published in. """
        self._journal_filters.append(self._create_text_filter("journal.title", "journal", journal_name))

    def add_mesh_descriptor_id_filter(self, mesh_desc_ids: list[int]):
        """ Adds a filter by an article's Mesh Heading categorisations. """
        if len(mesh_desc_ids) == 0:
            raise PubMedFilterValueError("mesh", "There are no matching MeSH headings")

        self._mesh_filters.append(f"mesh_heading.id IN {self._next_filter_var(mesh_desc_ids)}")

    def add_mesh_name_filter(self, mesh_name: str):
        """ Adds a filter by the name of MeSH headings. """
        self._mesh_filters.append(self._create_text_filter("mesh_heading.name", "mesh_heading", mesh_name))

    def add_article_name_filter(self, article_name: str):
        """ Adds a filter by the name of articles. """
        self._article_filters.append(self._create_text_filter("article.title", "article", article_name))

    def add_affiliation_filter(self, affiliation_name: str):
        """ Adds a filter by the name of articles. """
        self._author_of_rel_filters.append(
            self._create_text_filter("author_rel.affiliation", "affiliation", affiliation_name)
        )

    def add_author_name_filter(self, author_name: str):
        """
        Adds a filter by the name of authors.
        """
        self._author_filters.append(self._create_text_filter(
            "author.name", "author", author_name,
            separator_chars=",;",
            wildcard_chars=".*"
        ))

    def add_first_author_filter(self):
        """ Adds a filter to only select first authors of articles. """
        self._author_of_rel_filters.append("author_rel.is_first_author")

    def add_last_author_filter(self):
        """ Adds a filter to only select last authors of articles. """
        self._author_of_rel_filters.append("author_rel.is_last_author")

    def add_published_after_filter(self, boundary_date: datetime.date):
        """ Adds a filter for all articles published after the given date. """
        self._article_filters.append(f"article.date >= {self._next_filter_var(boundary_date)}")

    def add_published_before_filter(self, boundary_date: datetime.date):
        """ Adds a filter for all articles published before the given date. """
        self._article_filters.append(f"article.date <= {self._next_filter_var(boundary_date)}")

    def build(
            self, settings: PubMedFilterQuerySettings, *,
            node_query: bool = False, relationship_query: bool = False
    ) -> PubMedFilterQuery:
        """
        Builds this list of filters into a Cypher query.
        """
        visualise_query = not node_query and not relationship_query

        query = ""
        if visualise_query:
            query += "CYPHER planner=dp\n"
        elif relationship_query:
            query += "CALL {\n"

        contains_journal_filters = len(self._journal_filters) > 0
        contains_mesh_filters = len(self._mesh_filters) > 0
        contains_article_filters = len(self._article_filters) > 0
        contains_article_citations_filters = len(self._article_citations_filters) > 0
        contains_author_filters = len(self._author_filters) > 0
        contains_author_of_rel_filters = len(self._author_of_rel_filters) > 0

        # Querying some fields requires querying others.
        if contains_journal_filters:
            settings.query_journals = True
        if contains_author_filters or contains_author_of_rel_filters:
            settings.query_authors = True
        if contains_article_citations_filters:
            settings.query_article_citations = True
        if contains_article_filters or settings.query_authors or settings.query_article_citations:
            settings.query_articles = True
        if contains_mesh_filters:
            settings.query_mesh = True

        if settings.is_empty_query():
            raise ValueError("Not querying for anything. Set some filters, or force query of some results")

        # Journal and MeSH relationships require additional filters for articles and authors.
        effective_article_author_filters = self._article_filters + self._author_filters + self._author_of_rel_filters

        # Journal filters.
        if settings.query_journals:
            query += "MATCH (journal:Journal)\n"
            effective_article_author_filters.append("exists((article)-[:PUBLISHED_IN]->(journal))")
        if contains_journal_filters:
            query += "WHERE\n\t"
            query += "\n\tAND ".join(self._journal_filters) + "\n"

        # MeSH filters.
        if settings.query_mesh:
            query += "MATCH (mesh_heading:MeshHeading)\n"
            effective_article_author_filters.append("exists((article)-[:CATEGORISED_BY]->(mesh_heading))")
        if contains_mesh_filters:
            query += "WHERE\n\t"
            query += "\n\tAND ".join(self._mesh_filters) + "\n"

        # Article and Author filters (combined for speed).
        if settings.query_articles and settings.query_authors:
            query += "MATCH (article:Article) <-[author_rel:AUTHOR_OF]- (author:Author)"
        elif settings.query_articles:
            query += "MATCH (article:Article)"
        elif settings.query_articles:
            query += "MATCH (author:Author)"
        if len(effective_article_author_filters) > 0:
            query += "WHERE\n\t"
            query += "\n\tAND ".join(effective_article_author_filters) + "\n"

        # Article citation filters.
        if settings.query_article_citations:
            query += """
            CALL {
                WITH article
                MATCH (article) <-[article_citation_rel:CITES]- (:Article)
                RETURN COUNT(article_citation_rel) AS article_citations
            }
            """
        if contains_article_citations_filters:
            query += "WHERE\n\t"
            query += "\n\tAND ".join(self._article_citations_filters) + "\n"

        # Collect and Unwind.
        if node_query:
            query += "OPTIONAL MATCH (author:Author) --> (article) <-- (coauthor:Author)\n"
            query += "WITH COLLECT(id(author)) + COLLECT(id(coauthor)) AS ids\n"
            query += "UNWIND ids as id\n"
        
        if relationship_query:
            query += "OPTIONAL MATCH (author:Author) --> (article) <-- (coauthor:Author)\n"
            query += "WITH COLLECT(DISTINCT author) as authors, COLLECT(DISTINCT article) as articles\n"
            query += "UNWIND authors as author\n"
            query += "UNWIND articles as article\n"

        # Return values.
        return_values = []
        if visualise_query:
            if settings.query_journals:
                return_values.append("id(journal) AS journal_id")
            if settings.query_mesh:
                return_values.append("mesh_heading.id AS mesh_id")
            if settings.query_articles:
                return_values.append("id(article) AS article_id")
            if settings.query_authors:
                return_values.append("id(author) AS author_id")
        if node_query:
            return_values.append("DISTINCT id")
        if relationship_query:
            return_values.append("author")
            return_values.append("article")

        # Return.
        query += "RETURN\n\t" + ",\n\t".join(return_values) + "\n"

        # Limits.
        if settings.node_limit is not None and not relationship_query:
            query += f"LIMIT {self._next_filter_var(settings.node_limit)}\n"

        if relationship_query:
            query += "}\n\n"
            query += "MATCH (author1:Author)-[:AUTHOR_OF]->(article:Article)<-[:AUTHOR_OF]-(author2:Author)\n"
            query += "WHERE author1 = author OR author2 = author\n"
            query += "RETURN id(author1) as source, id(author2) as target, apoc.create.vRelationship(author1, 'COAUTHOR', {count: count(*)}, author2) as rel\n"

        return PubMedFilterQuery(settings, query, self._variable_values)


class PubMedFilterCache:
    """
    Caches the results of past filter queries to be re-used for future requests.
    This is especially helpful when only changing the graph properties.
    """
    def __init__(self, results_to_hold: int = 10):
        self.results_to_hold = results_to_hold
        self.past_results: list[tuple[PubMedFilterQuery, PubMedFilterResults]] = []

    def get(self, query: PubMedFilterQuery) -> Optional[PubMedFilterResults]:
        """
        If the results for the given query have been saved, returns them.
        Otherwise, returns None.
        """
        for past_query, results in self.past_results:
            if past_query == query:
                return results

        return None

    def add(self, query: PubMedFilterQuery, results: PubMedFilterResults):
        """
        Saves the results of the given query so that they can be re-used
        if the same query is made in the future.
        """
        self.past_results.append((query, results))
        while len(self.past_results) > self.results_to_hold:
            self.past_results = self.past_results[1:]

    def get_or_run(self, query: PubMedFilterQuery, session: neo4j.Session) -> PubMedFilterResults:
        """
        If the results of the query have been cached, then returns the cached results.
        Otherwise, runs the query and caches the results.
        """
        existing_results = self.get(query)
        if existing_results is not None:
            return existing_results

        results = query.run(session)
        self.add(query, results)
        return results
