from neo4j import GraphDatabase
from graphdatascience import GraphDataScience
from config import NEO4J_DATABASE, NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD
from flask import jsonify

from app import db
from app.snapshot_models import Snapshot, DegreeCentrality

import threading

class AnalyticsThreading(object):
    def __init__(self, graph_type: str, snapshot_id: int, filters):
        thread = threading.Thread(target=run_analytics, args=(graph_type, snapshot_id, filters))
        thread.daemon = True
        thread.start()


def query_by_filters(graph_type: str, filters):

    def get_author(tx):
        return list(tx.run(
            '''
            MATCH (author:Author {name:$author_name})
            MATCH (author)-[r:AUTHOR_OF]-(article:Article)
            OPTIONAL MATCH (article)<--(coauthor:Author) WHERE coauthor <> author
            RETURN DISTINCT author.name AS author_name, 
            article.title AS article_title, 
            COLLECT(DISTINCT coauthor.name) AS coauthors
            LIMIT $limit
            ''',
            {"author_name": filters["author"], "limit": filters["limit"]}
        ))

    driver = GraphDatabase.driver(uri=NEO4J_URI, auth=basic_auth(NEO4J_USER, NEO4J_PASSWORD))
    session = driver.session()
    results = session.read_transaction(get_author)
    nodes = []
    rels = []
    i = 0
    nodes.append({"value": results[0]["author_name"], "label": "author"})
    for record in results:
        nodes.append({"value": record["article_title"], "label": "article"})
        i += 1
        article_target = i
        rels.append({"source": 0, "target": article_target})

        for coauthor_name in record["coauthors"]:
            coauthor = {"value": coauthor_name, "label": "coauthor"}
            try:
                source = nodes.index(coauthor)
            except ValueError:
                nodes.append(coauthor)
                i += 1
                source = i
            rels.append({"source": source, "target": article_target})
    
    # create snapshot
    snapshot = Snapshot()
    db.session.add(snapshot)
    db.session.commit()

    print("snapshot id: {}".format(snapshot.id))

    AnalyticsThreading(graph_type=graph_type, filters=filters, snapshot_id=snapshot.id)

    return jsonify({"snapshot_id": snapshot.id, "nodes": nodes, "edges": rels})

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
            # project graph into memory
            G, _ = gds.graph.project.cypher(
                graph_name,
                node_query,
                relationship_query
            )

            # # create snapshot
            # snapshot = Snapshot()
            # db.session.add(snapshot)
            # db.session.commit()

            # print("snapshot id: {}".format(snapshot.id))

            # compute degree centrality
            res = gds.degree.stream(G)

            # save top 5 nodes by degree to db
            res = res.sort_values(by=['score'], ascending=False, ignore_index=True)

            for row in res.head(5).itertuples():
                node_degree_centrality = \
                    DegreeCentrality(
                        snapshot_id=snapshot_id,
                        rank=row.Index,
                        node_id=row.nodeId,
                        node_name=gds.util.asNode(row.nodeId).get('name'),
                        node_score=int(row.score)
                    )
                db.session.add(node_degree_centrality)
                db.session.commit()

            print("analytics completed")

            # TODO 
            # other centrality measures
            # deal with when can't find a match
            # deal with unconnected graph

            G.drop()
        
        driver.close()


def retrieve_analytics(snapshot_id: int):
    """
    Returns a JSON object containing the analytics results for a given snapshot.
    """
    # get degree centrality scores
    res = DegreeCentrality.query.filter_by(snapshot_id=snapshot_id)

    if res.count() != 0:
        top5_degree = _map_centrality_results(res)

        # construct response
        analytics_response = {
            "principle_connectors": top5_degree
        }

        return jsonify(analytics_response)

    else:
        if Snapshot.query.filter_by(id=snapshot_id).first() is None:
            return "ERROR: snapshot does not exist"
        else:
            return "analytics have not completed yet"
