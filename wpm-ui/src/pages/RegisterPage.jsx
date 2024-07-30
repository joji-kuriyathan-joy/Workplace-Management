// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../auth.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await register(username, password);
  };

  return (
    <div className="d-flex vh-100 register-view">
      <div className="container text-center align-self-center">
        <h1 className="mb-4">Register</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="d-flex justify-content-center">
          <button type="submit" className="btn btn-primary">
            Register
          </button>
          <Link to="/" className="btn btn-custom mx-2">
              ⬅ Back
            </Link>
          </div>
          
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
