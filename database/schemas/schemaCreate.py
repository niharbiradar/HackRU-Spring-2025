from pymongo import MongoClient
from datetime import datetime


username = 'niharbiradar'
password = 'Pillow007$$'  # Replace with your actual password
cluster_name = 'campusridesharedb.marsf.mongodb.net'

from pymongo import MongoClient
from pymongo.errors import CollectionInvalid
import datetime

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['CampusRideshare']

def setup_rides_collection():
    # Create or get the rides collection
    try:
        db.create_collection('rides')
    except CollectionInvalid:
        print("Rides collection already exists")

    rides = db.rides

    # Create indexes for rides
    rides.create_index([("ride_id", 1)], unique=True)
    rides.create_index([("driver_id", 1)])
    rides.create_index([("rider_id", 1)])
    rides.create_index([("ride_time", 1)])
    rides.create_index([("status", 1)])

    # Rides validator
    rides_validator = {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["ride_id", "driver_id", "start_location", "end_location", 
                        "ride_time", "status", "available_seats", "total_seats"],
            "properties": {
                "ride_id": {
                    "bsonType": "string",
                    "description": "must be a string and is required"
                },
                "rider_id": {
                    "bsonType": "string",
                    "description": "must be a string"
                },
                "driver_id": {
                    "bsonType": "string",
                    "description": "must be a string and is required"
                },
                "start_location": {
                    "bsonType": "string",
                    "description": "must be a string and is required"
                },
                "end_location": {
                    "bsonType": "string",
                    "description": "must be a string and is required"
                },
                "ride_time": {
                    "bsonType": "date",
                    "description": "must be a date and is required"
                },
                "ride_date": {
                    "bsonType": "date",
                    "description": "must be a date"
                },
                "status": {
                    "enum": ["pending", "active", "completed", "cancelled"],
                    "description": "can only be one of the enum values"
                },
                "payment_status": {
                    "enum": ["pending", "paid", "refunded"],
                    "description": "can only be one of the enum values"
                },
                "rating": {
                    "bsonType": ["int", "null"],
                    "minimum": 1,
                    "maximum": 5,
                    "description": "must be an integer between 1 and 5 or null"
                },
                "available_seats": {
                    "bsonType": "int",
                    "minimum": 0,
                    "description": "must be an integer greater than or equal to 0"
                },
                "total_seats": {
                    "bsonType": "int",
                    "minimum": 1,
                    "description": "must be an integer greater than 0"
                },
                "price": {
                    "bsonType": "double",
                    "minimum": 0,
                    "description": "must be a non-negative number"
                },
                "repeat_ride": {
                    "bsonType": "bool",
                    "description": "must be a boolean"
                },
                "repeat_days": {
                    "bsonType": "array",
                    "items": {
                        "bsonType": "string"
                    }
                }
            }
        }
    }

    # Update rides collection with validator
    db.command({
        'collMod': 'rides',
        'validator': rides_validator,
        'validationLevel': 'moderate'
    })

def setup_bookings_collection():
    # Create or get the bookings collection
    try:
        db.create_collection('bookings')
    except CollectionInvalid:
        print("Bookings collection already exists")

    bookings = db.bookings

    # Create indexes for bookings
    bookings.create_index([("booking_id", 1)], unique=True)
    bookings.create_index([("ride_id", 1)])
    bookings.create_index([("rider_id", 1)])
    bookings.create_index([("driver_id", 1)])
    bookings.create_index([("status", 1)])

    # Bookings validator
    bookings_validator = {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["booking_id", "ride_id", "rider_id", "driver_id", 
                        "status", "number_of_seats"],
            "properties": {
                "booking_id": {
                    "bsonType": "string",
                    "description": "must be a string and is required"
                },
                "ride_id": {
                    "bsonType": "string",
                    "description": "must be a string and is required"
                },
                "rider_id": {
                    "bsonType": "string",
                    "description": "must be a string and is required"
                },
                "driver_id": {
                    "bsonType": "string",
                    "description": "must be a string and is required"
                },
                "status": {
                    "enum": ["pending", "accepted", "rejected", "completed", "cancelled"],
                    "description": "can only be one of the enum values"
                },
                "number_of_seats": {
                    "bsonType": "int",
                    "minimum": 1,
                    "description": "must be an integer greater than 0"
                },
                "pickup_location": {
                    "bsonType": "string",
                    "description": "must be a string"
                },
                "created_at": {
                    "bsonType": "date",
                    "description": "must be a date"
                },
                "updated_at": {
                    "bsonType": "date",
                    "description": "must be a date"
                }
            }
        }
    }

    # Update bookings collection with validator
    db.command({
        'collMod': 'bookings',
        'validator': bookings_validator,
        'validationLevel': 'moderate'
    })

def insert_example_documents():
    # Example ride document
    example_ride = {
        "ride_id": "ride_123",
        "driver_id": "driver_456",
        "start_location": "Campus Center",
        "end_location": "Engineering Building",
        "ride_time": datetime.datetime.utcnow(),
        "ride_date": datetime.datetime.utcnow().date(),
        "status": "pending",
        "payment_status": "pending",
        "available_seats": 3,
        "total_seats": 4,
        "price": 5.00,
        "repeat_ride": False,
        "repeat_days": [],
        "created_at": datetime.datetime.utcnow()
    }

    # Example booking document
    example_booking = {
        "booking_id": "booking_789",
        "ride_id": "ride_123",
        "rider_id": "rider_101",
        "driver_id": "driver_456",
        "status": "pending",
        "number_of_seats": 1,
        "pickup_location": "Campus Center",
        "created_at": datetime.datetime.utcnow(),
        "updated_at": datetime.datetime.utcnow()
    }

    try:
        db.rides.insert_one(example_ride)
        print("Inserted example ride")
        db.bookings.insert_one(example_booking)
        print("Inserted example booking")
    except Exception as e:
        print(f"Error inserting example documents: {e}")

if __name__ == "__main__":
    print("Setting up CampusRideshare database...")
    setup_rides_collection()
    setup_bookings_collection()
    insert_example_documents()
    
    # Print collection info
    print("\nCollection details:")
    print(f"Rides collection - Number of documents: {db.rides.count_documents({})}")
    print(f"Bookings collection - Number of documents: {db.bookings.count_documents({})}")
    print("\nRides indexes:", db.rides.index_information())
    print("\nBookings indexes:", db.bookings.index_information())
    
    print("\nSetup complete!")