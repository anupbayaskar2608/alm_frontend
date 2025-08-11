import React from "react";
import { Modal } from "react-bootstrap";

const getIpTypeColor = (ip, profile) => {
  if (ip === profile.IP_poolAddr) return "bg-primary"; // Network IP
  if (ip === profile.gateway) return "bg-danger"; // Gateway
  if (ip === profile.broadcastIP) return "bg-secondary"; // Broadcast
  if ((profile.assignedIPs || []).includes(ip)) return "bg-warning"; // Assigned
  return "bg-success"; // Unassigned
};

const NetworkprofileViewModal = ({ show, onClose, profile }) => {
  if (!profile) return null;

  const ipList = (profile.IP_range || []).map((ipObj) => ipObj.value);

  return (
    <Modal show={show} onHide={onClose} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>View IP Pool</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <label className="form-label fw-bold">Network Label</label>
            <input className="form-control" readOnly value={profile.netLabel || "-"} />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-bold">IP Address</label>
            <input className="form-control" readOnly value={profile.IP_poolAddr || "-"} />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold">Subnet Mask</label>
            <input className="form-control" readOnly value={profile.subnetMask || "-"} />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-bold">Default Gateway</label>
            <input className="form-control" readOnly value={profile.gateway || "-"} />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold">vlanID</label>
            <input className="form-control" readOnly value={profile.vlanID || "-"} />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-bold">No of Hosts</label>
            <input className="form-control" readOnly value={profile.noOfHosts || "-"} />
          </div>

          <div className="col-md-12">
            <label className="form-label fw-bold">Notes</label>
            <input className="form-control" readOnly value={profile.notes || "-"} />
          </div>
        </div>

        {/* Legend */}
        <div className="mb-3">
          <label className="form-label fw-bold">Indicators</label>
          <div className="d-flex flex-wrap gap-3">
            <span className="badge bg-warning text-dark">Assigned IP’s</span>
            <span className="badge bg-success">Unassigned IP’s</span>
            <span className="badge bg-primary">Network IP</span>
            <span className="badge bg-secondary">Broadcast IP</span>
            <span className="badge bg-danger">Gateway</span>
          </div>
        </div>

        {/* IP Pool Grid */}
        <div className="border rounded p-3">
          <div className="fw-bold mb-2">IP Pool</div>
          <div className="d-flex flex-wrap gap-2">
            {ipList.length > 0 ? (
              ipList.map((ip, idx) => (
                <span
                  key={idx}
                  className={`badge ${getIpTypeColor(ip, profile)} text-white px-3 py-2 rounded-pill`}
                >
                  {ip}
                </span>
              ))
            ) : (
              <span className="text-muted">No IPs Found</span>
            )}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-success" onClick={onClose}>Close</button>
      </Modal.Footer>
    </Modal>
  );
};

export default NetworkprofileViewModal;
