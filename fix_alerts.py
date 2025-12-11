from pymongo import MongoClient
from bson import ObjectId

client = MongoClient('mongodb://localhost:27017/')
db = client['railway_reservation']

# Get all alerts
alerts = list(db.alerts.find())

print(f"Found {len(alerts)} alerts to fix")

for alert in alerts:
    train_number = alert.get('train_number')
    
    # Check if train_number looks like an ObjectId
    if train_number and len(str(train_number)) == 24:
        try:
            # Try to find the train by ObjectId
            train = db.trains.find_one({'_id': ObjectId(train_number)})
            
            if train:
                # Update alert with actual train number and name
                actual_train_number = str(train.get('TrainNo', train.get('number', '')))
                train_name = train.get('TrainName', train.get('name', ''))
                
                db.alerts.update_one(
                    {'_id': alert['_id']},
                    {
                        '$set': {
                            'train_number': actual_train_number,
                            'train_name': train_name
                        }
                    }
                )
                
                print(f"✅ Updated alert {alert['_id']}: {train_number} -> {actual_train_number} - {train_name}")
            else:
                print(f"⚠️ Train not found for alert {alert['_id']}: {train_number}")
        except Exception as e:
            print(f"❌ Error updating alert {alert['_id']}: {e}")
    else:
        print(f"ℹ️ Alert {alert['_id']} already has correct train_number: {train_number}")

print("\n✅ Done! All alerts have been updated.")
