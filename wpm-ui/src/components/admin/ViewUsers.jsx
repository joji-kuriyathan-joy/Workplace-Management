import React, { useState, useEffect } from 'react';
import { Table, Button, Alert, Spinner, Container, Row, Col } from 'react-bootstrap';
import Header from '../../components/common/Header.jsx';
import Footer from '../../components/common/Footer.jsx';
import AdminSidebar from '../../components/admin/AdminSidebar.jsx';
import ReusableModal from '../../components/common/ReusableModal.jsx';
import { useNavigate } from 'react-router-dom';
import UpdateUserModal from '../../components/common/UpdateUserModal.jsx'; // Import the UpdateUserModal

const ViewUsers = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]); // Initialize as an empty array
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(true); // Loading state
    const [showModal, setShowModal] = useState(false); // Modal visibility state
    const [showUpdateModal, setShowUpdateModal] = useState(false); // Update modal visibility state
    const [selectedUser, setSelectedUser] = useState({ id: null, username: '', role: '', organization: '' }); // Store selected user's details


    useEffect(() => {
        fetchUsers();
    }, []);


    useEffect(() => {
        // Auto-dismiss success alert after 3 seconds
        if (success) {
            const timer = setTimeout(() => {
                setSuccess(null);
            }, 3000);
            return () => clearTimeout(timer); // Cleanup the timer on component unmount
        }
    }, [success]);

    useEffect(() => {
        // Auto-dismiss error alert after 3 seconds
        if (error) {
            const timer = setTimeout(() => {
                setError(null);
            }, 3000);
            return () => clearTimeout(timer); // Cleanup the timer on component unmount
        }
    }, [error]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/view-users`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.status === 401) { // Token expired or unauthorized
                navigate('/login'); // Redirect to login
                throw new Error('Token expired or unauthorized. Redirecting to login.');
            }

            const data = await response.json();
            if (response.ok) {
                setUsers(data || []); // Ensure users is an array
                setSuccess('Users fetched successfully.');
            } else {
                setError(data.msg || 'Failed to fetch users.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId) => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/delete-user`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ userId })
            });
            // TODO: implement token expiration
            const data = await response.json();
            if (response.ok) {
                setSuccess(data.msg);
                fetchUsers();
            } else {
                setError(data.msg || 'Failed to delete user.');
            }
        } catch (err) {
            setError('An error occurred while deleting the user.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (userId, updatedData) => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/update-user`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ userId, ...updatedData })
            });

            const data = await response.json();
            if (response.ok) {
                setSuccess(data.msg);
                fetchUsers();
            } else {
                setError(data.msg || 'Failed to update user.');
            }
        } catch (err) {
            setError('An error occurred while updating the user.');
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (userId, username) => {
        setSelectedUser({ id: userId, username });
        setShowModal(true); // Show the modal when user attempts to delete
    };

    const handleConfirmDelete = () => {
        if (selectedUser.id) {
            handleDelete(selectedUser.id);
            setShowModal(false); // Close the modal after deletion
        }
    };

    const openUpdateModal = (user) => {
        setSelectedUser(user);
        setShowUpdateModal(true); // Show the modal when user attempts to update
    };


    return (
        <div>
            <Header />
            <Container className='mt-2'>
                <Row>
                    <Col md={2} className="bg-light p-4 text-black">
                        <AdminSidebar />
                    </Col>
                    <Col md={10} className="p-4">
                        <h2>View Users</h2>
                        {error && <Alert variant="danger">{error}</Alert>}
                        {success && <Alert variant="success">{success}</Alert>}
                        {loading ? (
                            <Spinner animation="border" role="status">
                                <span className="sr-only"></span>
                            </Spinner>
                        ) : (
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Username</th>
                                        <th>Role</th>
                                        <th>Organization</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length > 0 ? (
                                        users.map((user, index) => (
                                            <tr key={user.id}>
                                                <td>{index + 1}</td>
                                                {user.verified ? (
                                                    <td>⭐ {user.username}</td>
                                                ) :(
                                                    <td>{user.username}</td>
                                                )}
                                               
                                                <td>{user.role}</td>
                                                <td>{user.organization}</td>
                                                <td>
                                                    <Button variant="danger" onClick={() => confirmDelete(user.id, user.username)}>❌ Delete</Button>
                                                    <Button variant="primary" className="m-1" onClick={() => openUpdateModal(user)}>✏ Update</Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center">No users found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        )}
                    </Col>
                </Row>
            </Container>
            <Footer />
            {/* Reusable Modal for Delete Confirmation */}
            <ReusableModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                title="Confirm Delete"
                message={`Do you really want to delete the user ${selectedUser.username}?`}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirm={handleConfirmDelete}
            />

            {/* Update User Modal */}
            <UpdateUserModal
                show={showUpdateModal}
                handleClose={() => setShowUpdateModal(false)}
                user={selectedUser}
                onUpdate={handleUpdate}
            />
        </div>

    );
};

export default ViewUsers;
