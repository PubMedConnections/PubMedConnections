# from app.api import bp
from flask import request
from flask_restx import Namespace, Resource, fields, abort

ns = Namespace('auth', description='user authentication')
user = ns.model('user', {'username': fields.String, 'password': fields.String})


@ns.route('/login')
class Login(Resource):
    @staticmethod
    @ns.expect(user)
    def post():
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        if not password or username:
            return abort(400, "bad request!")
        # TODO authenticate
        return "TODO implement user login"


@ns.route('/register')
class Register(Resource):
    @staticmethod
    @ns.expect(user)
    def post():
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        if not password or username:
            return abort(400, "bad request!")
            # TODO return error
            pass
        # TODO create user account
        return "TODO implement user register"

# @bp.route('/login', methods=['POST'])
# def login():
#     data = request.get_json()
#     password = data.get('password')
#
#     if not password:
#         # TODO return error
#         pass
#
#     # TODO authenticate
#
#     return "TODO implement user login"
