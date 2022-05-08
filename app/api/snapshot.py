# from app.api import bp
from flask import request
from flask_restplus import Namespace, Resource, fields
from app.controller.snapshot_controller import query_by_filters

ns = Namespace('Snapshot', description='snapshot related operations')

publication_date = ns.model('publication_date', {'published_before': fields.String,
                                                 'published_after': fields.String})


filters = ns.model('filters',
                   {'author': fields.String, 'article_title': fields.String, 'published_before': fields.String,
                    'published_after': fields.String, 'institution': fields.String, 'journal': fields.String,
                    'limit': fields.Integer, 'mesh_heading': fields.String})


@ns.route('/snapshot/visualise/<string:graph_type>')
class VisualiseSnapshot(Resource):
    @staticmethod
    @ns.expect(filters)
    def get(graph_type):
        return query_by_filters(graph_type, request.form())


@ns.route('/snapshot/analyse')
class AnalyseSnapshot(Resource):
    @staticmethod
    def get():
        return "TODO return analytics for snapshot"

# @bp.route('/snapshot/visualise/<string:graph_type>', methods=['GET'])
# def visualise_snapshot(graph_type):
#
#     return "TODO return {} snapshot".format(graph_type)


# @bp.route('/snapshot/analyse', methods=['GET'])
# def analyse_snapshot():
#     return "TODO return analytics for snapshot"
