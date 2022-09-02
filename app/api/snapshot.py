from flask import request
from flask_restx import Namespace, Resource, fields
from app.controller.snapshot_visualise import query_by_filters, query_by_snapshot_id, set_default_date
from app.controller.snapshot_create import create_by_filters
from app.controller.snapshot_get import get_snapshot
from app.controller.snapshot_delete import delete_by_snapshot_id
from app.controller.snapshot_analyse import retrieve_analytics

ns = Namespace('snapshot', description='snapshot related operations')

filters = ns.model('filters',
                   {'mesh_heading': fields.String(required=False, default="Skin Neoplasms"),
                    'author': fields.String(required=False, default=""),
                    'first_author': fields.String(required=False, default="Vittorio Bolcato"),
                    'last_author': fields.String(required=False, default=""),
                    'published_before': fields.String(required=False, default=""),
                    'published_after': fields.String(required=False, default=""),
                    'journal': fields.String(required=False, default=""),
                    'article': fields.String(required=False, default=""),
                    'graph_size': fields.Integer(required=False, default=100),
                    'graph_type': fields.String(required=False, default="author")
                    })


@ns.route('/create/<graph_type>')
class CreateSnapshot(Resource):
    @staticmethod
    @ns.expect(filters)
    @ns.doc(params={'graph_type': {'description': 'graph type: authors/mesh', 'default': 'authors'}})
    def put(graph_type):
        filter_params = request.json
        return create_by_filters(graph_type, filter_params)


@ns.route('/get_snapshot/')
class GetSnapshot(Resource):
    @staticmethod
    @ns.doc(params={'snapshot_id': {'default': '147020'}})
    def get():
        snapshot_id = request.args.get('snapshot_id', default=-1, type=int)
        return get_snapshot(snapshot_id)


@ns.route('/delete/<int:snapshot_id>')
class DeleteSnapshot(Resource):
    @staticmethod
    @ns.doc(params={'snapshot_id': {'default': '1'}})
    def delete(snapshot_id: int):
        return delete_by_snapshot_id(snapshot_id)


@ns.route('/visualise/')
class VisualiseSnapshot(Resource):
    @staticmethod
    @ns.doc(params={'snapshot_id': {'default': '147020'}})
    def get():
        snapshot_id = request.args.get('snapshot_id', type=int)
        return query_by_snapshot_id(snapshot_id)

    @staticmethod
    @ns.expect(filters)
    def post():
        filter_params = request.json
        filter_params = set_default_date(filter_params)
        return query_by_filters(filter_params)


@ns.route('/analyse/<int:snapshot_id>')
class AnalyseSnapshot(Resource):
    @staticmethod
    @ns.doc(params={'snapshot_id': {'default': '1'}})
    def get(snapshot_id: int):
        return retrieve_analytics(snapshot_id)
