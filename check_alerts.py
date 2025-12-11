from pymongo import MongoClient
import json

client = MongoClient('mongodb://localhost:27017/')
db = client['railway_reservation']

# Get one alert
alert = db.alerts.find_one()

if alert:
    # Convert ObjectId to string for printing
    alert['_id'] = str(alert['_id'])
    if 'train_id' in alert:
        alert['train_id'] = str(alert['train_id'])
    
    print("Alert document:")
    print(json.dumps(alert, indent=2, default=str))
else:
    print("No alerts found")

# Check trains too
print("\n\nTrain documents:")
trains = list(db.trains.find().limit(2))
for train in trains:
    train['_id'] = str(train['_id'])
    print(json.dumps(train, indent=2, default=str))
