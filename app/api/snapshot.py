from app.api import bp

@bp.route('/snapshot/visualise/<string:graph_type>', methods=['GET'])
def visualise_snapshot(graph_type):
    return "TODO return {} snapshot".format(graph_type)

@bp.route('/snapshot/analyse', methods=['GET'])
def analyse_snapshot():
    return "TODO return analytics for snapshot"