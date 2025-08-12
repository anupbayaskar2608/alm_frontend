import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";

const AppMappingForm = ({ onClose, onSave, editingAppMapping }) => {
  const [apmData, setApmData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [regionData, setRegionData] = useState([]);
  const [securityGroupData, setSecurityGroupData] = useState([]);
  const [vmData, setVmData] = useState([]);

  const [formData, setFormData] = useState({
    apm_id: "",
    application_name: "",
    application_type: "",
    application_facing_type: "",
    dept: "",
    departmentHead: "",
    applicationOwner: "",
    applicationMail: "",
    applicationContact: "",
    assignedBy: "admin",
    region: "",
    securityGroup: "",
    requestId: "",
    comments: "",
    selectedVMs: [],
  });

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Populate form when editing
  useEffect(() => {
    if (editingAppMapping) {
      setFormData({
        ...formData,
        ...editingAppMapping,
        comments: editingAppMapping.comments || "",
        selectedVMs: editingAppMapping.selectedVMs || [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingAppMapping]);

  const fetchData = async () => {
    try {
      const response = await fetch("http://localhost:5000/appvms");
      const data = await response.json();

      setApmData(data.dbAplication || []);
      setDepartmentData(data.dbDepartments || []);
      setRegionData(data.dbRegions || []);
      setSecurityGroupData(data.dbSecurity || []);
      setVmData(data.dbVMs || []);

      // Fetch users data separately
      const userResponse = await fetch("http://localhost:5000/users");
      const userList = await userResponse.json();

      setUserData(Array.isArray(userList) ? userList : userList.users || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "apm_id") {
      const selectedApp = apmData.find((apm) => apm.apm_id === value);
      setFormData((prev) => ({
        ...prev,
        apm_id: value,
        application_name: selectedApp?.application_name || "",
        application_type: selectedApp?.application_type || "",
        application_facing_type: selectedApp?.application_facing_type || "",
      }));
    } else if (name === "applicationOwner") {
      const selectedOwner = userData.find((u) => u._id === value);
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        applicationMail: selectedOwner?.email || "",
        applicationContact: selectedOwner?.phone || "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal show d-block" tabIndex="-1" role="dialog" aria-modal="true">
      <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Application Mapping</h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            />
          </div>
          <div className="modal-body">
            <Form onSubmit={handleSubmit}>
              {/* APM Section */}
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group controlId="apm_id">
                    <Form.Label>APM ID</Form.Label>
                    <Form.Select
                      name="apm_id"
                      value={formData.apm_id}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Application ID</option>
                      {apmData.map((apm) => (
                        <option key={apm.apm_id} value={apm.apm_id}>
                          {apm.application_name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="application_name">
                    <Form.Label>Application Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.application_name}
                      disabled
                      readOnly
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group controlId="application_type">
                    <Form.Label>Application Type</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.application_type}
                      disabled
                      readOnly
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="application_facing_type">
                    <Form.Label>Application Facing Type</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.application_facing_type}
                      disabled
                      readOnly
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Department & Head */}
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group controlId="dept">
                    <Form.Label>Department Name</Form.Label>
                    <Form.Select
                      name="dept"
                      value={formData.dept}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Department</option>
                      {departmentData.map((dept) => (
                        <option key={dept._id} value={dept._id}>
                          {dept.department_name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="departmentHead">
                    <Form.Label>Department Head</Form.Label>
                    <Form.Select
                      name="departmentHead"
                      value={formData.departmentHead}
                      onChange={handleInputChange}
                      required
                      disabled={!formData.dept}
                    >
                      <option value="">Select Department Head</option>
                      {departmentData
                        .filter((dept) => dept._id === formData.dept)
                        .flatMap((dept) =>
                          (dept.dept_members || [])
                            .filter(
                              (member) =>
                                member.key?.toLowerCase() === "department_head"
                            )
                            .map((member) => {
                              const user = userData.find(
                                (u) => u._id === member.user_id
                              );
                              const fullName = user
                                ? user.fullname || `${user.fname || ""} ${user.lname || ""}`
                                : member.user_id;
                              return (
                                <option key={member.user_id} value={member.user_id}>
                                  {fullName}
                                </option>
                              );
                            })
                        )}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {/* Application Owner Section */}
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group controlId="applicationOwner">
                    <Form.Label>Application Owner</Form.Label>
                    <Form.Select
                      name="applicationOwner"
                      value={formData.applicationOwner}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Owner</option>
                      {userData.map((owner) => (
                        <option key={owner._id} value={owner._id}>
                          {owner.fullname || `${owner.fname || ""} ${owner.lname || ""}`}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="applicationMail">
                    <Form.Label>Application Mail</Form.Label>
                    <Form.Control type="email" value={formData.applicationMail} disabled />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group controlId="applicationContact">
                    <Form.Label>Application Contact</Form.Label>
                    <Form.Control type="text" value={formData.applicationContact} disabled />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="assignedBy">
                    <Form.Label>Assigned By</Form.Label>
                    <Form.Control type="text" value={formData.assignedBy} disabled />
                  </Form.Group>
                </Col>
              </Row>

              {/* Region & Security Group */}
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group controlId="region">
                    <Form.Label>Region</Form.Label>
                    <Form.Select
                      name="region"
                      value={formData.region}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Region</option>
                      {regionData.map((region) => (
                        <option key={region.region_id} value={region.region_id}>
                          {region.region_name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="securityGroup">
                    <Form.Label>Security Group</Form.Label>
                    <Form.Select
                      name="securityGroup"
                      value={formData.securityGroup}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Security Group</option>
                      {securityGroupData.map((group) => (
                        <option key={group.secg_id} value={group.secg_id}>
                          {group.security_group_name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {/* Request ID & Comments */}
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group controlId="requestId">
                    <Form.Label>Request ID</Form.Label>
                    <Form.Control
                      name="requestId"
                      value={formData.requestId}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="comments">
                    <Form.Label>Comments</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="comments"
                      value={formData.comments}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Select multiple VMs */}
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group controlId="selectedVMs">
                    <Form.Label>Select VMs (multiple)</Form.Label>
                    <Form.Select
                      name="selectedVMs"
                      multiple
                      value={formData.selectedVMs}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          selectedVMs: Array.from(
                            e.target.selectedOptions,
                            (option) => option.value
                          ),
                        }))
                      }
                      required
                    >
                      {vmData.map((vm) => (
                        <option key={vm.vm_id} value={vm.vm_id}>
                          {vm.vm_name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {/* Submit Buttons */}
              <div className="d-flex justify-content-center">
                <Button type="submit" variant="success" className="me-2">
                  {editingAppMapping ? "Update" : "Add"}
                </Button>
                <Button variant="danger" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppMappingForm;
