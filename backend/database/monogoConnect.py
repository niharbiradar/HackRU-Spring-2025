from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

class MongoDBConnection:
    _instance = None
    _client = None
    
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance
    
    def __init__(self):
        if MongoDBConnection._client is None:
            # Get credentials from environment variables
            self.username = os.getenv('MONGODB_USERNAME')
            self.password = os.getenv('MONGODB_PASSWORD')
            self.cluster = os.getenv('MONGODB_CLUSTER')
            
            if not all([self.username, self.password, self.cluster]):
                raise ValueError("Missing MongoDB credentials in environment variables")
            
            # Construct the connection string
            connection_string = f"mongodb+srv://{self.username}:{self.password}@{self.cluster}/CampusRideshare?retryWrites=true&w=majority"
            
            try:
                # Create MongoDB client
                MongoDBConnection._client = MongoClient(connection_string)
                # Test the connection
                MongoDBConnection._client.admin.command('ping')
                print("Successfully connected to MongoDB!")
            except ConnectionFailure as e:
                print(f"Failed to connect to MongoDB: {e}")
                raise
    
    def get_db(self):
        """Get the database instance"""
        return MongoDBConnection._client['CampusRideshare']
    
    def get_collection(self, collection_name):
        """Get a specific collection"""
        return self.get_db()[collection_name]
    
    def close_connection(self):
        """Close the MongoDB connection"""
        if MongoDBConnection._client:
            MongoDBConnection._client.close()
            MongoDBConnection._client = None
            print("MongoDB connection closed.")

# Example usage:
if __name__ == "__main__":
    try:
        # Get the MongoDB connection instance
        mongo_conn = MongoDBConnection.get_instance()
        
        # Test the connection with some basic operations
        users = mongo_conn.get_collection('users')
        print(f"Number of users: {users.count_documents({})}")
        
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        # Close the connection when done
        mongo_conn.close_connection()