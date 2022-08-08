from neo4j import GraphDatabase, basic_auth
from config import NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD
from flask import jsonify
from app import db
from app.snapshot_models import Snapshot
from app.controller.snapshot_analyse import AnalyticsThreading

def query_by_filters(graph_type: str, filters):
    """
    cypher for querying authors
    """

    def get_author(tx):
        return list(tx.run(
            '''
            // author - article - citation - coauthor
            MATCH (author: Author)-[:AUTHOR_OF]->(article:Article)-[:REFERENCES] -> 
            (citation:Article) <-- (coauthor: Author)
                WHERE (SIZE($author_name) = 0 OR toLower(author.name) CONTAINS toLower($author_name))
                AND (SIZE($article_title) = 0 OR toLower(article.title) CONTAINS toLower($article_title))
                AND citation <> article
                AND coauthor <> author
                //AND (SIZE($published_after) = 0 OR article.date >= date($published_after))
                //AND (SIZE($published_before) = 0 OR article.date <= date($published_before))  
            
            // article - journal, citation - journal
            MATCH (article)-[:PUBLISHED_IN]->(journal:Journal)<--(citation)
                WHERE SIZE($journal) = 0 OR toLower(journal.title) CONTAINS toLower($journal)                
            
            WITH properties(author) AS author, properties(coauthor) AS coauthor, 
            properties(article) AS article, properties(citation) AS citation
        
            
            RETURN author, coauthor, article, citation
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

    # create snapshot
    snapshot = Snapshot()
    db.session.add(snapshot)
    db.session.commit()

    print("snapshot id: {}".format(snapshot.id))

    AnalyticsThreading(graph_type=graph_type, filters=filters, snapshot_id=snapshot.id)

    print(results)

    nodes = []
    edges = []
    i = 0

    for record in results:
        author = {'id': record['author']['id'], 'label': record['author']['name'], 'value': 0}
        coauthor = {'id': record['coauthor']['id'], 'label': record['coauthor']['name'], 'value': 1}
        article = {'id': record['article']['pmid'], 'title': record['article']['title']}
        citation = {'id': record['citation']['pmid'], 'title': record['citation']['title']}
        edge = {'from': author['id'], 'to': coauthor['id'], 'value': 1, 'label': [(article, citation)]}

        # check if author in node list
        if not any(node['id'] == author['id'] for node in nodes):
            nodes.append(author)

        # check if coauthor in node list
        if len(nodes) == 0:
            nodes.append(coauthor)
        else:
            node_flag = False
            for i in range(len(nodes)):
                if nodes[i]['id'] == coauthor['id']:
                    nodes[i]['value'] += 1
                    flag = True
                    break
            if not node_flag:
                nodes.append(coauthor)

        # check if edge in edge list
        if len(edges) == 0:
            edges.append(edge)
        else:
            edge_flag = False
            for i in range(len(edges)):
                if edges[i]['from'] == author['id'] and edges[i]['to'] == coauthor['id']:
                    edges[i]['value'] += 1
                    edges[i]['label'].append(edge['label'][0])
                    edge_flag = True
                    break
            if not edge_flag:
                edges.append(edge)

    return jsonify({"nodes": nodes, "edges": edges, 'counts': {'nodes num': len(nodes), 'edges num': len(edges)}})