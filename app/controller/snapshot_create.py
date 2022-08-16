from neo4j import GraphDatabase, basic_auth
from config import NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD
from datetime import datetime


def create_by_filters(graph_type: str, filters):
    """
    cypher for creating snapshot
    """

    filters['creation_time'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    def cypher(tx):
        result = tx.run(
            '''
            MATCH (m:DBMetadata)
            WITH max(m.version) AS max_version
            MATCH (d:DBMetadata)
            WHERE d.version = max_version

            CREATE (s:Snapshot {
            creation_time: $creation_time,
            mesh_heading: $mesh_heading,
            author: $author,
            first_author: $first_author,
            last_author: $last_author,
            published_before: $published_before,
            published_after: $published_after,
            journal: $journal,
            article: $article,
            num_nodes: $num_nodes,
            degree_centrality: $degree_centrality,
            database_version: max_version
            })
            SET s.id = ID(s)
            RETURN ID(s) AS snapshot_id
            ''',
            {'mesh_heading': filters['mesh_heading'],
             'author': filters['author'],
             'first_author': filters['first_author'],
             'last_author': filters['last_author'],
             'published_before': filters['published_before'],
             'published_after': filters['published_after'],
             'journal': filters['journal'],
             'article': filters['article'],
             'creation_time': filters['creation_time'],
             'num_nodes': filters['num_nodes'],
             'degree_centrality': filters['degree_centrality']
             }
        )
        if result is None:
            return 'Failed to create snapshot!'
        record = result.single()
        return record['snapshot_id']

    """
    set up a graph database connection session
    """
    driver = GraphDatabase.driver(uri=NEO4J_URI, auth=basic_auth(NEO4J_USER, NEO4J_PASSWORD))
    session = driver.session()
    snapshot_id = session.write_transaction(cypher)

    return snapshot_id

