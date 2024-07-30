from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .models import read_json, write_json, hash_password
import uuid
from functools import wraps

main_bp = Blueprint('main', __name__)

def role_required(role):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            identity = get_jwt_identity()
            if identity['role'] != role:
                return jsonify({"msg": "Unauthorized"}), 403
            return func(*args, **kwargs)
        return wrapper
    return decorator

@main_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    try:
        identity = get_jwt_identity()
        if identity['role'] not in ['superadmin', 'admin']:
            return jsonify({"msg": "Unauthorized"}), 403

        users = read_json('users.json')
        if identity['role'] == 'admin':
            users = [u for u in users if u.get('organization') == identity['organization']]

        return jsonify(users), 200
    except Exception as e:
        return jsonify({"msg": f"Internal Server Error: {str(e)}"}), 500

@main_bp.route('/users', methods=['POST'])
@jwt_required()
def add_user():
    try:
        identity = get_jwt_identity()
        if identity['role'] not in ['superadmin', 'admin']:
            return jsonify({"msg": "Unauthorized"}), 403

        data = request.get_json()
        new_user = {
            "id": str(uuid.uuid4()),  # Generate unique ID
            "username": data.get('username'),
            "password": hash_password(data.get('password')).decode('utf-8'),
            "role": data.get('role', 'user'),  # Default role is 'user'
            "organization": identity.get('organization') if identity['role'] == 'admin' else data.get('organization')
        }
        users = read_json('users.json')
        if any(u['username'] == new_user['username'] for u in users):
            return jsonify({"msg": "Username already exists"}), 400

        users.append(new_user)
        write_json('users.json', users)
        return jsonify({"msg": "User added successfully"}), 201
    except Exception as e:
        return jsonify({"msg": f"Internal Server Error: {str(e)}"}), 500

@main_bp.route('/admin_only', methods=['GET'])
@jwt_required()
@role_required('admin')
def admin_only():
    return jsonify({"msg": "This is an admin-only endpoint"}), 200
