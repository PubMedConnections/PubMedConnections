from flask import Flask
from flask_sqlalchemy import SQLAlchemy

# import blueprints
from app.api import bp as api_bp

# Our application
app = Flask(__name__)

# Load the configuration from config.py
app.config.from_object('config')

# register blueprints
app.register_blueprint(api_bp, url_prefix='/api')

# Register the routes
from app.routes import *

# Create the database
db = SQLAlchemy(app)
db.create_all()
