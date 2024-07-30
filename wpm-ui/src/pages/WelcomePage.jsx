// src/pages/WelcomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const WelcomePage = () => {
  return (
    <div className="d-flex vh-100">
      <div className="container text-center align-self-center">
        <h1 className="mb-4">Workplace Management App</h1>
        <div className="d-flex justify-content-center">
          <Link to="/login" className="btn btn-primary mx-2">
            Login
          </Link>
          <Link to="/register" className="btn btn-secondary mx-2">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
