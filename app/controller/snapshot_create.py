from datetime import datetime

from app import neo4j_conn
from app.controller.snapshot_visualise import parse_dates
from app.controller.snapshot_analyse import AnalyticsThreading


def create_by_filters(filters, current_user):
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
            
            MATCH (u: User)
            WHERE u.username = $username

            CREATE (u)-[:USER_SNAPSHOT]->(s:Snapshot {database_version: max_version})
            SET s += $filters
            SET s.id = ID(s)
            RETURN ID(s) AS snapshot_id
            ''',
            {'filters': filters,
             'username': current_user
             }
        )
        if result is None:
            return 'Failed to create snapshot!'
        record = result.single()

        return record['snapshot_id']

    with neo4j_conn.new_session() as neo4j_session:
        snapshot_id = neo4j_session.write_transaction(cypher)

    return snapshot_id

