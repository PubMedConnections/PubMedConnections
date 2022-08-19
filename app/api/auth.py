# from app.api import bp
from flask import request, jsonify, make_response
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.controller.user_controller import authenticate_user
from datetime import timedelta

ns = Namespace('auth', description='user authentication', authorizations={'api_key': {'type': 'apiKey', 'in': 'header', 'name': 'Authorization'}}, security="api_key")
user = ns.model('user', {'username': fields.String(required=False, default="admin"),
                         'password': fields.String(required=False, default="admin")})


@ns.route('/login')
class Login(Resource):
    @staticmethod
    @ns.expect(user)
    def post():
        data = request.json
        username = data['username']
        password = data['password']
        if not password or not username:
            return jsonify('Username or password cannot be empty!', 400)
        if authenticate_user(username, password):
            access_token = create_access_token(identity=username, expires_delta=timedelta(minutes=60))
            return jsonify(access_token=access_token)
        else:
            return jsonify({"message": "Invalid username or password"}), 401


@ns.route('/check_authentication')
class ProtectedTest(Resource):
    @staticmethod
    @jwt_required()
    @ns.doc(security='api_key')
    def get():
        current_user = get_jwt_identity()
        return make_response(jsonify({'current_user': current_user}), 200)
