from flask import request
from flask_restx import Namespace, Resource, fields
from app.controller.snapshot_visualise import query_by_filters
from app.controller.snapshot_analyse import retrieve_analytics

ns = Namespace('snapshot', description='snapshot related operations')


filters = ns.model('filters',
                   {'author': fields.String(required=False, default="cook"),
                    'article_title': fields.String(required=False, default=""),
                    'published_before': fields.String(required=False, default=""),
                    'published_after': fields.String(required=False, default=""),
                    'institution': fields.String(required=False, default=""),
                    'journal': fields.String(required=False, default=""),
                    'limit': fields.Integer(required=False, default="3"),
                    'mesh_heading': fields.String(required=False, default="")})


@ns.route('/visualise/<string:graph_type>')
class VisualiseSnapshot(Resource):
    @staticmethod
    @ns.expect(filters)
    @ns.doc(params={'graph_type':{'description':'graph type: authors/mesh', 'default':'authors'}})
    def post(graph_type):
        filters = request.json
        return query_by_filters(graph_type, filters)


@ns.route('/analyse/<int:snapshot_id>')
class AnalyseSnapshot(Resource):
    @staticmethod
    @ns.doc(params={'snapshot_id':{'default':'1'}})
    def get(snapshot_id: int):
        return retrieve_analytics(snapshot_id)
