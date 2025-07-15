import sys
import json
import joblib
import os

# Dynamically resolve the path to the .pkl file
current_dir = os.path.dirname(__file__)
file_path = os.path.join(current_dir, 'user_recommendations.pkl')

# Load the pickle
user_recommendations = joblib.load(file_path)

# Get the username from CLI args
username = sys.argv[1] if len(sys.argv) > 1 else "test_user"
recommendations = user_recommendations.get(username, [])

# Output result
print(json.dumps(recommendations))
