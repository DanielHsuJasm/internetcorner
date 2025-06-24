from .storage import upload_image, delete_image, allowed_file
from ..extensions import db
from ..models import BirthPhoto
from flask import current_app
from datetime import datetime

def save_birthday_photo(file_storage, birthday_year=None, description=None):
    """保存生日照片"""
    filename = file_storage.filename
    if not allowed_file(filename):
        current_app.logger.warning(f"Unsupported format: {filename}")
        raise ValueError("不支援的檔案格式")
    
    current_app.logger.debug(f"Saving birthday photo: {filename}")
    object_key, url = upload_image(file_storage)
    
    # 如果沒有指定年份，使用當前年份
    if birthday_year is None:
        birthday_year = datetime.now().year
    
    birth_photo = BirthPhoto(
        object_key=object_key, 
        url=url,
        birthday_year=birthday_year,
        description=description
    )
    db.session.add(birth_photo)
    db.session.commit()
    
    current_app.logger.info(f"Birthday photo record created: id={birth_photo.id}")
    return birth_photo

def list_birthday_photos():
    """獲取所有生日照片，按年份排序"""
    return BirthPhoto.query.order_by(BirthPhoto.birthday_year.desc(), BirthPhoto.uploaded_at.desc()).all()

def get_birthday_photos_by_year(year):
    """獲取特定年份的生日照片"""
    return BirthPhoto.query.filter_by(birthday_year=year).order_by(BirthPhoto.uploaded_at.desc()).all()

def get_birthday_years():
    """獲取所有有照片的生日年份"""
    years = db.session.query(BirthPhoto.birthday_year).distinct().order_by(BirthPhoto.birthday_year.desc()).all()
    return [year[0] for year in years if year[0] is not None]

def delete_birthday_photo(photo_id):
    """刪除生日照片"""
    photo = BirthPhoto.query.get(photo_id)
    if not photo:
        current_app.logger.warning(f"Birthday photo id {photo_id} not found")
        return False
    
    try:
        delete_image(photo.object_key)
    except Exception:
        current_app.logger.error(f"Error deleting image from storage for birthday photo id={photo_id}")
    
    db.session.delete(photo)
    db.session.commit()
    current_app.logger.info(f"Birthday photo record deleted: id={photo_id}")
    return True

def get_birthday_stats():
    """獲取生日照片統計"""
    total_photos = BirthPhoto.query.count()
    years_count = len(get_birthday_years())
    
    return {
        'total_photos': total_photos,
        'years_count': years_count,
        'latest_year': max(get_birthday_years()) if years_count > 0 else None
    }