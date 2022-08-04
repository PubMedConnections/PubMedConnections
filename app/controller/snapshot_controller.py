from neo4j import GraphDatabase, basic_auth
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

    """
    cypher for querying authors
    """
    def get_author(tx):
        return list(tx.run(
            '''
            MATCH (author:Author) 
                WHERE SIZE($author_name) = 0 OR toLower(author.name) CONTAINS toLower($author_name)

            MATCH (author)-[r:AUTHOR_OF]-(article:Article) 
                WHERE SIZE($article_title) = 0 OR toLower(article.title) CONTAINS toLower($article_title)
        
            
            
            //MATCH (institution:Institution)<-[:AFFILIATED_WITH]-(author:Author) 
                //WHERE SIZE($institution) = 0 OR toLower(institution.name) CONTAINS toLower($institution)
            
            MATCH (article)-[:PUBLISHED_IN]->(journal:Journal)
                WHERE SIZE($journal) = 0 OR toLower(journal.title) CONTAINS toLower($journal)
                //AND article.date >= date({year: $published_after.year, month:$published_after.month, day:$published_after.day}
                //AND article.date <= date({year: $published_before.year, month:$published_before.month, day:$published_before.day}
            
            
            OPTIONAL MATCH (article)<--(coauthor:Author) WHERE coauthor <> author
            
            WITH
            author,
            {
                article: properties(article),
                coauthors: collect(DISTINCT properties(coauthor))
            } AS articles
            
            
            WITH 
            {
                author: properties(author),
                articles:  collect(DISTINCT properties(articles))
            } AS authors
            

            RETURN authors
            LIMIT $limit
            ''',
            {'author_name': filters['author'], 'article_title': filters['article_title'],
             'institution': filters['institution'], 'journal': filters['journal'],
             'published_before': filters['published_before'],
             'published_after': filters['published_after'],
             'mesh_heading': filters['mesh_heading'],
             'limit': filters['limit']}
        ))

    """
    set up a graph database connection session
    """
    driver = GraphDatabase.driver(uri=NEO4J_URI, auth=basic_auth(NEO4J_USER, NEO4J_PASSWORD))
    session = driver.session()
    results = session.read_transaction(get_author)
    print(results)
    nodes = []
    edges = []
    i = 0
    for record in results:
        '''
        author-author graph
        
        author -> a set of articles
        article -> a set of coauthors
        '''
        for author_prop in record:
            # append author node
            author = author_prop['author']
            author_node = {'id': author['id'], 'value': author['name'], 'label': 'author'}
            nodes.append(author_node)

            for article_prop in author_prop['articles']:
                # append article node
                article = article_prop['article']
                article_node = {'id': article['pmid'], 'value': article['title'], 'label': 'article'}
                nodes.append(article_node)
                edges.append({'source': article_node['id'], 'target': author_node['id']})

                coauthors = article_prop['coauthors']
                for coauthor in coauthors:
                    # append coauthor node
                    coauthor_node = {'id': coauthor['id'], 'value': coauthor['name'], 'label': 'coauthor'}
                    nodes.append(coauthor_node)
                    edges.append({'source': coauthor_node['id'], 'target': article_node['id']})

    return jsonify({"nodes": nodes, "edges": edges, 'counts': {'nodes num': len(nodes), 'edges num': len(edges)}})


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
