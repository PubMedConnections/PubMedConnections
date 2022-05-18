from app import db

class Snapshot(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    # TODO store graph properties


class DegreeCentrality(db.Model):
    snapshot_id = db.Column(db.Integer, db.ForeignKey('snapshot.id'),  primary_key=True)
    rank = db.Column(db.Integer,  primary_key=True)
    node_id = db.Column(db.Integer)
    node_name = db.Column(db.String(1024))
    node_score = db.Column(db.Integer)
