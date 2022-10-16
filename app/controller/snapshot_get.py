from typing import Optional

from app import neo4j_conn
import json


def date_handler(obj):
    if hasattr(obj, 'isoformat'):
        return obj.isoformat()
    else:
        raise TypeError(
            "Unserializable object {} of type {}".format(obj, type(obj))
        )


def get_snapshot(snapshot_id: Optional[int]) -> list[object]:
    """
    If an ID is given, returns a list containing the snapshot with the given ID.
    If the snapshot could not be found, an empty list will be returned.
    If an ID is not given, returns a list of all snapshots and their filters.
    """
    def run_get_all_snapshots_query(tx):
        return list(tx.run(
            """
            MATCH (s:Snapshot)
            WITH properties(s) AS snapshot
            RETURN snapshot
            """
        ))

    def run_get_snapshot_by_id_query(tx):
        return list(tx.run(
            """
            MATCH (s:Snapshot)
            WHERE s.id = $snapshot_id
            WITH properties(s) AS snapshot
            RETURN snapshot
            """,
            {"snapshot_id": snapshot_id}
        ))

    with neo4j_conn.new_session() as neo4j_session:
        if snapshot_id is not None:
            result = neo4j_session.read_transaction(run_get_snapshot_by_id_query)
        else:
            result = neo4j_session.read_transaction(run_get_all_snapshots_query)

        snapshots = [record.data()["snapshot"] for record in result]
        for snapshot in snapshots:
            del snapshot['database_version']
        return json.loads(json.dumps(snapshots, default=date_handler))


def get_user_snapshots(username: str) -> list[object]:
    """
    Retrieves all the snapshots by the given user.
    """
    def run_get_user_snapshots_query(tx):
        return list(tx.run(
            """
            Match (u:User {username: $username}) -[:USER_SNAPSHOT]-> (snapshot:Snapshot)
            RETURN snapshot
            """,
            {"username": username}
        ))

    with neo4j_conn.new_session() as neo4j_session:
        result = neo4j_session.read_transaction(run_get_user_snapshots_query)
        return json.loads(json.dumps([record.data()["snapshot"] for record in result], default=date_handler))

def get_db_latest_version() -> dict:
    """
    Retrieves all the snapshots by the given user.
    """
    def run_get_db_latest_version(tx):
        return list(tx.run(
            """
            MATCH (m:DBMetadata)
            WITH max(m.version) AS max_version
            MATCH (d:DBMetadata)
            WHERE d.version = max_version
            RETURN d
            """
        ))

    with neo4j_conn.new_session() as neo4j_session:
        result = neo4j_session.read_transaction(run_get_db_latest_version)
        return json.loads(json.dumps(result[0].data()['d'], default=date_handler))

