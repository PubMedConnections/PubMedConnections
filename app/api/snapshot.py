from flask import request
from flask_restx import Namespace, Resource, fields
from app.controller.snapshot_visualise import query_by_filters
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
                    'num_nodes': fields.Integer(required=False, default=100),
                    'degree_centrality':  fields.String(required=False, default="")
                    })


@ns.route('/create/<string:graph_type>')
class CreateSnapshot(Resource):
    @staticmethod
    @ns.expect(filters)
    @ns.doc(params={'graph_type':{'description':'graph type: authors/mesh', 'default':'authors'}})
    def post(graph_type):
        filters = request.json
        return create_by_filters(graph_type, filters)

@ns.route('/get_snapshot/')
@ns.route('/get_snapshot/<int:snapshot_id>')
class GetSnapshot(Resource):
    @staticmethod

    def get(snapshot_id=-1):
        return get_snapshot(snapshot_id)

@ns.route('/delete/<int:snapshot_id>')
class DeleteSnapshot(Resource):
    @staticmethod
    @ns.doc(params={'snapshot_id':{'default':'1'}})
    def delete(snapshot_id: int):
        return delete_by_snapshot_id(snapshot_id)


@ns.route('/visualise/<int:snapshot_id>')
class VisualiseSnapshot(Resource):
    @staticmethod
    @ns.doc(params={'snapshot_id':{'default':'1'}})
    def post(snapshot_id: int):
        return query_by_filters(snapshot_id)


@ns.route('/analyse/<int:snapshot_id>')
class AnalyseSnapshot(Resource):
    @staticmethod
    @ns.doc(params={'snapshot_id':{'default':'1'}})
    def get(snapshot_id: int):
        return retrieve_analytics(snapshot_id)
