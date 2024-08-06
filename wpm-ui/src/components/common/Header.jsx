import React from 'react';
import { Navbar, Nav, NavDropdown , Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth.jsx';
import AdminSidebar from '../../components/admin/AdminSidebar.jsx';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar  bg="dark" variant="dark" expand="lg" sticky="top">
      <Container >
        {!user ?(<Navbar.Brand as={Link} to="/">Workplace Management</Navbar.Brand>
                ) : (
                  (user.role === 'admin' || user.role === 'superadmin')?(
                    <Navbar.Brand as={Link} to="/admin/dashboard">Workplace Management</Navbar.Brand>
                  ):(<Navbar.Brand as={Link} to="/user/dashboard">Workplace Management</Navbar.Brand>)
                )

        }
      
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ms-auto justify-content-end">  {/* Added ml-auto class */}
          {!user ? (
            <>
             <Nav.Link as={Link} to="/login">Login</Nav.Link>
            </>
             
          ) : (
            <>
            <NavDropdown title="👤" id="navbarScrollingDropdown">
              <NavDropdown.Item >📛 {user.username}</NavDropdown.Item>
              <NavDropdown.Item >🛡 {user.role}</NavDropdown.Item>
              <NavDropdown.Item >🏛 {user.organization}</NavDropdown.Item>
            </NavDropdown>
            <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
            
            </>
          )}
          
        </Nav>
      </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
