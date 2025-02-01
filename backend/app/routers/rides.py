from flask import request
from flask_restx import Namespace, Resource, fields
from bson import ObjectId
from datetime import datetime
from flask import current_app
from app.database import db

rides_ns = Namespace('rides', description='Ride operations')

# Ride Model
ride_model = rides_ns.model('Ride', {
    'ride_id': fields.String(required=True, description="Unique Ride ID"),
    'driver_id': fields.String(required=True, description="ID of the driver"),
    'driver_name': fields.String(required=True, description="Driver's full name"),
    'driver_picture': fields.String(description="Driver's profile picture"),
    'start_location': fields.String(required=True, description="Starting location"),
    'end_location': fields.String(required=True, description="Destination location"),
    'ride_time': fields.DateTime(required=True, description="Scheduled ride time"),
    'status': fields.String(default='scheduled', enum=['scheduled', 'in-progress', 'completed', 'canceled'], description="Ride status"),
    'available_seats': fields.Integer(required=True, description="Available seats"),
    'total_seats': fields.Integer(required=True, description="Total seats"),
    'vehicle_info': fields.Nested(rides_ns.model('Vehicle', {
        'type': fields.String(description="Vehicle type (sedan, SUV, etc.)"),
        'model': fields.String(description="Vehicle model"),
        'plate': fields.String(description="License plate"),
        'state': fields.String(description="State of registration")
    })),
    'created_at': fields.DateTime(description="Ride creation timestamp"),
})

@rides_ns.route('/')
class RideList(Resource):
    @rides_ns.marshal_list_with(ride_model)
    def get(self):
        """Fetch all available rides"""
        rides = db.rides.find({'status': 'scheduled'})
        return [{'_id': str(ride['_id']), **ride} for ride in rides]

    @rides_ns.expect(ride_model)
    @rides_ns.marshal_with(ride_model, code=201)
    def post(self):
        """Create a new ride"""
        data = request.get_json()
        data['created_at'] = datetime.utcnow()
        result = db.rides.insert_one(data)
        data['_id'] = str(result.inserted_id)
        return data, 201

@rides_ns.route('/<string:ride_id>')
@rides_ns.param('ride_id', 'Ride ID')
class RideResource(Resource):
    @rides_ns.marshal_with(ride_model)
    def get(self, ride_id):
        """Fetch ride details"""
        ride = db.rides.find_one({'ride_id': ride_id})
        if ride:
            return {'_id': str(ride['_id']), **ride}
        rides_ns.abort(404, "Ride not found")

    @rides_ns.expect(ride_model)
    @rides_ns.marshal_with(ride_model)
    def put(self, ride_id):
        """Update ride details"""
        data = request.get_json()
        result = db.rides.update_one({'ride_id': ride_id}, {'$set': data})
        if result.matched_count == 0:
            rides_ns.abort(404, "Ride not found")
        return db.rides.find_one({'ride_id': ride_id})

    def delete(self, ride_id):
        """Cancel a ride"""
        result = db.rides.delete_one({'ride_id': ride_id})
        if result.deleted_count == 0:
            rides_ns.abort(404, "Ride not found")
        return {'message': 'Ride canceled'}, 200

@rides_ns.route('/<string:ride_id>/start')
class StartRide(Resource):
    def post(self, ride_id):
        """Start a ride"""
        result = db.rides.update_one({'ride_id': ride_id}, {'$set': {'status': 'in-progress'}})
        if result.matched_count == 0:
            rides_ns.abort(404, "Ride not found")
        return {'message': 'Ride started'}, 200

@rides_ns.route('/<string:ride_id>/complete')
class CompleteRide(Resource):
    def post(self, ride_id):
        """Mark a ride as completed"""
        result = db.rides.update_one({'ride_id': ride_id}, {'$set': {'status': 'completed'}})
        if result.matched_count == 0:
            rides_ns.abort(404, "Ride not found")
        return {'message': 'Ride completed'}, 200

@rides_ns.route('/match')
class RideMatch(Resource):
    def post(self):
        """Find a matching ride for a rider request"""
        data = request.get_json()
        pickup_location = data.get('pickup_location')
        available_rides = db.rides.find({
            'status': 'scheduled',
            'available_seats': {'$gt': 0}
        })
        
        matched_rides = [ride for ride in available_rides if ride['start_location'] == pickup_location]
        
        if not matched_rides:
            return {'message': 'No matching rides found'}, 404
        
        return [{'_id': str(ride['_id']), **ride} for ride in matched_rides], 200
