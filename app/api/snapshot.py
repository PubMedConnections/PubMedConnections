# from app.api import bp
from flask import request
from flask_restx import Namespace, Resource, fields
from app.controller.snapshot_controller import query_by_filters, retrieve_analytics

ns = Namespace('snapshot', description='snapshot related operations')

publication_date = ns.model('publication_date', {'published_before': fields.String,
                                                 'published_after': fields.String})


filters = ns.model('filters',
                   {'author': fields.String, 'article_title': fields.String, 'published_before': fields.String,
                    'published_after': fields.String, 'institution': fields.String, 'journal': fields.String,
                    'limit': fields.Integer, 'mesh_heading': fields.String})


@ns.route('/visualise/<string:graph_type>')
class VisualiseSnapshot(Resource):
    @staticmethod
    @ns.expect(filters)
    def post(graph_type):
        filters = request.json
        return query_by_filters(graph_type, filters)


@ns.route('/analyse/<int:snapshot_id>')
class AnalyseSnapshot(Resource):
    @staticmethod
    def get(snapshot_id: int):
        return retrieve_analytics(snapshot_id)

# @bp.route('/snapshot/visualise/<string:graph_type>', methods=['GET'])
# def visualise_snapshot(graph_type):
#
#     return "TODO return {} snapshot".format(graph_type)


# @bp.route('/snapshot/analyse', methods=['GET'])
# def analyse_snapshot():
#     return "TODO return analytics for snapshot"
