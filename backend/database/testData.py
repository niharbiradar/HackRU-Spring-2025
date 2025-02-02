import random
import os
from datetime import datetime, timedelta
from pymongo import MongoClient
import uuid


# MongoDB setup
MONGO_URI="mongodb+srv://niharbiradar:Pillow007$$@campusridesharedb.marsf.mongodb.net/CampusRideshare?retryWrites=true&w=majority"

client = MongoClient(MONGO_URI)
db = client['CampusRideshare']

# Create test data for users
def generate_test_users():
    users = list(db.users.find())
    if len(users) == 0:  # If no users exist, create test data
        for i in range(1, 6):  # Create 5 test users
            user_data = {
                'user_id': str(uuid.uuid4()),
                'email': f'user{i}@university.com',
                'name': f'User {i}',
                'user_type': random.choice(['rider', 'driver']),
                'university_email_verified': random.choice([True, False]),
                'profile_picture': f'http://someurl.com/user{i}.jpg',
                'created_at': datetime.utcnow()
            }
            db.users.insert_one(user_data)

# Create test data for rides
def generate_test_rides(user_ids):
    statuses = ['scheduled', 'in_progress', 'completed', 'cancelled']
    for i in range(1, 11):  # Create 10 test rides
        ride_data = {
            'ride_id': str(uuid.uuid4()),
            'driver_id': user_ids[random.choice(range(len(user_ids)))],  # Random driver from test users
            'driver_name': f'Driver {i}',
            'start_location': f'Location {i}',
            'end_location': f'Destination {i}',
            'ride_time': random_date(datetime.utcnow(), datetime.utcnow() + timedelta(days=30)),
            'status': random.choice(statuses),  # Random status from allowed statuses
            'available_seats': random.randint(1, 4),
            'total_seats': 4,
            'vehicle_info': {
                'model': f'Model {i}',
                'plate': f'ABC{i}123',
                'state': 'NY'
            },
            'created_at': datetime.utcnow()
        }
        db.rides.insert_one(ride_data)

# Create test data for bookings
def generate_test_bookings(user_ids):
    for i in range(1, 11):  # Create 10 test bookings
        booking_data = {
            'booking_id': str(uuid.uuid4()),
            'ride_id': str(uuid.uuid4()),  # Random ride ID
            'rider_id': user_ids[random.choice(range(len(user_ids)))],  # Random rider from test users
            'rider_name': f'Rider {i}',
            'status': random.choice(['confirmed', 'rejected', 'completed', 'cancelled']),  # Booking status
            'seats_booked': random.randint(1, 2),
            'pickup_location': f'Pickup {i}',
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        db.bookings.insert_one(booking_data)

# Random date generator function
def random_date(start, end):
    return start + (end - start) * random.random()

# Main function to generate data
def generate_test_data():
    generate_test_users()  # Ensure we have users to assign
    user_ids = [user['user_id'] for user in db.users.find()]
    generate_test_rides(user_ids)  # Create test rides with user assignment
    generate_test_bookings(user_ids)  # Create test bookings

# Run the function to generate test data
generate_test_data()
print("Test data generation completed!")
