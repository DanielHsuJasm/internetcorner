import logging
from logging.handlers import RotatingFileHandler
import os

def setup_logging(app):
    level = logging.DEBUG if app.config.get('DEBUG') else logging.INFO
    formatter = logging.Formatter('[%(asctime)s] %(levelname)s in %(module)s: %(message)s')

    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(level)
    console_handler.setFormatter(formatter)
    app.logger.setLevel(level)
    app.logger.addHandler(console_handler)

    # File handler
    logs_dir = os.path.join(os.getcwd(), 'logs')
    if not os.path.exists(logs_dir):
        os.mkdir(logs_dir)
    file_handler = RotatingFileHandler(os.path.join(logs_dir, 'app.log'), maxBytes=1024*1024, backupCount=5)
    file_handler.setLevel(level)
    file_handler.setFormatter(formatter)
    app.logger.addHandler(file_handler)

    # 降低 SQLAlchemy 引擎日誌噪音
    logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)
