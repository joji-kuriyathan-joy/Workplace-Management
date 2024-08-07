import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import UserPage from './pages/UserPage.jsx';
import WelcomePage from './pages/WelcomePage.jsx';
import { AuthProvider, useAuth } from './auth.jsx';
import AdminDashboard from './components/admin/AdminDashboard.jsx';
import RotaDashboard from './components/admin/RotaManagement/RotaDashboard.jsx';
import TimesheetApproval from './components/admin/TimesheetApproval.jsx';
import UserManagement from './components/admin/UserManagement.jsx';
import UserDashboard from './components/user/UserDashboard.jsx';
import CreateOrganization from './components/admin/CreateOrganization.jsx';
import CreateUser from './components/admin/CreateUser.jsx';
import ViewUsers from './components/admin/ViewUsers.jsx';
import Layout from './components/common/Layout.jsx'; 

// A custom component to protect routes
const PrivateRoute = ({ element, roles }) => {
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
      <Layout> {/* Wrap all routes with Layout */}
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin" element={<PrivateRoute roles={['admin', 'superadmin']} element={<AdminPage />} />} />
        <Route path="/admin/dashboard" element={<PrivateRoute roles={['admin', 'superadmin']} element={<AdminDashboard />} />} />
        <Route path="/admin/rota-management" element={<PrivateRoute roles={['admin', 'superadmin']} element={<RotaDashboard />} />} />
        <Route path="/admin/timesheet-approval" element={<PrivateRoute roles={['admin', 'superadmin']} element={<TimesheetApproval />} />} />
        <Route path="/admin/user-management" element={<PrivateRoute roles={['admin', 'superadmin']} element={<UserManagement />} />} />
        <Route path="/user" element={<PrivateRoute roles={['user']} element={<UserPage />} />} />
        <Route path="/user/dashboard" element={<PrivateRoute roles={['user']} element={<UserDashboard />} />} />
        <Route path="/admin/create-organization" element={<PrivateRoute roles={['superadmin']} element={<CreateOrganization />} />} />
        <Route path="/admin/create-user" element={<PrivateRoute roles={['admin', 'superadmin']} element={<CreateUser />} />} />
        <Route path="/admin/view-users" element={<PrivateRoute roles={['admin', 'superadmin']} element={<ViewUsers />} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      </Layout>
    </AuthProvider>
  );
}

export default App;
