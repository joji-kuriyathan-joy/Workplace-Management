# wpm-backend/app/tests/test_routes.py
import unittest
from flask import json
from flask_testing import TestCase
from app import create_app
from app.models import write_json, hash_password

class TestRoutes(TestCase):
    def create_app(self):
        app = create_app()
        app.config.from_object('app.config_test.TestConfig')
        return app

    def setUp(self):
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
        write_json('users_test.json', self.users)
        # Log in as superadmin and get the access token
        response = self.client.post('/login', data=json.dumps({
            'username': 'superadmin@example.com',
            'password': 'superadminpass'
        }), content_type='application/json')
        self.access_token = response.json.get('access_token')

    def tearDown(self):
        pass

    def test_get_users(self):
        response = self.client.get('/users', headers={
            'Authorization': f'Bearer {self.access_token}'
        })
        self.assertEqual(response.status_code, 200)
        self.assertTrue(len(response.json) > 0)

    def test_add_user(self):
        response = self.client.post('/users', headers={
            'Authorization': f'Bearer {self.access_token}'
        }, data=json.dumps({
            'username': 'uniqueanothernewuser@example.com',  # Ensure this username does not already exist
            'password': 'anothernewuserpass',
            'role': 'user',
            'organization': 'Org1'
        }), content_type='application/json')
        self.assertEqual(response.status_code, 201)
        self.assertIn('msg', response.json)

if __name__ == '__main__':
    unittest.main()
