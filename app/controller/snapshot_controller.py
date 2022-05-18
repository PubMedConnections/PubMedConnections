from neo4j import GraphDatabase
from graphdatascience import GraphDataScience
from config import NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD
from flask import jsonify

from app import db
from app.snapshot_models import Snapshot, DegreeCentrality

import threading

class AnalyticsThreading(object):
    def __init__(self, graph_type: str, filters):
        thread = threading.Thread(target=self.run, args=(graph_type, filters))
        thread.daemon = True
        thread.start()
    
    def run(self, graph_type, filters):
        driver = GraphDatabase.driver(uri=NEO4J_URI)
        gds = GraphDataScience(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

        graph_name = "coauthors"

        node_query = \
            """
            MATCH (a1:Author)-[r:AUTHOR_OF*1..3]-(ar:Article)<--(a2:Author)
            WHERE a1.name =~ ".*{author_name}.*"
            RETURN id(a2) as id
            """.format(author_name=filters['author'])


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

        with driver.session() as session:
            # project graph into memory
            G, _ = gds.graph.project.cypher(
                graph_name,
                node_query,
                relationship_query
            )

            # create snapshot
            snapshot = Snapshot()
            db.session.add(snapshot)
            db.session.commit()
            
            print(snapshot.id)

            # compute degree centrality
            res = gds.degree.stream(G)

            # save top 5 nodes by degree to db
            res = res.sort_values(by=['score'], ascending=False, ignore_index=True)
            top5_degree = []

            for row in res.head(5).itertuples():
                node_degree_centrality = \
                    DegreeCentrality(
                        snapshot_id = snapshot.id,
                        rank = row.Index,
                        node_id = row.nodeId,
                        node_name = gds.util.asNode(row.nodeId).get('name'),
                        node_score = int(row.score)
                    )
                db.session.add(node_degree_centrality)
                db.session.commit()

            for row in res.head(5).itertuples():
                top5_degree.append(
                    {
                        "id": row.nodeId,
                        "author_name": gds.util.asNode(row.nodeId).get('name'),
                        "count": int(row.score)
                    }
                )

            print(top5_degree)

            # TODO 
            # other centrality measures
            # deal with when can't find a match

            G.drop()
        
        driver.close()

def query_by_filters(graph_type: str, filters):
    # TODO verify inputs,
    #  Query Neo4j,
    #  transform data,
    #  return results

    t = AnalyticsThreading(graph_type=graph_type, filters=filters)

    return "TODO return {} snapshot".format(graph_type)

def _map_centrality_results(centrality_res):
    top_nodes = []
    
    # TODO might need to sort by rank if not returned by order
    for db_node in centrality_res:
        node = {}
        node['id'] = db_node.node_id
        node['name'] = db_node.node_name
        node['centrality'] = db_node.node_score
        top_nodes.append(node)
    
    return top_nodes

def retrieve_analytics(snapshot_id: int):
    # get degree centrality scores
    res = DegreeCentrality.query.filter_by(snapshot_id=snapshot_id)
    top5_degree = _map_centrality_results(res)

    # construct response
    analytics_response = {
        "principle_connectors": top5_degree
    }

    return jsonify(analytics_response)
