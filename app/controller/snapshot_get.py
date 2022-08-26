from app import neo4j_session
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

    result = neo4j_session.read_transaction(cypher)
    snapshots = json.loads(json.dumps([record.data()['snapshot'] for record in result], default=date_handler))
    return snapshots
