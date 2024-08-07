import React, { useState, useEffect } from 'react';
import { Button, Container, Row, Col, Alert } from 'react-bootstrap';
import CalendarView from './CalendarView.jsx';
import ListView from './ListView.jsx';
import CreateEditRotaModal from './CreateEditRotaModal.jsx';
import { Link } from 'react-router-dom';

const RotaDashboard = () => {
  const [showCreateEditModal, setShowCreateEditModal] = useState(false);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [refreshCalendar, setRefreshCalendar] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const toggleViewMode = () => {
    setViewMode(viewMode === 'calendar' ? 'list' : 'calendar');
  };

  const handleModalClose = (successMessage) => {
    setShowCreateEditModal(false);
    setSelectedEvent(null); // Reset the selected event
    if (successMessage) {
      setSuccess(successMessage);
      setRefreshCalendar(true); // Trigger calendar refresh
    }
  };

  const handleRefreshCalendar = () => {
    setRefreshCalendar(false);
  };

  const handleEventSelect = (event) => {
    setSelectedEvent(event); // Set the selected event
    setShowCreateEditModal(true); // Open modal for editing
  };

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

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h2>Rota Management</h2>
          <Button
            variant="primary"
            onClick={() => {
              setSelectedEvent(null);
              setShowCreateEditModal(true);
            }}
          >
            Create Rota
          </Button>
          <Button variant="secondary" onClick={toggleViewMode} className="m-2">
            {viewMode === 'calendar' ? 'Switch to List View' : 'Switch to Calendar View'}
          </Button>
          {/* <Button variant="primary" as={Link} href="/admin/rota-management">
            🔃 Refresh
          </Button> */}
          {success && <Alert variant="success" className="mt-3">{success}</Alert>}
          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        </Col>
      </Row>
      <Row>
        <Col>
          {viewMode === 'calendar' ? (
            <CalendarView
              refresh={refreshCalendar}
              onRefreshed={handleRefreshCalendar}
              onSelectEvent={handleEventSelect} // Pass handler to select event
            />
          ) : (
            <ListView refresh={refreshCalendar}  />
          )}
        </Col>
      </Row>

      <CreateEditRotaModal
        show={showCreateEditModal}
        handleClose={handleModalClose}
        setError={setError}
        setSuccess={setSuccess}
        initialRotaData={selectedEvent} // Pass selected event data
      />
    </Container>
  );
};

export default RotaDashboard;
