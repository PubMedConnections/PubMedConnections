from flask import request, jsonify
from flask_restx import Namespace, Resource, fields
from app.controller.snapshot_visualise import query_by_snapshot_id, parse_dates, get_author_graph, \
    query_coauthor_graph
from app.controller.snapshot_create import create_by_filters
from app.controller.snapshot_get import get_snapshot, get_user_snapshots
from app.controller.snapshot_delete import delete_by_snapshot_id
from app.controller.snapshot_analyse import get_analytics
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.pubmed.filtering import PubMedFilterLimitError, PubMedFilterValueError
from app.PubMedErrors import PubMedSnapshotDoesNotExistError, PubMedUpdateSnapshotError, PubMedAnalyticsError

ns = Namespace('snapshot', description='snapshot related operations',
               authorizations={'api_key':
                                   {'type': 'apiKey',
                                    'in': 'header',
                                    'name': 'Authorization'}
                               },
               security="api_key")

filters = ns.model('filters',
                   {'mesh_heading': fields.String(required=False, default="Skin Neoplasms"),
                    'author': fields.String(required=False, default="Vittorio Bolcato"),
                    'first_author': fields.String(required=False, default=""),
                    'last_author': fields.String(required=False, default=""),
                    'published_before': fields.String(required=False, default=""),
                    'published_after': fields.String(required=False, default=""),
                    'journal': fields.String(required=False, default=""),
                    'article': fields.String(required=False, default=""),
                    'graph_size': fields.Integer(required=False, default=100),
                    'graph_type': fields.String(required=False, default="author")
                    })


@ns.route('/create/')
class CreateSnapshot(Resource):
    @staticmethod
    @ns.expect(filters)
    @jwt_required()
    @ns.doc(security='api_key')
    def put():
        filter_params = request.json
        current_user = get_jwt_identity()
        snapshot = create_by_filters(filter_params, current_user)
        return {"id": snapshot, "success": type(snapshot) == int}


@ns.route('/get_snapshot/')
class GetSnapshot(Resource):
    @staticmethod
    @jwt_required()
    @ns.doc(params={'snapshot_id': {'default': '147020'}}, security='api_key')
    def get():
        snapshot_id = request.args.get('snapshot_id', default=-1, type=int)
        return get_snapshot(snapshot_id)


@ns.route('/delete/<int:snapshot_id>')
class DeleteSnapshot(Resource):
    @staticmethod
    @jwt_required()
    @ns.doc(params={'snapshot_id': {'default': '1'}}, security='api_key')
    def delete(snapshot_id: int):
        return {'id': delete_by_snapshot_id(snapshot_id), 'success': True}


@ns.route('/visualise/')
class VisualiseSnapshot(Resource):
    @staticmethod
    @jwt_required()
    @ns.doc(params={'snapshot_id': {'default': '147020'}}, security='api_key')
    def get():
        snapshot_id = request.args.get('snapshot_id', type=int)
        return query_by_snapshot_id(snapshot_id)

    @staticmethod
    @ns.expect(filters)
    @jwt_required()
    @ns.doc(security="api_key")
    def post():
        filter_params = request.json
        filter_params = parse_dates(filter_params)
        try:
            return query_coauthor_graph(filter_params)
        except PubMedFilterLimitError as e:
            return {
                "error": str(e),
                "empty_message": f"{e}."
            }
        except PubMedFilterValueError as e:
            return {
                "error": str(e),
                "error_filter": e.filter_name,
                "empty_message": f"{e}."
            }


@ns.route('/visualise_three_hop/')
class VisualiseThreeHopNeighbourhoodSnapshot(Resource):
    @staticmethod
    @ns.expect(filters)
    @jwt_required()
    @ns.doc(security="api_key")
    def post():
        filter_params = request.json
        filter_params = parse_dates(filter_params)
        return get_author_graph(filter_params)


@ns.route('/analyse/<int:snapshot_id>')
class AnalyseSnapshot(Resource):
    @staticmethod
    @jwt_required()
    @ns.doc(params={'snapshot_id': {'default': '1'}}, security="api_key")
    def get(snapshot_id: int):
        try:
            return jsonify(get_analytics(snapshot_id))
        except (PubMedSnapshotDoesNotExistError, PubMedUpdateSnapshotError) as e:
            return {
                "error": str(e),
                "empty_message": f"{e}."
            }
        except PubMedAnalyticsError as e:
            return {
                "error": e.code,
                "message": str(e),
            }

@ns.route('/list/')
class VisualiseSnapshot(Resource):
    @staticmethod
    @jwt_required()
    @ns.doc(security='api_key')
    def get():
        current_user = get_jwt_identity()
        return get_user_snapshots(current_user)
