"""
Tool to construct graphs to pass to the frontend.
"""
import math
import textwrap
import matplotlib.pyplot as plt
from typing import Callable, cast, Optional, TypeVar

from app.pubmed.filtering import PubMedFilterValueError
from app.pubmed.model import DBArticle, DBAuthor, DBArticleAuthorRelation


T = TypeVar("T")


def scale_value_source_results_log(values: dict[T, float]) -> dict[T, float]:
    """
    Takes value source results that fall into an arbitrary range of values,
    and scales them into the range [0, 1]. This is done by shifting all
    values such that the minimum value falls at 1, and then linearly
    scaling the log-10 of the shifted values.
    """
    if len(values) == 0:
        return {}

    # Find the limits.
    shift_for_log_value = None
    for value in values.values():
        if shift_for_log_value is None or value < shift_for_log_value:
            shift_for_log_value = value

    # Take the log of all the values.
    values = {key: math.log(value + shift_for_log_value + 1) for key, value in values.items()}

    # Find the limits.
    min_value = None
    max_value = None
    for value in values.values():
        if min_value is None or value < min_value:
            min_value = value
        if max_value is None or value > max_value:
            max_value = value

    # Scale based upon the limits.
    value_range = max_value - min_value
    if value_range == 0:
        scaled = {key: 0.75 for key in values.keys()}
    else:
        scaled: dict[T, float] = {}
        for key, value in values.items():
            scaled[key] = (value - min_value) / value_range

    return scaled


class NodesValueSource:
    """
    A source that can assign values in the range [0, 1] to nodes,
    which can then be used for their visualisation.
    """
    def __init__(self):
        pass

    def query(self, graph: 'Graph') -> dict[int, float]:
        """
        Queries the graph, and potentially the database, to find the values of nodes.
        Returns the values of nodes as a dictionary from the node IDs to their values.
        """
        raise NotImplementedError()

    def __eq__(self, other):
        """
        We use this to help with memoisation of results when sources are used more than once.
        If a source takes parameters, then this will need to be overridden.
        """
        return type(self) == type(other)


class ConstantNodesValueSource(NodesValueSource):
    """
    A source that always returns a fixed value.
    """
    def __init__(self, value: float = 0.75):
        super().__init__()
        self.value = value

    def query(self, graph: 'Graph') -> dict[int, float]:
        result: dict[int, float] = {}
        for node_id in graph.nodes:
            result[node_id] = self.value
        return result


class MatchedNodesValueSource(NodesValueSource):
    """
    A source that assigns one value to matched nodes, and another to connected nodes.
    """
    def __init__(self, matched_value: float = 0.75, connected_value: float = 0.25):
        super().__init__()
        self.matched_value = matched_value
        self.connected_value = connected_value

    def query(self, graph: 'Graph') -> dict[int, float]:
        result: dict[int, float] = {}
        for node_id, node in graph.nodes.items():
            result[node_id] = self.matched_value if node.is_root_node else self.connected_value
        return result


class EdgeCountNodesValueSource(NodesValueSource):
    """
    A source that assigns one value to matched nodes, and another to connected nodes.
    """
    def __init__(self, matched_value: float = 0.75, connected_value: float = 0.25):
        super().__init__()
        self.matched_value = matched_value
        self.connected_value = connected_value

    def query(self, graph: 'Graph') -> dict[int, float]:
        result: dict[int, float] = {}
        for node_id in graph.nodes.keys():
            result[node_id] = len(graph.node_edges[node_id])

        return scale_value_source_results_log(result)


class AuthorCitationsNodesValueSource(NodesValueSource):
    """
    A source that assigns 1 to the node with the highest citations,
    0 to the node with the lowest citations, and values between
    0 and 1 for the rest of the nodes.
    """
    def __init__(self):
        super().__init__()

    def query(self, graph: 'Graph') -> dict[int, float]:
        raise NotImplementedError()


class EdgesValueSource:
    """
    A source that can assign values in the range [0, 1] to nodes,
    which can then be used for their visualisation.
    """
    def __init__(self):
        pass

    def query(self, graph: 'Graph') -> dict[tuple[int, int], float]:
        """
        Queries the graph, and potentially the database, to find the values of nodes.
        Returns the values of nodes as a dictionary from the node IDs to their values.
        """
        raise NotImplementedError()

    def __eq__(self, other):
        """
        We use this to help with memoisation of results when sources are used more than once.
        If a source takes parameters, then this will need to be overridden.
        """
        return type(self) == type(other)


class ConstantEdgesValueSource(EdgesValueSource):
    """
    A source that always returns a fixed value.
    """
    def __init__(self, value: float = 0.75):
        super().__init__()
        self.value = value

    def query(self, graph: 'Graph') -> dict[tuple[int, int], float]:
        result: dict[tuple[int, int], float] = {}
        for edge_key in graph.edges:
            result[edge_key] = self.value
        return result


class CoAuthoredArticlesEdgesValueSource(EdgesValueSource):
    """
    A source that assigns 1 to the edge with the highest number of co-authored articles,
    0 to the edge with the lowest number of co-authored articles, and values between
    0 and 1 for the rest of the edges.
    """
    def __init__(self):
        super().__init__()

    def query(self, graph: 'Graph') -> dict[tuple[int, int], float]:
        result: dict[tuple[int, int], float] = {}
        for edge_key, edge in graph.edges.items():
            result[edge_key] = len(cast(CoAuthorEdge, edge).articles)

        return scale_value_source_results_log(result)


class GraphOptions:
    """
    A class for holding the visualisation options for graphs.
    """
    def __init__(self):
        self._node_limit: int = 1000
        self.node_size_source: NodesValueSource = MatchedNodesValueSource()
        self.node_colour_source: NodesValueSource = MatchedNodesValueSource()
        self.edge_size_source: EdgesValueSource = ConstantEdgesValueSource()

    @property
    def node_limit(self) -> int:
        """ The maximum number of nodes to visualise. """
        return self._node_limit

    @node_limit.setter
    def node_limit(self, value: int):
        if value <= 0:
            raise PubMedFilterValueError("graph_size", f"The requested graph size must be positive, not {value}")
        self._node_limit = value


class GraphNode:
    """
    Represents a node in a graph built using GraphBuilder.
    """
    def __init__(self, node_id: int, is_root_node: bool):
        self.node_id: int = node_id
        self.is_root_node: bool = is_root_node

    def get_label(self) -> Optional[str]:
        """ Returns the name of this node to be used in the graph. """
        return None

    def get_title(self) -> Optional[str]:
        """ Returns the tooltip text of this node in the graph. """
        return None


def list_articles_for_description(articles, *, max_article_lines=8) -> str:
    """
    Lists the articles in a list to be added to the description of an edge or node.
    Assumes that duplicate articles are not present.
    """
    article_titles = []

    # Collect the titles of all the articles.
    for article in articles:
        date_str = article.date.strftime('%Y')
        truncated_title = textwrap.shorten(article.title, width=64, placeholder="...")
        article_titles.append(f"{date_str}: {truncated_title}")

    # Sort them by date (as the date shows up first in the string).
    article_titles = list(sorted(article_titles))[::-1]

    # Decide if we need to truncate the number of articles that are shown.
    too_many_articles = len(article_titles) > max_article_lines
    article_names_to_show = article_titles[:max_article_lines - 1] if too_many_articles else article_titles
    if too_many_articles:
        article_names_to_show.append(f"+ {len(article_titles) - max_article_lines + 1} more")

    return " - " + "\n - ".join(article_names_to_show)


class AuthorNode(GraphNode):
    """
    Represents a node in an author graph.
    """
    def __init__(self, is_root_node: bool, author: DBAuthor, articles: list[DBArticle]):
        super().__init__(author.author_id, is_root_node)
        self.author: DBAuthor = author
        self.articles: list[DBArticle] = articles

    def get_label(self) -> Optional[str]:
        """ Returns the name of this node to be used in the graph. """
        return self.author.full_name

    def get_title(self) -> Optional[str]:
        """ Returns the tooltip text of this node in the graph. """
        title = f"{self.author.full_name}\n"
        title += "\n"
        title += ("Matching Author" if self.is_root_node else "Co-author") + f" of {len(self.articles)} articles"
        title += f"\n{list_articles_for_description(self.articles)}"
        return title


class ArticleAuthorNode(GraphNode):
    """
    Represents an intermediate node in building an author graph.
    """
    def __init__(self, is_root_node: bool, author: DBAuthor, article: DBArticle):
        super().__init__(author.author_id, is_root_node)
        self.author: DBAuthor = author
        self.article: DBArticle = article

    @staticmethod
    def collapse(nodes: list[GraphNode]) -> AuthorNode:
        """ Collapses many article-author nodes into a single author node. """
        is_root_node: bool = False
        author: DBAuthor = cast(ArticleAuthorNode, nodes[0]).author
        articles: list[DBArticle] = []
        article_ids: set[int] = set()
        for node in nodes:
            node = cast(ArticleAuthorNode, node)
            is_root_node = is_root_node or node.is_root_node
            if node.article.pmid not in article_ids:
                article_ids.add(node.article.pmid)
                articles.append(node.article)

        return AuthorNode(is_root_node, author, articles)


class GraphEdge:
    """
    Represents a node in a graph built using GraphBuilder.
    """
    def __init__(self, node1_id: int, node2_id: int):
        self.smaller_node_id: int = min(node1_id, node2_id)
        self.larger_node_id: int = max(node1_id, node2_id)
        self.key = (self.smaller_node_id, self.larger_node_id)

    def get_title(self) -> Optional[str]:
        """ Returns the tooltip text of this node in the graph. """
        return None


class CoAuthorEdge(GraphEdge):
    """
    Represents a co-author edge between author nodes.
    """
    def __init__(
            self,
            author_id: int,
            author_article_rels: list[DBArticleAuthorRelation],
            articles: list[DBArticle],
            coauthor_article_rels: list[DBArticleAuthorRelation],
            coauthor_id: int
    ):
        super().__init__(author_id, coauthor_id)
        self.author_id: int = author_id
        self.author_article_rel: list[DBArticleAuthorRelation] = author_article_rels
        self.articles: list[DBArticle] = articles
        self.coauthor_article_rel: list[DBArticleAuthorRelation] = coauthor_article_rels
        self.coauthor_id: int = coauthor_id

    def get_title(self) -> Optional[str]:
        """ Returns the tooltip text of this edge in the graph. """
        title = f"{len(self.articles)} Co-Authored Articles\n"
        title += f"\n{list_articles_for_description(self.articles)}"
        return title


class ArticleCoAuthorEdge(GraphEdge):
    """
    Represents an intermediate edge in building a co-author graph.
    """
    def __init__(
            self, author_id: int,
            author_article_rel: DBArticleAuthorRelation,
            article: DBArticle,
            coauthor_article_rel: DBArticleAuthorRelation,
            coauthor_id: int
    ):
        super().__init__(author_id, coauthor_id)
        self.author_id: int = author_id
        self.author_article_rel: DBArticleAuthorRelation = author_article_rel
        self.article: DBArticle = article
        self.coauthor_article_rel: DBArticleAuthorRelation = coauthor_article_rel
        self.coauthor_id: int = coauthor_id

    @staticmethod
    def collapse(edges: list[GraphEdge]) -> CoAuthorEdge:
        """ Collapses many article-author nodes into a single author node. """
        author_id = cast(ArticleCoAuthorEdge, edges[0]).author_id
        author_article_rels: list[DBArticleAuthorRelation] = []
        articles: list[DBArticle] = []
        coauthor_article_rels: list[DBArticleAuthorRelation] = []
        coauthor_id = cast(ArticleCoAuthorEdge, edges[0]).coauthor_id

        seen_articles: set[int] = set()
        for edge in edges:
            edge = cast(ArticleCoAuthorEdge, edge)
            # The edge can be added from both directions.
            if edge.article.pmid not in seen_articles:
                seen_articles.add(edge.article.pmid)
                author_article_rels.append(edge.author_article_rel)
                articles.append(edge.article)
                coauthor_article_rels.append(edge.coauthor_article_rel)

        return CoAuthorEdge(author_id, author_article_rels, articles, coauthor_article_rels, coauthor_id)


class Graph:
    """
    A graph of nodes and edges, and their associated data.
    """
    def __init__(self, nodes: dict[int, GraphNode], edges: dict[tuple[int, int], GraphEdge]):
        self.nodes = nodes
        self.edges = edges

        self.node_edges: dict[int, list[tuple[int, int]]] = {node_id: [] for node_id in nodes.keys()}
        for edge_key in edges.keys():
            edge_id_1, edge_id_2 = edge_key
            self.node_edges[edge_id_1].append(edge_key)
            self.node_edges[edge_id_2].append(edge_key)

        self._nodes_value_source_results: list[tuple[NodesValueSource, dict[int, float]]] = []
        self._edges_value_source_results: list[tuple[EdgesValueSource, dict[tuple[int, int], float]]] = []

    def _query_node_value_source(self, source: NodesValueSource) -> dict[int, float]:
        """
        Queries the source and saves its results.
        """
        # First, try to find if we've already calculated the results.
        # We use equals here instead of a dictionary, as a dictionary
        # would require us to make the sources Hashable.
        for saved_source, saved_results in self._nodes_value_source_results:
            if saved_source == source:
                return saved_results

        # Otherwise, query the values.
        results = source.query(self)
        self._nodes_value_source_results.append((source, results))
        return results

    def _query_edge_value_source(self, source: EdgesValueSource) -> dict[tuple[int, int], float]:
        """
        Queries the source and saves its results.
        """
        # First, try to find if we've already calculated the results.
        # We use equals here instead of a dictionary, as a dictionary
        # would require us to make the sources Hashable.
        for saved_source, saved_results in self._edges_value_source_results:
            if saved_source == source:
                return saved_results

        # Otherwise, query the values.
        results = source.query(self)
        self._edges_value_source_results.append((source, results))
        return results

    def _build_node_json(self, options: GraphOptions) -> list[dict]:
        node_size_values: dict[int, float] = self._query_node_value_source(options.node_size_source)
        node_colour_values: dict[int, float] = self._query_node_value_source(options.node_colour_source)

        cmap = plt.get_cmap("viridis")

        nodes: list[dict] = []
        for node_id, node in self.nodes.items():
            node_label = node.get_label()
            node_title = node.get_title()
            node_size = node_size_values[node_id]
            r, g, b, _ = cmap(node_colour_values[node_id])
            node_colour = f"rgb({round(255*r)}, {round(255*g)}, {round(255*b)})"

            node_json = {
                "id": node_id,
                "borderWidth": round(1 + node_size),
                "borderWidthSelected": round(2 + node_size),
                "size": round(20 + 20 * node_size),
                "color": node_colour
            }
            if node_label is not None:
                node_json["label"] = node_label
            if node_title is not None:
                node_json["title"] = node_title

            nodes.append(node_json)

        return nodes

    def _build_edge_json(self, options: GraphOptions) -> list[dict]:
        edge_size_values: dict[tuple[int, int], float] = self._query_edge_value_source(options.edge_size_source)

        edges: list[dict] = []
        for edge_key, edge in self.edges.items():
            from_id, to_id = edge_key
            edge_title = edge.get_title()
            edge_size = edge_size_values[edge_key]

            edge_json = {
                "from": from_id,
                "to": to_id,
                "value": edge_size
            }
            if edge_title is not None:
                edge_json["title"] = edge_title

            edges.append(edge_json)

        return edges

    def build_json(self, options: GraphOptions):
        """ Builds the graph using the given options. """
        return {
            "nodes": self._build_node_json(options),
            "edges": self._build_edge_json(options)
        }


class GraphBuilder:
    """
    Allows the gradual building of a graph to pass to the frontend.
    """
    def __init__(self):
        self._num_records = 0
        self._nodes: dict[int, list[GraphNode]] = {}
        self._edges: dict[tuple[int, int], list[GraphEdge]] = {}

    def get_node_count(self) -> int:
        """ Returns the number of nodes in the current graph. """
        return len(self._nodes)

    def get_edge_count(self) -> int:
        """ Returns the number of edges in the current graph. """
        return len(self._edges)

    def add_record(self):
        """ Marks that another record is being processed. """
        self._num_records += 1

    def add_node(self, node: GraphNode):
        """ Adds a single node to the graph. """
        if node.node_id in self._nodes:
            self._nodes[node.node_id].append(node)
        else:
            self._nodes[node.node_id] = [node]

    def add_edge(self, edge: GraphEdge):
        """ Adds an edge between nodes in the graph. """
        if edge.key in self._edges:
            self._edges[edge.key].append(edge)
        else:
            self._edges[edge.key] = [edge]

    def build(
            self, node_collapse_fn: Callable[[list[GraphNode]], GraphNode],
            edge_collapse_fn: Callable[[list[GraphEdge]], GraphEdge]
    ) -> Graph:
        """ Builds the graph to be passed to the frontend. """
        nodes: dict[int, GraphNode] = {}
        for node_id, node_data in self._nodes.items():
            nodes[node_id] = node_collapse_fn(node_data)

        edges: dict[tuple[int, int], GraphEdge] = {}
        for edge_id, edge_data in self._edges.items():
            edges[edge_id] = edge_collapse_fn(edge_data)

        return Graph(nodes, edges)
