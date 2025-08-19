import React, { useState, useEffect } from "react";
import Avatar from "react-avatar";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Navbar,
  Nav,
  NavDropdown,
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Alert,
} from "react-bootstrap";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

import "./Dashboard.css";

function Dashboard() {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const [departmentCount, setDepartmentCount] = useState(0);
  const [securitygrpCount, setSecuritygrpCount] = useState(0);
  const [applicationCount, setApplicationCount] = useState(0);
  const [userInfo, setUserInfo] = useState({
    full_name: "",
    role: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const handleShowUpdate = () => setShowUpdateModal(true);
  const handleCloseUpdate = () => setShowUpdateModal(false);
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const location = useLocation();
  const navigate = useNavigate();
  const mainPage = location.pathname === "/dashboard";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found, please log in.");
        }

        const decoded = jwtDecode(token);
        setUserInfo({
          full_name: decoded.fullName || decoded.fname + " " + decoded.lname || "Unknown User",
          role: decoded.role || "N/A",
          email: decoded.email || "N/A",
        });

        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        const [usersRes, departmentsRes, securitygrpRes, applicationsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/users").catch((err) => ({ error: err })),
          axios.get("http://localhost:5000/api/dept").catch((err) => ({ error: err })),
          axios.get("http://localhost:5000/api/securitygroups").catch((err) => ({ error: err })),
          axios.get("http://localhost:5000/api/applications").catch((err) => ({ error: err })),
        ]);

        // Handle Users Response
        if (usersRes.error) {
          console.error("Users API error:", usersRes.error.message);
          setUserCount(0);
        } else {
          console.log("Users API response:", usersRes.data);
          setUserCount(Array.isArray(usersRes.data.users) ? usersRes.data.users.length : usersRes.data.length || 0);
        }

        // Handle Departments Response
        if (departmentsRes.error) {
          console.error("Departments API error:", departmentsRes.error.message);
          setDepartmentCount(0);
        } else {
          console.log("Departments API response:", departmentsRes.data);
          setDepartmentCount(Array.isArray(departmentsRes.data.departments) ? departmentsRes.data.departments.length : departmentsRes.data.length || 0);
        }

        // Handle Security Groups Response
        if (securitygrpRes.error) {
          console.error("Security Groups API error:", securitygrpRes.error.message);
          setSecuritygrpCount(0);
        } else {
          console.log("Security Groups API response:", securitygrpRes.data);
          setSecuritygrpCount(Array.isArray(securitygrpRes.data.securitygroups) ? securitygrpRes.data.securitygroups.length : securitygrpRes.data.length || 0);
        }

        // Handle Applications Response
        if (applicationsRes.error) {
          console.error("Applications API error:", applicationsRes.error.message);
          setApplicationCount(0);
        } else {
          console.log("Applications API response:", applicationsRes.data);
          setApplicationCount(Array.isArray(applicationsRes.data.applications) ? applicationsRes.data.applications.length : applicationsRes.data.length || 0);
        }

      } catch (err) {
        console.error("Error fetching data:", err.message);
        setError("Failed to fetch data. Please try again or contact support.");
        if (err.response && err.response.status === 401) {
          localStorage.removeItem("token");
          navigate("/");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div
      className={`dashboard ${
        isSidebarOpen ? "sidebar-open" : "sidebar-closed"
      }`}
    >
      {/* Sidebar */}
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
            <Link to="securitygroups" className="sidebar-link">
              <i className="fas fa-shield-alt"></i> <span>SECURITY GROUP</span>
            </Link>
          </li>
          <li>
            <Link to="appprofile" className="sidebar-link">
              <i className="fas fa-file-alt"></i> <span>APPLICATION PROFILE</span>
            </Link>
          </li>
          <li>
            <Link to="networkprofile" className="sidebar-link">
              <i className="fas fa-network-wired"></i> <span>NETWORK PROFILE</span>
            </Link>
          </li>
          <li>
            <Link to="workloads" className="sidebar-link">
              <i className="fas fa-tasks"></i> <span>WORKLOADS</span>
            </Link>
          </li>
          <li>
            <Link to="appmapping" className="sidebar-link">
              <i className="fas fa-sitemap"></i> <span>APP MAPPING</span>
            </Link>
          </li>
        </ul>
        <div className="sidebar-footer">
          <p>Design & Developed by SmartEdge Technologies © 2025</p>
        </div>
      </div>

      {/* Main content */}
      <div className="main-content">
        <Navbar expand="lg" className="navbar-custom">
          <Container>
            <Navbar.Brand className="custom-navbar-brand">
              <Button variant="primary" onClick={handleShowUpdate}>
                New Updates
              </Button>
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
                {loading ? (
                  <span>Loading...</span>
                ) : (
                  <NavDropdown
                    className="nav-drop"
                    show={isDropdownOpen}
                    onToggle={(open) => setDropdownOpen(open)}
                    title={
                      <span className="admin-dropdown d-flex align-items-center">
                        <Avatar
                          name={userInfo.full_name || "U"}
                          size="50"
                          round={true}
                          color="#8a8a8bff"
                          fgColor="#fff"
                          className="me-2"
                          style={{ fontWeight: "bold" }}
                        />
                        <b className="me-2" style={{ color: "black" }}>
                          <small>Welcome </small>
                          {userInfo.full_name}
                        </b>
                      </span>
                    }
                    id="basic-nav-dropdown"
                    align="end"
                  >
                    <NavDropdown.Item href="#profile">
                      <b>My Profile</b>
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                    <div className="px-3">
                      <table className="table table-sm mb-0">
                        <tbody>
                          <tr>
                            <th style={{ width: "80px" }}>Name:</th>
                            <td>{userInfo.full_name}</td>
                          </tr>
                          <tr>
                            <th>Role:</th>
                            <td>{userInfo.role}</td>
                          </tr>
                          <tr>
                            <th>Email:</th>
                            <td>{userInfo.email}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <NavDropdown.Divider />
                    <NavDropdown.Item
                      onClick={handleLogout}
                      style={{
                        color: "#f8f5f5ff",
                        fontWeight: "bold",
                        background: "red",
                      }}
                      className="logout-btn"
                    >
                      <i
                        className="fas fa-sign-out-alt"
                        style={{
                          marginRight: "8px",
                          fontSize: "16px",
                        }}
                      ></i>
                      Log Out
                    </NavDropdown.Item>
                  </NavDropdown>
                )}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
        <Modal show={showUpdateModal} onHide={handleCloseUpdate} centered>
          <Modal.Header closeButton>
            <Modal.Title>Update Information</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h5>Official Version up to date ****. **. 25</h5>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseUpdate}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
        <div className={`content-area-wrapper ${isDropdownOpen ? "blurred" : ""}`}>
          <div className="content-area">
            {error && (
              <Container fluid className="mt-3">
                <Alert variant="danger">{error}</Alert>
              </Container>
            )}
            {mainPage && (
              <Container fluid className="mt-5">
                <Row className="mb-4">
                  <Col md={3} sm={6}>
                    <Card className="p-3 text-center border-primary">
                      <h4>{loading ? "..." : applicationCount}</h4>
                      <h5 style={{ color: "gray" }}>Total Applications</h5>
                    </Card>
                  </Col>
                  <Col md={3} sm={6}>
                    <Card className="p-3 text-center border-primary">
                      <h4>{loading ? "..." : userCount}</h4>
                      <h5 style={{ color: "gray" }}>Total Users</h5>
                    </Card>
                  </Col>
                  <Col md={3} sm={6}>
                    <Card className="p-3 text-center border-primary">
                      <h4>{loading ? "..." : departmentCount}</h4>
                      <h5 style={{ color: "gray" }}>Total Departments</h5>
                    </Card>
                  </Col>
                  <Col md={3} sm={6}>
                    <Card className="p-3 text-center border-primary">
                      <h4>{loading ? "..." : securitygrpCount}</h4>
                      <h5 style={{ color: "gray" }}>Security Groups</h5>
                    </Card>
                  </Col>
                </Row>
              </Container>
            )}
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;