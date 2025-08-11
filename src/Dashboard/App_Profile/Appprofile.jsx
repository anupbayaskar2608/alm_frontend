import React, { useState, useEffect } from "react";
import { FaEdit, FaEye, FaHome, FaTrash } from "react-icons/fa";
import AppprofileForm from "./Appprofileform";
import {  useNavigate } from "react-router-dom";

const Appprofile = () => {
  const [appProfiles, setAppProfiles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAppProfile, setEditingAppProfile] = useState(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []); 
  const navigate = useNavigate();
  const fetchApplications = async () => {
    try {
      const response = await fetch("http://localhost:5000/Applications");
      const data = await response.json();
      setAppProfiles(data.applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this application?")) return;

    try {
      const response = await fetch(`http://localhost:5000/Applications/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete application");

      setAppProfiles((prev) => prev.filter((app) => app._id !== id));
    } catch (error) {
      console.error("Error deleting application:", error);
    }
  };

  const handleAdd = (newApp) => {
    setAppProfiles((prev) => [...prev, newApp]);
  };

  const handleUpdate = (updatedApp) => {
    setAppProfiles((prev) =>
      prev.map((app) => (app._id === updatedApp._id ? updatedApp : app))
    );
  };

  const viewUserHandler = (application) => {
    setEditingAppProfile(application);
    setViewOnly(true);
    setShowForm(true);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const filteredAppProfiles = appProfiles.filter(
    (app) =>
      app.application_name.toLowerCase().includes(search.toLowerCase()) ||
      app.application_type.toLowerCase().includes(search.toLowerCase())
  );
  const HomeClick = () => {
    navigate("/dashboard");
  };
  return (
    <div className="container mt-5">
      <h2 className="mb-4">App Profiles</h2>
        <div className="d-flex mb-3">
              <button onClick={HomeClick} className="btn btn-light">
                <FaHome size={20} color="gray" /> <b>Home</b>
              </button>
            </div>
      <div className="d-flex justify-content-end mb-3">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Search here..."
          value={search}
          onChange={handleSearch}
        />
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(true);
            setEditingAppProfile(null);
            setViewOnly(false);
          }}
        >
          ADD +
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>Application Name</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppProfiles.length > 0 ? (
              filteredAppProfiles.map((application) => (
                <tr key={application._id}>
                  <td>{application.application_name}</td>
                  <td>{application.application_type}</td>
                  <td>
                    <button
                      className="btn btn-info btn-sm me-2"
                      onClick={() => viewUserHandler(application)}
                      title="View Application"
                    >
                      <FaEye size={18} />
                    </button>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => {
                        setEditingAppProfile(application);
                        setShowForm(true);
                        setViewOnly(false);
                      }}
                      title="Edit Application"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(application._id)}
                      title="Delete Application"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center">
                  No Record Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <AppprofileForm
          onAdd={handleAdd}
          onUpdate={handleUpdate}
          onClose={() => {
            setShowForm(false);
            setEditingAppProfile(null);
            setViewOnly(false);
          }}
          editingAppProfile={editingAppProfile}
          viewOnly={viewOnly}
        />
      )}
    </div>
  );
};

export default Appprofile;
