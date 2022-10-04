from app import neo4j_conn


def delete_snapshot_by_id(snapshot_id: int):
    """
    Deletes a snapshot from the database.
    """
    def run_delete_snapshot_query(tx):
        result = tx.run(
            """
            MATCH (s:Snapshot)
            WHERE ID(s) = $snapshot_id
            WITH s, ID(s) AS snapshot_id
            DETACH DELETE s
            RETURN snapshot_id
            """,
            {"snapshot_id": snapshot_id}
        )
        if result is None:
            raise Exception("Failed to delete snapshot!")

        record = result.single()
        return record["snapshot_id"]

    with neo4j_conn.new_session() as neo4j_session:
        return neo4j_session.write_transaction(run_delete_snapshot_query)
