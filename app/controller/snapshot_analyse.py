from neo4j import GraphDatabase
from neo4j.exceptions import ClientError
from graphdatascience import GraphDataScience
from config import NEO4J_DATABASE, NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD
from app import db
from app.snapshot_models import Snapshot, DegreeCentrality
from flask import jsonify
import json
import threading

class AnalyticsThreading(object):
    def __init__(self, graph_type: str, snapshot_id: int, filters):
        thread = threading.Thread(target=run_analytics, args=(graph_type, snapshot_id, filters))
        thread.daemon = True
        thread.start()

def _map_centrality_results(centrality_res: list[DegreeCentrality]):
    """
    Helper function which maps centrality results retrieved from the db into the required
    response format.
    """
    top_nodes = []

    # TODO might need to sort by rank if not returned by order
    for db_node in centrality_res:
        node = {}
        node['id'] = db_node.node_id
        node['name'] = db_node.node_name
        node['centrality'] = db_node.node_score
        top_nodes.append(node)

    return top_nodes

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

def run_analytics(graph_type: str, snapshot_id: int, filters):
    """
    Runs analytics on the graph returned by the query. The graph is either author-author
    or MeSH-MeSH.
    """
    driver = GraphDatabase.driver(uri=NEO4J_URI)
    gds = GraphDataScience(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

    if graph_type == "authors":
        graph_name = "coauthors"

        # return all authors within a 3 hop neighbourhood of a specific author
        # in the projected author-author graph
        node_query = \
            """
            MATCH (a1:Author)-[r:AUTHOR_OF*1..3]-(ar:Article)<--(a2:Author)
            WHERE a1.name =~ ".*{author_name}.*"
            RETURN id(a2) as id
            """.format(author_name=filters['author'])

        # create direct author-author relations based on the 3 hop neighbourhood
        relationship_query = \
            """
            CALL {{
                MATCH (a:Author)-[r:AUTHOR_OF*1..3]-(ar:Article)<--(target:Author)
                WHERE a.name =~ ".*{author_name}.*"
                RETURN ar
            }}
            MATCH (a1:Author)-[:AUTHOR_OF]->(ar:Article)<-[:AUTHOR_OF]-(a2:Author)
            WITH a1, a2, count(*) AS c WHERE c > {min_colaborations}
            RETURN id(a1) as source, id(a2) as target, apoc.create.vRelationship(a1, "COAUTHOR", {{count: c}}, a2) as rel
            """.format(author_name=filters['author'], min_colaborations=0)

        with driver.session(database=NEO4J_DATABASE) as session:
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

                # save top 5 nodes by degree to db
                res = res.sort_values(by=['score'], ascending=False, ignore_index=True)

                top_5_degree = []
                for row in res.head(5).itertuples():
                    top_5_degree.append(
                        {
                            "id": row.nodeId,
                            "name": gds.util.asNode(row.nodeId).get('name'),
                            "centrality": int(row.score)
                        }
                    )

                # save the degree distributions to db
                # TODO may need to use a cut-off for very large graphs
                degree_distributions = []
                for score, count in res['score'].value_counts().sort_index().iteritems():
                    degree_distributions.append(
                        {
                            "score": score,
                            "count": count
                        }
                    )

                # print(top_5_degree)
                # print(degree_distributions)

                # save to db
                degree_centrality_record = json.dumps(
                    {
                        "top_5": top_5_degree,
                        "distributions": degree_distributions
                    }
                )

                session.write_transaction(_update_snapshot_degree_centrality, snapshot_id, degree_centrality_record)

                print("analytics completed")

                # TODO
                # other centrality measures
                #   could also use a weighted degree centrality (by collaborations) 
                # add more complicated filters

                G.drop()

            # unable to project the graph into memory because there are no matches for the given filters
            except ClientError as err:
                # TODO
                # print(err)
                pass

                # remove snapshot
                # TODO need to make sure this is consistent behaviour with adding the filters to the snapshot

        driver.close()


def retrieve_analytics(snapshot_id: int):
    """
    Returns a JSON object containing the analytics results for a given snapshot.
    """

    driver = GraphDatabase.driver(uri=NEO4J_URI)
    with driver.session(database=NEO4J_DATABASE) as session:

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
