from app import neo4j_session


def delete_by_snapshot_id(snapshot_id: int):
    def cypher(tx):
        result = tx.run(
            '''
            MATCH (s:Snapshot)
            WHERE ID(s) = $snapshot_id
            WITH s, ID(s) AS snapshot_id
            DETACH DELETE s
            RETURN snapshot_id
            ''',
            {'snapshot_id': snapshot_id}
        )
        if result is None:
            return 'Failed to delete snapshot!'
        record = result.single()
        return record["snapshot_id"]

    snapshot_id = neo4j_session.write_transaction(cypher)
    return snapshot_id
