import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;  // Access the backend URL from environment variables

  // Function to check if a JWT token is expired
  const isTokenExpired = (token) => {
    const payloadBase64 = token.split('.')[1];
    const payload = JSON.parse(atob(payloadBase64));
    return payload.exp * 1000 < Date.now();
  };

  // Validate token with backend
  const validateToken = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${backendUrl}/validate-token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser({ token, role: data.user.role });
      } else {
        logout();
      }
    } catch (error) {
      logout();
    }
  };

  // Initialize user state from localStorage on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');
    const organization = localStorage.getItem('organization');
    if (token && role) {
      if (isTokenExpired(token)) {
        logout(); // Log out if token is expired
      } else {
        setUser({ token, role, username, organization });
        validateToken(); // Validate token with backend
      }
    }
  }, []);

  const login = (token, role, username, organization) => {
    console.log('auth login');
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('username', username);
    localStorage.setItem('organization', organization);

    setUser({ token, role, username, organization });
  };

  const logout = () => {
    console.log('auth logout');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('organization');

    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
