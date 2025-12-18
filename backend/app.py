from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from bson import ObjectId
import json

# Load environment variables
load_dotenv()

# Custom JSON encoder to handle MongoDB ObjectId
class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)

# Initialize Flask app
app = Flask(__name__, 
            static_folder='../frontend/static',
            template_folder='../frontend/templates')

# Enable CORS
CORS(app)

# Configure MongoDB connection
try:
    mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/railway_reservation')
    client = MongoClient(mongo_uri)
    db = client.railway_reservation
    print("Connected to MongoDB successfully!")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")

# Import routes after app initialization to avoid circular imports
from backend.api.routes import register_routes

# Register API routes
register_routes(app, db)

# Main route for serving the frontend
@app.route('/')
def index():
    return render_template('index.html')

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not found"}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({"error": "Internal server error"}), 500

# Run the application
if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)