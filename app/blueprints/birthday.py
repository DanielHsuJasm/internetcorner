from flask import Blueprint, render_template, request, redirect, url_for, flash, current_app, jsonify
from ..services.birthday_service import (
    list_birthday_photos, 
    save_birthday_photo, 
    delete_birthday_photo,
    get_birthday_photos_by_year,
    get_birthday_years,
    get_birthday_stats
)
from datetime import datetime

bp = Blueprint('birthday', __name__, url_prefix='/birthday')

@bp.route('/')
def index():
    """生日主頁面"""
    # 獲取所有生日照片
    photos = list_birthday_photos()
    
    # 獲取年份列表用於篩選
    years = get_birthday_years()
    
    # 獲取統計資訊
    stats = get_birthday_stats()
    
    # 獲取當前篩選年份
    selected_year = request.args.get('year', type=int)
    if selected_year:
        photos = get_birthday_photos_by_year(selected_year)
    
    # 🔧 添加當前年份變數
    current_year = datetime.now().year
    
    return render_template('birthday/index.html', 
                         photos=photos, 
                         years=years, 
                         selected_year=selected_year,
                         stats=stats,
                         current_year=current_year)  # 🔧 傳遞給模板

@bp.route('/upload', methods=['POST'])
def upload():
    """上傳生日照片"""
    if 'photos' not in request.files:
        flash('找不到上傳欄位', 'error')
        return redirect(url_for('birthday.index'))
    
    files = request.files.getlist('photos')
    birthday_year = request.form.get('birthday_year', type=int)
    description = request.form.get('description', '').strip()
    
    # 如果沒有指定年份，使用當前年份
    if not birthday_year:
        birthday_year = datetime.now().year
    
    uploaded_count = 0
    for file in files:
        if file and file.filename:
            try:
                save_birthday_photo(
                    file, 
                    birthday_year=birthday_year,
                    description=description if description else None
                )
                uploaded_count += 1
            except ValueError as ve:
                flash(str(ve), 'warning')
            except Exception:
                current_app.logger.exception(f"Birthday upload failed for {file.filename}")
                flash(f"上傳失敗: {file.filename}", 'error')
    
    if uploaded_count > 0:
        flash(f'成功上傳 {uploaded_count} 張生日照片！', 'success')
    
    return redirect(url_for('birthday.index'))

@bp.route('/delete/<int:photo_id>', methods=['POST'])
def delete(photo_id):
    """刪除生日照片"""
    success = delete_birthday_photo(photo_id)
    if success:
        flash('生日照片已刪除', 'success')
    else:
        flash('找不到該照片', 'error')
    return redirect(url_for('birthday.index'))

@bp.route('/api/stats')
def api_stats():
    """API: 獲取生日照片統計"""
    stats = get_birthday_stats()
    return jsonify(stats)

@bp.route('/year/<int:year>')
def year_view(year):
    """特定年份的生日照片頁面"""
    photos = get_birthday_photos_by_year(year)
    years = get_birthday_years()
    stats = get_birthday_stats()
    
    # 🔧 添加當前年份變數
    current_year = datetime.now().year
    
    return render_template('birthday/index.html', 
                         photos=photos, 
                         years=years, 
                         selected_year=year,
                         stats=stats,
                         current_year=current_year)  # 🔧 傳遞給模板