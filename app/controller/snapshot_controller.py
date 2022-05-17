from neo4j import GraphDatabase
from graphdatascience import GraphDataScience
from config import NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD

# when installed GDS, neo4j was upgraded - make sure this doesn't cause a problem

def query_by_filters(graph_type, filters):
    # TODO verify inputs,
    #  Query Neo4j,
    #  transform data,
    #  return results

    run_analytics(graph_type, filters)

    return "TODO return {} snapshot".format(graph_type)

def run_analytics(graph_type, filters):
    driver = GraphDatabase.driver(uri=NEO4J_URI)
    gds = GraphDataScience(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

    with driver.session() as session:
        G, _ = gds.graph.project.cypher(
            "coauthors",

            """
            MATCH (a1:Author)-[r:AUTHOR_OF*1..3]-(ar:Article)<--(a2:Author)
            WHERE a1.name =~ ".*{}.*"
            RETURN id(a2) as id
            """.format(filters['author']),

            """
            CALL {
                MATCH (a:Author)-[r:AUTHOR_OF*1..3]-(ar:Article)<--(target:Author)
                WHERE a.name =~ ".*""" + filters['author'] + """.*"
                RETURN ar
            }
            MATCH (a1:Author)-[:AUTHOR_OF]->(ar:Article)<-[:AUTHOR_OF]-(a2:Author)
            WITH a1, a2, count(*) AS c
            RETURN id(a1) as source, id(a2) as target, apoc.create.vRelationship(a1, "COAUTHOR", {count: c}, a2) as rel
            """
        )

        # compute degree centrality
        res = gds.degree.stream(G)

        # save top 5 nodes by degree
        res = res.sort_values(by=['score'], ascending=False)
        top5_degree = []
        

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
        # write results to db

        G.drop()
    
    driver.close()
