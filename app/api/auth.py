import json
from flask import request, jsonify, make_response
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from app.controller.user_controller import authenticate_user, create_user, get_user, expire_token
from app import app, jwt

ns = Namespace('auth', description='user authentication',
               authorizations={'api_key':
                                   {'type': 'apiKey',
                                    'in': 'header',
                                    'name': 'Authorization'}
                               },
               security="api_key")

user = ns.model('user', {'username': fields.String(required=False, default="admin"),
                         'password': fields.String(required=False, default="admin")})

registration = ns.model('registration', {'username': fields.String(required=False, default="admin"),
                                         'password': fields.String(required=False, default="admin"),
                                         'invite_code': fields.String(required=False, default=app.config['REGISTRATION_INVITE_CODE'])})

@jwt.token_in_blocklist_loader
def check_if_token_is_revoked(jwt_header, jwt_payload: dict):
    jti = jwt_payload["jti"]
    username = jwt_payload["sub"]
    user = get_user(username)
    revoked_tokens = json.loads(user["revoked_tokens"])
    return jti in revoked_tokens.keys()


@ns.route('/login')
class Login(Resource):
    @staticmethod
    @ns.expect(user)
    def post():
        data = request.json
        username = data['username']
        password = data['password']
        if not password or not username:
            return make_response(jsonify('Username or password cannot be empty!', 400))
        if authenticate_user(username, password):
            access_token = create_access_token(identity=username)
            return make_response(jsonify(access_token=access_token), 200)
        else:
            return make_response(jsonify({"message": "Invalid username or password"}), 401)


@ns.route('/check_authentication')
class CheckAuthentication(Resource):
    @staticmethod
    @jwt_required()
    @ns.doc(security='api_key')
    def get():
        current_user = get_jwt_identity()
        return make_response(jsonify({'current_user': current_user, 'success': True}), 200)


@ns.route('/register')
class RegisterUser(Resource):
    @staticmethod
    @ns.expect(registration)
    def post():
        data = request.json

        if data['invite_code'] != app.config['REGISTRATION_INVITE_CODE']:
            return make_response(jsonify({"message": "Invalid invite code."}), 401)

        username = data['username']
        password = data['password']

        if not username or not password:
            return make_response(jsonify({"message": "Please enter a username and password."}), 400)

        if create_user(username, password):
            return make_response(jsonify({"message": f"User '{username}' created.", "success": True}), 200)
        else:
            return make_response(jsonify({"message": f"Error! User '{username}' already exists."}), 400)


@ns.route('/logout')
class Logout(Resource):
    @staticmethod
    @jwt_required()
    @ns.doc(security='api_key')
    def post():
        jwt_payload = get_jwt()
        username = jwt_payload["sub"]
        jti = jwt_payload["jti"]
        expiry = jwt_payload["exp"]
        expire_token(username, jti, expiry)
        return make_response(jsonify({"message": "Access token revoked", "success": True}))
