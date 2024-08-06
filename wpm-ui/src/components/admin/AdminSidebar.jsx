import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth.jsx';

const AdminSidebar = () => {
  const { user } = useAuth();
  const isSuperAdmin = user.role === 'superadmin';

  return (
    <Nav className="flex-column" variant="underline">
       <Nav.Link  as={Link} to="/admin/dashboard">Dashboard</Nav.Link>
       {isSuperAdmin && <Nav.Link as={Link} to="/admin/create-organization">Create Organization</Nav.Link>}
       <Nav.Link as={Link} to="/admin/create-user">Create User</Nav.Link>
       <Nav.Link  as={Link} to="/admin/view-users">View All Users</Nav.Link>
    </Nav>
  );
};

export default AdminSidebar;
