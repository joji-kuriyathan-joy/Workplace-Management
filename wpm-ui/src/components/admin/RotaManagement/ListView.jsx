import React, { useEffect, useState } from 'react';
import { Table, Spinner, Alert, Button } from 'react-bootstrap';
import ReusableModal from '../../common/ReusableModal.jsx';
import CreateEditRotaModal from './CreateEditRotaModal.jsx';
import { useNavigate } from 'react-router-dom';

const ListView = ({ refresh }) => {
  const navigate = useNavigate();
  const [rotas, setRotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRota, setSelectedRota] = useState(null);

  useEffect(() => {
    fetchRotaData();
  }, [refresh]);

  // Auto-dismiss alerts after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }

    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const fetchRotaData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/get-rotas`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.status === 401) { // Token expired or unauthorized
        navigate('/login'); // Redirect to login
        throw new Error('Token expired or unauthorized. Redirecting to login.');
      }
      const data = await response.json();
      if (response.ok) {
        setRotas(data || []);
      } else {
        setError(data.msg || 'Failed to fetch rota data.');
      }
    } catch (error) {
      setError('Failed to fetch rota data. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const handleUpdate = (rota) => {
    setSelectedRota(rota);
    setShowUpdateModal(true);
  };

  const handleDelete = (rota) => {
    setSelectedRota(rota);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/delete-rota/${selectedRota.rota_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setRotas(rotas.filter(rota => rota.rota_id !== selectedRota.rota_id));
        setSuccess('Rota deleted successfully');
      } else {
        setError(data.msg || 'Failed to delete rota.');
      }
    } catch (error) {
      setError('An error occurred while deleting the rota.');
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleModalClose = (successMessage) => {
    setShowUpdateModal(false);
    if (successMessage) {
      setSuccess(successMessage);
      fetchRotaData(); // Refresh the data after successful update
    }
  };

  return (
    <>
      {success && <Alert variant="success" className="mt-3">{success}</Alert>}
      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
      {loading ? (
        <Spinner animation="border" role="status">
          <span className="sr-only"></span>
        </Spinner>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Users</th>
              <th>Repeat</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rotas.length > 0 ? (
              rotas.map((rota, index) => (
                <tr key={rota.rota_id}>
                  <td>{index + 1}</td>
                  <td>{rota.date}</td>
                  <td>{rota.startTime}</td>
                  <td>{rota.endTime}</td>
                  <td>{rota.users.map(user => user.name).join(', ')}</td>
                  <td>{rota.repeat}</td>
                  <td>
                    <Button variant="primary" onClick={() => handleUpdate(rota)}>✏ Update</Button>{' '}
                    <Button variant="danger" onClick={() => handleDelete(rota)}>❌ Delete</Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">No rota data found.</td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      {/* Update Rota Modal */}
      {selectedRota && (
        <CreateEditRotaModal
          show={showUpdateModal}
          handleClose={handleModalClose}
          initialRotaData={selectedRota}
          setError={setError}
          setSuccess={() => handleModalClose('Rota updated successfully.')}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ReusableModal
        show={showDeleteModal}
        handleClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
        message={`Do you really want to delete this rota on ${selectedRota?.date} for ${selectedRota?.users.map(user => user.name).join(', ')}?`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
      />
    </>
  );
};

export default ListView;
