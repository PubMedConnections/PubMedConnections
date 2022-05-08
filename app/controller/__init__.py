from flask import Blueprint

bp = Blueprint('controller', __name__)

from app.controller import snapshot_controller

