from flask import request, make_response, jsonify
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


@rides_ns.route('/all')
class AllRidesAndBookings(Resource):
    def get(self):
        """Fetch all rides and bookings"""
        try:
            # Fetch all rides
            rides_cursor = db.rides.find()
            rides_list = list(rides_cursor)
            
            # Fetch all bookings
            bookings_cursor = db.bookings.find()
            bookings_list = list(bookings_cursor)
            
            # Process rides to make them JSON serializable
            processed_rides = []
            for ride in rides_list:
                ride_dict = {}
                for key, value in ride.items():
                    if isinstance(value, ObjectId):
                        ride_dict[key] = str(value)
                    elif isinstance(value, datetime):
                        ride_dict[key] = value.isoformat()
                    else:
                        ride_dict[key] = value
                processed_rides.append(ride_dict)
            
            # Process bookings similarly
            processed_bookings = []
            for booking in bookings_list:
                booking_dict = {}
                for key, value in booking.items():
                    if isinstance(value, ObjectId):
                        booking_dict[key] = str(value)
                    elif isinstance(value, datetime):
                        booking_dict[key] = value.isoformat()
                    else:
                        booking_dict[key] = value
                processed_bookings.append(booking_dict)
            
            # Combine and return
            return {
                'rides': processed_rides,
                'bookings': processed_bookings
            }

        except Exception as e:
            print(f"Error in /rides/all GET: {str(e)}")
            return {'error': str(e)}, 500

@rides_ns.route('/driver/<string:driver_id>')
class DriverRides(Resource):
    def get(self, driver_id):
        """Fetch rides for a specific driver"""
        try:
            # Find all rides for this driver
            rides = db.rides.find({'driver_id': driver_id})
            
            # Convert to list and process for JSON
            rides_list = []
            for ride in rides:
                ride['_id'] = str(ride['_id'])
                # Convert datetime objects to strings
                if 'ride_time' in ride:
                    ride['ride_time'] = ride['ride_time'].isoformat()
                if 'created_at' in ride:
                    ride['created_at'] = ride['created_at'].isoformat()
                rides_list.append(ride)

            response = make_response(jsonify(rides_list))
            response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
            response.headers.add("Access-Control-Allow-Credentials", "true")
            return response

        except Exception as e:
            error_response = make_response(jsonify({'error': str(e)}), 500)
            error_response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
            error_response.headers.add("Access-Control-Allow-Credentials", "true")
            return error_response

@rides_ns.route('/test-db')
class TestDB(Resource):
    def get(self):
        """Test database connection"""
        try:
            # Test MongoDB connection
            count = db.rides.count_documents({})
            
            response = make_response(jsonify({
                'status': 'success',
                'message': 'Database connection successful',
                'rides_count': count
            }))
            response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
            response.headers.add("Access-Control-Allow-Credentials", "true")
            return response
            
        except Exception as e:
            error_response = make_response(jsonify({
                'status': 'error',
                'message': str(e)
            }), 500)
            error_response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
            error_response.headers.add("Access-Control-Allow-Credentials", "true")
            return error_response




@rides_ns.route('/')
class RideList(Resource):
    def get(self):
        """Fetch all rides"""
        try:
            print("Fetching all rides from database...")
            
            # Remove status filter to return ALL rides
            rides_cursor = db.rides.find()
            
            rides_list = list(rides_cursor)
            print(f"Found {len(rides_list)} total rides")
            
            # Process rides to make them JSON serializable
            processed_rides = []
            for ride in rides_list:
                ride_dict = {}
                for key, value in ride.items():
                    if isinstance(value, ObjectId):
                        ride_dict[key] = str(value)
                    elif isinstance(value, datetime):
                        ride_dict[key] = value.isoformat()
                    else:
                        ride_dict[key] = value
                processed_rides.append(ride_dict)

            print("Rides found:", [ride.get('status') for ride in processed_rides])

            response = make_response(jsonify(processed_rides))
            response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
            response.headers.add("Access-Control-Allow-Credentials", "true")
            return response

        except Exception as e:
            print(f"Error in /rides GET: {str(e)}")
            error_response = make_response(jsonify({'error': str(e)}), 500)
            error_response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
            error_response.headers.add("Access-Control-Allow-Credentials", "true")
            return error_response


    @rides_ns.expect(ride_model)  # Assuming you have ride_model defined
    def post(self):
        """Create a new ride"""
        try:
            data = request.get_json()
            data['created_at'] = datetime.utcnow()
            
            result = db.rides.insert_one(data)
            data['_id'] = str(result.inserted_id)
            
            response = make_response(jsonify(data), 201)
            response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
            response.headers.add("Access-Control-Allow-Credentials", "true")
            return response
            
        except Exception as e:
            error_response = make_response(jsonify({'error': str(e)}), 500)
            error_response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
            error_response.headers.add("Access-Control-Allow-Credentials", "true")
            return error_response

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
