import React, { useState, useEffect } from "react";
import WorkloadsForm from "./Workloadsform";
import WorkloadsViewModal from "./WorkloadsViewModal";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";

const Workloads = () => {
  const [workloads, setWorkloads] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingWorkload, setEditingWorkload] = useState(null);
  const [viewWorkload, setViewWorkload] = useState(null);

  useEffect(() => {
    fetchWorkloads();
  }, []);

  const fetchWorkloads = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/workloads");
      const data = await response.json();
      setWorkloads(data.workloads || []);
    } catch (error) {
      console.error("Error fetching workloads:", error);
    }
  };

  const handleSave = async (formData) => {
    const method = editingWorkload ? "PUT" : "POST";
    const url = editingWorkload
      ? `http://localhost:5000/api/workloads/${editingWorkload._id}`
      : "http://localhost:5000/api/workloads";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Save failed");
      fetchWorkloads();
      setShowForm(false);
      setEditingWorkload(null);
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this workload?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/workloads/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deletedBy: "currentUser" }),
      });
      if (!response.ok) throw new Error("Delete failed");
      fetchWorkloads();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="container mt-5">
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
                    <button className="btn btn-sm btn-outline-primary me-1" title="View"
                      onClick={() => setViewWorkload(item)}>
                      <FaEye />
                    </button>
                    <button className="btn btn-sm btn-outline-warning me-1" title="Edit"
                      onClick={() => {
                        setEditingWorkload(item);
                        setShowForm(true);
                      }}>
                      <FaEdit />
                    </button>
                    <button className="btn btn-sm btn-outline-danger" title="Delete"
                      onClick={() => handleDelete(item._id)}>
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
          }}
          onSave={handleSave}
          editingWorkload={editingWorkload}
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
