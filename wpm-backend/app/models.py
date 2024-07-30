import json
import os
import bcrypt

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')

def read_json(file_name):
    try:
        with open(os.path.join(DATA_DIR, file_name), 'r') as file:
            return json.load(file)
    except FileNotFoundError:
        print(f"Error: {file_name} not found.")
        return []
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from {file_name}.")
        return []

def write_json(file_name, data):
    try:
        with open(os.path.join(DATA_DIR, file_name), 'w') as file:
            json.dump(data, file, indent=4)
    except Exception as e:
        print(f"Error: Could not write to {file_name}. Exception: {e}")

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

def check_password(hashed_password, password):
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
