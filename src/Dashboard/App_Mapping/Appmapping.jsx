// Appmapping.jsx
import React, { useState, useEffect } from "react";
import AppMappingForm from "./Appmappingform";
import AppMappingView from "./AppMappingView";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";

const Appmapping = () => {
  const [appMapping, setAppMapping] = useState({
    dbSecurity: [],
    dbDepartments: [],
    dbRegions: [],
    dbUsersList: [],
    dbAplication: [],
    dbVMs: [],
    NetworkMappings: [],
  });

  const [showForm, setShowForm] = useState(false);
  const [editingAppMapping, setEditingAppMapping] = useState(null);
  const [viewAppMapping, setViewAppMapping] = useState(null);

  useEffect(() => {
    fetchAppMapping();
  }, []);

  const fetchAppMapping = async () => {
    try {
      const response = await fetch("http://localhost:5000/appvms");
      const data = await response.json();
      setAppMapping(data);
    } catch (error) {
      console.error("Error fetching Application Mapping:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Application Mapping?")) return;

    try {
      const response = await fetch(`http://localhost:5000/appvms/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      fetchAppMapping();
      alert("Deleted successfully.");
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Failed to delete Application Mapping.");
    }
  };

  const handleEdit = (application) => {
    setEditingAppMapping(application);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setEditingAppMapping(null);
    setShowForm(false);
  };

  const handleFormSave = async (formData) => {
    try {
      const url = editingAppMapping
        ? `http://localhost:5000/appvms/${editingAppMapping._id}`
        : `http://localhost:5000/appvms`;

      const method = editingAppMapping ? "PUT" : "POST";

      const payload = editingAppMapping
        ? {
            editapm_id: formData.apm_id,
            edit_region: formData.region,
            edit_dept: formData.dept,
            edit_secgrp: formData.securityGroup,
            uappown: formData.applicationOwner,
            assigndby: formData.assignedBy,
            requestID: parseInt(formData.requestId),
            comments: formData.comments,
            vm_id_edit: formData.selectedVMs,
          }
        : {
            apm_id: formData.apm_id,
            region: formData.region,
            dept: formData.dept,
            appown: formData.applicationOwner,
            secgrp: formData.securityGroup,
            assigndby: formData.assignedBy,
            requestID: parseInt(formData.requestId),
            comments: formData.comments,
            vm_id: formData.selectedVMs,
          };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const msg = await response.text();
        throw new Error(`Save failed: ${msg}`);
      }

      fetchAppMapping();
      handleFormClose();
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save Application Mapping.");
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Application Mapping</h2>
      <div className="d-flex justify-content-end mb-3">
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingAppMapping(null);
            setShowForm(true);
          }}
        >
          ADD +
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>APM ID</th>
              <th>Region</th>
              <th>Owner</th>
              <th>No. of VMs</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appMapping.NetworkMappings.length > 0 ? (
              appMapping.NetworkMappings.map((app) => {
                const region = appMapping.dbRegions.find((r) => r.region_id === app.region);
                const owner = appMapping.dbUsersList.find((o) => o._id === app.owner_id);
                const mappedVMs = app.mapped_vms || [];

                return (
                  <tr key={app._id}>
                    <td>{app.apm_id}</td>
                    <td>{region?.region_name || "N/A"}</td>
                    <td>{owner?.fullname || "N/A"}</td>
                    <td>{mappedVMs.length}</td>
                    <td>
                      <button
                        className="btn btn-info btn-sm me-2"
                        onClick={() => setViewAppMapping(app)}
                      >
                        <FaEye />
                      </button>
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => handleEdit(app)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(app._id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No Records Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <AppMappingForm
          onClose={handleFormClose}
          onSave={handleFormSave}
          editingAppMapping={editingAppMapping}
        />
      )}

      {viewAppMapping && (
        <AppMappingView
          app={viewAppMapping}
          onClose={() => setViewAppMapping(null)}
          dataSources={appMapping}
        />
      )}
    </div>
  );
};

export default Appmapping;
