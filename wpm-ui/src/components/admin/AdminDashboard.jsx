import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import AdminSidebar from '../../components/admin/AdminSidebar.jsx';
import Header from '../../components/common/Header.jsx';
import Footer from '../../components/common/Footer.jsx';
import { useAuth } from '../../auth.jsx';

const AdminDashboard = () => {
  const { user } = useAuth();
  return (<div>
    <Header />
    <Container className='mt-2'>
      <Row>
        <Col md={2} className="bg-light p-4 text-black">
          <AdminSidebar />
        </Col>
        <Col md={10} className="p-4">
          <h2>{user.role === 'superadmin' ? 'Super Admin Dashboard' : 'Admin Dashboard'}</h2>
          <p>Welcome to your dashboard. Use the sidebar to navigate through admin functionalities.</p>
        </Col>
      </Row>
    </Container>
    <Footer />
  </div>);
}
export default AdminDashboard