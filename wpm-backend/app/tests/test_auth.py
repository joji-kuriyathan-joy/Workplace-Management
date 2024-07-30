# wpm-backend/app/tests/test_auth.py
import unittest
from flask import json
from flask_testing import TestCase
from app import create_app, mail
from app.models import read_json, write_json, hash_password
from unittest.mock import patch

class TestAuth(TestCase):
    def create_app(self):
        app = create_app()
        app.config.from_object('app.config_test.TestConfig')
        return app

    def setUp(self):
        # Initialize a fresh users.json before each test
        self.users = [
            {
                "id": "1",
                "username": "superadmin@example.com",
                "password": hash_password("superadminpass").decode('utf-8'),
                "role": "superadmin",
                "verified": True
            },
            {
                "id": "2",
                "username": "orgadmin1@example.com",
                "password": hash_password("orgadminpass").decode('utf-8'),
                "role": "admin",
                "organization": "Org1",
                "verified": True
            },
            {
                "id": "3",
                "username": "user1@example.com",
                "password": hash_password("userpass").decode('utf-8'),
                "role": "user",
                "organization": "Org1",
                "verified": True
            }
        ]
        write_json('users.json', self.users)

    def tearDown(self):
        # Cleanup actions (if any)
        pass

    def test_login_success(self):
        response = self.client.post('/login', data=json.dumps({
            'username': 'superadmin@example.com',
            'password': 'superadminpass'
        }), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertIn('access_token', response.json)

    def test_login_failure(self):
        response = self.client.post('/login', data=json.dumps({
            'username': 'superadmin@example.com',
            'password': 'wrongpassword'
        }), content_type='application/json')
        self.assertEqual(response.status_code, 401)
        self.assertIn('msg', response.json)

    def test_register_user(self):
        response = self.client.post('/register', data=json.dumps({
            'username': 'uniqueuser@example.com',  # Ensure this username does not already exist
            'password': 'newuserpass',
            'role': 'user',
            'organization': 'Org1'
        }), content_type='application/json')
        self.assertEqual(response.status_code, 201)
        self.assertIn('msg', response.json)

    @patch('flask_mail.Mail.send')
    def test_forgot_password(self, mock_send):
        response = self.client.post('/forgot_password', data=json.dumps({
            'username': 'user1@example.com'
        }), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertIn('msg', response.json)
        mock_send.assert_called_once()

    @patch('flask_mail.Mail.send')
    def test_reset_password(self, mock_send):
        # Simulate forgot password to get reset token
        self.client.post('/forgot_password', data=json.dumps({
            'username': 'user1@example.com'
        }), content_type='application/json')

        # Fetch the updated user data to get the reset token
        users = read_json('users_test.json')
        user = next(u for u in users if u['username'] == 'user1@example.com')
        reset_token = user['reset_token']

        # Test resetting password
        response = self.client.post(f'/reset_password/{reset_token}', data=json.dumps({
            'password': 'newpassword'
        }), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertIn('msg', response.json)

        # Ensure the password has been updated
        users = read_json('users_test.json')
        user = next(u for u in users if u['username'] == 'user1@example.com')
        self.assertTrue(user['password'] != hash_password("userpass").decode('utf-8'))
        self.assertTrue(user['password'] == hash_password("newpassword").decode('utf-8'))
        self.assertNotIn('reset_token', user)

if __name__ == '__main__':
    unittest.main()
