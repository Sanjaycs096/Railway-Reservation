from flask import Blueprint, request, jsonify
from bson import ObjectId
import json
from datetime import datetime

# Function to register all routes
def register_routes(app, db):
    # Create API blueprint
    api = Blueprint('api', __name__)
    
    # User routes
    @api.route('/api/users/register', methods=['POST'])
    def register_user():
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'email', 'password']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Check if user already exists
        if db.users.find_one({'email': data['email']}):
            return jsonify({'error': 'User with this email already exists'}), 409
        
        # Create new user
        new_user = {
            'name': data['name'],
            'email': data['email'],
            'password': data['password'],  # In production, hash this password
            'role': 'passenger',  # Default role
            'created_at': datetime.utcnow()
        }
        
        result = db.users.insert_one(new_user)
        
        return jsonify({
            'message': 'User registered successfully',
            'user_id': str(result.inserted_id)
        }), 201
    
    @api.route('/api/users/login', methods=['POST'])
    def login_user():
        data = request.get_json()
        
        # Validate required fields
        if 'email' not in data or 'password' not in data:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Find user
        user = db.users.find_one({'email': data['email']})
        
        if not user or user['password'] != data['password']:  # In production, verify hashed password
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # In production, generate and return JWT token
        return jsonify({
            'message': 'Login successful',
            'user_id': str(user['_id']),
            'name': user['name'],
            'role': user['role']
        }), 200
    
    # Train routes
    @api.route('/api/trains', methods=['GET'])
    def get_trains():
        trains = list(db.trains.find())
        return jsonify({
            'trains': json.loads(json.dumps(trains, default=str))
        }), 200
    
    @api.route('/api/trains/<train_id>', methods=['GET'])
    def get_train(train_id):
        train = db.trains.find_one({'_id': ObjectId(train_id)})
        
        if not train:
            return jsonify({'error': 'Train not found'}), 404
        
        return jsonify({
            'train': json.loads(json.dumps(train, default=str))
        }), 200
    
    # Booking routes
    @api.route('/api/bookings', methods=['POST'])
    def create_booking():
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['user_id', 'train_id', 'seats', 'date']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Check if train exists
        train = db.trains.find_one({'_id': ObjectId(data['train_id'])})
        if not train:
            return jsonify({'error': 'Train not found'}), 404
        
        # Check if user exists
        user = db.users.find_one({'_id': ObjectId(data['user_id'])})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Create new booking
        new_booking = {
            'user_id': ObjectId(data['user_id']),
            'train_id': ObjectId(data['train_id']),
            'train_name': train['name'],
            'seats': data['seats'],
            'date': data['date'],
            'status': 'confirmed',  # Default status
            'created_at': datetime.utcnow()
        }
        
        result = db.bookings.insert_one(new_booking)
        
        return jsonify({
            'message': 'Booking created successfully',
            'booking_id': str(result.inserted_id)
        }), 201
    
    @api.route('/api/bookings/<user_id>', methods=['GET'])
    def get_user_bookings(user_id):
        bookings = list(db.bookings.find({'user_id': ObjectId(user_id)}))
        
        return jsonify({
            'bookings': json.loads(json.dumps(bookings, default=str))
        }), 200
    
    # Train tracking routes
    @api.route('/api/tracking/<train_id>', methods=['GET'])
    def get_train_location(train_id):
        # In a real application, this would fetch real-time GPS data
        # For demo purposes, we'll return mock data
        tracking_info = db.tracking.find_one({'train_id': ObjectId(train_id)})
        
        if not tracking_info:
            return jsonify({'error': 'Tracking information not available'}), 404
        
        return jsonify({
            'tracking': json.loads(json.dumps(tracking_info, default=str))
        }), 200
    
    # Alert routes
    @api.route('/api/alerts', methods=['GET'])
    def get_alerts():
        alerts = list(db.alerts.find().sort('created_at', -1).limit(10))
        
        return jsonify({
            'alerts': json.loads(json.dumps(alerts, default=str))
        }), 200
    
    @api.route('/api/alerts/<train_id>', methods=['GET'])
    def get_train_alerts(train_id):
        alerts = list(db.alerts.find({'train_id': ObjectId(train_id)}).sort('created_at', -1))
        
        return jsonify({
            'alerts': json.loads(json.dumps(alerts, default=str))
        }), 200
    
    # Admin routes
    @api.route('/api/admin/trains', methods=['POST'])
    def add_train():
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'source', 'destination', 'departure_time', 'arrival_time', 'total_seats']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Create new train
        new_train = {
            'name': data['name'],
            'source': data['source'],
            'destination': data['destination'],
            'departure_time': data['departure_time'],
            'arrival_time': data['arrival_time'],
            'total_seats': data['total_seats'],
            'available_seats': data['total_seats'],  # Initially all seats are available
            'status': 'scheduled',  # Default status
            'created_at': datetime.utcnow()
        }
        
        result = db.trains.insert_one(new_train)
        
        return jsonify({
            'message': 'Train added successfully',
            'train_id': str(result.inserted_id)
        }), 201
    
    @api.route('/api/admin/alerts', methods=['POST'])
    def create_alert():
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['message', 'type']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Create new alert
        new_alert = {
            'message': data['message'],
            'type': data['type'],  # e.g., 'delay', 'cancellation', 'platform_change'
            'train_id': ObjectId(data['train_id']) if 'train_id' in data else None,
            'created_at': datetime.utcnow()
        }
        
        result = db.alerts.insert_one(new_alert)
        
        return jsonify({
            'message': 'Alert created successfully',
            'alert_id': str(result.inserted_id)
        }), 201
    
    # Register blueprint with app
    app.register_blueprint(api)
    
    return api