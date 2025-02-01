from flask import request
from flask_restx import Namespace, Resource, fields
from bson import ObjectId
from datetime import datetime
from flask import current_app
from app.database import db

users_ns = Namespace('users', description='User operations')

# User Model
user_model = users_ns.model('User', {
    'user_id': fields.String(required=True, description="Unique User ID"),
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

# Ride Request Model
ride_request_model = users_ns.model('RideRequest', {
    'rider_id': fields.String(required=True, description="ID of the rider requesting a ride"),
    'pickup_location': fields.String(required=True, description="Rider's pickup location"),
    'status': fields.String(default='pending', enum=['pending', 'accepted', 'rejected'], description="Status of the ride request"),
    'created_at': fields.DateTime(description="Request creation timestamp")
})

@users_ns.route('/')
class UserList(Resource):
    @users_ns.marshal_list_with(user_model)
    def get(self):
        """Fetch all users"""
        users = db.users.find()
        return [{'_id': str(user['_id']), **user} for user in users]

    @users_ns.expect(user_model)
    @users_ns.marshal_with(user_model, code=201)
    def post(self):
        """Register a new user"""
        data = request.get_json()
        data['created_at'] = datetime.utcnow()
        result = db.users.insert_one(data)
        data['_id'] = str(result.inserted_id)
        return data, 201

@users_ns.route('/<string:user_id>')
@users_ns.param('user_id', 'User ID')
class UserResource(Resource):
    @users_ns.marshal_with(user_model)
    def get(self, user_id):
        """Fetch a specific user by ID"""
        user = db.users.find_one({'user_id': user_id})
        if user:
            return {'_id': str(user['_id']), **user}
        users_ns.abort(404, "User not found")

    @users_ns.expect(user_model)
    @users_ns.marshal_with(user_model)
    def put(self, user_id):
        """Update user profile"""
        data = request.get_json()
        data['updated_at'] = datetime.utcnow()
        result = db.users.update_one({'user_id': user_id}, {'$set': data})
        if result.matched_count == 0:
            users_ns.abort(404, "User not found")
        return db.users.find_one({'user_id': user_id})

    def delete(self, user_id):
        """Delete a user"""
        result = db.users.delete_one({'user_id': user_id})
        if result.deleted_count == 0:
            users_ns.abort(404, "User not found")
        return {'message': 'User deleted'}, 200

@users_ns.route('/<string:user_id>/request-ride')
class RideRequest(Resource):
    @users_ns.expect(ride_request_model)
    @users_ns.marshal_with(ride_request_model, code=201)
    def post(self, user_id):
        """Rider requests a ride"""
        data = request.get_json()
        data['created_at'] = datetime.utcnow()
        data['status'] = 'pending'
        data['rider_id'] = user_id
        result = db.ride_requests.insert_one(data)
        data['_id'] = str(result.inserted_id)
        return data, 201

    def get(self, user_id):
        """Get ride requests for a user"""
        requests = db.ride_requests.find({'rider_id': user_id})
        return [{'_id': str(req['_id']), **req} for req in requests]

@users_ns.route('/<string:user_id>/requests/<string:request_id>/accept')
class AcceptRideRequest(Resource):
    def post(self, user_id, request_id):
        """Driver accepts a ride request"""
        request = db.ride_requests.find_one({'_id': ObjectId(request_id)})
        if not request:
            users_ns.abort(404, "Ride request not found")
        db.ride_requests.update_one({'_id': ObjectId(request_id)}, {'$set': {'status': 'accepted'}})
        return {'message': 'Ride request accepted'}, 200
