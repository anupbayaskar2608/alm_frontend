import React from "react";

const WorkloadsViewModal = ({ workload, onClose }) => {
  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0">
          <div className="modal-header">
            <h5 className="modal-title fw-semibold">View Workload Instance</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p><strong>Name:</strong> {workload.vm_name}</p>
            <p><strong>OS:</strong> {workload.vm_guest_os}</p>
            <p><strong>Notes:</strong> {workload.notes}</p>
            <p><strong>NICs:</strong> {workload.NICs}</p>

            {workload.nic_ids && workload.nic_ids.length > 0 && (
              <div>
                <h6 className="mt-3">Network Adapters:</h6>
                <ul className="list-group">
                  {workload.nic_ids.map((nic, idx) => (
                    <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                      <span><strong>{nic.id}</strong></span>
                      <span>IP: {nic.ip}</span>
                      <span>Label: {nic.netLabel}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkloadsViewModal;