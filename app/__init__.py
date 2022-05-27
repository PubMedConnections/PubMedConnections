from flask import Flask
from flask_sqlalchemy import SQLAlchemy

# Our application
app = Flask(__name__)

# Load the configuration from config.py
app.config.from_object('config')

# Create the database
db = SQLAlchemy(app)

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
