from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)
    jwt.init_app(app)

    with app.app_context():
        # Import models
        from app.models import user, tournament
        
        # Create database tables
        db.create_all()

        # Register blueprints
        from app.routes import auth, tournaments
        app.register_blueprint(auth.bp)
        app.register_blueprint(tournaments.bp)

    return app 