from flask import request, jsonify, make_response, send_from_directory
from flask_restx import Namespace, Resource, fields
from bson import ObjectId
from datetime import datetime
import uuid
import os
from app.database import db

# Configuration
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

users_ns = Namespace('users', description='User operations')

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def handle_cors_response(response):
    """Add CORS headers to response"""
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    return response

# Model definitions
user_model = users_ns.model('User', {
    'user_id': fields.String(description="Unique User ID"),
    'email': fields.String(required=True, description="User's university email"),
    'name': fields.String(required=True, description="Full Name"),
    'user_type': fields.String(required=True, enum=['rider', 'driver'], description="User role"),
    'university_email_verified': fields.Boolean(default=False),
    'profile_picture': fields.String(description="Profile Picture URL"),
    'vehicle_info': fields.Nested(users_ns.model('Vehicle', {
        'type': fields.String(description="Vehicle type"),
        'model': fields.String(description="Vehicle model"),
        'plate': fields.String(description="License plate"),
        'state': fields.String(description="State of registration")
    }), required=False),
    'emergency_contacts': fields.List(fields.String, description="Emergency contacts"),
    'created_at': fields.DateTime(description="Account creation date"),
})

@users_ns.route('/uploads/<path:filename>')
class UploadedFile(Resource):
    def get(self, filename):
        """Serve uploaded files"""
        return send_from_directory(UPLOAD_FOLDER, filename)

@users_ns.route('/check_email')
class CheckEmail(Resource):
    def options(self):
        """Handle CORS preflight"""
        response = make_response()
        return handle_cors_response(response)

    def get(self):
        """Check if email exists"""
        try:
            email = request.args.get('email')
            if not email:
                return handle_cors_response(jsonify({'error': 'Email is required'})), 400
            
            user = db.users.find_one({'email': email})
            return handle_cors_response(jsonify({'exists': bool(user)}))
        except Exception as e:
            return handle_cors_response(jsonify({'error': str(e)})), 500

@users_ns.route('/onboard')
class UserOnboard(Resource):
    def options(self):
        """Handle CORS preflight"""
        response = make_response()
        return handle_cors_response(response)

    def post(self):
        """Handle user onboarding"""
        try:
            # Get email from form data or JSON
            email = request.form.get('email') if request.form else request.json.get('email')
            name = request.form.get('name') if request.form else request.json.get('name')
            role = request.form.get('role') if request.form else request.json.get('role')

            if not email or not name or not role:
                return handle_cors_response(jsonify({"error": "Missing required fields"})), 400

            # Check for existing user
            existing_user = db.users.find_one({'email': email})
            if existing_user:
                return handle_cors_response(jsonify({'message': 'User already exists'})), 400

            # Initialize user data
            user_data = {
                'user_id': str(uuid.uuid4()),
                'email': email,
                'name': name,
                'user_type': role,
                'created_at': datetime.utcnow(),
                'university_email_verified': False
            }


            # Handle vehicle information for drivers
            if role == 'driver':
                vehicle_model = request.form.get('vehicleModel') if request.form else request.json.get('vehicleModel')
                plate_number = request.form.get('plateNumber') if request.form else request.json.get('plateNumber')
                vehicle_state = request.form.get('vehicleState') if request.form else request.json.get('vehicleState')
                
                if vehicle_model and plate_number and vehicle_state:
                    user_data['vehicle_info'] = {
                        'model': vehicle_model,
                        'plate': plate_number,
                        'state': vehicle_state
                    }

            # Save to database
            result = db.users.insert_one(user_data)
            user_data['_id'] = str(result.inserted_id)

            response = jsonify(user_data)
            return handle_cors_response(response), 201

        except Exception as e:
            print(f"Error in onboarding: {str(e)}")
            return handle_cors_response(jsonify({"error": str(e)})), 500

@users_ns.route('/')
class UserList(Resource):
    def options(self):
        """Handle CORS preflight"""
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
        response.headers.add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        return response

    def get(self):
        """Fetch all users"""
        try:
            print("Fetching users from database...")
            
            # Query all users
            users_cursor = db.users.find()
            users_list = list(users_cursor)
            print(f"Found {len(users_list)} users")
            
            # Process users to make them JSON serializable
            processed_users = []
            for user in users_list:
                user_dict = {}
                for key, value in user.items():
                    if isinstance(value, ObjectId):
                        user_dict[key] = str(value)
                    elif isinstance(value, datetime):
                        user_dict[key] = value.isoformat()
                    else:
                        user_dict[key] = value
                processed_users.append(user_dict)

            print(f"Processed {len(processed_users)} users")

            # Create response with CORS headers
            response = make_response(jsonify(processed_users))
            response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
            response.headers.add("Access-Control-Allow-Credentials", "true")
            return response

        except Exception as e:
            print(f"Error in /users GET: {str(e)}")
            error_response = make_response(jsonify({'error': str(e)}), 500)
            error_response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
            error_response.headers.add("Access-Control-Allow-Credentials", "true")
            return error_response
        
    @users_ns.expect(user_model)
    def post(self):
        """Create new user"""
        try:
            data = request.get_json()
            if not data.get('email') or not data.get('name'):
                return handle_cors_response(jsonify({'error': 'Missing required fields'})), 400

            existing_user = db.users.find_one({'email': data['email']})
            if existing_user:
                return handle_cors_response(jsonify({'error': 'Email already registered'})), 400

            data['user_id'] = str(uuid.uuid4())
            data['created_at'] = datetime.utcnow()
            
            result = db.users.insert_one(data)
            data['_id'] = str(result.inserted_id)
            
            return handle_cors_response(jsonify(data)), 201
        except Exception as e:
            return handle_cors_response(jsonify({'error': str(e)})), 500

@users_ns.route('/<string:user_id>')
class UserResource(Resource):
    def options(self):
        """Handle CORS preflight"""
        response = make_response()
        return handle_cors_response(response)

    def get(self, user_id):
        """Get user by ID"""
        try:
            user = db.users.find_one({'user_id': user_id})
            if not user:
                return handle_cors_response(jsonify({'error': 'User not found'})), 404
            user['_id'] = str(user['_id'])
            return handle_cors_response(jsonify(user))
        except Exception as e:
            return handle_cors_response(jsonify({'error': str(e)})), 500

    @users_ns.expect(user_model)
    def put(self, user_id):
        """Update user profile"""
        try:
            data = request.get_json()
            data['updated_at'] = datetime.utcnow()
            
            result = db.users.update_one(
                {'user_id': user_id}, 
                {'$set': data}
            )
            
            if result.matched_count == 0:
                return handle_cors_response(jsonify({'error': 'User not found'})), 404
                
            updated_user = db.users.find_one({'user_id': user_id})
            updated_user['_id'] = str(updated_user['_id'])
            return handle_cors_response(jsonify(updated_user))
        except Exception as e:
            return handle_cors_response(jsonify({'error': str(e)})), 500

    def delete(self, user_id):
        """Delete user"""
        try:
            result = db.users.delete_one({'user_id': user_id})
            if result.deleted_count == 0:
                return handle_cors_response(jsonify({'error': 'User not found'})), 404
            return handle_cors_response(jsonify({'message': 'User deleted successfully'}))
        except Exception as e:
            return handle_cors_response(jsonify({'error': str(e)})), 500

@users_ns.route('/verify_email/<string:user_id>')
class EmailVerification(Resource):
    def options(self):
        """Handle CORS preflight"""
        response = make_response()
        return handle_cors_response(response)

    def post(self, user_id):
        """Verify university email"""
        try:
            result = db.users.update_one(
                {'user_id': user_id},
                {'$set': {'university_email_verified': True}}
            )
            
            if result.matched_count == 0:
                return handle_cors_response(jsonify({'error': 'User not found'})), 404
                
            return handle_cors_response(jsonify({'message': 'Email verified successfully'}))
        except Exception as e:
            return handle_cors_response(jsonify({'error': str(e)})), 500

@users_ns.route('/get_user_id')
class GetUserID(Resource):
    def options(self):
        """Handle CORS preflight"""
        response = make_response()
        response.status_code = 200
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
        response.headers.add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        return response

    def get(self):
        """Get user_id by email"""
        try:
            email = request.args.get('email')
            if not email:
                return jsonify({'error': 'Email is required'}), 400

            user = db.users.find_one({'email': email}, {'user_id': 1})
            if not user:
                return jsonify({'error': 'User not found'}), 404

            # Ensure the response is serializable
            user_id = str(user.get('user_id'))  # Ensure the 'user_id' is a string

            response = jsonify({'user_id': user_id})
            response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
            response.headers.add("Access-Control-Allow-Credentials", "true")
            return response
        except Exception as e:
            return jsonify({'error': str(e)}), 500
