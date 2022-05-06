from app.api import bp
from flask import request


@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    password = data.get('password')

    if not password:
        # TODO return error
        pass
    
    # TODO authenticate

    return "TODO implement user login"