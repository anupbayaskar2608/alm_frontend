import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Navbar,
  Nav,
  NavDropdown,
  Container,
  Row,
  Col,
  Card,
} from "react-bootstrap";
import axios from "axios";
import "./Dashboard.css";
function Dashboard() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const [departmentCount, setDepartmentCount] = useState(0);
const [securitygrpCount, setSecuritygrpCount] = useState(0);
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const location = useLocation();
  const mainPage = location.pathname === "/dashboard";

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [usersRes, departmentsRes,securitygrpRes] = await Promise.all([
          axios.get("http://localhost:5000/users"),
          axios.get("http://localhost:5000/dept"),
          axios.get("http://localhost:5000/securitygroups")
        ]);

        setUserCount(usersRes.data.users.length);
        setDepartmentCount(departmentsRes.data.departments.length);
        setSecuritygrpCount(securitygrpRes.data.securitygroups.length);

      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    };

    fetchCounts();
  }, []);
  return (
    <div
      className={`dashboard ${
        isSidebarOpen ? "sidebar-open" : "sidebar-closed"
      }`}
    >
      <div className="sidebar">
        <div className="sidebar-head">
          <img src="/sleek-icon.png" alt="Logo" className="sidebar-logo" />
          <Link to="/dashboard" className="sidebar-link">
            <h2 className="sidebar-header">Dashboard</h2>
          </Link>
        </div>
        <ul className="sidebar-menu">
          <li>
            <Link to="users" className="sidebar-link">
              <i className="fas fa-users"></i> <span>USERS</span>
            </Link>
          </li>
          <li>
            <Link to="regions" className="sidebar-link">
              <i className="fas fa-map-marker-alt"></i> <span>REGIONS</span>
            </Link>
          </li>
          <li>
            <Link to="departments" className="sidebar-link">
              <i className="fas fa-building"></i> <span>DEPARTMENTS</span>
            </Link>
          </li>
          <li>
            <Link to="services" className="sidebar-link">
              <i className="fas fa-cogs"></i> <span>SERVICES</span>
            </Link>
          </li>
          <li>
            <Link to="securitygroup" className="sidebar-link">
              <i className="fas fa-shield-alt"></i> <span>SECURITY GROUP</span>
            </Link>
          </li>
          <li>
            <Link to="appprofile" className="sidebar-link">
              <i className="fas fa-file-alt"></i>{" "}
              <span>APPLICATION PROFILE</span>
            </Link>
          </li>
          <li>
            <Link to="networkprofile" className="sidebar-link">
              <i className="fas fa-network-wired"></i>{" "}
              <span>NETWORK PROFILE</span>
            </Link>
          </li>
          <li>
            <Link to="workloads" className="sidebar-link">
              <i className="fas fa-tasks"></i> <span>WORKLOADS</span>
            </Link>
          </li>
          <li>
            <Link to="appmapping" className="sidebar-link">
              <i className="fas fa-sitemap"></i>{" "}
              <span>APPLICATION MAPPING</span>
            </Link>
          </li>
        </ul>
        <div className="sidebar-footer">
          <p>Design & Developed by SmartEdge Technologies © 2025</p>
        </div>
      </div>

      <div className="main-content">
        <Navbar expand="lg" className="navbar-custom">
          <Container>
            <Navbar.Brand className="custom-navbar-brand">
              New Updates
            </Navbar.Brand>
            <Navbar.Toggle
              aria-controls="basic-navbar-nav"
              onClick={toggleSidebar}
            />
            <Navbar.Collapse id="basic-navbar-nav">
              <div className="welcome-text">
                <b>WELCOME APPLICATION LIFECYCLE MANAGER</b>
              </div>
              <Nav className="me-5">
                <NavDropdown
                  className="nav-drop"
                  title={
                    <span className="admin-dropdown">
                      <b>Admin</b>
                    </span>
                  }
                  id="basic-nav-dropdown"
                  align="end"
                >
                  <div className="dropdown-header d-flex">
                    <img
                      src="/user.png"
                      alt="Admin"
                      className="dropdown-avatar"
                    />
                    <div>
                      <b>admin</b>
                      <br />
                      <small>admin@alm.in</small>
                    </div>
                  </div>
                  <NavDropdown.Divider />
                  <NavDropdown.Item href="#profile">
                    <i className="fas fa-user"></i> My Profile
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item href="/">
                    <i className="fas fa-sign-out-alt"></i> Log Out
                  </NavDropdown.Item>
                </NavDropdown>
                <div className="online-indicator"></div> 
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <div className="content-area">
          {mainPage && (
              <Container fluid className="mt-5">
              <Row className="mb-4" >
                <Col md={3} sm={6}>
                  <Card className="p-3 text-center"style={{ backgroundColor: 'white', color: 'black', border: '2px solid blue' }}>
                    <h4>1</h4>
                    <h5 style={{ color: 'gray' }}>Total Applications</h5>
                  </Card>
                </Col>

                <Col md={3} sm={6}>
                  <Card className="p-3 text-center"style={{ backgroundColor:'white', color: 'black',border: '2px solid blue' }}>
                    <h4>{userCount}</h4>
                    <h5 style={{ color: 'gray' }}>Total Users</h5>
                  </Card>
                </Col>

                <Col md={3} sm={6}>
                  <Card className="p-3 text-center"style={{ backgroundColor: 'white', color: 'black' ,border: '2px solid blue'}}>
                    <h4>{departmentCount}</h4>
                    <h5 style={{ color: 'gray' }}>Total Departments</h5>
                  </Card>
                </Col>

                <Col md={3} sm={6}>
                  <Card className="p-3 text-center"style={{ backgroundColor: 'white', color: 'black',border: '2px solid blue' }}>
                    <h4>{securitygrpCount}</h4>
                    <h5 style={{ color: 'gray' }}>Security Groups</h5>
                  </Card>
                </Col>
              </Row>
            </Container>
          )}
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
