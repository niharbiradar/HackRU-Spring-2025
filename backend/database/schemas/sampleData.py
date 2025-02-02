from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timedelta, UTC
import uuid

# MongoDB connection
client = MongoClient("mongodb+srv://niharbiradar:Pillow007$$@campusridesharedb.marsf.mongodb.net/CampusRideshare?retryWrites=true&w=majority")
db = client.CampusRideshare

def create_sample_data():
    # Get the existing user
    user = db.users.find_one({})
    if not user:
        print("No users found in database")
        return

    # Campus locations for sample data
    locations = [
        "Livingston Student Center",
        "College Ave Student Center",
        "Busch Student Center",
        "Academic Building",
        "Alexander Library",
        "Hill Center",
        "Scott Hall",
        "Beck Hall",
        "Engineering Building",
        "Business School"
    ]

    # Create sample rides
    sample_rides = []
    ride_statuses = ["scheduled", "in_progress", "completed", "cancelled", "scheduled"]
    
    for i in range(5):  # Create 5 sample rides
        ride = {
            "_id": ObjectId(),
            "ride_id": str(uuid.uuid4()),
            "driver_id": user["user_id"],
            "driver_name": user.get("name", "Default Driver Name"),
            "driver_picture": user.get("profile_picture", "default_profile.jpg"),
            "start_location": locations[i],
            "end_location": locations[(i + 1) % len(locations)],
            "ride_time": datetime.now(UTC) + timedelta(hours=i+1),
            "status": ride_statuses[i],  # Using valid status values
            "available_seats": 4,
            "total_seats": 4,
            "vehicle_info": {
                "type": user.get("vehicle_type", "sedan"),
                "model": user.get("vehicle_model", "Toyota Corolla"),
                "plate": user.get("vehicle_plate", "ABC123"),
                "state": user.get("vehicle_state", "NJ")
            },
            "created_at": datetime.now(UTC)
        }
        sample_rides.append(ride)

    # Create sample bookings
    sample_bookings = []
    booking_statuses = ["pending", "accepted", "rejected", "completed", "cancelled"]
    
    for i, ride in enumerate(sample_rides):
        # Create 2 bookings for each ride
        for j in range(2):
            booking = {
                "_id": ObjectId(),
                "booking_id": str(uuid.uuid4()),
                "ride_id": ride["ride_id"],
                "rider_id": user["user_id"],
                "rider_name": user.get("name", "Default Rider Name"),
                "rider_picture": user.get("profile_picture", "default_profile.jpg"),
                "driver_id": ride["driver_id"],
                "status": booking_statuses[i],
                "seats_booked": 1,
                "pickup_location": ride["start_location"],
                "emergency_contact": user.get("emergency_contacts", [{"name": "Emergency Contact", "phone": "123-456-7890", "relationship": "Parent"}])[0],
                "created_at": datetime.now(UTC),
                "updated_at": datetime.now(UTC)
            }
            sample_bookings.append(booking)

    try:
        # Insert the sample data
        if sample_rides:
            db.rides.insert_many(sample_rides)
            print(f"Successfully inserted {len(sample_rides)} rides")
        
        if sample_bookings:
            db.bookings.insert_many(sample_bookings)
            print(f"Successfully inserted {len(sample_bookings)} bookings")

        # Print sample data for verification
        print("\nSample Ride:")
        print(db.rides.find_one())
        print("\nSample Booking:")
        print(db.bookings.find_one())

    except Exception as e:
        print(f"Error inserting data: {e}")

if __name__ == "__main__":
    # Clear existing data
    db.rides.delete_many({})
    db.bookings.delete_many({})
    print("Cleared existing data")

    # Insert new sample data
    create_sample_data()