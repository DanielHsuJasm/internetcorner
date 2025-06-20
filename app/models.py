from .extensions import db
from datetime import datetime

class Photo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    object_key = db.Column(db.String(512), nullable=False)
    url = db.Column(db.String(1024), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
