// Securitygroups.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaEye, FaHome, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";
import { useConfirm } from "react-use-confirming-dialog";

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

const Securitygroups = () => {
  const [securitygroups, setSecuritygroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingSecurityGroup, setEditingSecuritygroup] = useState(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    security_group_name: "",
    service_names: [],
    notes: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const confirm = useConfirm();

  /** ✅ Fetch Security Groups (normalize service_names) */
  const fetchSecuritygroup = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/securitygroups`);
      const groups = res.data.securitygroups || [];

      const normalized = groups.map((g) => ({
        ...g,
        service_names: g.services
          ? g.services.map((s) => s.service_name)
          : g.service_names || [],
      }));

      setSecuritygroups(normalized);
      setFilteredGroups(normalized);
    } catch (err) {
      console.error("Error fetching security groups:", err);
      toast.error("Error loading security groups.");
    }
  };

  /** ✅ Fetch Services list */
  const fetchServices = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/services`);
      setServices(res.data.services || res.data);
    } catch (err) {
      console.error("Error fetching services:", err);
    }
  };

  useEffect(() => {
    fetchSecuritygroup();
    fetchServices();
  }, []);

  /** Search */
  function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    setSearch(query);
    setFilteredGroups(
      securitygroups.filter(
        (group) =>
          (group.security_group_name || "").toLowerCase().includes(query) ||
          (group.notes || "").toLowerCase().includes(query)
      )
    );
  }

  /** Delete */
  const handleDelete = async (group) => {
    const ok = await confirm({
      title: "Delete Security Group",
      message: `Are you sure you want to delete the security group "${group.security_group_name}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (!ok) return;

    try {
      await axios.delete(`${BASE_URL}/securitygroups/${group._id}`);
      fetchSecuritygroup();
      toast.success(
        `Security Group "${group.security_group_name}" deleted successfully!`
      );
    } catch (err) {
      console.error("Error deleting security group:", err);
      toast.error("Error deleting security group.");
    }
  };

  /** Add */
  const openAddForm = () => {
    setEditingSecuritygroup(null);
    setFormData({ security_group_name: "", service_names: [], notes: "" });
    setViewOnly(false);
    setError(null);
    setShowForm(true);
  };

  /** Edit */
  const openEditForm = (group) => {
    setEditingSecuritygroup(group);
    setFormData({
      security_group_name: group.security_group_name || "",
      service_names: group.service_names || [],
      notes: group.notes || "",
    });
    setViewOnly(false);
    setError(null);
    setShowForm(true);
  };

  /** View */
  const openViewForm = (group) => {
    setEditingSecuritygroup(group);
    setFormData({
      security_group_name: group.security_group_name || "",
      service_names: group.service_names || [],
      notes: group.notes || "",
    });
    setViewOnly(true);
    setError(null);
    setShowForm(true);
  };

  /** Save */
  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.security_group_name) {
      setError("Please enter a security group name.");
      return;
    }

    try {
      setLoading(true);
      const method = editingSecurityGroup ? "put" : "post";
      const url = editingSecurityGroup
        ? `${BASE_URL}/securitygroups/${editingSecurityGroup._id}`
        : `${BASE_URL}/securitygroups`;

      await axios[method](url, formData);

      setShowForm(false);
      fetchSecuritygroup();
      toast.success(
        editingSecurityGroup
          ? "Security Group updated!"
          : "Security Group added!"
      );
    } catch (err) {
      console.error("Error saving security group:", err);
      setError(err.response?.data?.message || "Error saving security group.");
    } finally {
      setLoading(false);
    }
  };

  /** Close form */
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSecuritygroup(null);
    setViewOnly(false);
    setFormData({ security_group_name: "", service_names: [], notes: "" });
    setError(null);
  };

  /** Home button */
  const HomeClick = () => navigate("/dashboard");

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Security Groups</h2>

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
        <button className="btn btn-primary" onClick={openAddForm}>
          ADD +
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>Security Group Name</th>
              <th>Services</th>
              <th>Comments</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group) => (
                <tr key={group._id}>
                  <td>{group.security_group_name}</td>
                  <td>
                    {group.service_names && group.service_names.length > 0
                      ? group.service_names.join(", ")
                      : "No services"}
                  </td>
                  <td>{group.notes}</td>
                  <td>
                    <button
                      className="btn btn-info btn-sm me-2"
                      onClick={() => openViewForm(group)}
                    >
                      <FaEye />
                    </button>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => openEditForm(group)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(group)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">
                  No Record Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {viewOnly
                    ? "View Security Group"
                    : editingSecurityGroup
                    ? "Edit Security Group"
                    : "Add Security Group"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseForm}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSave}>
                  <div className="mb-3 row">
                    <label className="col-sm-3 col-form-label">
                      Security Group Name
                    </label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control"
                        value={formData.security_group_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            security_group_name: e.target.value,
                          })
                        }
                        disabled={viewOnly}
                        required
                      />
                    </div>
                  </div>

                  {/* ✅ Services */}
                  <div className="mb-3 row">
                    <label className="col-sm-3 col-form-label">Services</label>
                    <div className="col-sm-9">
                      {viewOnly ? (
                        <div>
                          {formData.service_names.length > 0 ? (
                            formData.service_names.map((s, i) => (
                              <span key={i} className="badge bg-primary me-2">
                                {s}
                              </span>
                            ))
                          ) : (
                            <span>No services selected</span>
                          )}
                        </div>
                      ) : (
                        <Select
                          isMulti
                          className="react-select-container"
                          classNamePrefix="react-select"
                          options={services.map((service) => ({
                            value: service.service_name,
                            label: service.service_name,
                          }))}
                          value={formData.service_names.map((s) => ({
                            value: s,
                            label: s,
                          }))}
                          onChange={(selected) =>
                            setFormData({
                              ...formData,
                              service_names: selected
                                ? selected.map((s) => s.value)
                                : [],
                            })
                          }
                        />
                      )}
                    </div>
                  </div>

                  <div className="mb-3 row">
                    <label className="col-sm-3 col-form-label">Comments</label>
                    <div className="col-sm-9">
                      <textarea
                        className="form-control"
                        rows="3"
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        disabled={viewOnly}
                      />
                    </div>
                  </div>

                  {error && <div className="alert alert-danger">{error}</div>}

                  <div className="d-flex justify-content-between">
                    {!viewOnly && (
                      <button
                        type="submit"
                        className="btn btn-success"
                        disabled={loading}
                      >
                        {loading
                          ? "Saving..."
                          : editingSecurityGroup
                          ? "Update"
                          : "Add"}
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={handleCloseForm}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Securitygroups;
