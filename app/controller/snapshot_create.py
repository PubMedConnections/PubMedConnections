from datetime import datetime

from app import neo4j_conn
from app.controller.snapshot_visualise import parse_dates
from app.controller.snapshot_analyse import AnalyticsThreading


def create_by_filters(graph_type: str, filters):
    filters = parse_dates(filters)

    filters['creation_time'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    """
    cypher for creating snapshot
    """
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
            graph_type: $graph_type,
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
             'num_nodes': filters['graph_size'],
             'graph_type': graph_type
             }
        )
        if result is None:
            return 'Failed to create snapshot!'
        record = result.single()

        # run analytics on graph 
        AnalyticsThreading(graph_type=graph_type, filters=filters, snapshot_id=record['snapshot_id'])

        return record['snapshot_id']

    with neo4j_conn.new_session() as neo4j_session:
        snapshot_id = neo4j_session.write_transaction(cypher)

    return snapshot_id

