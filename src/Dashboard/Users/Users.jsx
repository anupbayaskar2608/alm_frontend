import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Usersform from "./Usersform";
import axios from "axios";
import { FaEdit, FaEye, FaHome, FaTrash} from 'react-icons/fa';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewOnly, setViewOnly] = useState(false);

  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get("http://localhost:5000/api/users", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUsers(response.data.users);
      setFilteredUsers(response.data.users);
    } catch (err) {
      console.error("Error fetching users:", err);
      if (err.response?.status === 401) {
        navigate('/login');
      }
      alert("Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e) => {
    const searchData = e.target.value.toLowerCase();
    setSearch(searchData);
    const filtered = users.filter(
      (user) =>
        user.fname.toLowerCase().includes(searchData) ||
        user.lname.toLowerCase().includes(searchData) ||
        user.username.toLowerCase().includes(searchData) ||
        user.email.toLowerCase().includes(searchData)
    );
    setFilteredUsers(filtered);
  };

  const editingUserHandler = (user) => {
    setEditingUser(user);
    setViewOnly(false);  
    setShowForm(true);
  };

  const viewUserHandler = (user) => {
    setEditingUser(user);
    setViewOnly(true); 
    setShowForm(true);
  };

  const deleteUser = async (user) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://localhost:5000/api/users/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 200) {
        const updatedUsers = users.filter(u => u._id !== user._id);
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
        alert("User deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
      alert(`Failed to delete user: ${error.message}`);
    }
  };

  const updateUser = async (updatedUser) => {
    try {
      await fetchUsers();
      setShowForm(false);
    } catch (error) {
      console.error("Error updating users list:", error);
      alert("Failed to refresh users list");
    }
  };

  const HomeClick = () => {
    navigate("/dashboard");
  };

  return (
    <div className="container-fluid px-2 px-sm-3 px-md-4 mt-3 mt-md-4">
      <div className="row">
        <div className="col-12">
          <h1 className="mb-3 fs-2 fs-md-1">Users</h1>
          
          <div className="d-flex flex-column flex-sm-row gap-2 mb-3">
            <button onClick={HomeClick} className="btn btn-light d-flex align-items-center justify-content-center justify-content-sm-start">
              <FaHome size={16} color="gray" className="me-2" /> 
              <span className="fw-bold">Home</span>
            </button>
          </div>

          <div className="row g-2 mb-3">
            <div className="col-12 col-md-8 col-lg-9">
              <input
                type="text"
                className="form-control"
                placeholder="Search users..."
                value={search}
                onChange={handleSearch}
                style={{ fontSize: 'clamp(14px, 2.5vw, 16px)' }}
              />
            </div>
            <div className="col-12 col-md-4 col-lg-3">
              <button 
                className="btn btn-primary w-100 d-flex align-items-center justify-content-center" 
                onClick={() => {
                  setEditingUser(null);
                  setShowForm(true);
                }}
                style={{ fontSize: 'clamp(14px, 2.5vw, 16px)' }}
              >
                <i className="fas fa-plus me-2"></i>
                <span className="d-none d-sm-inline">Add User</span>
                <span className="d-sm-none">Add</span>
              </button>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="d-none d-lg-block">
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>Username</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Gender</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers && filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user._id}>
                        <td>{user.username}</td>
                        <td>{user.fname}</td>
                        <td>{user.lname}</td>
                        <td>{user.email}</td>
                        <td>{user.phone}</td>
                        <td>{user.gender}</td>
                        <td>{user.role}</td>
                        <td>
                          <div className="d-flex gap-1">
                            <button 
                              className="btn btn-info btn-sm" 
                              onClick={() => viewUserHandler(user)}
                              title="View"
                            >
                              <FaEye size={14} />
                            </button>
                            <button
                              onClick={() => editingUserHandler(user)}
                              className="btn btn-warning btn-sm"
                              title="Edit"
                            >
                              <FaEdit size={14} />
                            </button>
                            <button
                              onClick={() => deleteUser(user)} 
                              className="btn btn-danger btn-sm"
                              title="Delete"
                            >
                              <FaTrash size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-4">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="d-lg-none">
            {filteredUsers && filteredUsers.length > 0 ? (
              <div className="row g-3">
                {filteredUsers.map((user) => (
                  <div key={user._id} className="col-12 col-sm-6">
                    <div className="card h-100 shadow-sm" style={{ borderRadius: '15px' }}>
                      <div className="card-body p-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="card-title mb-0 fw-bold text-primary">{user.username}</h6>
                          <span className="badge bg-secondary" style={{ fontSize: '10px' }}>{user.role}</span>
                        </div>
                        
                        <div className="mb-2">
                          <small className="text-muted d-block">
                            <i className="fas fa-user me-1"></i>
                            {user.fname} {user.lname}
                          </small>
                          <small className="text-muted d-block">
                            <i className="fas fa-envelope me-1"></i>
                            {user.email}
                          </small>
                          <small className="text-muted d-block">
                            <i className="fas fa-phone me-1"></i>
                            {user.phone}
                          </small>
                          <small className="text-muted d-block">
                            <i className="fas fa-venus-mars me-1"></i>
                            {user.gender}
                          </small>
                        </div>
                        
                        <div className="d-flex gap-1 mt-3">
                          <button 
                            className="btn btn-info btn-sm flex-fill" 
                            onClick={() => viewUserHandler(user)}
                            style={{ fontSize: '12px' }}
                          >
                            <FaEye size={12} className="me-1" /> View
                          </button>
                          <button
                            onClick={() => editingUserHandler(user)}
                            className="btn btn-warning btn-sm flex-fill"
                            style={{ fontSize: '12px' }}
                          >
                            <FaEdit size={12} className="me-1" /> Edit
                          </button>
                          <button
                            onClick={() => deleteUser(user)} 
                            className="btn btn-danger btn-sm flex-fill"
                            style={{ fontSize: '12px' }}
                          >
                            <FaTrash size={12} className="me-1" /> Del
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5">
                <i className="fas fa-users fa-3x text-muted mb-3"></i>
                <h5 className="text-muted">No users found</h5>
                <p className="text-muted">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <Usersform
          onClose={() => setShowForm(false)}
          onSave={updateUser}
          editingUser={editingUser}
          viewOnly={viewOnly}
        />
      )}
    </div>
  );
};

export default Users;
