import React from "react";
import { Modal, Button } from "react-bootstrap";

const AppMappingView = ({ app, onClose, dataSources }) => {
  if (!app) return null;

  const {
    dbRegions,
    dbUsersList,
    dbDepartments,
    dbSecurity,
    dbVMs,
    dbAplication,
  } = dataSources;

  const region = dbRegions.find((r) => r.region_id === app.region)?.region_name || "N/A";
  const owner = dbUsersList.find((u) => u._id === app.applicationOwner || app.owner_id)?.fullname || "N/A";
  const dept = dbDepartments.find((d) => d._id === app.dept)?.department_name || "N/A";
  const secgrp = dbSecurity.find((s) => s.secg_id === app.securityGroup || app.secgrp)?.security_group_name || "N/A";
  const apm = dbAplication.find((a) => a.apm_id === app.apm_id);

  const vmIds = Array.isArray(app.selectedVMs)
    ? app.selectedVMs
    : typeof app.selectedVMs === "string"
    ? [app.selectedVMs]
    : app.vm_id || app.mapped_vms || [];

  const vmNames = Array.isArray(vmIds)
    ? vmIds.map((item) => {
        const vmId = typeof item === "object" ? item.vm_id : item;
        const vm = dbVMs.find((v) => v.vm_id === vmId);
        return vm?.vm_name || vmId;
      }) 
    : [];

  return (
    <Modal show onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>View Application Mapping</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-2"><strong>APM ID:</strong> {app.apm_id || "N/A"}</div>
        <div className="mb-2"><strong>Application Name:</strong> {apm?.application_name || "N/A"}</div>
        <div className="mb-2"><strong>Application Type:</strong> {apm?.application_type || "N/A"}</div>
        <div className="mb-2"><strong>Application Facing Type:</strong> {apm?.application_facing_type || "N/A"}</div>
        <div className="mb-2"><strong>Department:</strong> {dept}</div>
        <div className="mb-2"><strong>Application Owner:</strong> {owner}</div>
        <div className="mb-2"><strong>Region:</strong> {region}</div>
        <div className="mb-2"><strong>Security Group:</strong> {secgrp}</div>
        <div className="mb-2"><strong>Request ID:</strong> {app.requestId || app.requestID || "N/A"}</div>

     

        <div className="mb-2">
          <strong>Selected VMs:</strong>
          {vmNames.length > 0 ? (
            <ul className="mt-1">
              {vmNames.map((name, index) => (
                <li key={index}>{name}</li>
              ))}
            </ul>
          ) : (
            <div>N/A</div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AppMappingView;
