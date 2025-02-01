from datetime import datetime
from pymongo import MongoClient

# MongoDB connection
client = MongoClient('mongodb+srv://niharbiradar:Pillow007$$@campusridesharedb.marsf.mongodb.net/CampusRideshare?retryWrites=true&w=majority')
db = client['CampusRideshare']

# Collections
users = db['users']
drivers = db['drivers']
rides = db['rides']
payments = db['payments']
ratings_reviews = db['ratings_reviews']
driver_availability = db['driver_availability']
emergency_contacts = db['emergency_contacts']