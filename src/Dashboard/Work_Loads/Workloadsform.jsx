import React, { useState, useEffect } from "react";
import axios from "axios";

const WorkloadsForm = ({ onClose, onSave, editingWorkload }) => {
  const [formData, setFormData] = useState({
    vm_id: "",
    vm_name: "",
    vm_guest_os: "",
    NICs: 1,
    notes: "",
    nic_ids: [],
  });

  const [networkProfiles, setNetworkProfiles] = useState([]);

  // Fetch IP Pools
  useEffect(() => {
    axios
      .get("http://localhost:5000/ippools")
      .then((res) => setNetworkProfiles(res.data.ip_pools || []))
      .catch((err) => console.error("Failed to fetch network profiles", err));
  }, []);

  // Populate form when editing
  useEffect(() => {
    if (editingWorkload) {
      setFormData({
        vm_id: editingWorkload.vm_id || "",
        vm_name: editingWorkload.vm_name || "",
        vm_guest_os: editingWorkload.vm_guest_os || "",
        NICs: editingWorkload.NICs || 1,
        notes: editingWorkload.notes || "",
        nic_ids: editingWorkload.nic_ids || [],
      });
    }
  }, [editingWorkload]);

  // Update NICs dynamically
  useEffect(() => {
    const count = parseInt(formData.NICs);
    setFormData((prev) => ({
      ...prev,
      nic_ids: Array(count).fill(null).map((_, i) => ({
        id: `NIC${i + 1}`,
        ip: prev.nic_ids[i]?.ip || "",
        netLabel:
          prev.nic_ids[i]?.netLabel ||
          (networkProfiles.length > 0 ? networkProfiles[0].netLabel : "No Network Profiles Available"),
      })),
    }));
  }, [formData.NICs, networkProfiles]);

  // General input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // NIC change
  const handleNICChange = (index, field, value) => {
    const updated = [...formData.nic_ids];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, nic_ids: updated }));
  };

  // Save
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content border-0">
          <div className="modal-header">
            <h5 className="modal-title fw-semibold">
              {editingWorkload ? "Edit" : "Add"} Application Workload Instance
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="vm_name"
                    value={formData.vm_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">OS</label>
                  <input
                    type="text"
                    className="form-control"
                    name="vm_guest_os"
                    value={formData.vm_guest_os}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-control"
                    name="notes"
                    rows="3"
                    value={formData.notes}
                    onChange={handleChange}
                  ></textarea>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Network Adapters</label>
                  <select
                    className="form-select"
                    name="NICs"
                    value={formData.NICs}
                    onChange={handleChange}
                  >
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {formData.nic_ids.map((nic, index) => (
                <div className="row mb-2 bg-light rounded py-2 px-3" key={index}>
                  <div className="col-md-4 mb-2">
                    <label className="form-label">NIC ID</label>
                    <input
                      type="text"
                      className="form-control"
                      value={nic.id}
                      readOnly
                    />
                  </div>
                  <div className="col-md-4 mb-2">
                    <label className="form-label">IP Address</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 192.168.1.10"
                      value={nic.ip}
                      onChange={(e) => handleNICChange(index, "ip", e.target.value)}
                    />
                  </div>
                  <div className="col-md-4 mb-2">
                    <label className="form-label">Network Label</label>
                    <select
                      className="form-select"
                      value={nic.netLabel}
                      onChange={(e) => handleNICChange(index, "netLabel", e.target.value)}
                    >
                      {networkProfiles.length > 0 ? (
                        networkProfiles.map((p) => (
                          <option key={p._id} value={p.netLabel}>
                            {p.netLabel}
                          </option>
                        ))
                      ) : (
                        <option>No Network Profiles Available</option>
                      )}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-footer">
              <button type="submit" className="btn btn-success">
                {editingWorkload ? "Update" : "Add"}
              </button>
              <button type="button" className="btn btn-danger" onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WorkloadsForm;
