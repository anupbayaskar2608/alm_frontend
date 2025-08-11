import { useEffect, useState } from "react";

const Servicesform = ({ onClose, onSave, editingService, viewOnly }) => {
  const [formData, setFormData] = useState({
    service_name: "",
    ports: "",
    protocols: "",
    notes: "",
  });

  useEffect(() => {
    if (editingService) {
      setFormData({
        service_name: editingService.service_name || "",
        ports: editingService.ports || "",
        protocols: editingService.protocols || "",
        notes: editingService.notes || "",
      });
    }
  }, [editingService]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedFormData = {
      ...formData,
      ports: Number(formData.ports),
    };

    try {
      const method = editingService ? "PUT" : "POST";
      const url = editingService
        ? `http://localhost:5000/services/${editingService._id}`
        : "http://localhost:5000/services";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFormData),
      });

      if (!response.ok) {
        const errorResponse = await response.text();
        console.error(`Error response: ${errorResponse}`);
        throw new Error(`Failed to save service: ${errorResponse}`);
      }

      const data = await response.json();
      console.log("Service saved successfully:", data);

      if (editingService) {
        alert("Service updated successfully!");
      } else {
        alert("Service added successfully!");
      }

      onSave(); 
      onClose(); 
    } catch (error) {
      console.error("Error during service save:", error);
      alert(`Error saving service: ${error.message}`);
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {editingService ? "Edit Service Definition" : "Add Service Definition"}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3 row">
                <label htmlFor="service_name" className="col-sm-3 col-form-label">
                  Service Name
                </label>
                <div className="col-sm-9">
                  <input
                    type="text"
                    className="form-control"
                    id="service_name"
                    name="service_name"
                    placeholder="Enter Service Name"
                    value={formData.service_name}
                    onChange={handleChange}
                    required
                    disabled={viewOnly}
                  />
                </div>
              </div>
              <div className="mb-3 row">
                <label htmlFor="ports" className="col-sm-3 col-form-label">
                  Service Ports
                </label>
                <div className="col-sm-9">
                  <input
                    type="number" 
                    className="form-control"
                    id="ports"
                    name="ports"
                    placeholder="Enter service ports"
                    value={formData.ports}
                    onChange={handleChange}
                    required
                    disabled={viewOnly} 
                  />
                </div>
              </div>
              <div className="mb-3 row">
                <label htmlFor="protocols" className="col-sm-3 col-form-label">
                  Service Protocols
                </label>
                <div className="col-sm-9">
                  <input
                    type="text"
                    className="form-control"
                    id="protocols"
                    name="protocols"
                    placeholder="Enter service protocols"
                    value={formData.protocols}
                    onChange={handleChange}
                    required
                    disabled={viewOnly}
                  />
                </div>
              </div>
              <div className="mb-3 row">
                <label htmlFor="notes" className="col-sm-3 col-form-label">
                  Service Description
                </label>
                <div className="col-sm-9">
                  <textarea
                    className="form-control"
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    disabled={viewOnly} 
                  ></textarea>
                </div>
              </div>
              {!viewOnly && (
                <div className="d-flex justify-content-between">
                  <button type="submit" className="btn btn-success">
                    {editingService ? "Update" : "Add"}
                  </button>
                </div>
              )}

              <button
                type="button"
                className="btn btn-danger mt-3"
                onClick={onClose}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Servicesform;
