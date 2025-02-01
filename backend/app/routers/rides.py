from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId
from datetime import datetime
from ..database import mongo

router = Blueprint('rides', __name__)

def serialize_document(doc):
    if '_id' in doc:
        doc['_id'] = str(doc['_id'])
    else:
        raise ValueError('Document does not contain an _id field')
    return doc

# Create a new ride
@router.route('/', methods=['POST'])
def create_ride():
    data = request.json
    data['created_at'] = datetime.utcnow()
    result = mongo.db.rides.insert_one(data)
    return jsonify({"message": "Ride created", "ride_id": str(result.inserted_id)}), 201

# Get all rides
@router.route('/', methods=['GET'])
def get_all_rides():
    rides = mongo.db.rides.find()
    return jsonify([serialize_document(ride) for ride in rides]), 200

# Get a ride by ID
@router.route('/<ride_id>', methods=['GET'])
def get_ride(ride_id):
    ride = mongo.db.rides.find_one({"_id": ObjectId(ride_id)})
    if ride:
        return jsonify(serialize_document(ride)), 200
    return jsonify({"message": "Ride not found"}), 404

# Update a ride by ID
@router.route('/<ride_id>', methods=['PUT'])
def update_ride(ride_id):
    data = request.get_json()
    result = mongo.db.rides.update_one(
        {'_id': ObjectId(ride_id)},
        {'$set': data}
    )
    if result.modified_count:
        return jsonify({'message': 'Ride updated successfully'}), 200
    return jsonify({'message': 'Ride not found'}), 404

# Delete a ride by ID
@router.route('/<ride_id>', methods=['DELETE'])
def delete_ride(ride_id):
    result = mongo.db.rides.delete_one({'_id': ObjectId(ride_id)})
    if result.deleted_count:
        return jsonify({'message': 'Ride deleted successfully'}), 200
    return jsonify({'message': 'Ride not found'}), 404