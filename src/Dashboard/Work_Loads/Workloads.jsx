import React, { useState, useEffect } from "react";
import WorkloadsForm from "./Workloadsform";
import WorkloadsViewModal from "./WorkloadsViewModal";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";

const Workloads = () => {
  const [workloads, setWorkloads] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingWorkload, setEditingWorkload] = useState(null);
  const [viewWorkload, setViewWorkload] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWorkloads();
  }, []);

  const fetchWorkloads = async () => {
    try {
      const response = await fetch("http://localhost:5000/workloads", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`, // Replace with your auth token logic
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch workloads");
      }
      const data = await response.json();
      setWorkloads(data.vmcontainers || []);
      setError(null);
    } catch (error) {
      console.error("Error fetching workloads:", error);
      setError(error.message || "Failed to load workloads. Please try again.");
    }
  };

  const handleSave = async (formData) => {
    const method = editingWorkload ? "PUT" : "POST";
    const url = editingWorkload
      ? `http://localhost:5000/workloads/${editingWorkload._id}`
      : "http://localhost:5000/workloads";

    // Prepare payload to match backend expectations
    const payload = {
      vm_name: formData.vm_name,
      host_ip: formData.host_ip,
      vm_guest_os: formData.vm_guest_os,
      vm_network: formData.vm_network,
      nics: formData.NICs,
      notes: formData.notes,
      // For POST, include NIC data as individual fields (ipad1, netLabel1, etc.)
      ...(method === "POST" && {
        ...formData.nic_ids.reduce((acc, nic, index) => ({
          ...acc,
          [`ipad${index + 1}`]: nic.ip,
          [`netLabel${index + 1}`]: nic.netLabel,
        }), {}),
      }),
      // For PUT, include nic_ids array
      ...(method === "PUT" && { nic_ids: formData.nic_ids }),
    };

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`, // Replace with your auth token logic
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Save failed");
      fetchWorkloads();
      setShowForm(false);
      setEditingWorkload(null);
      setError(null);
    } catch (err) {
      console.error("Save error:", err);
      setError(err.message || "Failed to save workload. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this workload?")) return;
    try {
      const response = await fetch(`http://localhost:5000/workloads/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`, // Replace with your auth token logic
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Delete failed");
      }
      fetchWorkloads();
      setError(null);
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.message || "Failed to delete workload. Please try again.");
    }
  };

  return (
    <div className="container mt-5">
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">Application Workload Instances</h3>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>ADD +</button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered align-middle table-hover">
          <thead className="table-light">
            <tr>
              <th>Name</th>
              <th>Network Adapters</th>
              <th>OS</th>
              <th style={{ width: "120px" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {workloads.length > 0 ? (
              workloads.map((item) => (
                <tr key={item._id}>
                  <td>{item.vm_name}</td>
                  <td>{item.NICs}</td>
                  <td>{item.vm_guest_os}</td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-outline-primary me-1"
                      title="View"
                      onClick={() => setViewWorkload(item)}
                    >
                      <FaEye />
                    </button>
                    <button
                      className="btn btn-sm btn-outline-warning me-1"
                      title="Edit"
                      onClick={() => {
                        setEditingWorkload(item);
                        setShowForm(true);
                      }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      title="Delete"
                      onClick={() => handleDelete(item._id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" className="text-center">No records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <WorkloadsForm
          onClose={() => {
            setShowForm(false);
            setEditingWorkload(null);
            setError(null);
          }}
          onSave={handleSave}
          editingWorkload={editingWorkload}
          lastVmNumber={workloads.length}
        />
      )}

      {viewWorkload && (
        <WorkloadsViewModal
          workload={viewWorkload}
          onClose={() => setViewWorkload(null)}
        />
      )}
    </div>
  );
};

export default Workloads;