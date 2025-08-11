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
      const response = await axios.get("http://localhost:5000/users");
      setUsers(response.data.users);
      setFilteredUsers(response.data.users);
    } catch (err) {
      console.error("Error fetching users:", err);
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
      console.log("Deleting user:", user);

      const userId = user._id; 
      const response = await axios.delete(`http://localhost:5000/users/${userId}`);
      
      if (response.status === 200) {
        const updatedUsers = users.filter(u => u._id !== userId);
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
        alert("User deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Status code:", error.response.status);
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
    <div className="container mt-4">
      <h1 className="mb-3">Users</h1>
     <div className="d-flex mb-3">
                  <button onClick={HomeClick} className="btn btn-light">
                    <FaHome size={20} color="gray" /> <b>Home</b>
                  </button>
                </div>

      <div className="d-flex justify-content-between mb-3">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Search users..."
          value={search}
          onChange={handleSearch}
        />
        <button className="btn btn-primary" onClick={() => {
          setEditingUser(null);
          setShowForm(true);
        }}>
          ADD +
        </button>
      </div>

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
                <tr key={user.user_id}>
                  <td>{user.username}</td>
                  <td>{user.fname}</td>
                  <td>{user.lname}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>{user.gender}</td>
                  <td>{user.role}</td>
                  <td>
                    <button 
                      className="btn btn-info btn-sm me-2" 
                      onClick={() => viewUserHandler(user)}
                    >
                      <FaEye size={24} />
                    </button>
                    <button
                      onClick={() => editingUserHandler(user)}
                      className="btn btn-warning btn-sm me-2"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => deleteUser(user)} 
                      className="btn btn-danger btn-sm"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
