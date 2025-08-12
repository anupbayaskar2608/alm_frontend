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

  const ownerUser = dbUsersList.find((u) => u._id === app.owner_id);

  const owner = ownerUser?.fullname || `${ownerUser?.fname || ""} ${ownerUser?.lname || ""}`.trim() || "N/A";

  const dept = dbDepartments.find((d) => d._id === app.dept)?.department_name || "N/A";

  // Find department head from dept_members if available
  let departmentHead = "N/A";
  const department = dbDepartments.find((d) => d._id === app.dept);
  if (department?.dept_members && dbUsersList.length) {
    const headMember = department.dept_members.find(
      (member) => member.key?.toLowerCase() === "department_head"
    );
    if (headMember) {
      const headUser = dbUsersList.find((u) => u._id === headMember.user_id);
      if (headUser) {
        departmentHead = headUser.fullname || `${headUser.fname || ""} ${headUser.lname || ""}`.trim();
      }
    }
  }

  const secgrp = dbSecurity.find((s) => s.secg_id === app.secgrp)?.security_group_name || "N/A";

  const apm = dbAplication.find((a) => a.apm_id === app.apm_id);
  const applicationName = apm?.application_name || app.appname || "N/A";
  const applicationType = apm?.application_type || app.apptype || "N/A";
  const applicationFacingType = apm?.application_facing_type || app.faceapp || "N/A";

  const assignedBy = app.assigndby || "N/A";
  const comments = app.notes || "N/A";


  const vmIds = Array.isArray(app.mapped_vms)
    ? app.mapped_vms.map((vm) => vm.vm_id)
    : [];

  const vmNames = vmIds.map((vmId) => {
    const vm = dbVMs.find((v) => v.vm_id === vmId);
    return vm?.vm_name || vmId;
  });

  return (
    <Modal show onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>View Application Mapping</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-2"><strong>APM ID:</strong> {app.apm_id || "N/A"}</div>
        <div className="mb-2"><strong>Application Name:</strong> {applicationName}</div>
        <div className="mb-2"><strong>Application Type:</strong> {applicationType}</div>
        <div className="mb-2"><strong>Application Facing Type:</strong> {applicationFacingType}</div>
        <div className="mb-2"><strong>Department:</strong> {dept}</div>
        <div className="mb-2"><strong>Department Head:</strong> {departmentHead}</div>
        <div className="mb-2"><strong>Application Owner:</strong> {owner}</div>
        <div className="mb-2"><strong>Region:</strong> {region}</div>
        <div className="mb-2"><strong>Security Group:</strong> {secgrp}</div>
        <div className="mb-2"><strong>Assigned By:</strong> {assignedBy}</div>
        <div className="mb-2"><strong>Comments:</strong> {comments}</div>

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
