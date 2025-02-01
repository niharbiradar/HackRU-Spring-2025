from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId
from datetime import datetime
from ..database import mongo

router = Blueprint('rides', __name__)

# Helper function to serialize MongoDB documents
def serialize_doc(doc):
    if '_id' in doc:
        doc['_id'] = str(doc['_id'])
    return doc

# Create a new ride
@router.route('/', methods=['POST'])
def create_ride():
    data = request.json
    data['created_at'] = datetime.utcnow()
    result = mongo.db.rides.insert_one(data)
    return jsonify({"message": "Ride created", "ride_id": str(result.inserted_id)}), 201

# Get a ride by ID
@router.route('/<ride_id>', methods=['GET'])
def get_ride(ride_id):
    ride = mongo.db.rides.find_one({"_id": ObjectId(ride_id)})
    if ride:
        return jsonify(serialize_doc(ride)), 200
    return jsonify({"message": "Ride not found"}), 404

# Get all rides
@router.route('/', methods=['GET'])
def get_rides():
    rides = list(mongo.db.rides.find())
    return jsonify([serialize_doc(ride) for ride in rides]), 200

# Update a ride by ID
@router.route('/<ride_id>', methods=['PUT'])
def update_ride(ride_id):
    data = request.json
    result = mongo.db.rides.update_one(
        {"_id": ObjectId(ride_id)}, 
        {"$set": data}
    )
    if result.matched_count > 0:
        return jsonify({"message": "Ride updated"}), 200
    return jsonify({"message": "Ride not found"}), 404

# Delete a ride by ID
@router.route('/<ride_id>', methods=['DELETE'])
def delete_ride(ride_id):
    result = mongo.db.rides.delete_one({"_id": ObjectId(ride_id)})
    if result.deleted_count > 0:
        return jsonify({"message": "Ride deleted"}), 200
    return jsonify({"message": "Ride not found"}), 404