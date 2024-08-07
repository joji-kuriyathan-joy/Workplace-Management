import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const WelcomePage = () => {
  return (
    <div>
      <Container fluid className="text-center mt-4">
        <Row className="justify-content-center">
          <Col md={8}>
            <h1>Welcome to Workplace Management</h1>
            <p>
              Manage your workplace efficiently with our comprehensive tool.
              From scheduling shifts to logging work hours, everything is at your fingertips.
            </p>
            <Button as={Link} to="/login" variant="primary" className="mr-2">Login</Button>
            <Button as={Link} to="/register" variant="secondary">Register</Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default WelcomePage;
