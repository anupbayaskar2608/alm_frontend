import React, { useState, useEffect } from "react";
import axios from "axios";
import RegionsForm from "./Regionsform";

import { FaEdit, FaEye, FaHome, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
const Regions = () => {
  const [regions, setRegions] = useState([]);
  const [filteredRegions, setFilteredRegions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRegion, setEditingRegion] = useState(null); 
  const [search, setSearch] = useState("");
   const [viewOnly, setViewOnly] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRegions();
  }, []); 

  const fetchRegions = async () => {
    try {
      const response = await axios.get("http://localhost:5000/regions");
      setRegions(response.data.regions);
      setFilteredRegions(response.data.regions);
    } catch (error) {
      console.error("Error fetching regions:", error);
      alert("Error loading regions. Please try again.");
    }
  };
  const handleDelete = async (regionId) => {
    if (!window.confirm("Are you sure you want to delete this region?")) return;
    try {
      const response = await axios.delete(`http://localhost:5000/regions/${regionId}`);
      if (response.status === 200) {
        await fetchRegions();
        alert("Region deleted successfully!");
      } else {
        throw new Error('Failed to delete region');
      }
    } catch (error) {
      console.error("Error deleting region:", error);
      alert("Error deleting region. Please try again.");
    }
  };
  const handleSave = async (updatedRegion) => {
    await fetchRegions();
    setShowForm(false);
    setEditingRegion(null);
  };
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearch(query);
    setFilteredRegions(
      regions.filter((region) =>
        region.region_name.toLowerCase().includes(query) ||
        region.postal_address.toString().includes(query) ||
        (region.notes && region.notes.toLowerCase().includes(query))
      )
    );
  };

  const editRegion = (region) => {
    setEditingRegion(region);
    setShowForm(true);
  };
  const viewUserHandler = (region) => {
    setEditingRegion(region);
    setViewOnly(true); 
    setShowForm(true);
  };

  const HomeClick = () => {
    navigate("/dashboard");
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Regions</h2>

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
            setEditingRegion(null);
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
                  <button 
                      className="btn btn-info btn-sm me-2" 
                      onClick={() => viewUserHandler(region)}
                    >
                      <FaEye size={24} />
                    </button>
                    <button 
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => editRegion(region)} 
                      title="Edit Region"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(region._id)}
                      title="Delete Region"
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
        <RegionsForm
          onClose={() => {
            setShowForm(false);
            setEditingRegion(null);
          }}
          onSave={handleSave}
          regionToEdit={editingRegion}
          viewOnly={viewOnly}
        /> 
      )}
    </div>
  );
};

export default Regions;