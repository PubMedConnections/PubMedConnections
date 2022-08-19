# from app.api import bp
from flask import request, jsonify, make_response
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.controller.user_controller import authenticate_user, create_user
from datetime import timedelta
from app import app

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
            access_token = create_access_token(identity=username, expires_delta=timedelta(minutes=60))
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
        return make_response(jsonify({'current_user': current_user}), 200)


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
            return make_response(jsonify({"message": f"User '{username}' created."}), 200)
        else:
            return make_response(jsonify({"message": f"Error! User '{username}' already exists."}), 400)
