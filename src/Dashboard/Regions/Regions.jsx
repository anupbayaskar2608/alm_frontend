// Regions.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaEye, FaHome, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useConfirm } from "react-use-confirming-dialog";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

const Regions = () => {
  const [regions, setRegions] = useState([]);
  const [filteredRegions, setFilteredRegions] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingRegion, setEditingRegion] = useState(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [formData, setFormData] = useState({ region_name: "", postal_address: "", notes: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const confirm = useConfirm();
  const navigate = useNavigate();

  const fetchRegions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/regions`, {headers: { Authorization: `Bearer ${token}` }});
      setRegions(res.data.regions);
      setFilteredRegions(res.data.regions);
    } catch (err) {
      console.error("Error fetching regions:", err);
      if (err.response?.status === 401) navigate("/login");
      toast.error("Error loading regions.");
    }
  };

  // Load regions when component mounts
  useEffect(() => {
    fetchRegions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    setSearch(query);
    setFilteredRegions(
      regions.filter(
        (region) => (region.region_name || "").toLowerCase().includes(query) ||
          (region.postal_address || "").toString().toLowerCase().includes(query) ||
          (region.notes || "").toLowerCase().includes(query)
      )
    );
  }

const handleDelete = async (region) => {
  const ok = await confirm({
    title: "Delete Region",
    message: `Are you sure you want to delete the region "${region.region_name}"? This action cannot be undone.`,
    confirmText: "Delete",
    cancelText: "Cancel",
  });
  if (!ok) return;

  try {
    const token = localStorage.getItem("token");
    await axios.delete(`${BASE_URL}/regions/${region._id}`, {
headers: { Authorization: `Bearer ${token}` },
    });
    fetchRegions();
    toast.success(`Region "${region.region_name}" deleted successfully!`);
  } catch (err) {
    console.error("Error deleting region:", err);
    if (err.response?.status === 401) navigate("/login");
    toast.error("Error deleting region.");
  }
};

  const openAddForm = () => {
    setEditingRegion(null);
    setFormData({ region_name: "", postal_address: "", notes: "" });
    setViewOnly(false);
    setError(null);
    setShowForm(true);
  };

  const openEditForm = (region) => {
    setEditingRegion(region);
    setFormData({
      region_name: region.region_name || "",
      postal_address: region.postal_address || "",
      notes: region.notes || "",
    });
    setViewOnly(false);
    setError(null);
    setShowForm(true);
  };

  const openViewForm = (region) => {
    setEditingRegion(region);
    setFormData({
      region_name: region.region_name || "",
      postal_address: region.postal_address || "",
      notes: region.notes || "",
    });
    setViewOnly(true);
    setError(null);
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.region_name || !formData.postal_address) {
      setError("Please fill out all required fields.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const method = editingRegion ? "put" : "post";
      const url = editingRegion
        ? `${BASE_URL}/regions/${editingRegion._id}`
        : `${BASE_URL}/regions`;

      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowForm(false);
      fetchRegions();
      toast.success(editingRegion ? "Region updated successfully!" : "Region added successfully!");
    } catch (err) {
      console.error("Error saving region:", err);
      if (err.response?.status === 401) navigate("/login");
      setError(err.response?.data?.message || "Error saving region.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingRegion(null);
    setViewOnly(false);
    setFormData({ region_name: "", postal_address: "", notes: "" });
    setError(null);
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Regions</h2>

      <div className="d-flex mb-3">
        <button onClick={() => navigate("/dashboard")} className="btn btn-light">
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
              <th>Region Name</th>
              <th>Zip Code</th>
              <th>Comments</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRegions.length > 0 ? (
              filteredRegions.map((region) => (
                <tr key={region._id}>
                  <td>{region.region_name}</td>
                  <td>{region.postal_address}</td>
                  <td>{region.notes}</td>
                  <td>
                    <button className="btn btn-info btn-sm me-2" onClick={() => openViewForm(region)}>
                      <FaEye />
                    </button>
                    <button className="btn btn-warning btn-sm me-2" onClick={() => openEditForm(region)}>
                      <FaEdit />
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(region)}>
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
                  {viewOnly ? "View Region" : editingRegion ? "Edit Region" : "Add Region"}
                </h5>
                <button type="button" className="btn-close" onClick={handleCloseForm}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSave}>
                  <div className="mb-3 row">
                    <label className="col-sm-3 col-form-label">Region Name</label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        name="region_name"
                        className="form-control"
                        value={formData.region_name}
                        onChange={(e) => setFormData({ ...formData, region_name: e.target.value })}
                        disabled={viewOnly}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3 row">
                    <label className="col-sm-3 col-form-label">Postal Address</label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        name="postal_address"
                        className="form-control"
                        value={formData.postal_address}
                        onChange={(e) => setFormData({ ...formData, postal_address: e.target.value })}
                        disabled={viewOnly}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3 row">
                    <label className="col-sm-3 col-form-label">Notes</label>
                    <div className="col-sm-9">
                      <textarea
                        name="notes"
                        className="form-control"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        disabled={viewOnly}
                      ></textarea>
                    </div>
                  </div>

                  {error && <div className="alert alert-danger">{error}</div>}

                  <div className="d-flex justify-content-between">
                    {!viewOnly && (
                      <button type="submit" className="btn btn-success" disabled={loading}>
                        {loading ? "Saving..." : editingRegion ? "Update" : "Add"}
                      </button>
                    )}
                    <button type="button" className="btn btn-danger" onClick={handleCloseForm}>
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

export default Regions;