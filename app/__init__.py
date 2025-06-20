import os
from flask import Flask, jsonify
from .config import DevelopmentConfig, ProductionConfig
from .extensions import db, migrate
from .utils.logging import setup_logging
from dotenv import load_dotenv

def create_app(config_name=None):
    # 本地開發讀 .env
    load_dotenv()

    app = Flask(__name__, 
                static_folder=os.path.join(os.getcwd(), 'static'),
                template_folder=os.path.join(os.getcwd(), 'templates'))
    # 選擇 config
    env = os.environ.get('FLASK_ENV', 'development')
    config_name = config_name or env
    if config_name == 'production':
        app.config.from_object(ProductionConfig)
    else:
        app.config.from_object(DevelopmentConfig)

    # 設置日誌
    setup_logging(app)

    # 初始化 extensions
    db.init_app(app)
    migrate.init_app(app, db)

    # 註冊藍圖
    from .blueprints.upload import bp as upload_bp
    from .blueprints.view import bp as view_bp
    from .blueprints.delete import bp as delete_bp
    app.register_blueprint(upload_bp)
    app.register_blueprint(view_bp)
    app.register_blueprint(delete_bp)

    # 全域錯誤處理
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'Not Found'}), 404

    @app.errorhandler(Exception)
    def handle_exception(e):
        app.logger.exception("Unhandled exception")
        return jsonify({'error': 'Internal Server Error'}), 500

    return app
