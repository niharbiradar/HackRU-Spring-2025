from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId
from datetime import datetime
from ..database import mongo

router = Blueprint('users', __name__)

# Helper function to serialize MongoDB documents
def serialize_doc(doc):
    if '_id' in doc:
        doc['_id'] = str(doc['_id'])
    return doc

# Create a new user
@router.route('/', methods=['POST'])
def create_user():
    data = request.json
    data['created_at'] = datetime.utcnow()
    result = mongo.db.users.insert_one(data)
    return jsonify({"message": "User created", "user_id": str(result.inserted_id)}), 201

# Get a user by ID
@router.route('/<user_id>', methods=['GET'])
def get_user(user_id):
    user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
    if user:
        return jsonify(serialize_doc(user)), 200
    return jsonify({"message": "User not found"}), 404

# Update a user by ID
@router.route('/<user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.json
    result = mongo.db.users.update_one({"_id": ObjectId(user_id)}, {"$set": data})
    if result.matched_count > 0:
        return jsonify({"message": "User updated"}), 200
    return jsonify({"message": "User not found"}), 404

# Delete a user by ID
@router.route('/<user_id>', methods=['DELETE'])
def delete_user(user_id):
    result = mongo.db.users.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count > 0:
        return jsonify({"message": "User deleted"}), 200
    return jsonify({"message": "User not found"}), 404