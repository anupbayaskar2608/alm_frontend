import React, { useState, useEffect } from "react";
import Networkprofileform from "./Networkprofileform";
import NetworkprofileViewModal from "./NetworkprofileViewModal";
import { FaEdit, FaTrash } from "react-icons/fa";
import { AiOutlineEye } from "react-icons/ai";

const Networkprofile = () => {
  const [networkProfiles, setNetworkProfiles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingNetworkProfile, setEditingNetworkProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingProfile, setViewingProfile] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    fetchNetworkProfiles();
  }, []);

  const fetchNetworkProfiles = async () => {
    try {
      const response = await fetch("http://localhost:5000/ippools");
      const data = await response.json();
      setNetworkProfiles(data.ip_pools || []);
    } catch (error) {
      console.error("Error fetching Network profiles:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this network profile?")) return;
    try {
      const response = await fetch(`http://localhost:5000/ippools/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete Network profile");
      setNetworkProfiles((prev) => prev.filter((profile) => profile._id !== id));
    } catch (error) {
      console.error("Error deleting Network profile:", error);
    }
  };

  const filteredProfiles = networkProfiles.filter((profile) =>
    profile.netLabel?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mt-5">
      <h2 className="fw-bold mb-2">Network Profiles</h2>
      <div className="mb-3">
        <span className="text-muted"><i className="bi bi-house-door"></i> Home</span>
      </div>

      <div className="card p-4 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <label className="me-2">Show</label>
            <select className="form-select d-inline w-auto">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <span className="ms-2">Entries</span>
          </div>

          <input
            type="text"
            className="form-control w-25"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <button className="btn btn-primary" onClick={() => setShowForm(true)}>ADD +</button>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered table-hover text-center">
            <thead className="table-light">
              <tr>
                <th>Network Profile</th>
                <th>Network IP</th>
                <th>Gateway</th>
                <th>Subnet Mask</th>
                <th>No of Hosts</th>
                <th>Usable Hosts</th>
                <th>No of IP assigned</th>
                <th>IP Pool Range</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfiles.length > 0 ? (
                filteredProfiles.map((network) => (
                  <tr key={network._id}>
                    <td>{network.netLabel}</td>
                    <td>{network.IP_poolAddr}</td>
                    <td>{network.gateway}</td>
                    <td>{network.subnetMask}</td>
                    <td>{network.noOfHosts}</td>
                    <td>{network.usableHosts || "-"}</td>
                    <td>{network.noOfAssigned || "0"}</td>
                    <td>
                      {network.IP_range?.[0]?.value} - {network.IP_range?.[network.IP_range.length - 1]?.value}
                    </td>
                    <td>
                      <button
                        className="btn btn-outline-primary btn-sm me-1"
                        title="View"
                        onClick={() => {
                          setViewingProfile(network);
                          setShowViewModal(true);
                        }}
                      >
                        <AiOutlineEye />
                      </button>
                      <button
                        className="btn btn-outline-warning btn-sm me-1"
                        onClick={() => {
                          setEditingNetworkProfile(network);
                          setShowForm(true);
                        }}
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(network._id)}
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9">No Record Found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <Networkprofileform
          onClose={() => {
            setShowForm(false);
            setEditingNetworkProfile(null);
          }}
          onSave={fetchNetworkProfiles}
          editingNetworkProfile={editingNetworkProfile}
        />
      )}

      {showViewModal && (
        <NetworkprofileViewModal
          show={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setViewingProfile(null);
          }}
          profile={viewingProfile}
        />
      )}
    </div>
  );
};

export default Networkprofile;
