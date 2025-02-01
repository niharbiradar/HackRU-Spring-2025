from pymongo import MongoClient
from pymongo.errors import CollectionInvalid
from datetime import datetime, UTC

# Connect to MongoDB
client = MongoClient("mongodb+srv://niharbiradar:Pillow007$$@campusridesharedb.marsf.mongodb.net/CampusRideshare?retryWrites=true&w=majority")
db = client.CampusRideshare

def setup_collections():
    # Rides Collection
    try:
        db.create_collection('rides')
    except CollectionInvalid:
        print("Rides collection already exists")
    
    rides = db.rides
    
    # Create indexes for rides
    rides.create_index([("ride_id", 1)], unique=True)
    rides.create_index([("driver_id", 1)])
    rides.create_index([("ride_time", 1)])
    
    # Rides validator
    rides_validator = {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["ride_id", "driver_id", "start_location", "end_location", 
                        "ride_time", "status", "available_seats", "total_seats"],
            "properties": {
                "ride_id": {
                    "bsonType": "string"
                },
                "driver_id": {
                    "bsonType": "string"
                },
                "driver_name": {
                    "bsonType": "string"
                },
                "driver_picture": {
                    "bsonType": "string"
                },
                "start_location": {
                    "bsonType": "string"
                },
                "end_location": {
                    "bsonType": "string"
                },
                "ride_time": {
                    "bsonType": "date"
                },
                "status": {
                    "enum": ["scheduled", "in_progress", "completed", "cancelled"]
                },
                "available_seats": {
                    "bsonType": "int",
                    "minimum": 0
                },
                "total_seats": {
                    "bsonType": "int",
                    "minimum": 1
                },
                "vehicle_info": {
                    "bsonType": "object",
                    "properties": {
                        "type": {"bsonType": "string"},
                        "model": {"bsonType": "string"},
                        "plate": {"bsonType": "string"},
                        "state": {"bsonType": "string"}
                    }
                },
                "created_at": {
                    "bsonType": "date"
                }
            }
        }
    }

    db.command({
        'collMod': 'rides',
        'validator': rides_validator,
        'validationLevel': 'moderate'
    })

    # Bookings Collection
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
    
    # Bookings validator
    bookings_validator = {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["booking_id", "ride_id", "rider_id", "driver_id", "status"],
            "properties": {
                "booking_id": {
                    "bsonType": "string"
                },
                "ride_id": {
                    "bsonType": "string"
                },
                "rider_id": {
                    "bsonType": "string"
                },
                "rider_name": {
                    "bsonType": "string"
                },
                "rider_picture": {
                    "bsonType": "string"
                },
                "driver_id": {
                    "bsonType": "string"
                },
                "status": {
                    "enum": ["pending", "accepted", "rejected", "completed", "cancelled"]
                },
                "seats_booked": {
                    "bsonType": "int",
                    "minimum": 1
                },
                "pickup_location": {
                    "bsonType": "string"
                },
                "emergency_contact": {
                    "bsonType": "object",
                    "properties": {
                        "name": {"bsonType": "string"},
                        "phone": {"bsonType": "string"},
                        "relationship": {"bsonType": "string"}
                    }
                },
                "created_at": {
                    "bsonType": "date"
                },
                "updated_at": {
                    "bsonType": "date"
                }
            }
        }
    }

    db.command({
        'collMod': 'bookings',
        'validator': bookings_validator,
        'validationLevel': 'moderate'
    })

def insert_test_documents():
    # Example rider document
    example_rider = {
        "ride_id": "RIDE_" + datetime.now(UTC).strftime("%Y%m%d%H%M%S"),
        "driver_id": "TEST_DRIVER_1",
        "driver_name": "Test Driver",
        "start_location": "Student Center",
        "end_location": "Engineering Building",
        "ride_time": datetime.now(UTC),
        "status": "scheduled",
        "available_seats": 3,
        "total_seats": 4,
        "vehicle_info": {
            "type": "sedan",
            "model": "Toyota Camry",
            "plate": "XYZ123",
            "state": "NJ"
        },
        "created_at": datetime.now(UTC)
    }
    
    example_booking = {
        "booking_id": "BOOK_" + datetime.now(UTC).strftime("%Y%m%d%H%M%S"),
        "ride_id": "RIDE_001",
        "rider_id": "TEST_RIDER_1",
        "rider_name": "Test Rider",
        "driver_id": "TEST_DRIVER_1",
        "status": "pending",
        "seats_booked": 1,
        "pickup_location": "Student Center",
        "emergency_contact": {
            "name": "Emergency Contact",
            "phone": "123-456-7890",
            "relationship": "Parent"
        },
        "created_at": datetime.now(UTC),
        "updated_at": datetime.now(UTC)
    }
    
    try:
        db.rides.insert_one(example_rider)
        db.bookings.insert_one(example_booking)
        print("Test documents inserted successfully")
    except Exception as e:
        print(f"Error inserting test documents: {e}")

if __name__ == "__main__":
    print("Setting up CampusRideshare collections...")
    setup_collections()
    # Uncomment next line if you want to insert test documents
    # insert_test_documents()
    print("Setup complete!")