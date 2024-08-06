import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Alert, Spinner, Container, Row, Col, Form, ButtonGroup } from 'react-bootstrap';
import Header from '../../components/common/Header.jsx';
import Footer from '../../components/common/Footer.jsx';
import AdminSidebar from '../../components/admin/AdminSidebar.jsx';
const CreateUser = () => {
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false); // Loading state
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('');
    const [organization, setOrganization] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

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

    const handleReset = () =>{
        setUsername('');
        setPassword('');
        setRole('');
        setOrganization('');
    }

    const handleCreate = async(e) => {
        e.preventDefault();
        setLoading(true);
        try{
            
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/create-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ username,password,role,organization })
            });
            const data = await response.json();
            if (response.ok) {
                setSuccess(data.msg);
                handleReset();
            }else{
                setError(data.msg || 'Failed to create user.');
            }
        }
        catch(err) {
            setError('An error occurred while creating the user.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <Header />
            <Container className='mt-2'>
                <Row>
                    <Col md={2} className="bg-light p-4 text-black">
                        <AdminSidebar />
                    </Col>
                    <Col md={10} className="p-4">
                        <h2>Create Users</h2>
                        {error && <Alert variant="danger">{error}</Alert>}
                        {success && <Alert variant="success">{success}</Alert>}
                        {loading ? (
                            <Spinner animation="border" role="status">
                                <span className="sr-only"></span>
                            </Spinner>
                        ) : (
                            <Form id="create-user-form" onSubmit={handleCreate}>
                                <Form.Group controlId="username">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group controlId="password">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
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
                                        <option value="" >Choose a role</option>
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
                                        Create
                                    </Button>
                                    <Button variant="secondary" onClick={handleReset} className="mt-3">
                                        Reset
                                    </Button>
                                </ButtonGroup>
                            </Form>
                        )}
                    </Col>
                </Row>
            </Container>
            <Footer />
        </div >
    );
}

export default CreateUser;