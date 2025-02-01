from flask import Flask
from flask_cors import CORS
from app.database import mongo
from app.routers.rides import router as rides_router
from app.routers.users import router as users_router

app = Flask(__name__)
CORS(app)

# MongoDB configuration with hardcoded URI
app.config["MONGO_URI"] = "mongodb+srv://niharbiradar:Pillow007$$@campusridesharedb.marsf.mongodb.net/CampusRideshare?retryWrites=true&w=majority"
mongo.init_app(app)

# Register blueprints
app.register_blueprint(rides_router, url_prefix='/api/rides')
app.register_blueprint(users_router, url_prefix='/api/users')

@app.route('/')
def home():
    return {
        'message': 'Campus Rideshare API is running',
        'endpoints': {
            'rides': '/api/rides',
            'users': '/api/users'
        }
    }

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)