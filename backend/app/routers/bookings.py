from flask import request, jsonify, make_response, send_from_directory
from flask_restx import Namespace, Resource, fields
from bson import ObjectId
from datetime import datetime
from flask import current_app
from app.database import db


bookings_ns = Namespace('bookings', description='Booking operations')

# Booking Model
booking_model = bookings_ns.model('Booking', {
    'booking_id': fields.String(required=True, description="Unique Booking ID"),
    'ride_id': fields.String(required=True, description="Associated Ride ID"),
    'rider_id': fields.String(required=True, description="ID of the rider"),
    'rider_name': fields.String(description="Rider's full name"),
    'rider_picture': fields.String(description="Rider's profile picture"),
    'status': fields.String(default='pending', enum=['pending', 'confirmed', 'rejected', 'canceled', 'completed'], description="Booking status"),
    'seats_booked': fields.Integer(required=True, description="Number of seats booked"),
    'pickup_location': fields.String(required=True, description="Rider's pickup location"),
    'created_at': fields.DateTime(description="Booking creation timestamp"),
    'updated_at': fields.DateTime(description="Last update timestamp"),
})

@bookings_ns.route('/')
class BookingList(Resource):
    @bookings_ns.marshal_list_with(booking_model)
    def get(self):
        """Fetch all bookings"""
        bookings = db.bookings.find()
        return [{'_id': str(booking['_id']), **booking} for booking in bookings]

    @bookings_ns.expect(booking_model)
    @bookings_ns.marshal_with(booking_model, code=201)
    def post(self):
        """Create a new booking"""
        data = request.get_json()
        ride = db.rides.find_one({'ride_id': data['ride_id']})
        if not ride or ride['available_seats'] < data['seats_booked']:
            bookings_ns.abort(400, "Not enough seats available")
        
        data['created_at'] = datetime.utcnow()
        data['updated_at'] = datetime.utcnow()
        result = db.bookings.insert_one(data)
        data['_id'] = str(result.inserted_id)
        
        db.rides.update_one(
            {'ride_id': data['ride_id']},
            {'$inc': {'available_seats': -data['seats_booked']}}
        )
        
        return data, 201

@bookings_ns.route('/<string:booking_id>')
@bookings_ns.param('booking_id', 'Booking ID')
class BookingResource(Resource):
    @bookings_ns.marshal_with(booking_model)
    def get(self, booking_id):
        """Fetch booking details"""
        booking = db.bookings.find_one({'booking_id': booking_id})
        if booking:
            return {'_id': str(booking['_id']), **booking}
        bookings_ns.abort(404, "Booking not found")

    @bookings_ns.expect(booking_model)
    @bookings_ns.marshal_with(booking_model)
    def put(self, booking_id):
        """Update booking details"""
        data = request.get_json()
        data['updated_at'] = datetime.utcnow()
        result = db.bookings.update_one({'booking_id': booking_id}, {'$set': data})
        if result.matched_count == 0:
            bookings_ns.abort(404, "Booking not found")
        return db.bookings.find_one({'booking_id': booking_id})

    def delete(self, booking_id):
        """Cancel a booking"""
        booking = db.bookings.find_one({'booking_id': booking_id})
        if not booking:
            bookings_ns.abort(404, "Booking not found")
        
        db.rides.update_one(
            {'ride_id': booking['ride_id']},
            {'$inc': {'available_seats': booking['seats_booked']}}
        )
        
        db.bookings.delete_one({'booking_id': booking_id})
        return {'message': 'Booking canceled'}, 200


@bookings_ns.route('/get_by_ride_id')
class GetBookingsByRideId(Resource):
    def get(self):
        """Get all bookings by ride_id"""
        try:
            ride_id = request.args.get('ride_id')
            if not ride_id:
                return make_response(jsonify({'error': 'Ride ID parameter is required'}), 400)

            # Convert ride_id to ObjectId if needed
            try:
                ride_id = ObjectId(ride_id)
            except Exception:
                return make_response(jsonify({'error': 'Invalid Ride ID format'}), 400)

            # Query MongoDB for all bookings related to the ride_id
            bookings_cursor = db.bookings.find({"ride_id": ride_id})
            bookings_list = list(bookings_cursor)

            if not bookings_list:
                return make_response(jsonify({'message': 'No bookings found for this ride'}), 404)

            # Convert ObjectId fields to string
            processed_bookings = []
            for booking in bookings_list:
                booking_dict = {key: str(value) if isinstance(value, ObjectId) else value for key, value in booking.items()}
                processed_bookings.append(booking_dict)

            return make_response(jsonify(processed_bookings), 200)

        except Exception as e:
            return make_response(jsonify({'error': str(e)}), 500)
