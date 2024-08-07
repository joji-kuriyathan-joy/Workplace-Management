import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const CreateEditRotaModal = ({ show, handleClose, initialRotaData, setError, setSuccess }) => {
  const [rotaData, setRotaData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    users: [],
    repeat: 'none',
  });

  const navigate = useNavigate();
  const [users, setUsers] = useState([]); // Initialize as an empty array

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (initialRotaData) {
      setRotaData({
        date: initialRotaData.date || '',
        startTime: initialRotaData.startTime || '',
        endTime: initialRotaData.endTime || '',
        users: initialRotaData.users || [],
        repeat: initialRotaData.repeat || 'none',
      });
    } else {
      // Reset for creation mode
      setRotaData({
        date: '',
        startTime: '',
        endTime: '',
        users: [],
        repeat: 'none',
      });
    }
  }, [initialRotaData]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/view-users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.status === 401) {
        navigate('/login');
        throw new Error('Token expired or unauthorized. Redirecting to login.');
      }

      const data = await response.json();
      if (response.ok) {
        setUsers(data || []);
      } else {
        setError(data.msg || 'Failed to fetch users.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRotaData({ ...rotaData, [name]: value });
  };

  const handleUserChange = (e) => {
    const selectedUsers = Array.from(e.target.selectedOptions, option => ({
      id: option.value,
      name: option.label,
    }));
    setRotaData({ ...rotaData, users: selectedUsers });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/create-rota`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(rotaData),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(data.msg || 'Rota created successfully.');
        handleClose(data.msg || 'Rota created successfully.');
        // Reset for creation mode
        setRotaData({
          date: '',
          startTime: '',
          endTime: '',
          users: [],
          repeat: 'none',
        });
      } else {
        setError(data.msg || 'Failed to create rota.');
      }
    } catch (err) {
      setError('Error creating rota', err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!initialRotaData?.rota_id) return;
    console.log("initialRotaData.rota_id",initialRotaData.rota_id);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/update-rota/${initialRotaData.rota_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(rotaData),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(data.msg || 'Rota updated successfully.');
        handleClose(data.msg || 'Rota updated successfully.');
      } else {
        setError(data.msg || 'Failed to update rota.');
      }
    } catch (err) {
      setError('Error updating rota', err);
    }
  };

  const handleDelete = async () => {
    if (!initialRotaData?.rota_id) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/delete-rota/${initialRotaData.rota_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(data.msg || 'Rota deleted successfully.');
        handleClose(data.msg || 'Rota deleted successfully.');
      } else {
        setError(data.msg || 'Failed to delete rota.');
      }
    } catch (err) {
      setError('Error deleting rota', err);
    }
  };

  return (
    <Modal show={show} onHide={() => handleClose(null)} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{initialRotaData?.rota_id ? 'Edit Rota' : 'Create Rota'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="date">
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="date"
              name="date"
              value={rotaData.date}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="startTime">
            <Form.Label>Start Time</Form.Label>
            <Form.Control
              type="time"
              name="startTime"
              value={rotaData.startTime}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="endTime">
            <Form.Label>End Time</Form.Label>
            <Form.Control
              type="time"
              name="endTime"
              value={rotaData.endTime}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="users">
            <Form.Label>Assign Users</Form.Label>
            <Form.Control
              as="select"
              name="users"
              multiple
              value={rotaData.users.map(user => user.id)}
              onChange={handleUserChange}
              required
            >
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="repeat">
            <Form.Label>Repeat</Form.Label>
            <Form.Control as="select" name="repeat" value={rotaData.repeat} onChange={handleChange}>
              <option value="none">None</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </Form.Control>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => handleClose(null)}>
          Cancel
        </Button>
        {initialRotaData?.rota_id ? (
          <>
            <Button variant="primary" onClick={handleUpdate}>
              Update
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </>
        ) : (
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default CreateEditRotaModal;
