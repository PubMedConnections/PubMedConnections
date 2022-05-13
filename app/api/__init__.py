from flask import Blueprint
from flask_restx import Api

bp = Blueprint('api', __name__)

# from app.api import snapshot, login
from app.api.snapshot import ns as snapshot_ns
from app.api.auth import ns as auth_ns

api_extension = Api(
    bp,
    title='PubMedConnections API',
    version='1.0',
    description='',
    doc='/doc'
)

api_extension.add_namespace(snapshot_ns)
api_extension.add_namespace(auth_ns)
