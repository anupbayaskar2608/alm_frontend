import React, { useState, useEffect } from 'react';

const RegionsForm = ({ onClose, onSave, regionToEdit, viewOnly }) => {
  const [formData, setFormData] = useState({
    region_name: "",
    postal_address: "",
    notes: "",
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (regionToEdit) {
      setFormData({
        region_name: regionToEdit.region_name || "",
        postal_address: regionToEdit.postal_address || "",
        notes: regionToEdit.notes || "",
      });
    }
  }, [regionToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedFormData = { ...formData };

    if (!updatedFormData.region_name || !updatedFormData.postal_address) {
      setError('Please fill out all required fields.');
      return;
    }

    try {
      let url = "http://localhost:5000/regions"; 
      let method = "POST";
      let payload = {
        regionName: updatedFormData.region_name, 
        postalAddress: updatedFormData.postal_address,
        notes: updatedFormData.notes,
      };

      if (regionToEdit) {
        url = `http://localhost:5000/regions/${regionToEdit._id}`;
        method = "PUT"; 
        payload = {
          region_name: updatedFormData.region_name, 
          postal_address: updatedFormData.postal_address,
          notes: updatedFormData.notes,
        };
      }

      console.log('Submitting data:', payload); 

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), 
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error("Error response:", errorResponse); 
        throw new Error(errorResponse.message || 'Failed to save region');
      }
 
      const data = await response.json();
      console.log('Region saved:', data);

      alert(regionToEdit ? 'Region updated successfully!' : 'Region added successfully!');
      onSave(); 
      onClose();

    } catch (error) {
      console.error('Error during region save:', error);
      setError(error.message); 
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{regionToEdit ? "Edit Region" : "Add Region"}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3 row">
                <label htmlFor="region_name" className="col-sm-3 col-form-label">
                  Region Name
                </label>
                <div className="col-sm-9">
                  <input
                    type="text"
                    className="form-control"
                    id="region_name"
                    name="region_name"
                    placeholder="Enter Region Name"
                    value={formData.region_name}
                    onChange={handleChange}
                    required
                    disabled={viewOnly} 
                  />
                </div>
              </div>
              <div className="mb-3 row">
                <label htmlFor="postal_address" className="col-sm-3 col-form-label">
                  Postal Address
                </label>
                <div className="col-sm-9">
                  <input
                    type="text"
                    className="form-control"
                    id="postal_address"
                    name="postal_address"
                    placeholder="Enter Postal Address"
                    value={formData.postal_address}
                    onChange={handleChange}
                    required
                    disabled={viewOnly}
                  />
                </div>
              </div>

              <div className="mb-3 row">
                <label htmlFor="notes" className="col-sm-3 col-form-label">
                  Notes
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
              {error && (
                <div className="alert alert-danger mt-3" role="alert">
                  <strong>Error:</strong> {error}
                </div>
              )}

              <div className="d-flex justify-content-between">
                {!viewOnly && (
                  <button type="submit" className="btn btn-success">
                    {regionToEdit ? "Update" : "Add"}
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={onClose}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegionsForm;
