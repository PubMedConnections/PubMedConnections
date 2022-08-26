from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from neo4j import GraphDatabase, basic_auth
from config import NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD

# Our application
app = Flask(__name__)

# Load the configuration from config.py
app.config.from_object('config')

jwt = JWTManager(app)

# Create the database
db = SQLAlchemy(app)

# establish neo4j connection session
driver = GraphDatabase.driver(uri=NEO4J_URI, auth=basic_auth(NEO4J_USER, NEO4J_PASSWORD))
neo4j_session = driver.session()

# Import snapshot models
from app.snapshot_models import *

db.create_all()

# Import blueprints
from app.api import bp as api_bp
from app.controller import bp as controller_bp

# Register blueprints
app.register_blueprint(api_bp, url_prefix='/api')
app.register_blueprint(controller_bp)

# Register the routes

from app.routes import *
