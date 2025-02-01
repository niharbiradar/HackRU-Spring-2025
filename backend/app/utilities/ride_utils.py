from bson.objectid import ObjectId
from app.database import mongo

def get_ride_by_id(ride_id):
    return mongo.db.rides.find_one({"_id": ObjectId(ride_id)})

def get_total_seats(ride_id):
    ride = get_ride_by_id(ride_id)
    if ride:
        return ride.get('total_seats')
    return None

def get_available_seats(ride_id):
    ride = get_ride_by_id(ride_id)
    if ride:
        return ride.get('available_seats')
    return None

def get_driver_id(ride_id):
    ride = get_ride_by_id(ride_id)
    if ride:
        return ride.get('driver_id')
    return None

def get_driver_name(ride_id):
    ride = get_ride_by_id(ride_id)
    if ride:
        return ride.get('driver_name')
    return None

def get_driver_picture(ride_id):
    ride = get_ride_by_id(ride_id)
    if ride:
        return ride.get('driver_picture')
    return None

def get_start_location(ride_id):
    ride = get_ride_by_id(ride_id)
    if ride:
        return ride.get('start_location')
    return None

def get_end_location(ride_id):
    ride = get_ride_by_id(ride_id)
    if ride:
        return ride.get('end_location')
    return None

def get_ride_time(ride_id):
    ride = get_ride_by_id(ride_id)
    if ride:
        return ride.get('ride_time')
    return None

def get_status(ride_id):
    ride = get_ride_by_id(ride_id)
    if ride:
        return ride.get('status')
    return None

def get_vehicle_info(ride_id):
    ride = get_ride_by_id(ride_id)
    if ride:
        return ride.get('vehicle_info')
    return None

#probably unecessary... definitely unecessary.
def get_created_at(ride_id):
    ride = get_ride_by_id(ride_id)
    if ride:
        return ride.get('created_at')
    return None