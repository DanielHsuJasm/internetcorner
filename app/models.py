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
    birthday_year = db.Column(db.Integer, nullable=False)      # 生日年份 (必填)
    birthday_date = db.Column(db.String(10), nullable=False)   # 🆕 生日日期 (MM-DD 格式，如 "01-01" 或 "06-26")
    description = db.Column(db.Text, nullable=True)            # 照片描述
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 🆕 生日配置常數
    BIRTH_DATES = {
        '01-01': 2003,  # 1月1日，出生年份2003
        '06-26': 2003   # 6月26日，出生年份2003 (你可以修改這個年份)
    }
    
    def get_age(self):
        """🆕 計算照片拍攝時的歲數"""
        birth_year = self.BIRTH_DATES.get(self.birthday_date)
        if birth_year and self.birthday_year:
            return self.birthday_year - birth_year
        return None
    
    def get_age_display(self):
        """🆕 獲取歲數顯示文字"""
        age = self.get_age()
        if age is not None:
            return f"{age}歲生日!"
        return "生日快樂!"
    
    def get_birthday_display(self):
        """🆕 獲取生日顯示文字"""
        date_map = {
            '01-01': '元旦生日',
            '06-26': '6月26日生日'
        }
        return date_map.get(self.birthday_date, '生日')
    
    def get_full_birthday_display(self):
        """🆕 獲取完整生日資訊"""
        birthday_name = self.get_birthday_display()
        age_text = self.get_age_display()
        return f"{self.birthday_year}年{birthday_name} - {age_text}"
    
    def __repr__(self):
        return f'<BirthPhoto {self.id}: {self.birthday_year}年{self.birthday_date}>'