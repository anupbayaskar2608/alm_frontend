import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaEye, FaHome } from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useConfirm } from "react-use-confirming-dialog";

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

// ================= Helper Functions ===============

// Calculate default gateway (first usable IP after network address)
const calculateDefaultGateway = (networkIp, subnetMask) => {
  if (!networkIp || !subnetMask) return "";
  const netNum = ipToNumber(networkIp);
  const maskNum = ipToNumber(subnetMask);
  const networkAddress = netNum & maskNum;
  return numberToIp(networkAddress + 1); // First usable IP
};

// Convert IP string to number
const ipToNumber = (ip) =>
  ip.split(".").reduce((acc, octet) => (acc << 8) + Number(octet), 0);

// Convert number back to IP string
const numberToIp = (num) =>
  [(num >> 24) & 255, (num >> 16) & 255, (num >> 8) & 255, num & 255].join(".");

// Generate full IP list including network, gateway, unassigned, and broadcast with appropriate keys
const generateFullIpList = (networkIp, subnetMask, existingIpRange = []) => {
  if (!networkIp || !subnetMask)
    return { ipList: [], noOfHosts: 0, usableHosts: 0, noOfAssigned: 0 };
  const netNum = ipToNumber(networkIp);
  const maskNum = ipToNumber(subnetMask);

  const networkAddress = netNum & maskNum;
  const broadcastAddress = networkAddress | (~maskNum & 0xffffffff);
  const defaultGateway = calculateDefaultGateway(networkIp, subnetMask);

  const ipList = [];

  // Add network IP
  ipList.push({ key: "networkIP", value: numberToIp(networkAddress) });

  // Preserve existing "assigned_ip" entries from existingIpRange, if any
  const existingAssigned = existingIpRange.filter(
    (ip) => ip.key === "assigned_ip"
  );

  // Add usable IPs, marking the default gateway and preserving assigned IPs
  for (let i = networkAddress + 1; i < broadcastAddress; i++) {
    const currentIp = numberToIp(i);
    const existingAssignedIp = existingAssigned.find(
      (ip) => ip.value === currentIp
    );

    if (currentIp === defaultGateway) {
      ipList.push({ key: "default_gateway", value: currentIp });
    } else if (existingAssignedIp) {
      ipList.push({ key: "assigned_ip", value: currentIp });
    } else {
      ipList.push({ key: "unassigned_ip", value: currentIp });
    }
  }

  // Add broadcast IP
  ipList.push({ key: "broadcast_ip", value: numberToIp(broadcastAddress) });

  // Calculate metrics
  const noOfHosts = ipList.length;
  const usableHosts = noOfHosts >= 2 ? noOfHosts - 2 : 0; // Exclude network and broadcast IPs, ensure non-negative
  const noOfAssigned = ipList.filter((ip) => ip.key === "assigned_ip").length; // Count IPs with key "assigned_ip"

  return { ipList, noOfHosts, usableHosts, noOfAssigned };
};

// Helper function to get color class based on IP type
const getIpTypeColor = (ip) => {
  switch (ip.key) {
    case "assigned_ip":
      return "bg-warning text-dark";
    case "unassigned_ip":
      return "bg-success";
    case "networkIP":
      return "bg-primary";
    case "broadcast_ip":
      return "bg-secondary";
    case "default_gateway":
      return "bg-danger";
    default:
      return "bg-light";
  }
};

// ====================================================

const Networkprofile = () => {
  const [networkProfiles, setNetworkProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [formData, setFormData] = useState({
    netLabel: "",
    IP_poolAddr: "",
    subnetMask: "",
    gateway: "",
    vlanID: "",
    Overlay_Network: false,
    notes: "",
    IP_range: [],
    noOfHosts: 0,
    usableHosts: 0,
    noOfAssigned: 0,
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const confirm = useConfirm();
  const navigate = useNavigate();

  const fetchNetworkProfiles = async () => {
    try {
      const res = await fetch(`${BASE_URL}/ip-pools`);
      const data = await res.json();
      console.log("API Response:", data);

      // Process each profile to ensure usableHosts is calculated if missing
      const processedData = (
        Array.isArray(data) ? data : data.ip_pools || []
      ).map((profile) => ({
        ...profile,
        usableHosts:
          profile.usableHosts ??
          (profile.noOfHosts >= 2 ? profile.noOfHosts - 2 : 0),
        noOfAssigned:
          profile.noOfAssigned ??
          (profile.IP_range
            ? profile.IP_range.filter((ip) => ip.key === "assigned_ip").length
            : 0),
      }));

      setNetworkProfiles(processedData);
      setFilteredProfiles(processedData);
    } catch (err) {
      console.error("Error fetching profiles:", err);
      toast.error("Error loading network profiles.");
    }
  };

  useEffect(() => {
    fetchNetworkProfiles();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredProfiles(
      networkProfiles.filter((p) =>
        (p.netLabel || "").toLowerCase().includes(query)
      )
    );
  };

  const handleDelete = async (profile) => {
    const ok = await confirm({
      title: "Delete Network Profile",
      message: `Are you sure you want to delete the network profile "${profile.netLabel}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (!ok) return;

    try {
      const res = await fetch(`${BASE_URL}/ip-pools/${profile._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      fetchNetworkProfiles();
      toast.success(
        `Network Profile "${profile.netLabel}" deleted successfully!`
      );
    } catch (err) {
      console.error("Error deleting:", err);
      toast.error("Error deleting profile.");
    }
  };

  const openAddForm = () => {
    setEditingProfile(null);
    setFormData({
      netLabel: "",
      IP_poolAddr: "",
      subnetMask: "",
      gateway: "",
      vlanID: "",
      Overlay_Network: false,
      notes: "",
      IP_range: [],
      noOfHosts: 0,
      usableHosts: 0,
      noOfAssigned: 0,
    });
    setViewOnly(false);
    setShowForm(true);
    setError(null);
  };

  const openEditForm = (profile) => {
    setEditingProfile(profile);
    setFormData({
      netLabel: profile.netLabel || "",
      IP_poolAddr: profile.IP_poolAddr || "",
      subnetMask: profile.subnetMask || "",
      gateway: profile.gateway || "",
      vlanID: profile.vlanID || "",
      Overlay_Network: profile.Overlay_Network || false,
      notes: profile.notes || "",
      IP_range: profile.IP_range || [],
      noOfHosts: profile.noOfHosts || 0,
      usableHosts:
        profile.usableHosts ||
        (profile.noOfHosts >= 2 ? profile.noOfHosts - 2 : 0),
      noOfAssigned:
        profile.noOfAssigned ||
        (profile.IP_range
          ? profile.IP_range.filter((ip) => ip.key === "assigned_ip").length
          : 0),
    });
    setViewOnly(false);
    setShowForm(true);
    setError(null);
  };

  const openViewForm = (profile) => {
    setEditingProfile(profile);
    setFormData({
      netLabel: profile.netLabel || "",
      IP_poolAddr: profile.IP_poolAddr || "",
      subnetMask: profile.subnetMask || "",
      gateway: profile.gateway || "",
      vlanID: profile.vlanID || "",
      Overlay_Network: profile.Overlay_Network || false,
      notes: profile.notes || "",
      IP_range: profile.IP_range || [],
      noOfHosts: profile.noOfHosts || 0,
      usableHosts:
        profile.usableHosts ||
        (profile.noOfHosts >= 2 ? profile.noOfHosts - 2 : 0),
      noOfAssigned:
        profile.noOfAssigned ||
        (profile.IP_range
          ? profile.IP_range.filter((ip) => ip.key === "assigned_ip").length
          : 0),
    });
    setViewOnly(true);
    setShowForm(true);
    setError(null);
  };

  // ======== LOGIC FOR AUTO-SETTING GATEWAY ========
  const autoSelectGateway = (ip, subnetMask) => {
    if (!ip || !subnetMask) return;
    const pureMask = subnetMask.split("/")[0];
    const gateway = calculateDefaultGateway(ip, pureMask);
    setFormData((prev) => ({
      ...prev,
      gateway,
    }));
  };

  const handleIpChange = (e) => {
    const ipValue = e.target.value;
    const pureMask = formData.subnetMask?.split("/")[0] || "";
    setFormData((prev) => ({ ...prev, IP_poolAddr: ipValue }));
    autoSelectGateway(ipValue, pureMask);
  };

  const handleSubnetMaskChange = (e) => {
    const subnetMaskValue = e.target.value;
    const pureMask = subnetMaskValue.split("/")[0];
    setFormData((prev) => ({ ...prev, subnetMask: subnetMaskValue }));
    autoSelectGateway(formData.IP_poolAddr, pureMask);
  };
  // =====================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const pureMask = formData.subnetMask?.split("/")[0];
    const { ipList, noOfHosts, usableHosts, noOfAssigned } = generateFullIpList(
      formData.IP_poolAddr,
      pureMask,
      editingProfile ? formData.IP_range : [] // Pass existing IP_range for editing
    );

    const payload = {
      ...formData,
      gateway:
        formData.gateway ||
        calculateDefaultGateway(formData.IP_poolAddr, pureMask),
      IP_range: ipList,
      noOfHosts,
      usableHosts,
      noOfAssigned,
    };

    const url = editingProfile
      ? `${BASE_URL}/ip-pools/${editingProfile._id}`
      : `${BASE_URL}/ip-pools`;
    const method = editingProfile ? "PUT" : "POST";

    try {
      setLoading(true);
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to save");

      fetchNetworkProfiles();
      setShowForm(false);
      toast.success(editingProfile ? "Profile updated!" : "Profile added!");
    } catch (err) {
      console.error("Error saving:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProfile(null);
    setViewOnly(false);
    setError(null);
  };

  return (
    <div className="container mt-5">
      <h2 className="fw-bold mb-2">Network Profiles</h2>

      <div className="d-flex mb-3">
        <button
          onClick={() => navigate("/dashboard")}
          className="btn btn-light"
        >
          <FaHome size={20} color="gray" /> <b>Home</b>
        </button>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <input
          type="text"
          className="form-control w-25"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearch}
        />
        <button className="btn btn-primary" onClick={openAddForm}>
          ADD +
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover text-center">
          <thead className="table-dark">
            <tr>
              <th>Network Profile</th>
              <th>Network IP</th>
              <th>Gateway</th>
              <th>Subnet Mask</th>
              <th>No of Hosts</th>
              <th>Usable Hosts</th>
              <th>No of IP Assigned</th>
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
                  <td>{network.usableHosts > 0 ? network.usableHosts : "0"}</td>
                  <td>{network.noOfAssigned || "0"}</td>
                  <td>
                    {network.IP_range?.[0]?.value} -{" "}
                    {network.IP_range?.[network.IP_range.length - 1]?.value}
                  </td>
                  <td>
                    <button
                      className="btn btn-info btn-sm me-1"
                      onClick={() => openViewForm(network)}
                    >
                      <FaEye />
                    </button>
                    <button
                      className="btn btn-warning btn-sm me-1"
                      onClick={() => openEditForm(network)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(network)}
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

      {showForm && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {viewOnly
                    ? "View Network Profile"
                    : editingProfile
                    ? "Edit Network Profile"
                    : "Add Network Profile"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseForm}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  {/* Network Label */}
                  <div className="mb-3 row">
                    <label className="col-sm-3 col-form-label">
                      Network Label
                    </label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control"
                        value={formData.netLabel}
                        onChange={(e) =>
                          setFormData({ ...formData, netLabel: e.target.value })
                        }
                        disabled={viewOnly}
                        required={!viewOnly}
                      />
                    </div>
                  </div>

                  {/* IP Address */}
                  <div className="mb-3 row">
                    <label className="col-sm-3 col-form-label">
                      IP Address
                    </label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control"
                        value={formData.IP_poolAddr}
                        onChange={handleIpChange}
                        disabled={viewOnly}
                        required={!viewOnly}
                      />
                    </div>
                  </div>

                  {/* Subnet Mask */}
                  <div className="mb-3 row">
                    <label className="col-sm-3 col-form-label">
                      Subnet Mask
                    </label>
                    <div className="col-sm-9">
                      {viewOnly ? (
                        <input
                          type="text"
                          className="form-control"
                          value={formData.subnetMask}
                          disabled
                        />
                      ) : (
                        <select
                          className="form-select"
                          value={formData.subnetMask}
                          onChange={handleSubnetMaskChange}
                          required
                        >
                          <option value="">Select Subnet Mask</option>
                          {[
                            "255.255.255.255/32",
                            "255.255.255.254/31",
                            "255.255.255.252/30",
                            "255.255.255.248/29",
                            "255.255.255.240/28",
                            "255.255.255.224/27",
                            "255.255.255.192/26",
                            "255.255.255.128/25",
                            "255.255.255.0/24",
                            "255.255.254.0/23",
                            "255.255.252.0/22",
                            "255.255.248.0/21",
                            "255.255.240.0/20",
                            "255.255.224.0/19",
                            "255.255.192.0/18",
                            "255.255.128.0/17",
                            "255.255.0.0/16",
                            "255.254.0.0/15",
                            "255.252.0.0/14",
                            "255.248.0.0/13",
                            "255.240.0.0/12",
                            "255.224.0.0/11",
                            "255.192.0.0/10",
                            "255.128.0.0/9",
                            "255.0.0.0/8",
                            "254.0.0.0/7",
                            "252.0.0.0/6",
                            "248.0.0.0/5",
                            "240.0.0.0/4",
                            "224.0.0.0/3",
                            "192.0.0.0/2",
                            "128.0.0.0/1",
                          ].map((mask) => (
                            <option key={mask} value={mask}>
                              {mask.split("/")[0]}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Gateway */}
                  <div className="mb-3 row">
                    <label className="col-sm-3 col-form-label">Gateway</label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control"
                        value={formData.gateway}
                        disabled
                      />
                    </div>
                  </div>

                  {/* VLAN ID */}
                  <div className="mb-3 row">
                    <label className="col-sm-3 col-form-label">VLAN ID</label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control"
                        value={formData.vlanID}
                        onChange={(e) =>
                          setFormData({ ...formData, vlanID: e.target.value })
                        }
                        disabled={viewOnly}
                      />
                    </div>
                  </div>

                  {/* Overlay Network */}
                  <div className="mb-3 row">
                    <label className="col-sm-3 col-form-label">
                      Overlay Network
                    </label>
                    <div className="col-sm-9">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={formData.Overlay_Network}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            Overlay_Network: e.target.checked,
                          })
                        }
                        disabled={viewOnly}
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mb-3 row">
                    <label className="col-sm-3 col-form-label">Notes</label>
                    <div className="col-sm-9">
                      <textarea
                        className="form-control"
                        rows="3"
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        disabled={viewOnly}
                      ></textarea>
                    </div>
                  </div>

                  {/* IP Range Display (View Mode Only) */}
                  {viewOnly && (
                    <>
                      <div className="mb-3 row">
                        <label className="col-sm-3 col-form-label">
                          Number of Hosts
                        </label>
                        <div className="col-sm-9">
                          <input
                            type="text"
                            className="form-control"
                            value={formData.noOfHosts}
                            disabled
                          />
                        </div>
                      </div>
                      <div className="mb-3 row">
                        <label className="col-sm-3 col-form-label">
                          Usable Hosts
                        </label>
                        <div className="col-sm-9">
                          <input
                            type="text"
                            className="form-control"
                            value={formData.usableHosts}
                            disabled
                          />
                        </div>
                      </div>
                      <div className="mb-3 row">
                        <label className="col-sm-3 col-form-label">
                          Assigned IPs
                        </label>
                        <div className="col-sm-9">
                          <input
                            type="text"
                            className="form-control"
                            value={formData.noOfAssigned}
                            disabled
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Legend and IP Pool Grid (View Mode Only) */}
                  {viewOnly && (
                    <>
                      {/* Legend */}
                      <div className="border rounded p-3">
                        <div className="fw-bold mb-2">Indicators</div>
                        <div className="d-flex flex-wrap gap-3 justify-content-center">
                          <span className="badge bg-warning text-dark">
                            Assigned IP’s
                          </span>
                          <span className="badge bg-success">
                            Unassigned IP’s
                          </span>
                          <span className="badge bg-primary">Network IP</span>
                          <span className="badge bg-secondary">
                            Broadcast IP
                          </span>
                          <span className="badge bg-danger">Gateway</span>
                        </div>
                      </div>
                      
                      <br></br>

                      {/* IP Pool Grid */}
                      <div className="border rounded p-3">
                        <div className="fw-bold mb-2">IP Pool</div>
                        <div className="d-flex flex-wrap gap-2 justify-content-center">
                          {formData.IP_range.length > 0 ? (
                            formData.IP_range.map((ip, idx) => (
                              <span
                                key={idx}
                                className={`badge ${getIpTypeColor(
                                  ip
                                )} text-white px-3 py-2 rounded-pill`}
                                style={{
                                  backgroundColor: getIpTypeColor(ip).includes(
                                    "bg-success"
                                  )
                                    ? "#28a745"
                                    : "",
                                }}
                              >
                                {ip.value}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted">No IPs Found</span>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  <br></br>

                  {error && <div className="alert alert-danger">{error}</div>}

                  <div className="d-flex justify-content-between">
                    {!viewOnly && (
                      <button
                        type="submit"
                        className="btn btn-success"
                        disabled={loading}
                      >
                        {loading
                          ? "Saving..."
                          : editingProfile
                          ? "Update"
                          : "Add"}
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={handleCloseForm}
                    >
                      {viewOnly ? "Close" : "Cancel"}
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

export default Networkprofile;