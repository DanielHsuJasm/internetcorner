from flask import Blueprint, render_template
from ..services.bookmark_service import get_all_bookmarks

bp = Blueprint('home', __name__, url_prefix='/')

@bp.route('/')
def index():
    """主畫面 - 顯示書本和書籤"""
    bookmarks = get_all_bookmarks()
    return render_template('home.html', bookmarks=bookmarks)