# from app.api import bp
from flask import request
from flask_restx import Namespace, Resource, fields, abort

ns = Namespace('auth', description='user authentication')
user = ns.model('user', {'username': fields.String(required=False, default="admin"),
                         'password': fields.String(required=False, default="admin")})


@ns.route('/login')
class Login(Resource):
    @staticmethod
    @ns.expect(user)
    def post():
        data = request.json
        # TODO authenticate
        if not data['password'] or not data['username']:
            return 'username or password cannot be empty!', 400
        if data['username'] == 'admin' and data['password'] == 'admin':
            return 'login successful!'
        return "TODO implement user login"
