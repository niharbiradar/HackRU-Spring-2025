from flask import Flask
from flask_restx import Api
from flask_cors import CORS
import os

# Initialize Flask app
app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})


# Initialize API with Swagger UI
api = Api(
    app,
    version="1.0",
    title="Campus Rideshare API",
    description="API for managing rides, bookings, users, and messaging",
    doc="/docs"
)

# Import namespaces AFTER defining the app
from app.routers.users import users_ns
from app.routers.rides import rides_ns
from app.routers.bookings import bookings_ns
from app.routers.messaging import messaging_ns  # Add messaging routes

# Register namespaces
api.add_namespace(users_ns, path="/users")
api.add_namespace(rides_ns, path="/rides")
api.add_namespace(bookings_ns, path="/bookings")
api.add_namespace(messaging_ns, path="/messages")  # Add chat APIs

# Default route
@app.route('/')
def home():
    return {
        "message": "Welcome to the Campus Rideshare API",
        "docs": "/docs",
        "endpoints": {
            "Users": "/users",
            "Rides": "/rides",
            "Bookings": "/bookings",
            "Messages": "/messages"
        }
    }

# Run Flask app
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8000)
