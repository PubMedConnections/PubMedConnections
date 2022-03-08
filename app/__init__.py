from flask import Flask
from flask_sqlalchemy import SQLAlchemy

# Our application
app = Flask(__name__)

# Load the configuration from config.py
app.config.from_object('config')

# Register the routes
from app.routes import *

# Create the database
db = SQLAlchemy(app)
db.create_all()
