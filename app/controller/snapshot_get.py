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


def get_all_snapshots():
    def get_snapshots(tx):
        return list(tx.run(
            '''
            //MATCH (m:DBMetadata)
            //WITH max(m.version) AS max_version
            MATCH (s:Snapshot) 
            //-- (v:DBMetadata)
            
            WITH s, properties(s) AS snapshot
            RETURN snapshot
            //, v.version, v.version = max_version
            '''
        ))

    driver = GraphDatabase.driver(uri=NEO4J_URI, auth=basic_auth(NEO4J_USER, NEO4J_PASSWORD))
    session = driver.session()
    result = session.read_transaction(get_snapshots)
    snapshots = json.loads(json.dumps([record.data()['snapshot'] for record in result], default=date_handler))
    return snapshots

