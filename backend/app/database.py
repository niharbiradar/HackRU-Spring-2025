from pymongo import MongoClient
import os

# Load MongoDB URI from environment variables
MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongo:27017/CampusRideshare")
client = MongoClient(MONGO_URI)
db = client.CampusRideshare  # Database instance
