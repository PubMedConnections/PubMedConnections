from flask import Blueprint

bp = Blueprint('controller', __name__)

from app.controller import snapshot_analyse
from app.controller import snapshot_visualise

