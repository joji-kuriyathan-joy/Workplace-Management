from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from flask_mail import Message
from .models import read_json, write_json, hash_password, check_password
import uuid
from app import mail, blacklist
from functools import wraps
import logging

auth_bp = Blueprint('auth', __name__)
login_attempts = {}

logger = logging.getLogger(__name__)

def role_required(role):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            identity = get_jwt_identity()
            if identity['role'] != role:
                logger.warning(f"Unauthorized access attempt by user: {identity['username']}")
                return jsonify({"msg": "Unauthorized"}), 403
            return func(*args, **kwargs)
        return wrapper
    return decorator

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        users = read_json('users.json')

        if username in login_attempts and login_attempts[username] >= 5:
            logger.warning(f"Account locked due to too many failed login attempts: {username}")
            return jsonify({"msg": "Account locked due to too many failed login attempts. Please try again later."}), 403

        user = next((u for u in users if u['username'] == username), None)
        if user and check_password(user['password'], password):
            if not user.get('verified', False):
                logger.info(f"User {username} attempted to login without verifying email.")
                return jsonify({"msg": "Please verify your email before logging in."}), 403
            access_token = create_access_token(identity={'username': username, 'role': user['role'], 'organization': user.get('organization')})
            login_attempts[username] = 0
            logger.info(f"User {username} logged in successfully.")
            return jsonify(access_token=access_token, role=user['role']), 200

        login_attempts[username] = login_attempts.get(username, 0) + 1
        logger.warning(f"Failed login attempt for user: {username}")
        return jsonify({"msg": "Bad username or password"}), 401
    except Exception as e:
        logger.error(f"Internal Server Error: {str(e)}", exc_info=True)
        return jsonify({"msg": f"Internal Server Error: {str(e)}"}), 500

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        new_user = {
            "id": str(uuid.uuid4()),  # Generate unique ID
            "username": data.get('username'),
            "password": hash_password(data.get('password')).decode('utf-8'),
            "role": data.get('role', 'user'),  # Default role is 'user'
            "organization": data.get('organization'),
            "verified": False,  # Email not verified
            "verification_token": str(uuid.uuid4())  # Email verification token
        }
        users = read_json('users.json')
        if any(u['username'] == new_user['username'] for u in users):
            logger.warning(f"Registration attempt with existing username: {new_user['username']}")
            return jsonify({"msg": "Username already exists"}), 400

        users.append(new_user)
        write_json('users.json', users)

        # Send verification email
        server_name = current_app.config['SERVER_NAME']
        msg = Message("Email Verification",
                      sender=current_app.config['MAIL_DEFAULT_SENDER'],
                      recipients=[new_user['username']])
        msg.body = f"To verify your email, visit the following link: {server_name}/verify_email/{new_user['verification_token']}"
        mail.send(msg)

        logger.info(f"User {new_user['username']} registered successfully.")
        return jsonify({"msg": "User registered successfully. Please check your email to verify your account."}), 201
    except Exception as e:
        logger.error(f"Internal Server Error: {str(e)}", exc_info=True)
        return jsonify({"msg": f"Internal Server Error: {str(e)}"}), 500

@auth_bp.route('/verify_email/<verification_token>', methods=['GET'])
def verify_email(verification_token):
    try:
        users = read_json('users.json')
        user = next((u for u in users if u.get('verification_token') == verification_token), None)
        if not user:
            logger.warning(f"Invalid or expired verification token used: {verification_token}")
            return jsonify({"msg": "Invalid or expired verification token"}), 400

        user['verified'] = True
        user.pop('verification_token', None)
        write_json('users.json', users)

        logger.info(f"User {user['username']} verified their email successfully.")
        return jsonify({"msg": "Email verified successfully"}), 200
    except Exception as e:
        logger.error(f"Internal Server Error: {str(e)}", exc_info=True)
        return jsonify({"msg": f"Internal Server Error: {str(e)}"}), 500

@auth_bp.route('/forgot_password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json()
        username = data.get('username')
        users = read_json('users.json')

        user = next((u for u in users if u['username'] == username), None)
        if not user:
            logger.warning(f"Password reset attempt for non-existing user: {username}")
            return jsonify({"msg": "User not found"}), 404

        reset_token = str(uuid.uuid4())
        user['reset_token'] = reset_token
        write_json('users.json', users)

        # Send reset email notification
        server_name = current_app.config['SERVER_NAME']
        msg = Message("Password Reset Request",
                      sender=current_app.config['MAIL_DEFAULT_SENDER'],
                      recipients=[username])
        msg.body = f"To reset your password, visit the following link: {server_name}/reset_password/{reset_token}"
        mail.send(msg)

        logger.info(f"Password reset email sent to {username}.")
        return jsonify({"msg": "Password reset email sent"}), 200
    except Exception as e:
        logger.error(f"Internal Server Error: {str(e)}", exc_info=True)
        return jsonify({"msg": f"Internal Server Error: {str(e)}"}), 500

@auth_bp.route('/reset_password/<reset_token>', methods=['POST'])
def reset_password(reset_token):
    try:
        data = request.get_json()
        new_password = data.get('password')
        users = read_json('users.json')

        user = next((u for u in users if u.get('reset_token') == reset_token), None)
        if not user:
            logger.warning(f"Invalid or expired reset token used: {reset_token}")
            return jsonify({"msg": "Invalid or expired reset token"}), 400

        user['password'] = hash_password(new_password).decode('utf-8')
        user.pop('reset_token', None)
        write_json('users.json', users)

        logger.info(f"User {user['username']} reset their password successfully.")
        return jsonify({"msg": "Password reset successfully"}), 200
    except Exception as e:
        logger.error(f"Internal Server Error: {str(e)}", exc_info=True)
        return jsonify({"msg": f"Internal Server Error: {str(e)}"}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    try:
        jti = get_jwt()['jti']
        blacklist.add(jti)
        logger.info(f"User {get_jwt_identity()['username']} logged out successfully.")
        return jsonify({"msg": "Successfully logged out"}), 200
    except Exception as e:
        logger.error(f"Internal Server Error: {str(e)}", exc_info=True)
        return jsonify({"msg": f"Internal Server Error: {str(e)}"}), 500
