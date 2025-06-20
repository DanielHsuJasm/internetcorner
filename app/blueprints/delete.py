from flask import Blueprint, redirect, url_for, flash
from ..services.photo_service import delete_photo

bp = Blueprint('delete', __name__, url_prefix='/delete')

@bp.route('/<int:photo_id>', methods=['POST'])
def delete(photo_id):
    success = delete_photo(photo_id)
    if success:
        flash('圖片已刪除', 'success')
    else:
        flash('找不到該圖片', 'error')
    return redirect(url_for('view.index'))
