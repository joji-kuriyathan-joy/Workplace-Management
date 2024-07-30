import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import UserPage from './pages/UserPage.jsx';
import WelcomePage from './pages/WelcomePage.jsx';
import { AuthProvider, useAuth } from './auth.jsx';
import AdminDashboard from './components/admin/AdminDashboard.jsx';
import RotaManagement from './components/admin/RotaManagement.jsx';
import TimesheetApproval from './components/admin/TimesheetApproval.jsx';
import UserManagement from './components/admin/UserManagement.jsx';

const PrivateRoute = ({ element, roles, ...rest }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return element;
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin" element={<PrivateRoute roles={['admin', 'superadmin']} element={<AdminPage />} />} />
        <Route path="/admin/dashboard" element={<PrivateRoute roles={['admin', 'superadmin']} element={<AdminDashboard />} />} />
        <Route path="/admin/rota-management" element={<PrivateRoute roles={['admin', 'superadmin']} element={<RotaManagement />} />} />
        <Route path="/admin/timesheet-approval" element={<PrivateRoute roles={['admin', 'superadmin']} element={<TimesheetApproval />} />} />
        <Route path="/admin/user-management" element={<PrivateRoute roles={['admin', 'superadmin']} element={<UserManagement />} />} />
        <Route path="/user" element={<PrivateRoute roles={['user']} element={<UserPage />} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
