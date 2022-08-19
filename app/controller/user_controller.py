from neo4j import GraphDatabase, basic_auth
from config import NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD
from hashlib import sha256
import json

def authenticate_user(username: str, password: str) -> bool :
    def cypher(tx):
        return list(tx.run(
            '''
            MATCH (u:User)  
            WHERE u.username = $username AND u.password = $password
            RETURN u
            ''',
            {
                'username': username,
                'password':  sha256(password.encode('utf-8')).hexdigest()
            }
        ))

    driver = GraphDatabase.driver(uri=NEO4J_URI, auth=basic_auth(NEO4J_USER, NEO4J_PASSWORD))
    session = driver.session()
    result = session.read_transaction(cypher)
    return len(result) == 1


def create_user(username: str, password: str):
    def cypher(tx):
        return list(tx.run(
            '''
            CREATE (u: User 
            {username: $username, 
            password: $password}
            )
            ''',
            {
                'username': username,
                'password': sha256(password)
            }
        ))

    driver = GraphDatabase.driver(uri=NEO4J_URI, auth=basic_auth(NEO4J_USER, NEO4J_PASSWORD))
    session = driver.session()
    session.write_transaction(cypher)