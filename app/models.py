from .extensions import db
from datetime import datetime

class Photo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    object_key = db.Column(db.String(512), nullable=False)
    url = db.Column(db.String(1024), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

class BirthPhoto(db.Model):
    __tablename__ = 'birth_photo'
    
    id = db.Column(db.Integer, primary_key=True)
    object_key = db.Column(db.String(512), nullable=False)
    url = db.Column(db.String(1024), nullable=False)
    birthday_year = db.Column(db.Integer, nullable=True)  # 生日年份
    description = db.Column(db.Text, nullable=True)       # 照片描述
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<BirthPhoto {self.id}: {self.birthday_year}>'