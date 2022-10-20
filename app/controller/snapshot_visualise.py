from typing import Any

from app import neo4j_conn
from flask import jsonify

from app.controller.graph_builder import GraphOptions, GraphBuilder, ArticleAuthorNode, ArticleCoAuthorEdge, \
    ConstantNodesValueSource, MatchedNodesValueSource, ConstantEdgesValueSource, CoAuthoredArticlesEdgesValueSource, \
    NodesValueSource, EdgeCountNodesValueSource, AuthorCitationsNodesValueSource, MeanPublicationDateNodesValueSource
from app.controller.graph_queries import CoAuthorGraph, query_graph

from app.pubmed.filtering import PubMedFilterValueError


def _parse_node_value_source_filter(
        filters: dict[str, Any], filter_key: str, default_source: NodesValueSource
) -> NodesValueSource:
    """ Parses a filter that refers to a node value source. """
    if filter_key not in filters:
        return default_source

    node_size_type = filters[filter_key]
    del filters[filter_key]
    if node_size_type == "constant":
        return ConstantNodesValueSource()
    elif node_size_type == "matched_nodes":
        return MatchedNodesValueSource()
    elif node_size_type == "edge_count":
        return EdgeCountNodesValueSource()
    elif node_size_type == "citations":
        return AuthorCitationsNodesValueSource()
    elif node_size_type == "mean_date":
        return MeanPublicationDateNodesValueSource()
    else:
        raise PubMedFilterValueError("graph_node_size", f"Unknown {filter_key} type {node_size_type}")


def construct_graph_options(filters: dict[str, Any]) -> GraphOptions:
    """
    Constructs the options used to control the visualisation of graphs using the options set in the filters.
    This will modify the query settings to include any information required for visualisation of the graph.
    """
    options = GraphOptions()
    options.node_size_source = _parse_node_value_source_filter(
        filters, "graph_node_size", MatchedNodesValueSource()
    )
    # TODO : The colour source will need custom options for MeSH headings.
    options.node_colour_source = _parse_node_value_source_filter(
        filters, "graph_node_colour", MatchedNodesValueSource()
    )

    if "graph_edge_size" in filters:
        node_size_type = filters["graph_edge_size"]
        del filters["graph_edge_size"]
        if node_size_type == "constant":
            options.edge_size_source = ConstantEdgesValueSource()
        elif node_size_type == "coauthored_articles":
            options.edge_size_source = CoAuthoredArticlesEdgesValueSource()
        else:
            raise PubMedFilterValueError("graph_edge_size", f"Unknown graph edge size type {node_size_type}")
    else:
        options.edge_size_source = CoAuthoredArticlesEdgesValueSource()

    if "graph_minimum_edges" in filters:
        minimum_edges_text = filters["graph_minimum_edges"].strip()
        del filters["graph_minimum_edges"]
        try:
            minimum_edges = int(minimum_edges_text)
        except ValueError:
            raise PubMedFilterValueError(
                "graph_minimum_edges",
                "The Graph Node Minimum Edges filter has an invalid value: it should contain an integer value"
            )

        options.minimum_edges = minimum_edges

    return options


def visualise_graph(filters: dict[str, Any]) -> Any:
    """
    Builds a graph from the given filter options.
    Returns a JSON response.
    """
    graph_options = construct_graph_options(filters)
    graph = query_graph(filters)

    if isinstance(graph, CoAuthorGraph):
        return visualise_coauthor_graph(graph_options, graph)
    else:
        return {"error": f"Unknown graph type {type(graph).__name__}"}


def visualise_coauthor_graph(graph_options: GraphOptions, coauthor_graph: CoAuthorGraph):
    """
    Builds the given co-author graph into a JSON response for the frontend to visualise.
    """
    # Build the Vis.JS graph.
    graph_builder = GraphBuilder()
    for record in coauthor_graph.records:
        graph_builder.add_record()

        graph_builder.add_node(ArticleAuthorNode(record.author_id, True, record.author, record.article))
        if record.coauthor is None:
            continue

        graph_builder.add_node(ArticleAuthorNode(record.coauthor_id, False, record.coauthor, record.article))
        graph_builder.add_edge(ArticleCoAuthorEdge(
            record.author_id, record.article_author, record.article,
            record.article_coauthor, record.coauthor_id
        ))

    graph = graph_builder.build(ArticleAuthorNode.collapse, ArticleCoAuthorEdge.collapse)
    with neo4j_conn.new_session() as session:
        graph_json = graph.build_json(graph_options, session)

    if len(graph.nodes) == 0:
        graph_json["empty_message"] = "There are no matching nodes."

    return graph_json


def query_by_snapshot_id(snapshot_id):
    def cypher_snapshot(tx):
        snapshot = (tx.run(
            '''
            // mesh - author - coauthor
            MATCH (s:Snapshot)
            WHERE ID(s) = $snapshot_id 
            MATCH (d:DBMetadata)
            WHERE d.version = s.database_version
            WITH 
            properties(s) AS s,
            properties(d) AS d           
            RETURN s, d
            ''',
            {'snapshot_id': snapshot_id}
        ))
        snapshot = snapshot.single()['s']
        return snapshot

    with neo4j_conn.new_session() as neo4j_session:
        filters = neo4j_session.read_transaction(cypher_snapshot)

    return query_graph(filters)
