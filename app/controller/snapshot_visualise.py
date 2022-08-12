from neo4j import GraphDatabase, basic_auth
from config import NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD
from flask import jsonify
from app import db
from app.snapshot_models import Snapshot
from app.controller.snapshot_analyse import AnalyticsThreading


def query_by_filters(snapshot_id):
    """
    cypher for querying authors
    """

    def visualise_snapshot(tx):
        return list(tx.run(
            '''
            // mesh - author - coauthor
            CALL {
            MATCH (s:Snapshot)
            WHERE ID(s) = $snapshot_id 
            //-- (v:DBMetadata)
            RETURN s
            //,v.version
            }
            
            MATCH (mesh_heading: MeshHeading) <-[:CATEGORISED_BY]- (article: Article)
            WHERE SIZE(s.mesh_heading) = 0 OR toLower(mesh_heading.name) = toLower(s.mesh_heading) 
            
            MATCH (author:Author) - [: AUTHOR_OF] - (article) <- [:AUTHOR_OF]- (coauthor: Author)
            WHERE (SIZE(s.author) = 0 OR toLower(author.name) CONTAINS toLower(s.author))
            AND coauthor <> author
            
            MATCH (article) - [: PUBLISHED_IN] - (journal : Journal)
            WHERE (SIZE(s.published_after) = 0 OR article.date >= s.published_after)
            AND (SIZE(s.published_before) = 0 OR article.date <= s.published_before) 
            AND (SIZE(s.journal) = 0 OR toLower(journal.title) CONTAINS toLower(s.journal))
            AND (SIZE(s.article) = 0 OR toLower(article.title) CONTAINS toLower(s.article))
            
            WITH
            author,
            {
                article: article.title,
                coauthors: COLLECT(DISTINCT properties(coauthor))
            } AS articles
                        
            RETURN DISTINCT properties(author) AS author,
            COLLECT (DISTINCT properties(articles)) AS articles
            LIMIT 100
            ''',
        {'snapshot_id': snapshot_id}
        ))

    def get_mesh(tx):
        return list(tx.run(
            '''
           // mesh - mesh
           MATCH (mesh_heading: MeshHeading) 
           RETURN mesh_heading
           LIMIT s.limit
           ''',
        ))

    """
    set up a graph database connection session
    """
    driver = GraphDatabase.driver(uri=NEO4J_URI, auth=basic_auth(NEO4J_USER, NEO4J_PASSWORD))
    session = driver.session()
    results = session.read_transaction(visualise_snapshot)
    # create snapshot
    snapshot = Snapshot()
    db.session.add(snapshot)
    db.session.commit()

    print("snapshot id: {}".format(snapshot.id))

    # AnalyticsThreading(graph_type=graph_type, filters=filters, snapshot_id=snapshot.id)

    print(results)

    nodes = []
    edges = []
    i = 0

    for i in range(len(results)):
        author = results[i]['author']
        author['value'] = 0
        nodes.append(author)

        # author - collect (article)
        for article in results[i]['articles']:

            # article - collect(coauthor)
            for coauthor in article['coauthors']:

                # coauthor appears multiple times
                flag = True
                for j in range(len(nodes)):
                    if nodes[j]['id'] == coauthor['id']:
                        flag = False
                        nodes[j]['value'] += 1
                        break

                # new coauthor
                if flag:
                    # author value + 1
                    nodes[i]['value'] += 1
                    # set coauthor value
                    coauthor['value'] = 1
                    nodes.append(coauthor)
                edges.append({'from': author['id'], 'to': coauthor['id'], 'label': article['article']})

    return jsonify({"nodes": nodes, "edges": edges,
                    'counts': {'nodes num': len(nodes), 'edges num': len(edges), 'records num': len(results)}})
