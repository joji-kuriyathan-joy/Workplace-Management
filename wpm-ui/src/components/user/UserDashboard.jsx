import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import Header from '../../components/common/Header.jsx';
import Footer from '../../components/common/Footer.jsx';


function UserDashboard(){
    return(<div>
      <Header />
      <Container className="mt-4">
        <h1>User Dashboard</h1>
        </Container>
      <Footer />
    </div>);
}
export default UserDashboard