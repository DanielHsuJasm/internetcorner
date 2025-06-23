from flask import Blueprint, request, redirect, url_for, flash, current_app
from ..services.photo_service import save_photo

bp = Blueprint('upload', __name__, url_prefix='/upload')

@bp.route('/', methods=['POST'])
def upload():
    if 'photos' not in request.files:
        flash('找不到上傳欄位', 'error')
        return redirect(url_for('memory.index'))  # 修改：重定向到回憶膠卷頁面
    files = request.files.getlist('photos')
    for file in files:
        if file and file.filename:
            try:
                save_photo(file)
            except ValueError as ve:
                flash(str(ve), 'warning')
            except Exception:
                current_app.logger.exception(f"Upload failed for {file.filename}")
                flash(f"上傳失敗: {file.filename}", 'error')
    return redirect(url_for('memory.index'))  # 修改：重定向到回憶膠卷頁面