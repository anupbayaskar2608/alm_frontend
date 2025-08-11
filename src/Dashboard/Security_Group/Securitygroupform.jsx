import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';

const Securitygroupform = ({ onClose, editingSecurityGroup, onSave, viewOnly }) => {
  const [securityGroupName, setSecurityGroupName] = useState(editingSecurityGroup ? editingSecurityGroup.security_group_name : '');
  const [selectedServices, setSelectedServices] = useState(editingSecurityGroup ? editingSecurityGroup.services.map(service => service.service_id) : []);
  const [comments, setComments] = useState(editingSecurityGroup ? editingSecurityGroup.notes : '');
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get('http://localhost:5000/services');
        setServices(response.data.services || response.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };
    fetchServices();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const payload = {
      security_group_name: securityGroupName,
      notes: comments,
    };
  
    if (editingSecurityGroup) {
      payload.services_edit = selectedServices;
    } else {
      payload.services = selectedServices;
    }
  
    try {
      if (editingSecurityGroup) {
        await axios.put(`http://localhost:5000/securitygroups/${editingSecurityGroup._id}`, payload);
      } else {
        await axios.post('http://localhost:5000/securitygroups', payload);
      }
      onSave(); 
      alert("Security group saved successfully!");
    } catch (error) {
      console.error('Error saving security group:', error);
      alert('Error saving security group.');
    }
  };

  const handleServiceChange = (e) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedServices(value);
  };

  return (
    <Modal show onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>{editingSecurityGroup ? 'Edit Security Group' : 'Add Security Group'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3 row">
            <Form.Label className="col-sm-3 col-form-label">Security Group Name</Form.Label>
            <div className="col-sm-9">
              <Form.Control
                type="text"
                placeholder="Enter security group name"
                value={securityGroupName}
                onChange={(e) => setSecurityGroupName(e.target.value)}
                required
                disabled={viewOnly}
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-3 row">
            <Form.Label className="col-sm-3 col-form-label">Services</Form.Label>
            <div className="col-sm-9">
              {viewOnly ? (
                <div>
                  {selectedServices.length > 0 ? (
                    selectedServices.map((serviceId) => {
                      const service = services.find((service) => service._id === serviceId);
                      return service ? <span key={serviceId} className="badge bg-success me-2">{service.service_name}</span> : null;
                    })
                  ) : (
                    <span>No services selected</span>
                  )}
                </div>
              ) : (
                <Form.Control
                  as="select"
                  multiple
                  value={selectedServices}
                  onChange={handleServiceChange}
                >
                  {Array.isArray(services) && services.map(service => (
                    <option key={service._id} value={service._id}>{service.service_name}</option>
                  ))}
                </Form.Control>
              )}
            </div>
          </Form.Group>

          <Form.Group className="mb-3 row">
            <Form.Label className="col-sm-3 col-form-label">Comments</Form.Label>
            <div className="col-sm-9">
              <Form.Control
                as="textarea"
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                disabled={viewOnly}
              />
            </div>
          </Form.Group>

          <div className="d-flex justify-content-end">
            {!viewOnly && (
              <>
                <Button variant="success" type="submit" className="me-2">{editingSecurityGroup ? 'Save' : 'Add'}</Button>
                <Button variant="danger" onClick={onClose}>Cancel</Button>
              </>
            )}
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default Securitygroupform;
