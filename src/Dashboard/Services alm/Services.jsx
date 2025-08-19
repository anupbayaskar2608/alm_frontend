import React, { useState, useEffect } from 'react';
import ServicesForm from './Servicesform';
import { FaEye, FaHome } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";

const Services = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [search, setSearch] = useState("");
  const [viewOnly, setViewOnly] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token"); // ✅ Get JWT token from storage

  const fetchServices = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/services', {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ Send token
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch services");
      }

      const data = await response.json();
      setServices(data.services || []);
      setFilteredServices(data.services || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line
  }, []);

  const handleDelete = async (serviceId) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/services/${serviceId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Send token
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete service");
        }
        await fetchServices();
        alert("Service deleted successfully!");
      } catch (error) {
        console.error("Error deleting service:", error);
        alert(`Error deleting service: ${error.message}`);
      }
    }
  };

  const handleSave = () => {
    fetchServices();
    setShowForm(false);
    setEditingService(null);
    setViewOnly(false);
  };

  const viewUserHandler = (service) => {
    setEditingService(service);
    setViewOnly(true);
    setShowForm(true);
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearch(query);
    setFilteredServices(
      services.filter(service =>
        service.service_name.toLowerCase().includes(query) ||
        service.ports.toString().includes(query) ||
        service.protocols.toLowerCase().includes(query)
      )
    );
  };

  const HomeClick = () => {
    navigate("/dashboard");
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Services Definition</h2>

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
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingService(null);
            setViewOnly(false);
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
              <th>Service Name</th>
              <th>Ports</th>
              <th>Protocols</th>
              <th>Comments</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredServices.length > 0 ? (
              filteredServices.map((service) => (
                <tr key={service._id}>
                  <td>{service.service_name}</td>
                  <td>{service.ports}</td>
                  <td>{service.protocols}</td>
                  <td>{service.notes}</td>
                  <td>
                    <button
                      className="btn btn-info btn-sm me-2"
                      onClick={() => viewUserHandler(service)}
                    >
                      <FaEye size={24} />
                    </button>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => {
                        setEditingService(service);
                        setViewOnly(false);
                        setShowForm(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(service._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No Record Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <ServicesForm
          onClose={() => {
            setShowForm(false);
            setEditingService(null);
            setViewOnly(false);
          }}
          onSave={handleSave}
          editingService={editingService}
          viewOnly={viewOnly}
        />
      )}
    </div>
  );
};

export default Services;
