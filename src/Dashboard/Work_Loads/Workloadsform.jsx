import React, { useState, useEffect } from "react";
import axios from "axios";

const WorkloadsForm = ({ onClose, onSave, editingWorkload, lastVmNumber }) => {
  const [formData, setFormData] = useState({
    vm_id: "",
    vm_name: "",
    host_ip: "",
    vm_guest_os: "",
    vm_network: "",
    NICs: 1,
    notes: "",
    nic_ids: [],
  });
  const [networkProfiles, setNetworkProfiles] = useState([]);
  const [errors, setErrors] = useState({});

  // Fetch network profiles (IP Pools)
  useEffect(() => {
    axios
      .get("http://localhost:5000/ippools", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`, // Replace with your auth token logic
        },
      })
      .then((res) => {
        setNetworkProfiles(res.data.ip_pools || []);
      })
      .catch((err) => {
        console.error("Failed to fetch network profiles", err);
        setErrors((prev) => ({ ...prev, network: "Failed to load network profiles" }));
      });
  }, []);

  // Populate form data for editing or adding
  useEffect(() => {
    if (editingWorkload) {
      setFormData({
        vm_id: editingWorkload.vm_id || "",
        vm_name: editingWorkload.vm_name || "",
        host_ip: editingWorkload.host_ip || "",
        vm_guest_os: editingWorkload.vm_guest_os || "",
        vm_network: editingWorkload.vm_network || "",
        NICs: editingWorkload.NICs || 1,
        notes: editingWorkload.notes || "",
        nic_ids: editingWorkload.nic_ids || [],
      });
    } else {
      const newId = `VM${String(lastVmNumber + 1).padStart(4, "0")}`;
      setFormData((prev) => ({ ...prev, vm_id: newId }));
    }
  }, [editingWorkload, lastVmNumber]);

  // Update NICs dynamically
  useEffect(() => {
    const count = parseInt(formData.NICs) || 1;
    setFormData((prev) => ({
      ...prev,
      nic_ids: Array(count)
        .fill(null)
        .map((_, i) => ({
          id: `NIC${i + 1}`,
          ip: prev.nic_ids[i]?.ip || "",
          netLabel:
            prev.nic_ids[i]?.netLabel ||
            (networkProfiles.length > 0 ? networkProfiles[0].netLabel : ""),
        })),
    }));
  }, [formData.NICs, networkProfiles]);

  // Handle text/select input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Handle NIC changes
  const handleNICChange = (index, field, value) => {
    const updated = [...formData.nic_ids];
    updated[index] = {
      ...updated[index],
      [field]: value,
      ...(field === "netLabel" ? { ip: "" } : {}),
    };
    setFormData((prev) => ({ ...prev, nic_ids: updated }));
    setErrors((prev) => ({ ...prev, [`nic${index}`]: "" }));
  };

  // Get unassigned IPs for dropdown
  const getUnassignedIps = (profile) => {
    if (!profile) return [];
    return Array.isArray(profile.IP_range)
      ? profile.IP_range
          .filter((ipObj) => ipObj.key !== "assigned")
          .map((ipObj) => ipObj.value)
      : [];
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};
    if (!formData.vm_name) newErrors.vm_name = "Name is required";
    if (!formData.vm_guest_os) newErrors.vm_guest_os = "OS is required";
    formData.nic_ids.forEach((nic, index) => {
      if (!nic.ip) newErrors[`nic${index}`] = `IP for NIC${index + 1} is required`;
      if (!nic.netLabel) newErrors[`nic${index}`] = `Network Label for NIC${index + 1} is required`;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
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
              {errors.network && <div className="alert alert-danger">{errors.network}</div>}
              {/* Row 1 */}
              <div className="row mb-3">
                <div className="col-md-3">
                  <label className="form-label">VM ID</label>
                  <input
                    type="text"
                    className="form-control"
                    name="vm_id"
                    value={formData.vm_id}
                    readOnly
                  />
                </div>
                <div className="col-md-5">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="vm_name"
                    value={formData.vm_name}
                    onChange={handleChange}
                    required
                  />
                  {errors.vm_name && <small className="text-danger">{errors.vm_name}</small>}
                </div>
                <div className="col-md-4">
                  <label className="form-label">OS</label>
                  <input
                    type="text"
                    className="form-control"
                    name="vm_guest_os"
                    value={formData.vm_guest_os}
                    onChange={handleChange}
                    required
                  />
                  {errors.vm_guest_os && <small className="text-danger">{errors.vm_guest_os}</small>}
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

              {/* NIC Fields */}
              {formData.nic_ids.map((nic, index) => {
                const selectedProfile = networkProfiles.find(
                  (p) => p.netLabel === nic.netLabel
                );
                const availableIps = getUnassignedIps(selectedProfile);

                return (
                  <div className="row mb-2 bg-light rounded py-2 px-3" key={index}>
                    <div className="col-md-4 mb-2">
                      <label className="form-label">NIC ID</label>
                      <input type="text" className="form-control" value={nic.id} readOnly />
                    </div>

                    <div className="col-md-4 mb-2">
                      <label className="form-label">IP Address</label>
                      <select
                        className="form-select"
                        value={nic.ip}
                        onChange={(e) => handleNICChange(index, "ip", e.target.value)}
                        required
                      >
                        <option value="">Select IP</option>
                        {availableIps.length > 0 ? (
                          availableIps.map((ip, idx) => (
                            <option key={idx} value={ip}>
                              {ip}
                            </option>
                          ))
                        ) : (
                          <option disabled>No Unassigned IPs</option>
                        )}
                      </select>
                      {errors[`nic${index}`] && <small className="text-danger">{errors[`nic${index}`]}</small>}
                    </div>

                    <div className="col-md-4 mb-2">
                      <label className="form-label">Network Label</label>
                      <select
                        className="form-select"
                        value={nic.netLabel}
                        onChange={(e) => handleNICChange(index, "netLabel", e.target.value)}
                        required
                      >
                        <option value="">Select Network Label</option>
                        {networkProfiles.length > 0 ? (
                          networkProfiles.map((p) => (
                            <option key={p._id} value={p.netLabel}>
                              {p.netLabel}
                            </option>
                          ))
                        ) : (
                          <option disabled>No Network Profiles Available</option>
                        )}
                      </select>
                      {errors[`nic${index}`] && <small className="text-danger">{errors[`nic${index}`]}</small>}
                    </div>
                  </div>
                );
              })}
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