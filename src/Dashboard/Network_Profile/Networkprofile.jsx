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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enrichProfile = (raw) => {
    const profile = { ...(raw || {}) };
    const ipRange = Array.isArray(profile.IP_range) ? profile.IP_range : [];

    const networkIP = ipRange.length > 0 ? ipRange[0].value : (profile.IP_poolAddr || "");

    const broadcastIP = ipRange.length > 1 ? ipRange[ipRange.length - 1].value : (profile.broadcastIP || "");

    const totalIPs = ipRange.length || 0;

    const usableHosts = Math.max(0, totalIPs - 2);

    const computedGateway = profile.gateway || (ipRange.length > 1 ? ipRange[1].value : "");

    const normalizedAssignedFromRange = ipRange
      .filter((item) => {
        if (!item || typeof item.key !== "string") return false;
        const k = item.key.trim().toLowerCase();
        if (!k) return false;
        if (
          k === "unassigned" ||
          k === "network id" ||
          k === "broadcast id" ||
          k === "broadcast" ||
          k === "gateway" ||
          k === "broadcast id" 
        ) {
          return false;
        }
        return true;
      })
      .map((i) => i.value);

    const assignedIPs = Array.isArray(profile.assignedIPs) && profile.assignedIPs.length > 0
      ? profile.assignedIPs
      : normalizedAssignedFromRange;

    const noOfAssigned = Array.isArray(assignedIPs) ? assignedIPs.length : 0;

    // Also ensure we mark the IP_range entry equal to computedGateway with key 'Gateway' locally,
    // so the view modal's color logic recognizes it.
    const normalizedIPRange = ipRange.map((item) => {
      if (!item) return item;
      // If the value equals computedGateway, return a copy with key 'Gateway'
      if (computedGateway && item.value === computedGateway) {
        return { ...item, key: "Gateway" };
      }
      return item;
    });

    // Return enriched profile (local copy only)
    return {
      ...profile,
      // keep original IP_poolAddr for compatibility but prefer networkIP as the canonical pool start
      IP_poolAddr: networkIP || profile.IP_poolAddr || "",
      networkIP,
      broadcastIP,
      usableHosts,
      gateway: computedGateway,
      assignedIPs,
      noOfAssigned,
      IP_range: normalizedIPRange
    };
  };

  // Fetch from backend and enrich profiles
  const fetchNetworkProfiles = async () => {
    try {
      const response = await fetch("http://localhost:5000/ippools");
      const data = await response.json();
      const rawProfiles = data.ip_pools || [];
      const enriched = rawProfiles.map((p) => enrichProfile(p));
      setNetworkProfiles(enriched);
    } catch (error) {
      console.error("Error fetching Network profiles:", error);
    }
  };

  // Delete handler
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this network profile?")) return;
    try {
      const response = await fetch(`http://localhost:5000/ippools/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete Network profile");
      // remove locally
      setNetworkProfiles((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      console.error("Error deleting Network profile:", error);
      alert("Delete failed: " + error.message);
    }
  };

  // When clicking view: enrich and open modal
  const handleView = (profile) => {
    const enriched = enrichProfile(profile);
    setViewingProfile(enriched);
    setShowViewModal(true);
  };

  // When clicking edit: pass the original profile object (enriched is fine too)
  const handleEdit = (profile) => {
    // pass a shallow copy to avoid accidental mutation
    setEditingNetworkProfile({ ...profile });
    setShowForm(true);
  };

  // Filter by netLabel or IP address
  const filteredProfiles = networkProfiles.filter((profile) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const label = (profile.netLabel || "").toLowerCase();
    const ip = (profile.networkIP || profile.IP_poolAddr || "").toLowerCase();
    return label.includes(q) || ip.includes(q);
  });

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
            placeholder="Search by label or IP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditingNetworkProfile(null); }}>ADD +</button>
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
                    <td>{network.netLabel || "-"}</td>
                    <td>{network.networkIP || network.IP_poolAddr || "-"}</td>
                    <td>{network.gateway || "-"}</td>
                    <td>{network.subnetMask || "-"}</td>
                    <td>{network.noOfHosts || "-"}</td>
                    <td>{typeof network.usableHosts !== "undefined" ? network.usableHosts : "-"}</td>
                    <td>{typeof network.noOfAssigned !== "undefined" ? network.noOfAssigned : "0"}</td>
                    <td>
                      {network.IP_range?.[0]?.value
                        ? `${network.IP_range[0].value} - ${network.IP_range[network.IP_range.length - 1]?.value || "-" }`
                        : "-"}
                    </td>
                    <td>
                      <button
                        className="btn btn-outline-primary btn-sm me-1"
                        title="View"
                        onClick={() => handleView(network)}
                      >
                        <AiOutlineEye />
                      </button>
                      <button
                        className="btn btn-outline-warning btn-sm me-1"
                        onClick={() => handleEdit(network)}
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

      {/* Add / Edit form modal */}
      {showForm && (
        <Networkprofileform
          onClose={() => {
            setShowForm(false);
            setEditingNetworkProfile(null);
            // refresh after close in case of save
            fetchNetworkProfiles();
          }}
          onSave={() => {
            // refresh list after saving
            fetchNetworkProfiles();
          }}
          editingNetworkProfile={editingNetworkProfile}
        />
      )}

      {/* View modal (enriched profile passed) */}
      {showViewModal && viewingProfile && (
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
