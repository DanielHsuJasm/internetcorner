from .storage import upload_image, delete_image, allowed_file
from ..extensions import db
from ..models import Photo
from flask import current_app

def save_photo(file_storage):
    filename = file_storage.filename
    if not allowed_file(filename):
        current_app.logger.warning(f"Unsupported format: {filename}")
        raise ValueError("不支援的檔案格式")
    current_app.logger.debug(f"Saving photo: {filename}")
    object_key, url = upload_image(file_storage)
    photo = Photo(object_key=object_key, url=url)
    db.session.add(photo)
    db.session.commit()
    current_app.logger.info(f"Photo record created: id={photo.id}")
    return photo

def list_photos():
    return Photo.query.order_by(Photo.uploaded_at).all()

def delete_photo(photo_id):
    photo = Photo.query.get(photo_id)
    if not photo:
        current_app.logger.warning(f"Photo id {photo_id} not found")
        return False
    try:
        delete_image(photo.object_key)
    except Exception:
        current_app.logger.error(f"Error deleting image from storage for id={photo_id}")
    db.session.delete(photo)
    db.session.commit()
    current_app.logger.info(f"Photo record deleted: id={photo_id}")
    return True
