from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .models import read_json, write_json, hash_password
import uuid
from functools import wraps
import logging


admin_bp = Blueprint('admin', __name__)
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

rotas_json_file = 'rotas.json'
users_json_file = 'users.json'

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

# ========================= Admin Section =========================
# View all users by admin registered under the organization
@admin_bp.route('/admin/view-users', methods=['GET'])
@jwt_required()
def view_users():
    try:
        identity = get_jwt_identity()
        if identity['role'] not in ['superadmin', 'admin']:
            return jsonify({"msg": "Unauthorized"}), 403

        users = read_json(users_json_file)
        if identity['role'] == 'admin':
            users = [u for u in users if u.get('organization') == identity['organization']]
        logger.debug(f"View Users:   {users} ")
        return jsonify(users), 200
    except Exception as e:
        return jsonify({"msg": f"Internal Server Error: {str(e)}"}), 500

# delete user
@admin_bp.route('/admin/delete-user', methods=['DELETE'])
@jwt_required()
def delete_user():
    try:
        identity = get_jwt_identity()
        if identity['role'] not in ['superadmin', 'admin']:
            return jsonify({"msg": "Unauthorized"}), 403
        
        user_id = request.json.get('userId')
        users = read_json(users_json_file)
        if identity['role'] == 'admin':
            # Find the user and remove it from the list
            users = [user for user in users if user['id'] != user_id]

        # Write the updated list back to the JSON file
        write_json(users_json_file, users)
        logger.debug(f"User Deleted: {user_id} ")
        return jsonify({"msg": "User deleted successfully."}), 200
    except Exception as e:
        return jsonify({"msg": f"An error occurred: {str(e)}"}), 500


# update user
@admin_bp.route('/admin/update-user', methods=['PUT'])
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
        
        users = read_json(users_json_file)
        if identity['role'] == 'admin':
            # Find the user and update their details
            for user in users:
                if user['id'] == user_id:
                    user['username'] = new_username
                    user['role'] = new_role
                    user['organization'] = new_organization
                    break

        # Write the updated list back to the JSON file
        write_json(users_json_file, users)

        return jsonify({"msg": "User updated successfully."}), 200
    except Exception as e:
        return jsonify({"msg": f"An error occurred: {str(e)}"}), 500

@admin_bp.route('/admin/create-user', methods=['POST'])
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
        users = read_json(users_json_file)
        if any(u['username'] == new_user['username'] for u in users):
            return jsonify({"msg": "Username already exists"}), 400

        users.append(new_user)
        write_json(users_json_file, users)
        return jsonify({"msg": "User added successfully"}), 201
    except Exception as e:
        return jsonify({"msg": f"Internal Server Error: {str(e)}"}), 500


# Route to create a new rota
@admin_bp.route('/create-rota', methods=['POST'])
@jwt_required()
def create_rota():
    try:
        identity = get_jwt_identity()
        if identity['role'] not in ['superadmin', 'admin']:
            return jsonify({"msg": "Unauthorized"}), 403
        
        new_rota = request.json
        new_rota["rota_id"] = str(uuid.uuid4())
        rotas = read_json(rotas_json_file)
        rotas.append(new_rota)
        write_json(rotas_json_file, rotas)
        return jsonify({"msg": "Rota created successfully."}), 201
    except Exception as e:
        return jsonify({"msg": f"An error occurred: {str(e)}"}), 500
    
# Route to get all rotas
@admin_bp.route('/get-rotas', methods=['GET'])
@jwt_required()
def get_rotas():
    try:
        identity = get_jwt_identity()
        if identity['role'] not in ['superadmin', 'admin']:
            return jsonify({"msg": "Unauthorized"}), 403
        rotas = read_json(rotas_json_file)
        return jsonify(rotas), 200
    except Exception as e:
        return jsonify({"msg": f"An error occurred: {str(e)}"}), 500

# Route to update a rota
@admin_bp.route('/update-rota/<rota_id>', methods=['PUT'])
@jwt_required()
def update_rota(rota_id):
    try:
        identity = get_jwt_identity()
        if identity['role'] not in ['superadmin', 'admin']:
            return jsonify({"msg": "Unauthorized"}), 403
        updated_data = request.json
        rotas = read_json('rotas.json')
        for rota in rotas:
            if rota['rota_id'] == rota_id:
                rota.update(updated_data)
                break
        write_json('rotas.json', rotas)
        return jsonify({"msg": "Rota updated successfully."}), 200
    except Exception as e:
        return jsonify({"msg": f"An error occurred: {str(e)}"}), 500

# Route to delete a rota
@admin_bp.route('/delete-rota/<rota_id>', methods=['DELETE'])
@jwt_required()
def delete_rota(rota_id):
    try:
        identity = get_jwt_identity()
        if identity['role'] not in ['superadmin', 'admin']:
            return jsonify({"msg": "Unauthorized"}), 403
        rotas = read_json('rotas.json')
        rotas = [rota for rota in rotas if rota['rota_id'] != rota_id]
        write_json('rotas.json', rotas)
        return jsonify({"msg": "Rota deleted successfully."}), 200
    except Exception as e:
        return jsonify({"msg": f"An error occurred: {str(e)}"}), 500


@admin_bp.route('/admin_only', methods=['GET'])
@jwt_required()
@role_required('admin')
def admin_only():
    return jsonify({"msg": "This is an admin-only endpoint"}), 200
# =========================End of Admin Section =========================