from app.api import bp

@bp.route('/login', methods=['POST'])
def login():
    return "TODO implement user login"