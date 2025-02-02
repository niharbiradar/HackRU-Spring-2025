from pymongo import MongoClient
import os

# Load MongoDB URI from environment variables
MONGO_URI="mongodb+srv://niharbiradar:Pillow007$$@campusridesharedb.marsf.mongodb.net/CampusRideshare?retryWrites=true&w=majority"
client = MongoClient(MONGO_URI)
db = client.CampusRideshare  # Database instance
