from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS

from app.pubmed.pubmed_db_conn import PubMedCacheConn

# Our application
app = Flask(__name__)

# Allow all endpoints for CORS
CORS(app)

# Load the configuration from config.py
app.config.from_object('config')

# Initialise authentication using JWT.
jwt = JWTManager(app)

# Initialise Neo4j connection.
neo4j_conn = PubMedCacheConn()
neo4j_conn.__enter__()

# Import blueprints
from app.api import bp as api_bp
from app.controller import bp as controller_bp

# Register blueprints
app.register_blueprint(api_bp, url_prefix='/api')
app.register_blueprint(controller_bp)

# Register the routes
from app.routes import *
