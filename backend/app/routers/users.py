from flask import request, jsonify
from flask_restx import Namespace, Resource, fields
from bson import ObjectId
from datetime import datetime
import uuid
from app.database import db


users_ns = Namespace('users', description='User operations')


# User Model
user_model = users_ns.model('User', {
    'user_id': fields.String(description="Unique User ID"),
    'email': fields.String(required=True, description="User's university email"),
    'name': fields.String(required=True, description="Full Name"),
    'user_type': fields.String(required=True, enum=['rider', 'driver'], description="User role"),
    'university_email_verified': fields.Boolean(default=False),
    'profile_picture': fields.String(description="Profile Picture URL"),
    'vehicle_info': fields.Nested(users_ns.model('Vehicle', {
        'type': fields.String(description="Vehicle type (sedan, SUV, etc.)"),
        'model': fields.String(description="Vehicle model"),
        'plate': fields.String(description="License plate"),
        'state': fields.String(description="State of registration")
    }), required=False),
    'emergency_contacts': fields.List(fields.String, description="List of emergency contacts"),
    'created_at': fields.DateTime(description="Account creation date"),
})

# ✅ NEW: Check if Email Exists
@users_ns.route('/check_email')
class CheckEmail(Resource):
    def get(self):
        """Check if a user exists by email"""
        email = request.args.get('email')
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        user = db.users.find_one({'email': email})
        return jsonify({'exists': bool(user)})  # ✅ Returns true/false


@users_ns.route('/onboard', methods=['OPTIONS', 'POST'])
class UserOnboard(Resource):
    def options(self):
        """Handles CORS Preflight Request"""
        response = make_response()
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "OPTIONS, POST"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        return response, 200

    def post(self):
        """Handles user onboarding and saves details in MongoDB"""
        data = request.get_json()

        if not data.get('email') or not data.get('name'):
            return jsonify({"error": "Missing required fields"}), 400
        
        existing_user = db.users.find_one({'email': data['email']})
        if existing_user:
            return jsonify({'message': 'User already exists'}), 400  

        data['user_id'] = str(uuid.uuid4())

        if 'vehicle_type' in data:
            data['vehicle_info'] = {
                'type': data.get('vehicle_type'),
                'model': data.get('vehicle_model'),
                'plate': data.get('vehicle_plate'),
                'state': data.get('vehicle_state'),
            }
            del data['vehicle_type']
            del data['vehicle_model']
            del data['vehicle_plate']
            del data['vehicle_state']

        data['created_at'] = datetime.utcnow()

        result = db.users.insert_one(data)
        data['_id'] = str(result.inserted_id)

        return jsonify(data), 201
# ✅ Register a New User
@users_ns.route('/')
class UserList(Resource):
    @users_ns.marshal_list_with(user_model)
    def get(self):
        """Fetch all users"""
        users = db.users.find()
        return [{'_id': str(user['_id']), **user} for user in users]

    @users_ns.expect(user_model)
    def post(self):
        """Register a new user"""
        data = request.get_json()

        # Generate a unique user_id if not provided
        if 'user_id' not in data:
            data['user_id'] = str(uuid.uuid4())  # Generate unique user ID

        # Ensure email is unique
        existing_user = db.users.find_one({'email': data['email']})
        if existing_user:
            return jsonify({'message': 'Email already registered'}), 400  

        # Convert vehicle fields to proper structure
        if 'vehicle_type' in data:
            data['vehicle_info'] = {
                'type': data.get('vehicle_type'),
                'model': data.get('vehicle_model'),
                'plate': data.get('vehicle_plate'),
                'state': data.get('vehicle_state'),
            }
            del data['vehicle_type']
            del data['vehicle_model']
            del data['vehicle_plate']
            del data['vehicle_state']

        data['created_at'] = datetime.utcnow()
        result = db.users.insert_one(data)
        data['_id'] = str(result.inserted_id)
        return jsonify(data), 201  

# ✅ Fetch or Update User
@users_ns.route('/<string:user_id>')
@users_ns.param('user_id', 'User ID')
class UserResource(Resource):
    def get(self, user_id):
        """Fetch a specific user by ID"""
        user = db.users.find_one({'user_id': user_id})
        if user:
            return jsonify({'_id': str(user['_id']), **user})
        return jsonify({'error': 'User not found'}), 404

    @users_ns.expect(user_model)
    def put(self, user_id):
        """Update user profile"""
        data = request.get_json()
        data['updated_at'] = datetime.utcnow()
        result = db.users.update_one({'user_id': user_id}, {'$set': data})
        if result.matched_count == 0:
            return jsonify({'error': 'User not found'}), 404
        return jsonify(db.users.find_one({'user_id': user_id}))

    def delete(self, user_id):
        """Delete a user"""
        result = db.users.delete_one({'user_id': user_id})
        if result.deleted_count == 0:
            return jsonify({'error': 'User not found'}), 404
        return jsonify({'message': 'User deleted'}), 200
