import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, ButtonGroup } from 'react-bootstrap';

const UpdateUserModal = ({ show, handleClose, user, onUpdate }) => {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [organization, setOrganization] = useState('');

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setRole(user.role);
      setOrganization(user.organization);
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(user.id, { username, role, organization });
    handleClose(); // Close the modal after submitting
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Update User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="userId">
            <Form.Label>User ID</Form.Label>
            <Form.Control type="text" value={user?.id || ''} disabled />
          </Form.Group>
          <Form.Group controlId="username">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group controlId="role">
            <Form.Label>Role</Form.Label>
            <Form.Control
              as="select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="organization">
            <Form.Label>Organization</Form.Label>
            <Form.Control
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              required
            />
          </Form.Group>
          <ButtonGroup className="mb-2">
          <Button variant="primary" type="submit" className="mt-3">
            Update
          </Button>
          <Button variant="secondary" onClick={handleClose} className="mt-3">
          Cancel
        </Button>
          </ButtonGroup>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default UpdateUserModal;
