import json
from neo4j import GraphDatabase, basic_auth
from config import NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD
from hashlib import sha256

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


def get_user(username: str):
    def get_users(tx):
        return list(tx.run(
            '''
            MATCH (u:User)  
            WHERE u.username = $username
            RETURN properties(u) AS user
            ''',
            {
                'username': username,
            }
        ))

    driver = GraphDatabase.driver(uri=NEO4J_URI, auth=basic_auth(NEO4J_USER, NEO4J_PASSWORD))
    session = driver.session()
    result = session.read_transaction(get_users)
    if len(result) == 1:
        return result[0].data()['user']
    else:
        return None


def create_user(username: str, password: str) -> bool:
    def cypher(tx):
        return list(tx.run(
            '''
            CREATE (u: User 
            {username: $username, 
            password: $password,
            revoked_tokens: '{}'}
            )
            ''',
            {
                'username': username,
                'password': sha256(password.encode('utf-8')).hexdigest()
            }
        ))

    if get_user(username) is not None:
        return False
    else:
        driver = GraphDatabase.driver(uri=NEO4J_URI, auth=basic_auth(NEO4J_USER, NEO4J_PASSWORD))
        session = driver.session()
        session.write_transaction(cypher)
        return True


def expire_token(username: str, jti: str, expiry: int):
    user = get_user(username)
    revoked_tokens = json.loads(user["revoked_tokens"])
    revoked_tokens[jti] = expiry

    def cypher(tx):
        return list(tx.run(
            '''
            MATCH (u:User {username: $username})
            SET u.revoked_tokens = $revoked_tokens
            RETURN properties(u)
            ''',
            {
                'username': username,
                'revoked_tokens': json.dumps(revoked_tokens)
            }
        ))

    driver = GraphDatabase.driver(uri=NEO4J_URI, auth=basic_auth(NEO4J_USER, NEO4J_PASSWORD))
    session = driver.session()
    session.write_transaction(cypher)
