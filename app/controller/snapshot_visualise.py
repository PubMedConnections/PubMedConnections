from typing import Any

from app import neo4j_conn
from flask import jsonify

from app.controller.graph_builder import GraphOptions, GraphBuilder, ArticleAuthorNode, ArticleCoAuthorEdge, \
    ConstantNodesValueSource, MatchedNodesValueSource, ConstantEdgesValueSource, CoAuthoredArticlesEdgesValueSource, \
    NodesValueSource, EdgeCountNodesValueSource, AuthorCitationsNodesValueSource, MeanPublicationDateNodesValueSource
from app.controller.graph_queries import CoAuthorGraph, query_graph
from app.helpers import _create_query_from_filters

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

        graph_builder.add_node(ArticleAuthorNode(record.author.author_id, True, record.author, record.article))
        if record.coauthor is None:
            continue

        graph_builder.add_node(ArticleAuthorNode(record.coauthor.author_id, False, record.coauthor, record.article))
        graph_builder.add_edge(ArticleCoAuthorEdge(
            record.author.author_id, record.article_author, record.article,
            record.article_coauthor, record.coauthor.author_id
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


def get_author_graph(filters):
    filter_query_string = _create_query_from_filters(filters)
    # TODO 
    #   implement LIMIT in query
    #   deal with author with no co-authors
    #   add min_colaborations filter?
    def three_hop_author_neighbourhood_query(tx):
        # MATCH (a1:Author)-[:AUTHOR_OF*1..3]-(ar:Article)<--(a2:Author)        
        return list(
            tx.run(
                """
                CALL {{
                    MATCH (a1:Author)-[:AUTHOR_OF*1..3]-(ar:Article)<--(a2:Author)
                    WHERE EXISTS {{
                        MATCH (a1)-[w:AUTHOR_OF]->(ar1:Article)-[:CATEGORISED_BY]->(m1:MeshHeading)
                        WHERE {}
                    }}
                    RETURN ar
                }}

                MATCH (a1:Author)-[ao1:AUTHOR_OF]->(ar:Article)<-[ao2:AUTHOR_OF]-(a2:Author)
                MATCH (ar)-[:PUBLISHED_IN]->(j:Journal)
                MATCH (ar)-[:CATEGORISED_BY]->(m:MeshHeading)

                WITH {{ id: a1.id, name: a1.name }} as author1, {{ id: a2.id, name: a2.name }} as author2, {{ article_title: ar.title, journal_title: j.title, article_date: ar.date, a1_pos: ao1.author_position, a2_pos: ao2.author_position, meshes: COLLECT( DISTINCT m.name) }} as articles

                RETURN author1, author2, COLLECT(DISTINCT properties(articles)) AS articles
                """.format(filter_query_string)
            )
        )

    with neo4j_conn.new_session() as neo4j_session:
        res = neo4j_session.read_transaction(three_hop_author_neighbourhood_query)

    return process_author_records(res)


def process_author_records(records):
    nodes = []
    edges = []

    author_and_coauthors = {}
    author_id_to_name = {}

    for record in records:
        record = record.data()

        author1 = record['author1']
        author2 = record['author2']

        num_articles_coauthored = len(record['articles'])

        if author1['id'] not in author_and_coauthors:
            # it's the first time we have seen this author
            author_and_coauthors[author1['id']] = {author2['id']}
            author_id_to_name[author1['id']] = author1['name']
        else:
            # we have seen this edge before
            if author2['id'] in author_and_coauthors[author1['id']]:
                continue
            else:
                author_and_coauthors[author1['id']].add(author2['id'])

        if author2['id'] not in author_and_coauthors:
            # it's the first time we have seen this author
            author_and_coauthors[author2['id']] = {author1['id']}
            author_id_to_name[author2['id']] = author2['name']
        else:
            author_and_coauthors[author2['id']].add(author1['id'])

        # construct edges
        for article in record['articles']:
            edges.append(
                {
                    'from': author1['id'],
                    'to': author2['id'],
                    'value': num_articles_coauthored,
                    'title':
                        'Mesh Heading:' + '; '.join(article['meshes']) + '\n' +
                        'Article Title:' + article['article_title'] + '\n' +
                        'Journal Title:' + article['journal_title'] + '\n'

                }
            )

    for author_id in author_and_coauthors:
        nodes.append(
            {
                'id': author_id,
                'label': author_id_to_name[author_id],
                'value': len(author_and_coauthors[author_id])
            }
        )

    # TODO what should records num equal to?

    return jsonify(
        {
            'nodes': nodes,
            'edges': edges,
            'counts':
                {
                    'nodes num': len(nodes),
                    'edges num': len(edges),
                    'records num': 0
                }
        }
    )
