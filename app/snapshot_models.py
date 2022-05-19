from app import db

class Snapshot(db.Model):
    """
    Stores information about snapshots.
    """
    id = db.Column(db.Integer, primary_key=True)
    # TODO store graph properties


class DegreeCentrality(db.Model):
    """
    Stores the degree centrality of a specific node in a snapshot. Additionally records 
    the node's id in the graph, the node's name and it's rank in terms of degree centrality
    for the snapshot.
    """
    snapshot_id = db.Column(db.Integer, db.ForeignKey('snapshot.id'),  primary_key=True)
    rank = db.Column(db.Integer,  primary_key=True)
    node_id = db.Column(db.Integer)
    node_name = db.Column(db.String(1024))
    node_score = db.Column(db.Integer)
