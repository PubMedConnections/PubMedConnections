from app import neo4j_conn
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

    with neo4j_conn.new_session() as neo4j_session:
        result = neo4j_session.read_transaction(cypher)
        snapshots = json.loads(json.dumps([record.data()['snapshot'] for record in result], default=date_handler))
    return snapshots

def get_user_snapshots(username):
    def cypher(tx):
        return list(tx.run(
            '''
            Match (u: User{username: $username})-[:USER_SNAPSHOT]->(s:Snapshot)
            RETURN s
            ''',
            {
                'username': username
            }
        ))

    result = neo4j_session.read_transaction(cypher)
    snapshots = json.loads(json.dumps([record.data()['s'] for record in result], default=date_handler))
    return snapshots