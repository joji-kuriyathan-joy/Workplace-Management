from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import logging
import os
from dotenv import load_dotenv

load_dotenv()

mail = Mail()
# limiter = Limiter(key_func=get_remote_address, default_limits=["200 per day", "50 per hour"])
blacklist = set()

def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')
    env = os.getenv('FLASK_ENV', 'development')
    if env == 'production':
        app.config.from_object('app.config.ProductionConfig')
    else:
        app.config.from_object('app.config.DevelopmentConfig')

    
    # CORS(app)
    CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})  # Enable CORS for your frontend URL
    jwt = JWTManager(app)
    mail.init_app(app)
    # limiter.init_app(app)
    
    # Configure logging
    logging.basicConfig(filename='app.log', level=logging.DEBUG,
                        format='%(asctime)s %(levelname)s %(name)s %(threadName)s : %(message)s')

    # Add a logger for the application
    logger = logging.getLogger(__name__)
    logger.setLevel(logging.DEBUG)

    

    from .auth import auth_bp
    from .routes import main_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(main_bp)

    @jwt.token_in_blocklist_loader
    def check_if_token_in_blacklist(jwt_header, jwt_payload):
        jti = jwt_payload['jti']
        return jti in blacklist

    return app
