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

