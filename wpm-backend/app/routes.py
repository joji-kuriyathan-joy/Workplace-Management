from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .models import read_json, write_json, hash_password
import uuid
from functools import wraps
import logging


main_bp = Blueprint('main', __name__)
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


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


# View all users by admin registered under the organization
@main_bp.route('/admin/view-users', methods=['GET'])
@jwt_required()
def view_users():
    try:
        identity = get_jwt_identity()
        if identity['role'] not in ['superadmin', 'admin']:
            return jsonify({"msg": "Unauthorized"}), 403

        users = read_json('users.json')
        if identity['role'] == 'admin':
            users = [u for u in users if u.get('organization') == identity['organization']]
        logger.debug(f"View Users:   {users} ")
        return jsonify(users), 200
    except Exception as e:
        return jsonify({"msg": f"Internal Server Error: {str(e)}"}), 500

# delete user
@main_bp.route('/admin/delete-user', methods=['DELETE'])
@jwt_required()
def delete_user():
    try:
        identity = get_jwt_identity()
        if identity['role'] not in ['superadmin', 'admin']:
            return jsonify({"msg": "Unauthorized"}), 403
        
        user_id = request.json.get('userId')
        users = read_json('users.json')
        if identity['role'] == 'admin':
            # Find the user and remove it from the list
            users = [user for user in users if user['id'] != user_id]

        # Write the updated list back to the JSON file
        write_json('users.json', users)
        logger.debug(f"User Deleted: {user_id} ")
        return jsonify({"msg": "User deleted successfully."}), 200
    except Exception as e:
        return jsonify({"msg": f"An error occurred: {str(e)}"}), 500


# update user
@main_bp.route('/admin/update-user', methods=['PUT'])
@jwt_required()
def update_user():
    try:
        identity = get_jwt_identity()
        if identity['role'] not in ['superadmin', 'admin']:
            return jsonify({"msg": "Unauthorized"}), 403
        
        user_id = request.json.get('userId')
        new_username = request.json.get('username')
        new_role = request.json.get('role')
        new_organization = request.json.get('organization')
        
        users = read_json('users.json')
        if identity['role'] == 'admin':
            # Find the user and update their details
            for user in users:
                if user['id'] == user_id:
                    user['username'] = new_username
                    user['role'] = new_role
                    user['organization'] = new_organization
                    break

        # Write the updated list back to the JSON file
        write_json('users.json', users)

        return jsonify({"msg": "User updated successfully."}), 200
    except Exception as e:
        return jsonify({"msg": f"An error occurred: {str(e)}"}), 500

@main_bp.route('/admin/create-user', methods=['POST'])
@jwt_required()
def create_user():
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
            "organization": identity.get('organization') if identity['role'] == 'admin' else data.get('organization'),
            "verified": True
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
