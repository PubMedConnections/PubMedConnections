from neo4j import GraphDatabase, basic_auth
from config import NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD
from flask import jsonify
from app import db
from app.snapshot_models import Snapshot
from app.controller.snapshot_analyse import AnalyticsThreading


def add_node_value(nodes, author):
    for j in range(len(nodes)):
        if nodes[j]['id'] == author['id']:
            nodes[j]['value'] += 1
            break
    return nodes


def query_by_filters(snapshot_id):
    """
    cypher for querying authors
    """

    def cypher(tx):
        return list(tx.run(
            '''
            // mesh - author - coauthor
            CALL {
            MATCH (s:Snapshot)
            WHERE ID(s) = $snapshot_id 
            MATCH (d:DBMetadata)
            WHERE d.version = s.database_version
            RETURN s, d
            }
            
            MATCH (mesh_heading: MeshHeading) <-[:CATEGORISED_BY]- (article: Article)
            WHERE SIZE(s.mesh_heading) = 0 OR toLower(mesh_heading.name) = toLower(s.mesh_heading) 
            
            MATCH (author:Author) - [a: AUTHOR_OF] -> (article)
            WHERE 
            //no author
            (SIZE(s.author)=0 
                AND SIZE(s.first_author)=0 
                AND SIZE(s.last_author)=0 
                AND a.is_first_author = true)            
            
            //author
            OR (SIZE(s.author)<>0 
                AND toLower(author.name) 
                    CONTAINS toLower(s.author))
            
            //first author
            OR (SIZE(s.author)=0 
                AND SIZE(s.first_author)<>0 
                AND toLower(author.name) 
                    CONTAINS toLower(s.first_author) AND a.is_first_author = true)                        
            
                    
            //last author
            OR (SIZE(s.author)=0 
                AND SIZE(s.first_author)=0 
                AND SIZE(s.last_author)<>0 
                AND toLower(author.name) 
                    CONTAINS toLower(s.last_author) AND a.is_last_author = true)            

            
            //coauthor
            MATCH (coauthor: Author) - [c:AUTHOR_OF] -> (article)          
            WHERE coauthor <> author
            
            MATCH (article) - [: PUBLISHED_IN] -> (journal : Journal)
            WHERE (SIZE(s.published_after) = 0 OR article.date >= s.published_after)
            AND (SIZE(s.published_before) = 0 OR article.date <= s.published_before) 
            AND (SIZE(s.journal) = 0 OR toLower(journal.title) CONTAINS toLower(s.journal))
            AND (SIZE(s.article) = 0 OR toLower(article.title) CONTAINS toLower(s.article))
            
            WITH
            author,
            {
                article: article.title,
                mesh_heading: COLLECT(DISTINCT mesh_heading.name),
                coauthors: COLLECT(DISTINCT properties(coauthor))
            } AS articles
                        
            RETURN 
            DISTINCT properties(author) AS author,
            COLLECT (DISTINCT properties(articles)) AS articles
            LIMIT 100
            ''',
            {'snapshot_id': snapshot_id}
        ))

    """
    set up a graph database connection session
    """
    driver = GraphDatabase.driver(uri=NEO4J_URI, auth=basic_auth(NEO4J_USER, NEO4J_PASSWORD))
    session = driver.session()
    results = session.read_transaction(cypher)
    # create snapshot
    # snapshot = Snapshot()
    # db.session.add(snapshot)
    # db.session.commit()

    # print("snapshot id: {}".format(snapshot.id))

    # AnalyticsThreading(graph_type=graph_type, filters=filters, snapshot_id=snapshot.id)

    nodes = []
    edges = []
    i = 0

    author_set = set()

    for i in range(len(results)):
        author = results[i]['author']
        author['value'] = 0

        # a new author
        new_author = False
        if author['id'] not in author_set:
            author_set.add(author['id'])
            new_author = True
            # nodes.append(author)

        # author - collect (article)
        for article in results[i]['articles']:

            # article - collect(coauthor)
            for coauthor in article['coauthors']:

                # old coauthor, new author
                #   1. old coauthor value + 1   2. new author value + 1
                if coauthor['id'] in author_set and new_author:
                    author['value'] += 1
                    nodes = add_node_value(nodes, coauthor)

                # old coauthor, old author
                # todo: edge value + 1
                elif coauthor['id'] not in author_set and not new_author:
                    pass

                # new coauthor, old author
                # 1. add coauthor to set, 2. old author value + 1, 3. add coauthor to nodes
                elif coauthor['id'] not in author_set and not new_author:
                    author_set.add(coauthor['id'])
                    nodes = add_node_value(nodes, author)
                    coauthor['value'] = 1
                    nodes.append(coauthor)

                # new coauthor, new author
                # 1. add coauthor to set, 2. new author value + 1, 3. add coauthor to nodes
                else:
                    author_set.add(coauthor['id'])
                    author['value'] += 1
                    coauthor['value'] = 1
                    nodes.append(coauthor)

                # add new author
                if new_author:
                    nodes.append(author)

                # edges
                edges.append({'from': author['id'], 'to': coauthor['id'], 'label': article['article']})

    return jsonify({"nodes": nodes,
                    "edges": edges,
                    'counts': {'nodes num': len(nodes),
                               'edges num': len(edges),
                               'records num': len(results)
                               }
                    })
