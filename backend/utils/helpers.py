import json
from bson import ObjectId
from datetime import datetime
import random

# Custom JSON encoder to handle MongoDB ObjectId and datetime
class JSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return json.JSONEncoder.default(self, obj)

# Function to convert MongoDB document to JSON
def doc_to_json(doc):
    return json.loads(json.dumps(doc, cls=JSONEncoder))

# Function to validate ObjectId
def is_valid_object_id(id_str):
    try:
        ObjectId(id_str)
        return True
    except:
        return False

# Function to generate mock train location data (for demo purposes)
def generate_mock_location(train_id, source, destination):
    # Mock locations between source and destination
    locations = [
        f"{source} Station",
        f"10 km from {source}",
        f"Midway between {source} and {destination}",
        f"20 km from {destination}",
        f"{destination} Station"
    ]
    
    # Randomly select a location (in a real app, this would be GPS data)
    current_location = random.choice(locations)
    
    # Calculate next station based on current location
    current_index = locations.index(current_location)
    next_station = locations[min(current_index + 1, len(locations) - 1)]
    
    # Generate random delay (0-30 minutes)
    delay_minutes = random.randint(0, 30)
    status = "on-time" if delay_minutes == 0 else "delayed"
    
    return {
        "train_id": train_id,
        "current_location": current_location,
        "next_station": next_station,
        "status": status,
        "delay_minutes": delay_minutes,
        "updated_at": datetime.utcnow()
    }

# Function to generate seat map for a coach
def generate_seat_map(total_seats, coach_type):
    seat_map = {}
    
    for i in range(1, total_seats + 1):
        seat_map[str(i)] = {
            "available": True,
            "type": get_seat_type(i, coach_type)
        }
    
    return seat_map

# Function to determine seat type based on seat number and coach type
def get_seat_type(seat_number, coach_type):
    if coach_type == "sleeper":
        if seat_number % 8 in [1, 4]:
            return "lower"
        elif seat_number % 8 in [2, 5]:
            return "middle"
        elif seat_number % 8 in [3, 6]:
            return "upper"
        elif seat_number % 8 == 7:
            return "side lower"
        else:  # seat_number % 8 == 0
            return "side upper"
    elif coach_type == "AC":
        if seat_number % 6 in [1, 2]:
            return "lower"
        elif seat_number % 6 in [3, 4]:
            return "middle"
        else:  # seat_number % 6 in [5, 0]
            return "upper"
    else:  # general
        return "general"