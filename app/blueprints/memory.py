from flask import Blueprint, render_template
from ..services.photo_service import list_photos

bp = Blueprint('memory', __name__, url_prefix='/memory')

@bp.route('/')
def index():
    """回憶膠卷頁面（原來的主頁面）"""
    photos = list_photos()
    return render_template('memory/index.html', images=photos)