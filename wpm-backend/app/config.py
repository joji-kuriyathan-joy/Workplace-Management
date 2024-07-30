# wpm-backend/app/config.py
import os
class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'your_default_secret_key')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your_default_jwt_secret_key')
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER')
    # SERVER_NAME = os.getenv('SERVER_NAME', 'localhost:5000')
    ENV = os.getenv('FLASK_ENV', 'development')

class DevelopmentConfig(Config):
    DEBUG = True
    SERVER_NAME = 'http://localhost:5000'

class ProductionConfig(Config):
    DEBUG = False
    SERVER_NAME = 'your_production_server.com'