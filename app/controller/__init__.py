from flask import Blueprint

bp = Blueprint('controller', __name__)

from app.controller import snapshot_analyse, snapshot_create, snapshot_get, snapshot_delete, snapshot_visualise

