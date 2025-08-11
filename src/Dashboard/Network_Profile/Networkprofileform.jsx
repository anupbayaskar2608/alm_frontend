import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';

const Networkprofileform = ({ onClose, onSave, editingNetworkProfile }) => {
  const [formData, setFormData] = useState({
    netLabel: '',
    IP_poolAddr: '',
    subnetMask: '',
    gateway: '',
    vlanID: '',
    Overlay_Network: false,
    notes: ''
  });

  useEffect(() => {
    if (editingNetworkProfile) {
      setFormData({
        netLabel: editingNetworkProfile.netLabel || '',
        IP_poolAddr: editingNetworkProfile.IP_poolAddr || '',
        subnetMask: editingNetworkProfile.subnetMask || '',
        gateway: editingNetworkProfile.gateway || '', // ✅ fixed typo here
        vlanID: editingNetworkProfile.vlanID || '',
        Overlay_Network: editingNetworkProfile.Overlay_Network || false,
        notes: editingNetworkProfile.notes || ''
      });
    }
  }, [editingNetworkProfile]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleIpChange = (e) => {
    const ipValue = e.target.value;
    const pureMask = formData.subnetMask?.split('/')[0] || '';
    setFormData((prev) => ({
      ...prev,
      IP_poolAddr: ipValue
    }));
    autoSelectGateway(ipValue, pureMask);
  };

  const handleSubnetMaskChange = (e) => {
    const subnetMaskValue = e.target.value;
    const pureMask = subnetMaskValue.split('/')[0];

    setFormData((prev) => ({
      ...prev,
      subnetMask: subnetMaskValue
    }));

    autoSelectGateway(formData.IP_poolAddr, pureMask);
  };

  const autoSelectGateway = (ip, subnetMask) => {
    if (!ip || !subnetMask) return;

    const ipParts = ip.split('.');
    const subnetParts = subnetMask.split('.');
    let gatewayParts = [...ipParts];

    for (let i = 0; i < 4; i++) {
      if (subnetParts[i] === '255') {
        gatewayParts[i] = ipParts[i];
      } else if (subnetParts[i] === '0') {
        gatewayParts[i] = i === 3 ? '1' : '0';
      }
    }

    setFormData((prev) => ({
      ...prev,
      gateway: gatewayParts.join('.')
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editingNetworkProfile
      ? `http://localhost:5000/ippools/${editingNetworkProfile._id}`
      : 'http://localhost:5000/ippools';

    const method = editingNetworkProfile ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to save network profile');

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving Network Profile:', error);
      alert('Failed to save: ' + error.message);
    }
  };

  return (
    <Modal show={true} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{editingNetworkProfile ? 'Edit Network Profile' : 'Add Network Profile'}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <form onSubmit={handleSubmit}>
          {/* Network Label */}
          <div className="mb-3 row">
            <label className="col-sm-3 col-form-label">Network Label</label>
            <div className="col-sm-9">
              <input type="text" className="form-control" name="netLabel" value={formData.netLabel} onChange={handleChange} placeholder="Enter network label" />
            </div>
          </div>

          {/* IP Address */}
          <div className="mb-3 row">
            <label className="col-sm-3 col-form-label">IP Address</label>
            <div className="col-sm-9">
              <input type="text" className="form-control" name="IP_poolAddr" value={formData.IP_poolAddr} onChange={handleIpChange} placeholder="e.g. 192.168.120.12" />
            </div>
          </div>

          {/* Subnet Mask */}
          <div className="mb-3 row">
            <label className="col-sm-3 col-form-label">Subnet Mask</label>
            <div className="col-sm-9">
              <select className="form-select" name="subnetMask" value={formData.subnetMask} onChange={handleSubnetMaskChange}>
                <option value="">Select Subnet Mask</option>
                {[
                  "255.255.255.255/32", "255.255.255.254/31", "255.255.255.252/30",
                  "255.255.255.248/29", "255.255.255.240/28", "255.255.255.224/27",
                  "255.255.255.192/26", "255.255.255.128/25", "255.255.255.0/24",
                  "255.255.254.0/23", "255.255.252.0/22", "255.255.248.0/21",
                  "255.255.240.0/20", "255.255.224.0/19", "255.255.192.0/18",
                  "255.255.128.0/17", "255.255.0.0/16", "255.254.0.0/15",
                  "255.252.0.0/14", "255.248.0.0/13", "255.240.0.0/12",
                  "255.224.0.0/11", "255.192.0.0/10", "255.128.0.0/9",
                  "255.0.0.0/8", "254.0.0.0/7", "252.0.0.0/6",
                  "248.0.0.0/5", "240.0.0.0/4", "224.0.0.0/3",
                  "192.0.0.0/2", "128.0.0.0/1"
                ].map(mask => (
                  <option key={mask} value={mask}>{mask.split('/')[0]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Gateway */}
          <div className="mb-3 row">
            <label className="col-sm-3 col-form-label">Gateway</label>
            <div className="col-sm-9">
              <input type="text" className="form-control" name="gateway" value={formData.gateway} readOnly />
            </div>
          </div>

          {/* VLAN ID */}
          <div className="mb-3 row">
            <label className="col-sm-3 col-form-label">VLAN ID</label>
            <div className="col-sm-9">
              <input type="text" className="form-control" name="vlanID" value={formData.vlanID} onChange={handleChange} />
            </div>
          </div>

          {/* Overlay Network */}
          <div className="mb-3 row">
            <label className="col-sm-3 col-form-label">Overlay Network</label>
            <div className="col-sm-9">
              <input type="checkbox" className="form-check-input" name="Overlay_Network" checked={formData.Overlay_Network} onChange={handleChange} />
            </div>
          </div>

          {/* Notes */}
          <div className="mb-3 row">
            <label className="col-sm-3 col-form-label">Notes</label>
            <div className="col-sm-9">
              <textarea className="form-control" name="notes" value={formData.notes} onChange={handleChange} rows="3" />
            </div>
          </div>

          {/* Buttons */}
          <div className="d-flex gap-2 justify-content-end">
            <button type="submit" className="btn btn-success">{editingNetworkProfile ? 'Update' : 'Add'}</button>
            <button type="button" className="btn btn-danger" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default Networkprofileform;
