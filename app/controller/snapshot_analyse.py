from neo4j import GraphDatabase
from neo4j.exceptions import ClientError
from graphdatascience import GraphDataScience
from config import NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD
from flask import jsonify
import json
import threading


class AnalyticsThreading(object):
    def __init__(self, graph_type: str, snapshot_id: int, filters):
        thread = threading.Thread(target=run_analytics, args=(graph_type, snapshot_id, filters))
        thread.daemon = True
        thread.start()


def _update_snapshot_degree_centrality(tx, snapshot_id, degree_centrality_record):
    """
    Helper function that updates a snapshot with the corresponding degree centrality results.
    """
    result = tx.run(
        """
        MATCH (m:DBMetadata)
        WITH max(m.version) AS max_version
        MATCH (d:DBMetadata)
        WHERE d.version = max_version

        MATCH (s:Snapshot { id: $snapshot_id })
        SET s.degree_centrality = $degree_centrality
        RETURN s
        """, snapshot_id=snapshot_id, degree_centrality=degree_centrality_record
    )

    # TODO error handling


def _retrieve_degree_centrality(tx, snapshot_id):
    """
    Helper function to retrieve the degree centrality results.
    """

    result = tx.run(
        """
        MATCH (m:DBMetadata)
        WITH max(m.version) AS max_version
        MATCH (d:DBMetadata)
        WHERE d.version = max_version

        MATCH (s: Snapshot { id: $snapshot_id })
        RETURN s.degree_centrality AS degree_centrality
        """, snapshot_id=snapshot_id
    )

    return result.single()


def _create_query_from_filters(filters):
    """
    Helper function to map the input filters to query conditions. The query conditions are returned as a string.
    """

    filter_queries = []

    if filters['mesh_heading'] != "":
        filter_queries.append("toLower(m1.name) CONTAINS '{}'".format(filters['mesh_heading'].lower()))
    if filters['author'] != "":
        filter_queries.append("toLower(a1.name) CONTAINS '{}'".format(filters['author'].lower()))
    if filters['first_author'] != "":
        filter_queries.append("w.is_first_author = '{}'".format(filters['first_author']))
    if filters['last_author'] != "":
        filter_queries.append("w.is_last_author = '{}'".format(filters['last_author']))
    if filters['published_after'] != "":
        filter_queries.append(
            "ar1.date >= date({year: %i, month:%i, day:%i})" % (
                filters['published_after'].year,
                filters['published_after'].month,
                filters['published_after'].day))
    if filters['published_before'] != "":
        filter_queries.append(
            "ar1.date <= date({year: %i, month:%i, day:%i})" % (
                filters['published_before'].year,
                filters['published_before'].month,
                filters['published_before'].day))
    if filters['journal'] != "":
        filter_queries.append(
            """
            EXISTS {{
                MATCH (ar)-[:PUBLISHED_IN]->(j:Journal)
                WHERE toLower(j.title) CONTAINS '{}'
            }}
            """.format(filters['journal'].lower())
        )
    if filters['article'] != "":
        filter_queries.append("toLower(ar.title) CONTAINS '{}'".format(filters['article'].lower()))

    return " AND ".join(filter_queries)


def _project_graph_and_run_analytics(graph_name: str, node_query: str, relationship_query: str, snapshot_id: int):
    driver = GraphDatabase.driver(uri=NEO4J_URI)
    gds = GraphDataScience(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

    # print(node_query)
    # print(relationship_query)

    with driver.session() as session:
        # try project graph into memory
        try:
            G, _ = gds.graph.project.cypher(
                graph_name,
                node_query,
                relationship_query,
                validateRelationships=False
            )

            # compute degree centrality
            res = gds.degree.stream(G)
            res = res.sort_values(by=['score'], ascending=False, ignore_index=True)

            # get the top 5 nodes by degree centrality
            top_5_degree = []
            for row in res.head(5).itertuples():
                top_5_degree.append(
                    {
                        "id": row.nodeId,
                        "name": gds.util.asNode(row.nodeId).get('name'),
                        "centrality": int(row.score)
                    }
                )

            # compute the degree distributions
            # TODO may need to use a cut-off for very large graphs
            degree_distributions = []
            for score, count in res['score'].value_counts().sort_index().iteritems():
                degree_distributions.append(
                    {
                        "score": score,
                        "count": count
                    }
                )

            # construct degree centrality record and save to db

            degree_centrality_record = json.dumps(
                {
                    "top_5": top_5_degree,
                    "distributions": degree_distributions
                }
            )

            session.write_transaction(_update_snapshot_degree_centrality, snapshot_id, degree_centrality_record)

            # compute degree centrality
            res = gds.betweenness.stream(G)
            res = res.sort_values(by=['score'], ascending=False, ignore_index=True)

            # get the top 5 nodes by degree centrality
            top_5_betweenness = []
            for row in res.head(5).itertuples():
                top_5_betweenness.append(
                    {
                        "id": row.nodeId,
                        "name": gds.util.asNode(row.nodeId).get('name'),
                        "centrality": row.score
                    }
                )

            # print(top_5_betweenness)

            # compute the betweenness distributions
            # TODO may need to use a cut-off for very large graphs
            betweenness_distributions = []
            for score, count in res['score'].value_counts().sort_index().iteritems():
                betweenness_distributions.append(
                    {
                        "score": score,
                        "count": count
                    }
                )

            # print(betweenness_distributions)

            print("analytics completed")

            # TODO
            # other centrality measures
            #   could also use a weighted degree centrality (by collaborations) 
            # first/last author should be a boolean or string?
            # when the number of nodes are limited: ensure that the projected graph is the same as the one being visualised
            #   solution: pass in ids of nodes from visualised graph to the node projection

            G.drop()

        # unable to project the graph into memory because there are no matches for the given filters
        except ClientError as err:
            # TODO
            print(err)
            pass

    driver.close()


def run_analytics(graph_type: str, snapshot_id: int, filters):
    """
    Runs analytics on the graph returned by the query. The graph is either author-author
    or MeSH-MeSH.
    """

    print("starting analytics")

    # TODO confirm expected behaviour when num_nodes == 0 
    # nodes_limit_string = str(filters['num_nodes']) if filters['num_nodes'] != 0 else "100"

    if graph_type == "authors":
        graph_name = "coauthors"

        filter_query_string = _create_query_from_filters(filters)

        # return all authors within a 3 hop neighbourhood of a specific author
        # in the projected author-author graph
        node_query = \
            """
            MATCH (a1:Author)-[:AUTHOR_OF*1..3]-(ar:Article)<--(a2:Author)
            WHERE EXISTS {{
                MATCH (a1)-[w:AUTHOR_OF]->(ar1:Article)-[:CATEGORISED_BY]->(m1:MeshHeading)
                WHERE {}
            }}
            WITH COLLECT(DISTINCT id(a1)) + COLLECT(DISTINCT id(a2)) AS ids
            UNWIND ids as id
            RETURN id
            """.format(filter_query_string)

        # create direct author-author relations based on the 3 hop neighbourhood
        relationship_query = \
            """
            CALL {{
                MATCH (a1:Author)-[:AUTHOR_OF*1..3]-(ar:Article)<--(a2:Author)
                WHERE EXISTS {{
                    MATCH (a1)-[w:AUTHOR_OF]->(ar1:Article)-[:CATEGORISED_BY]->(m1:MeshHeading)
                    WHERE {}
                }}
                RETURN ar
            }}

            MATCH (a1:Author)-[:AUTHOR_OF]->(ar:Article)<-[:AUTHOR_OF]-(a2:Author)
            WITH a1, a2, count(*) AS c WHERE c > {min_colaborations}
            RETURN id(a1) as source, id(a2) as target, apoc.create.vRelationship(a1, "COAUTHOR", {{count: c}}, a2) as rel
            """.format(filter_query_string, min_colaborations=0)

        _project_graph_and_run_analytics(graph_name, node_query, relationship_query, snapshot_id)

    elif graph_type == "mesh":
        graph_name = "comeshs"

        filter_query_string = _create_query_from_filters(filters)

        # return all mesh headings within a 3 hop neighbourhood of a specific author
        node_query = \
            """
            MATCH (ar:Article)-[:CATEGORISED_BY]->(m:MeshHeading) 
            WHERE EXISTS {{
                MATCH (a1:Author)-[:AUTHOR_OF*1..3]->(ar:Article)
                WHERE EXISTS {{
                    MATCH (a1)-[w:AUTHOR_OF]->(ar1:Article)-[:CATEGORISED_BY]->(m1:MeshHeading) 
                    WHERE {}
                }}
            }}
            RETURN id(m) as id
            """.format(filter_query_string)

        # create direct mesh heading-mesh heading relations based on the 3 hop neighbourhood
        relationship_query = \
            """
            CALL {{
            MATCH (a1:Author)-[:AUTHOR_OF*1..3]->(ar:Article)
            WHERE EXISTS {{
                MATCH (a1)-[w:AUTHOR_OF]->(ar1:Article)-[:CATEGORISED_BY]->(m1:MeshHeading)  
                    WHERE {}
                }}
                RETURN ar
            }}

            MATCH (m1:MeshHeading)<-[:CATEGORISED_BY]-(ar:Article)-[:CATEGORISED_BY]->(m2:MeshHeading)
            WITH m1, m2, count(*) AS c WHERE c > {min_colaborations}
            RETURN id(m1) as source, id(m2) as target, apoc.create.vRelationship(m1, "COAUTHOR", {{count: c}}, m2) as rel
            """.format(filter_query_string, min_colaborations=0)

        _project_graph_and_run_analytics(graph_name, node_query, relationship_query, snapshot_id)


def retrieve_analytics(snapshot_id: int):
    """
    Returns a JSON object containing the analytics results for a given snapshot.
    """

    driver = GraphDatabase.driver(uri=NEO4J_URI)
    with driver.session() as session:

        # retrieve the degree centrality record
        degree_centrality_record = session.read_transaction(_retrieve_degree_centrality, snapshot_id)

        if degree_centrality_record is not None:

            # if the degree centrality record is the empty string it means the analytics results
            # have not yet been added to the db
            if (degree_centrality_record.data()['degree_centrality'] != ""):
                degree_centrality = json.loads(degree_centrality_record.data()['degree_centrality'])

                # construct response
                analytics_response = {
                    "principle_connectors": degree_centrality
                }

                return jsonify(analytics_response)

            else:
                return "analytics have not completed yet"

        else:
            return "ERROR: snapshot does not exist"
