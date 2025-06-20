from flask import Blueprint, render_template
from ..services.photo_service import list_photos

bp = Blueprint('view', __name__, url_prefix='/')

@bp.route('/')
def index():
    photos = list_photos()
    return render_template('index.html', images=photos)
