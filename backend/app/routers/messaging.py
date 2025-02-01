from flask import request
from flask_restx import Namespace, Resource, fields
from stream_chat import StreamChat
import os

messaging_ns = Namespace("messages", description="Messaging using GetStream")

# Load GetStream credentials
GETSTREAM_API_KEY = os.getenv("GETSTREAM_API_KEY", "your_api_key")
GETSTREAM_API_SECRET = os.getenv("GETSTREAM_API_SECRET", "your_api_secret")

# Initialize GetStream Chat Client
chat_client = StreamChat(api_key=GETSTREAM_API_KEY, api_secret=GETSTREAM_API_SECRET)

# Message model for Swagger
message_model = messaging_ns.model("Message", {
    "sender_id": fields.String(required=True, description="Sender's user ID"),
    "receiver_id": fields.String(required=True, description="Receiver's user ID"),
    "ride_id": fields.String(required=True, description="Ride ID for chat"),
    "message": fields.String(required=True, description="Message content"),
})

@messaging_ns.route("/create_user")
class CreateUser(Resource):
    def post(self):
        """Create a user in GetStream"""
        data = request.get_json()
        user_id = data["user_id"]
        user_name = data["name"]

        user = chat_client.upsert_user({
            "id": user_id,
            "name": user_name
        })
        return {"message": "User created successfully", "user": user}, 201

@messaging_ns.route("/create_chat/<string:ride_id>")
class CreateChat(Resource):
    def post(self, ride_id):
        """Create a chat room for a ride"""
        data = request.get_json()
        driver_id = data["driver_id"]
        rider_id = data["rider_id"]

        channel = chat_client.channel("messaging", ride_id, {
            "members": [driver_id, rider_id]
        })
        channel.create(driver_id)
        return {"message": "Chat room created", "channel_id": ride_id}, 201

@messaging_ns.route("/send_message/<string:ride_id>")
class SendMessage(Resource):
    @messaging_ns.expect(message_model)
    def post(self, ride_id):
        """Send a message in a ride chat room"""
        data = request.get_json()
        sender_id = data["sender_id"]
        message_text = data["message"]

        channel = chat_client.channel("messaging", ride_id)
        message = channel.send_message({
            "text": message_text,
            "user_id": sender_id
        })
        return {"message": "Message sent successfully", "data": message}, 201

@messaging_ns.route("/history/<string:ride_id>")
class ChatHistory(Resource):
    def get(self, ride_id):
        """Get chat history for a ride"""
        channel = chat_client.channel("messaging", ride_id)
        messages = channel.query(messages={})
        return {"messages": messages["messages"]}

@messaging_ns.route("/delete_message/<string:message_id>")
class DeleteMessage(Resource):
    def delete(self, message_id):
        """Delete a message from chat"""
        chat_client.delete_message(message_id)
        return {"message": "Message deleted successfully"}, 200
