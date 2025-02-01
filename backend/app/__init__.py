import os
from datetime import datetime
from bson.objectid import ObjectId
from flask import Flask
from flask_restx import Api, Resource, fields
from flask_pymongo import PyMongo

# Import routers 
from app.routers.users import router as users_router
from app.routers.rides import router as rides_router


mongo = PyMongo()

def create_app():
    app = Flask(__name__)

    # Read MongoDB credentials from environment variables
    mongodb_username = os.getenv('MONGODB_USERNAME')
    mongodb_password = os.getenv('MONGODB_PASSWORD')
    mongodb_cluster = os.getenv('MONGODB_CLUSTER')

    # Construct MongoDB URI
    app.config['MONGO_URI'] = f"mongodb+srv://{mongodb_username}:{mongodb_password}@{mongodb_cluster}/CampusRideshare?retryWrites=true&w=majority"

    # Initialize MongoDB
    mongo.init_app(app)

    # Initialize Flask-RESTX
    api = Api(
        app,
        version='1.0',
        title='Campus Rideshare API',
        description='API for managing users, rides, and payments in a campus rideshare system.',
        doc='/docs'  # Enable Swagger UI at /docs
    )

    # Register routers
    app.register_blueprint(users_router, url_prefix='/api/users')
    app.register_blueprint(rides_router, url_prefix='/api/rides')

    # Define a namespace for users
    users_ns = api.namespace('users', description='User operations')

    # User model for Swagger documentation
    user_model = api.model('User', {
        'user_id': fields.String(required=True, description='Unique user ID'),
        'email': fields.String(required=True, description='User email'),
        'name': fields.String(required=True, description='Full name'),
        'user_type': fields.String(required=True, description='User type (rider/driver)'),
        'university_email_verified': fields.Boolean(required=True, description='Email verification status'),
        'profile_picture': fields.String(description='URL of profile picture'),
        'emergency_contacts': fields.List(fields.Nested(api.model('EmergencyContact', {
            'name': fields.String(required=True, description='Emergency contact name'),
            'phone': fields.String(required=True, description='Emergency contact phone number')
        })))
    })

    # Route to create a user
    @users_ns.route('/')
    class UserList(Resource):
        @users_ns.expect(user_model)
        @users_ns.response(201, 'User created')
        def post(self):
            """Create a new user"""
            data = api.payload
            data['created_at'] = datetime.utcnow()
            result = mongo.db.users.insert_one(data)
            return {"message": "User created", "user_id": str(result.inserted_id)}, 201

    # Route to get a user by ID
    @users_ns.route('/<user_id>')
    class User(Resource):
        @users_ns.response(200, 'User found')
        @users_ns.response(404, 'User not found')
        def get(self, user_id):
            """Get a user by ID"""
            user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
            if user:
                return serialize_doc(user), 200
            return {"message": "User not found"}, 404

    return app

def serialize_doc(doc):
    if '_id' in doc:
        doc['_id'] = str(doc['_id'])
    return doc