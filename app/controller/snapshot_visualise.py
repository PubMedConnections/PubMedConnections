import sys
from typing import Any, Optional

from app import neo4j_conn, PubMedCacheConn
from flask import jsonify
from datetime import datetime, date

from app.controller.graph_builder import GraphOptions, GraphBuilder, ArticleAuthorNode, ArticleCoAuthorEdge, \
    ConstantNodesValueSource, MatchedNodesValueSource, ConstantEdgesValueSource, CoAuthoredArticlesEdgesValueSource
from app.controller.snapshot_analyse import _create_query_from_filters

from app.pubmed.filtering import PubMedFilterBuilder, PubMedFilterLimitError, PubMedFilterValueError
from app.pubmed.model import DBMeSHHeading


def parse_date(filter_key: str, date_str: str) -> datetime:
    try:
        return datetime.strptime(date_str, '%Y-%m-%d')
    except ValueError as e:
        raise PubMedFilterValueError(filter_key, f"The {filter_key} filter contains an invalid date")


def parse_dates(filters):
    if "published_after" in filters:
        filters["published_after"] = parse_date("published_after", filters["published_after"])

    if "published_before" in filters:
        filters["published_before"] = parse_date("published_after", filters["published_before"])

    return filters


def construct_graph_options(filters: dict[str, Any]) -> GraphOptions:
    """
    Constructs the options used to control the visualisation of graphs
    using the options set in the filters.
    """
    options = GraphOptions()
    if "graph_size" in filters:
        options.node_limit = filters["graph_size"]
        del filters["graph_size"]

    if "graph_node_size" in filters:
        node_size_type = filters["graph_node_size"]
        del filters["graph_node_size"]
        if node_size_type == "constant":
            options.node_size_source = ConstantNodesValueSource()
        elif node_size_type == "matched_nodes":
            options.node_size_source = MatchedNodesValueSource()
        else:
            raise PubMedFilterValueError("graph_node_size", f"Unknown graph node size type {node_size_type}")
    else:
        options.node_size_source = MatchedNodesValueSource()

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

    return options


def construct_graph_filter(filters: dict[str, Any], graph_options: Optional[GraphOptions] = None) -> PubMedFilterBuilder:
    """
    Constructs a PubMedFilterBuilder that applies a set of filters to the PubMed graph
    to fetch a set of IDs corresponding to the nodes that match the filters.
    These IDs can then later be used to build graphs for visualisation.
    """
    filter_builder = PubMedFilterBuilder()
    if graph_options is not None:
        filter_builder.set_node_limit(graph_options.node_limit)

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
            mesh_headings = DBMeSHHeading.search(neo4j_conn.get_mesh_headings(), mesh_name)
            mesh_desc_ids = [m.descriptor_id for m in mesh_headings]
            filter_builder.add_mesh_descriptor_id_filter(mesh_desc_ids)

    if "author" in filters:
        author_name = filters["author"]
        del filters["author"]
        if len(author_name.strip()) > 0:
            filter_builder.add_author_name_filter(author_name)

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
        boundary_date = date(year=filter_date.year, month=filter_date.month, day=filter_date.day)
        filter_builder.add_published_after_filter(boundary_date)

    if "published_before" in filters:
        filter_date = filters["published_before"]
        del filters["published_before"]
        boundary_date = date(year=filter_date.year, month=filter_date.month, day=filter_date.day)
        filter_builder.add_published_before_filter(boundary_date)

    if len(filters) != 0:
        print("Unknown filters present: " + str(filters), file=sys.stderr)

    return filter_builder


def query_coauthor_graph(filters: dict[str, Any]):
    """
    Builds a co-author graph based upon a set of filters
    that returns the central authors to expand upon.
    """
    graph_options = construct_graph_options(filters)
    graph_filter = construct_graph_filter(filters, graph_options)
    with neo4j_conn.new_session() as session:
        filter_results = graph_filter.build(force_authors=True).run(session)
        co_author_graph_results = session.run(
            """
            CYPHER planner=dp
            MATCH (author:Author)
            WHERE id(author) IN $author_ids
            MATCH (author) -[author_rel:AUTHOR_OF]-> (article:Article)
            WHERE id(article) in $article_ids
            OPTIONAL MATCH (article) <-[coauthor_rel:AUTHOR_OF]- (coauthor)
            WHERE author <> coauthor
            RETURN author, author_rel, article, coauthor_rel, coauthor
            """,
            author_ids=filter_results.author_ids,
            article_ids=filter_results.article_ids,
            node_limit=graph_options.node_limit
        )

        graph_builder = GraphBuilder()
        for record in co_author_graph_results:
            graph_builder.add_record()
            author, author_rel, article, coauthor_rel, coauthor = record

            author = PubMedCacheConn.read_author_node(author)
            article = PubMedCacheConn.read_article_node(article)
            graph_builder.add_node(ArticleAuthorNode(True, author, article))
            if coauthor is None:
                continue

            coauthor = PubMedCacheConn.read_author_node(coauthor)
            author_rel = PubMedCacheConn.read_article_author_relation(article, author, author_rel)
            coauthor_rel = PubMedCacheConn.read_article_author_relation(article, coauthor, coauthor_rel)

            graph_builder.add_node(ArticleAuthorNode(False, coauthor, article))
            graph_builder.add_edge(ArticleCoAuthorEdge(
                author.author_id, author_rel, article, coauthor_rel, coauthor.author_id
            ))

        if graph_builder.get_node_count() >= graph_options.node_limit:
            raise PubMedFilterLimitError(f"The limit of {graph_options.node_limit} nodes was reached")

    graph = graph_builder.build(ArticleAuthorNode.collapse, ArticleCoAuthorEdge.collapse)
    graph_json = graph.build_json(graph_options)
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
    return query_coauthor_graph(filters)


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
