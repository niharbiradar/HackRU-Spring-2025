from flask import Flask
from flask_swagger_ui import get_swaggerui_blueprint
from app.routers.rides import router as rides_router
from app.routers.users import router as users_router
from app.database import mongo
from flask_cors import CORS
from flask_restx import Api
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB configuration
app.config["MONGO_URI"] = os.getenv("MONGODB_URI")
mongo.init_app(app)

# Initialize Flask-RESTX
api = Api(
    app,
    version='1.0',
    title='Campus Rideshare API',
    description='A simple rideshare API for campus transportation'
)

# Register blueprints
app.register_blueprint(rides_router, url_prefix='/api/rides')
app.register_blueprint(users_router, url_prefix='/api/users')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)