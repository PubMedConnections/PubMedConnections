from neo4j import GraphDatabase, basic_auth
from config import NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD


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

    driver = GraphDatabase.driver(uri=NEO4J_URI, auth=basic_auth(NEO4J_USER, NEO4J_PASSWORD))
    session = driver.session()
    snapshot_id = session.write_transaction(cypher)
    return snapshot_id
