from neo4j import GraphDatabase, basic_auth
from config import NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD
import json


def date_handler(obj):
    if hasattr(obj, 'isoformat'):
        return obj.isoformat()
    else:
        raise TypeError(
            "Unserializable object {} of type {}".format(obj, type(obj))
        )


def get_snapshot(snapshot_id):

    def cypher(tx):
        return list(tx.run(
            '''
            MATCH (s:Snapshot)  
            WHERE $snapshot_id = -1 OR s.id = $snapshot_id
            WITH  properties(s) AS snapshot
            RETURN snapshot
            ''',
            {
                'snapshot_id': snapshot_id
            }
        ))

    driver = GraphDatabase.driver(uri=NEO4J_URI, auth=basic_auth(NEO4J_USER, NEO4J_PASSWORD))
    session = driver.session()
    result = session.read_transaction(cypher)
    snapshots = json.loads(json.dumps([record.data()['snapshot'] for record in result], default=date_handler))
    return snapshots
