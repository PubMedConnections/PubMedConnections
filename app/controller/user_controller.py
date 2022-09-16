import json

from app import neo4j_conn
from hashlib import sha256
from datetime import datetime


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

    with neo4j_conn.new_session() as session:
        result = session.read_transaction(get_users)
        if len(result) == 1:
            return result[0].data()['user']
        else:
            return None


def clean_up_expired_tokens(username):
    user = get_user(username)
    if user is None:
        return
    revoked_tokens = json.loads(user['revoked_tokens'])
    expired_jtis = []
    for jti, expiry in revoked_tokens.items():
        if datetime.fromtimestamp(expiry) < datetime.now():
            # If it has already expired, we don't need to blacklist it any more
            expired_jtis.append(jti)

    for jti in expired_jtis:
        del revoked_tokens[jti]

    update_revoked_tokens(username, revoked_tokens)


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

    with neo4j_conn.new_session() as session:
        result = session.read_transaction(cypher)

    if len(result) == 1:
        clean_up_expired_tokens(username)

    return len(result) == 1


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
        with neo4j_conn.new_session() as session:
            session.write_transaction(cypher)
            return True


def update_revoked_tokens(username, revoked_tokens):
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

    with neo4j_conn.new_session() as session:
        session.write_transaction(cypher)


def expire_token(username: str, jti: str, expiry: int):
    user = get_user(username)
    revoked_tokens = json.loads(user["revoked_tokens"])
    revoked_tokens[jti] = expiry
    update_revoked_tokens(username, revoked_tokens)

