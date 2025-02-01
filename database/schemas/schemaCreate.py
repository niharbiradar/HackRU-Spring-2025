from pymongo import MongoClient
from datetime import datetime


username = 'niharbiradar'
password = 'Pillow007$$'  # Replace with your actual password
cluster_name = 'campusridesharedb.marsf.mongodb.net'

# Connect to MongoDB Atlas
connection_string = f"mongodb+srv://{username}:{password}@{cluster_name}/?retryWrites=true&w=majority"

client = MongoClient(connection_string)

# Choose the database (create if doesn't exist)
db = client['CampusRideshare']



# Define Collections

# Users Collection
users = db['users']
users_schema = {
    "user_id": "unique_user_id",
    "email": "student_email@university.edu",
    "name": "Full Name",
    "user_type": "rider/driver",  # Defines if user is a driver or rider
    "university_email_verified": True,
    "profile_picture": "url_of_profile_picture",
    "emergency_contacts": [
        {"name": "Emergency Contact Name", "phone": "123-456-7890"}
    ],
    "created_at": datetime.utcnow()
}

# Example user insertion (rider)
users.insert_one(users_schema)

# Drivers Collection
drivers = db['drivers']
drivers_schema = {
    "user_id": "unique_driver_id",
    "vehicle_type": "sedan/suv",
    "vehicle_model": "Toyota Corolla",
    "vehicle_plate": "XYZ123",
    "availability": [
        {"day": "Monday", "time": "9:00AM-12:00PM"},
        {"day": "Wednesday", "time": "1:00PM-3:00PM"}
    ],
    "rating": 4.7,  # Average rating based on feedback
    "created_at": datetime.utcnow()
}

# Example driver insertion
drivers.insert_one(drivers_schema)

# Rides Collection
rides = db['rides']
rides_schema = {
    "ride_id": "unique_ride_id",
    "rider_id": "unique_user_id",  # Refers to a user in 'users'
    "driver_id": "unique_driver_id",  # Refers to a user in 'drivers'
    "start_location": "Campus Building A",
    "end_location": "Campus Building B",
    "ride_time": "2025-01-30T08:00:00Z",  # ISO format timestamp
    "status": "completed",  # or "pending", "cancelled"
    "payment_status": "paid",  # or "pending"
    "rating": 5,  # Rating given after ride
    "created_at": datetime.utcnow()
}

# Example ride insertion
rides.insert_one(rides_schema)

# Payments Collection
payments = db['payments']
payments_schema = {
    "payment_id": "unique_payment_id",
    "ride_id": "unique_ride_id",  # Refers to ride in 'rides'
    "amount": 10.00,  # Payment amount
    "payment_method": "credit_card",  # Could be "paypal", "stripe", etc.
    "payment_status": "completed",  # or "pending", "failed"
    "created_at": datetime.utcnow()
}

# Example payment insertion
payments.insert_one(payments_schema)

# Ratings and Reviews Collection
ratings_reviews = db['ratings_reviews']
ratings_reviews_schema = {
    "ride_id": "unique_ride_id",  # Refers to ride in 'rides'
    "rider_id": "unique_rider_id",  # Refers to user in 'users'
    "driver_id": "unique_driver_id",  # Refers to user in 'drivers'
    "rating": 4,  # Rating between 1 and 5
    "review": "Great ride, would recommend!",
    "created_at": datetime.utcnow()
}

# Example rating/review insertion
ratings_reviews.insert_one(ratings_reviews_schema)

# Driver Availability Collection
driver_availability = db['driver_availability']
driver_availability_schema = {
    "driver_id": "unique_driver_id",  # Refers to driver in 'drivers'
    "availability": [
        {"day": "Monday", "time": "9:00AM-12:00PM"},
        {"day": "Tuesday", "time": "1:00PM-3:00PM"}
    ],
    "created_at": datetime.utcnow()
}

# Example availability insertion
driver_availability.insert_one(driver_availability_schema)

# Emergency Contacts Collection
emergency_contacts = db['emergency_contacts']
emergency_contacts_schema = {
    "user_id": "unique_user_id",  # Refers to user in 'users'
    "contacts": [
        {"name": "John Doe", "phone": "123-456-7890", "relationship": "Friend"},
        {"name": "Jane Doe", "phone": "987-654-3210", "relationship": "Family"}
    ],
    "created_at": datetime.utcnow()
}

# Example emergency contact insertion
emergency_contacts.insert_one(emergency_contacts_schema)

print("Data has been inserted successfully.")
