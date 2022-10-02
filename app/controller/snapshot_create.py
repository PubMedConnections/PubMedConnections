from datetime import datetime

from app import neo4j_conn
from app.controller.graph_queries import parse_dates


def create_snapshot(filters, current_user):
    """
    Creates a snapshot with the given set of filters, associated with the current user.
    """
    filters = parse_dates(filters)
    filters['creation_time'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    def run_create_snapshot_query(tx):
        """
        cypher for creating snapshot
        """
        result = tx.run(
            """
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
            """,
            {
                "filters": filters,
                "username": current_user
             }
        )
        if result is None:
            raise Exception("Failed to create snapshot!")

        record = result.single()
        return record["snapshot_id"]

    with neo4j_conn.new_session() as neo4j_session:
        return neo4j_session.write_transaction(run_create_snapshot_query)
