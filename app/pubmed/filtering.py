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
            article_ids: Optional[Iterable[int]] = None,
            author_ids: Optional[Iterable[int]] = None):

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
            query_authors: bool = False,
            query_affiliation: bool = False):

        self.node_limit: Optional[int] = node_limit
        self.query_journals: bool = query_journals
        self.query_mesh: bool = query_mesh
        self.query_articles: bool = query_articles
        self.query_authors: bool = query_authors
        self.query_affiliation: bool = query_affiliation

    def copy(self) -> 'PubMedFilterQuerySettings':
        """
        Returns a copy of these settings that may be modified
        without affecting this object.
        """
        return PubMedFilterQuerySettings(
            self.node_limit, self.query_journals, self.query_mesh,
            self.query_articles, self.query_authors, self.query_affiliation
        )

    def is_empty_query(self) -> bool:
        """ Returns whether these settings would lead to a query that queries nothing. """
        return not (self.query_journals or
                    self.query_mesh or
                    self.query_articles or
                    self.query_authors or
                    self.query_affiliation)

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
                self.query_authors == other.query_authors and
                self.query_affiliation == other.query_affiliation)


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

        author_ids = (set() if settings.query_authors else None)
        article_ids = (set() if settings.query_articles else None)

        num_records = 0
        for record in results:
            num_records += 1
            if settings.query_articles:
                article_ids.update(record["article_ids"])
            if settings.query_authors:
                author_ids.add(record["author_id"])

        if settings.node_limit is not None and num_records >= settings.node_limit:
            raise PubMedFilterLimitError(f"The limit of {settings.node_limit} nodes was reached")

        return PubMedFilterResults(article_ids, author_ids)


class PubMedFilterComponent:
    """
    A single filter of a query.
    """
    def __init__(self, cypher_condition: str, specificity: float):
        """
        Parameters:
            cypher_condition: The Cypher condition to be used in a WHERE clause for filtering.
            specificity: A value representing how specific a filter is. The higher the
                specificity, the fewer nodes that would be expected to pass this filter.
        """
        self.cypher_condition: str = cypher_condition
        self.specificity: float = max(1.0, specificity)

    @staticmethod
    def calculate_specificity(filters: list['PubMedFilterComponent']) -> float:
        """
        Calculates a total specificity for all the given filters.
        """
        specificity = 1
        for filter in filters:
            specificity *= filter.specificity

        return specificity

    @staticmethod
    def create_where_clause(filters: list['PubMedFilterComponent']) -> str:
        """
        Creates a WHERE clause to apply all the given filters.
        Return the Cypher WHERE clause to include in a query.
        """
        query = "WHERE\n\t"
        for index, filter in enumerate(filters):
            if index > 0:
                query += "\tAND "
            query += f"{filter.cypher_condition}\n"

        return query



class PubMedFilterBuilder:
    """
    A helper for building a set of PubMed filters to
    filter MeSH headings, articles, and authors.
    """
    def __init__(self):
        self._journal_filters: list[PubMedFilterComponent] = []
        self._mesh_filters: list[PubMedFilterComponent] = []
        self._article_filters: list[PubMedFilterComponent] = []
        self._article_author_filters: list[PubMedFilterComponent] = []
        self._author_filters: list[PubMedFilterComponent] = []
        self._affiliation_filters: list[PubMedFilterComponent] = []
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
            specificity_max_length: int = 18,
            specificity_mul: float = 1,
            escape_chars: str = "\\",
            quote_chars: str = "'\"",
            separator_chars: str = ";",
            wildcard_chars: str = "*"
    ) -> PubMedFilterComponent:
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
        specificity = 5**10
        for exact_piece in exact_pieces:
            conditions.append(f"{field} = {self._next_filter_var(exact_piece)}")

        for inexact_piece in pieces:
            # Strip whitespace from the start and end of the piece.
            inexact_piece[0] = inexact_piece[0].lstrip()
            inexact_piece[-1] = inexact_piece[-1].rstrip()

            # No wildcards if the length is 1.
            term_chars = 0
            if len(inexact_piece) == 1:
                term = inexact_piece[0].lower()
                term_chars = len(term)
                conditions.append(f"toLower({field}) CONTAINS {self._next_filter_var(term)}")
            else:
                for term in inexact_piece:
                    term_chars += len(term)

                regex = ".*".join(re.escape(term.lower()) for term in inexact_piece)
                conditions.append(f"toLower({field}) =~ {self._next_filter_var(regex)}")

            # Attempt to quantify how specific this filter is.
            specificity = min(specificity, 5**(min(9.0, 9.0 * term_chars / specificity_max_length)))

        return PubMedFilterComponent("(" + " OR ".join(conditions) + ")", specificity * specificity_mul)

    def add_journal_name_filter(self, journal_name: str):
        """ Adds a filter for the name of the journal that articles are published in. """
        self._journal_filters.append(self._create_text_filter("journal.title", "journal", journal_name))

    def add_mesh_name_filter(self, mesh_name: str):
        """ Adds a filter by the name of MeSH headings. """
        self._mesh_filters.append(
            self._create_text_filter("mesh_heading.name", "mesh_heading", mesh_name, specificity_max_length=9))

    def add_article_name_filter(self, article_name: str):
        """ Adds a filter by the name of articles. """
        self._article_filters.append(self._create_text_filter("article.title", "article", article_name))

    def add_affiliation_filter(self, affiliation_name: str):
        """ Adds a filter by the name of articles. """
        self._affiliation_filters.append(
            self._create_text_filter("affiliation.name", "affiliation", affiliation_name)
        )

    def add_author_name_filter(self, author_name: str):
        """
        Adds a filter by the name of authors.
        """
        self._author_filters.append(self._create_text_filter(
            "author.name", "author", author_name,
            specificity_max_length=9,
            specificity_mul=10,
            separator_chars=",;",
            wildcard_chars=".*"
        ))

    def add_first_author_filter(self):
        """ Adds a filter to only select first authors of articles. """
        self._article_author_filters.append(PubMedFilterComponent("article_author.is_first_author", 8.0))

    def add_last_author_filter(self):
        """ Adds a filter to only select last authors of articles. """
        self._article_author_filters.append(PubMedFilterComponent("article_author.is_last_author", 8.0))

    def add_published_after_filter(self, boundary_date: datetime.date):
        """ Adds a filter for all articles published after the given date. """
        self._article_filters.append(PubMedFilterComponent(
            f"article.date >= {self._next_filter_var(boundary_date)}", 3.0
        ))

    def add_published_before_filter(self, boundary_date: datetime.date):
        """ Adds a filter for all articles published before the given date. """
        self._article_filters.append(PubMedFilterComponent(
            f"article.date <= {self._next_filter_var(boundary_date)}", 3.0
        ))

    def build_articles_first_cypher(self, settings: PubMedFilterQuerySettings, return_values: list[str]) -> str:
        """
        Builds a query matching all journals, articles, and MeSH headings
        that pass the filters of this builder.
        """
        query = ""
        articles_match_left = ""
        articles_match_right = ""
        articles_match_filters = self._article_filters

        # Journal matching.
        if settings.query_journals:
            if settings.query_articles:
                articles_match_left = "(journal:Journal) <-[:PUBLISHED_IN]- "
                articles_match_filters += self._journal_filters
            else:
                query += "MATCH (journal:Journal)\n"
                if len(self._journal_filters) > 0:
                    query += PubMedFilterComponent.create_where_clause(self._journal_filters)

        # MeSH Headings.
        if settings.query_mesh:
            if settings.query_articles:
                articles_match_right = "-[:CATEGORISED_BY]-> (mesh_heading:MeshHeading)"
                articles_match_filters += self._mesh_filters
            else:
                query += "MATCH (mesh_heading:MeshHeading)\n"
                if len(self._mesh_filters) > 0:
                    query += PubMedFilterComponent.create_where_clause(self._mesh_filters)

        # Articles.
        if settings.query_articles:
            query += f"MATCH {articles_match_left}(article:Article){articles_match_right}\n"
            if len(articles_match_filters) > 0:
                query += PubMedFilterComponent.create_where_clause(articles_match_filters)
            query += "WITH DISTINCT article\n"
            return_values.append("COLLECT(id(article)) AS article_ids")

        return query

    def build_articles_last_cypher(self, settings: PubMedFilterQuerySettings, return_values: list[str]) -> str:
        """
        Builds a query matching all journals, articles, and MeSH headings
        that pass the filters of this builder.
        """
        query = ""
        articles_match_left = ""
        articles_match_right = ""
        articles_match_filters = self._article_filters

        # Journal matching.
        if settings.query_journals:
            if settings.query_articles:
                articles_match_left = "(journal:Journal) <-[:PUBLISHED_IN]- "
                articles_match_filters += self._journal_filters
            else:
                query += "MATCH (journal:Journal)\n"
                if len(self._journal_filters) > 0:
                    query += PubMedFilterComponent.create_where_clause(self._journal_filters)

        # Author.
        if settings.query_articles and settings.query_authors:
            articles_match_right = " <-[:AUTHOR_OF]- (article_author)"

        # MeSH Headings.
        matched_mesh = False
        if settings.query_mesh and articles_match_left == "":
            matched_mesh = True
            articles_match_left = "(mesh_heading:MeshHeading) <-[:CATEGORISED_BY]- "
            articles_match_filters += self._mesh_filters
        if settings.query_mesh and articles_match_right == "":
            matched_mesh = True
            articles_match_right = " -[:CATEGORISED_BY]-> (mesh_heading:MeshHeading)"
            articles_match_filters += self._mesh_filters

        # Articles.
        if settings.query_articles:
            query += f"MATCH {articles_match_left}(article:Article){articles_match_right}\n"
            if len(articles_match_filters) > 0:
                query += PubMedFilterComponent.create_where_clause(articles_match_filters)
            query += "WITH DISTINCT article"
            if settings.query_authors:
                query += ", author"
            query += "\n"
            return_values.append("COLLECT(id(article)) AS article_ids")

        # MeSH filters.
        if settings.query_mesh and not matched_mesh:
            query += "MATCH (mesh_heading:MeshHeading)  <-[:CATEGORISED_BY]- (article)\n"
            if len(self._mesh_filters) > 0:
                query += PubMedFilterComponent.create_where_clause(self._mesh_filters)

            # We use the collect to reduce the cardinality of the query.
            # Otherwise, any querying after this would occur for every
            # matching MeSH heading as well.
            query += "WITH COLLECT(DISTINCT mesh_heading) AS mesh_headings"
            if settings.query_articles:
                query += ", article"
            if settings.query_authors:
                query += ", author"
            query += "\n"

        return query

    def build_authors_first_cypher(self, settings: PubMedFilterQuerySettings, return_values: list[str]) -> str:
        """
        Builds a query matching all authors that pass the filters of this builder.
        """
        query = ""
        authors_match_left = ""
        authors_match_right = ""
        authors_match_filters = self._article_author_filters

        # Affiliation.
        if settings.query_affiliation:
            if settings.query_authors:
                authors_match_left = "(affiliation:Affiliation) <-[:AFFILIATED_WITH]- "
                authors_match_filters += self._affiliation_filters
            else:
                query += "MATCH (affiliation:Affiliation)\n"
                if len(self._affiliation_filters) > 0:
                    query += PubMedFilterComponent.create_where_clause(self._affiliation_filters)

        # Author.
        if settings.query_authors:
            authors_match_right = " <-[:IS_AUTHOR]- (author:Author)"
            authors_match_filters += self._author_filters

        # Article Author.
        if settings.query_authors:
            query += f"MATCH {authors_match_left}(article_author:ArticleAuthor){authors_match_right}\n"
            if len(authors_match_filters) > 0:
                query += PubMedFilterComponent.create_where_clause(authors_match_filters)

            if settings.query_articles:
                query += "WITH DISTINCT article_author, author"
            else:
                query += "WITH DISTINCT author"
            query += "\n"

            return_values.append("id(author) AS author_id")

        return query

    def build_authors_last_cypher(self, settings: PubMedFilterQuerySettings, return_values: list[str]) -> str:
        """
        Builds a query matching all authors that pass the filters of this builder.
        """
        query = ""
        authors_match_left = ""
        authors_match_right = ""
        authors_match_filters = self._article_author_filters

        # Affiliation.
        if settings.query_affiliation:
            if settings.query_authors:
                authors_match_left = "(affiliation:Affiliation) <-[:AFFILIATED_WITH]- "
                authors_match_filters += self._affiliation_filters
            else:
                query += "MATCH (affiliation:Affiliation)\n"
                if len(self._affiliation_filters) > 0:
                    query += PubMedFilterComponent.create_where_clause(self._affiliation_filters)

        # Article.
        if settings.query_articles and settings.query_authors:
            authors_match_right = " -[:AUTHOR_OF]-> (article)"

        # Author.
        matched_author = False
        if settings.query_authors and authors_match_left == "":
            matched_author = True
            authors_match_left = "(author:Author) -[:IS_AUTHOR]-> "
            authors_match_filters += self._author_filters
        if settings.query_authors and authors_match_right == "":
            matched_author = True
            authors_match_right = " <-[:IS_AUTHOR]- (author:Author)"
            authors_match_filters += self._author_filters

        # Articles.
        if settings.query_authors:
            query += f"MATCH {authors_match_left}(article_author:ArticleAuthor){authors_match_right}\n"
            if len(authors_match_filters) > 0:
                query += PubMedFilterComponent.create_where_clause(authors_match_filters)

            if matched_author:
                query += "WITH DISTINCT author, article\n"
            else:
                query += "WITH DISTINCT article_author, article\n"
            return_values.append("id(author) AS author_id")

        # Author.
        if settings.query_authors and not matched_author:
            query += "MATCH (article_author) <-[:IS_AUTHOR]- (author:Author)\n"
            if len(self._author_filters) > 0:
                query += PubMedFilterComponent.create_where_clause(self._author_filters)

        return query

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
        contains_article_author_filters = len(self._article_author_filters) > 0
        contains_author_filters = len(self._author_filters) > 0
        contains_affiliation_filters = len(self._affiliation_filters) > 0

        # Querying some fields requires querying others.
        if contains_journal_filters:
            settings.query_journals = True
        if contains_mesh_filters:
            settings.query_mesh = True
        if contains_affiliation_filters:
            settings.query_affiliation = True
        if contains_author_filters or contains_article_author_filters or settings.query_affiliation:
            settings.query_authors = True
        if contains_article_filters or settings.query_authors or (settings.query_mesh and settings.query_journals):
            settings.query_articles = True

        if settings.is_empty_query():
            raise ValueError("Not querying for anything. Set some filters, or force query of some results")

        article_filters = self._article_filters + self._journal_filters + self._mesh_filters
        article_filters_specificity = PubMedFilterComponent.calculate_specificity(article_filters)

        author_filters = self._author_filters + self._article_author_filters + self._affiliation_filters
        author_filters_specificity = PubMedFilterComponent.calculate_specificity(author_filters) / 2.0

        # Build the queries.
        return_values = []
        if article_filters_specificity > author_filters_specificity:
            query += self.build_articles_first_cypher(settings, return_values)
            query += self.build_authors_last_cypher(settings, return_values)
        else:
            query += self.build_authors_first_cypher(settings, return_values)
            query += self.build_articles_last_cypher(settings, return_values)

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

        print("author_filters_specificity =", author_filters_specificity)
        print("article_filters_specificity =", article_filters_specificity)
        print("query =\n", query)

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
