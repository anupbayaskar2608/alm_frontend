import React, { useState, useEffect } from "react";

function AppprofileForm({
  onAdd,
  onUpdate,
  onClose,
  editingAppProfile,
  viewOnly,
}) {
  const [formData, setFormData] = useState({
    apm_id: "",
    application_name: "",
    application_type: "", 
    application: "active-active",
    application_facing_type: "public",
    application_priority_type: "critical",
    notes: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (editingAppProfile) {
      setFormData(editingAppProfile);
    }
  }, [editingAppProfile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const requestData = { ...formData };
      let response;
      if (editingAppProfile) {
        response = await fetch(
          `http://localhost:5000/Applications/${editingAppProfile._id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData),
          }
        );
      } else {
        response = await fetch("http://localhost:5000/Applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData),
        });
      }

      if (!response.ok) throw new Error("Failed to submit form");

      const data = await response.json();
      editingAppProfile ? onUpdate(data) : onAdd(data);
      setFormData({
        apm_id: "",
        application_name: "",
        application_type: "",
        application: "active-active",
        application_facing_type: "public",
        application_priority_type: "critical",
        notes: "",
      });
      onClose();
    } catch (error) {
      setError("There was an error submitting the form.");
    }
  };

  return (
    <form className="modal show d-block" onSubmit={handleSubmit}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {editingAppProfile ? "Update App Profile" : "Add App Profile"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Application ID</label>
                <input
                  type="text"
                  className="form-control"
                  name="apm_id"
                  value={formData.apm_id}
                  onChange={handleChange}
                  disabled={viewOnly}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Application Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="application_name"
                  value={formData.application_name}
                  onChange={handleChange}
                  disabled={viewOnly}
                  required
                />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Application Type</label>
                <input
                  type="text"
                  className="form-control"
                  name="application_type"
                  value={formData.application_type}
                  onChange={handleChange}
                  disabled={viewOnly}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Application Instances</label>
                <div>
                  <input
                    type="radio"
                    name="application"
                    value="active-active"
                    checked={formData.application === "active-active"}
                    onChange={handleChange}
                    disabled={viewOnly}
                  />{" "}
                  Active - Active
                  <input
                    type="radio"
                    name="application"
                    value="active-passive"
                    checked={formData.application === "active-passive"}
                    onChange={handleChange}
                    disabled={viewOnly}
                  />{" "}
                  Active - Passive
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Application Facing</label>
                <div>
                  <input
                    type="radio"
                    name="application_facing_type"
                    value="public"
                    checked={formData.application_facing_type === "public"}
                    onChange={handleChange}
                    disabled={viewOnly}
                  />{" "}
                  Public
                  <input
                    type="radio"
                    name="application_facing_type"
                    value="non-public"
                    checked={formData.application_facing_type === "non-public"}
                    onChange={handleChange}
                    disabled={viewOnly}
                  />{" "}
                  Non-Public
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Application Priority</label>
                <div>
                  <input
                    type="radio"
                    name="application_priority_type"
                    value="critical"
                    checked={formData.application_priority_type === "critical"}
                    onChange={handleChange}
                    disabled={viewOnly}
                  />{" "}
                  Critical
                  <input
                    type="radio"
                    name="application_priority_type"
                    value="non-critical"
                    checked={
                      formData.application_priority_type === "non-critical"
                    }
                    onChange={handleChange}
                    disabled={viewOnly}
                  />{" "}
                  Non-Critical
                </div>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Comments</label>
              <textarea
                className="form-control"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                disabled={viewOnly}
              ></textarea>
            </div>
            {error && <div className="text-danger">{error}</div>}
          </div>
          {!viewOnly && (
            <div className="modal-footer">
              <button type="submit" className="btn btn-success">
                Add
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}

export default AppprofileForm;
