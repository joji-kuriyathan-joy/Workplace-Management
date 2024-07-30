// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../auth.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(username, password);
  };

  return (
    <div className="d-flex vh-100 login-view">
      <div className="container text-center align-self-center">
        <h1 className="mb-4">Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Username"
              value={username}
              required
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="d-flex justify-content-center">
            <button type="submit" className="btn btn-primary">
              Login
            </button><br/>
            <Link to="/" className="btn btn-custom mx-2">
              ⬅ Back
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
};

export default LoginPage;
