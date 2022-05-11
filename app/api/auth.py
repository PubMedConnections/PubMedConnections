# from app.api import bp
from flask import request
from flask_restplus import Namespace, Resource, fields

ns = Namespace('auth', description='user authentication')


@ns.route('/login')
class Login(Resource):
    @staticmethod
    def post():
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        if not password:
            # TODO return error
            pass
        # TODO authenticate
        return "TODO implement user login"


@ns.route('/register')
class Register(Resource):
    @staticmethod
    def get():
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        if not password or username:
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
