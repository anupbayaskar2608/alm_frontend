import React, { useState, useEffect } from 'react';
import { FaEye, FaHome } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Securitygroupform from "./Securitygroupform";

const Securitygroup = () => {
  const [securitygroups, setSecuritygroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [showFormVisible, setShowFormVisible] = useState(false);
  const [formData, setFormData] = useState(null);
  const [search, setSearch] = useState("");
  const [viewOnly, setViewOnly] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSecuritygroup = async () => {
      try {
        const response = await fetch('http://localhost:5000/securitygroups');
        const data = await response.json();
        setSecuritygroups(data.securitygroups || []);
        setFilteredGroups(data.securitygroups || []);
      } catch (error) {
        console.error('Error fetching Securitygroup:', error);
      }
    };
    fetchSecuritygroup();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearch(query);
    setFilteredGroups(
      securitygroups.filter(group =>
        group.security_group_name.toLowerCase().includes(query) ||
        (group.notes && group.notes.toLowerCase().includes(query))
      )
    );
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this security group?")) {
      try {
        await axios.delete(`http://localhost:5000/securitygroups/${id}`);
        fetchSecuritygroup();
        alert("Security group deleted successfully!");
      } catch (error) {
        console.error('Error deleting security group:', error);
        alert("Error deleting security group.");
      }
    }
  };

  const viewUserHandler = (group) => {
    setFormData(group);
    setViewOnly(true); 
    setShowFormVisible(true);
  };
  

  const fetchSecuritygroup = async () => {
    try {
      const response = await fetch('http://localhost:5000/securitygroups');
      const data = await response.json();
      setSecuritygroups(data.securitygroups || []);
      setFilteredGroups(data.securitygroups || []);
    } catch (error) {
      console.error('Error fetching Securitygroup:', error);
    }
  };
  const HomeClick = () => {
    navigate("/dashboard");
  };
  return (
    <div className="container mt-4">
      <h2 className="mb-3">Security Groups</h2>
      <div className="d-flex mb-3">
              <button onClick={HomeClick} className="btn btn-light">
                <FaHome size={20} color="gray" /> <b>Home</b>
              </button>
            </div>
      <div className="d-flex justify-content-between mb-3">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Search here..."
          value={search}
          onChange={handleSearch}
        />
        <button className="btn btn-primary" onClick={() => { setFormData(null); setShowFormVisible(true); setViewOnly(false); }}>
          ADD +
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>Security Group Name</th>
              <th>Comments</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group) => (
                <tr key={group._id}>
                  <td>{group.security_group_name}</td>
                  <td>{group.notes}</td>
                  <td>
                    <button
                      className="btn btn-info btn-sm me-2"
                      onClick={() => viewUserHandler(group)}>
                      <FaEye size={24} />
                    </button>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => { setFormData(group); setShowFormVisible(true); setViewOnly(false); }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(group._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center">No Record Found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showFormVisible && (
        <Securitygroupform 
          onClose={() => setShowFormVisible(false)} 
          editingSecurityGroup={formData} 
          onSave={() => {
            setShowFormVisible(false);
            fetchSecuritygroup();
          }}
          viewOnly={viewOnly}  
        />
      )}
    </div>
  );
};

export default Securitygroup;
