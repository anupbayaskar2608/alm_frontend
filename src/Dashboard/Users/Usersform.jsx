import React, { useState, useEffect } from "react";

function Usersform({ onClose, onSave, editingUser, viewOnly }) {
  const [formData, setFormData] = useState({
    user_id: "",    
    fname: "",
    lname: "",
    username: "",
    email: "",
    phone: "",
    gender: "",
    role: "",
    password: "",
    confirmPass: "",
    notes: "NA",   
    isDeleted: false,  
    date: new Date().toLocaleString(), 
    usertype: "ALM_Team_Members"  
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (editingUser) {
      setFormData({
        user_id: editingUser.user_id || "",
        fname: editingUser.fname || "",
        lname: editingUser.lname || "",
        username: editingUser.username || "",
        email: editingUser.email || "",
        phone: editingUser.phone || "",
        gender: editingUser.gender || "",
        role: editingUser.role || "",
        password: "", 
        confirmPass: "", 
        notes: editingUser.notes || "NA",
        isDeleted: editingUser.isDeleted || false,
        date: editingUser.date || new Date().toLocaleString(),
        usertype: editingUser.usertype || "ALM_Team_Members"
      });
    }
  }, [editingUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPass) {
      setError("Passwords do not match");
      return;
    } else {
      setError("");
    }

    try {
      const method = editingUser ? "PUT" : "POST"; 
      const url = editingUser
        ? `http://localhost:5000/users/${editingUser.user_id}`
        : "http://localhost:5000/users"; 

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorResponse = await response.text();
        console.error(`Error response: ${errorResponse}`);
        throw new Error(`Failed to save user: ${errorResponse}`);
      }

      const data = await response.json();
      console.log("User saved successfully:", data);

      alert(editingUser ? "User Updated successfully!" : "User Added successfully!");
      onSave(data); 
      onClose(); 
    } catch (error) {
      console.error("Error during user save:", error);
      setError(`Error saving user: ${error.message}`);
    }
  };

  return (
    <form className="modal show d-block" onSubmit={handleSubmit} tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{editingUser ? "Update User" : "Add User"}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3 p-2 rounded d-flex align-items-center justify-content-between">
              <label className="form-label mb-0">User Group</label>
              <div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="userGroup"
                    id="applicationTeam"
                    value="Application Team Members"
                    checked={formData.userGroup === "Application Team Members"}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="applicationTeam">
                    Application Team Members
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="userGroup"
                    id="almOperators"
                    value="ALM Operators"
                    checked={formData.userGroup === "ALM Operators"}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="almOperators">
                    ALM Operators
                  </label>
                </div>
              </div>
            </div>
                <div className="mb-3 p-2 rounded d-flex align-items-center justify-content-between">
              <label htmlFor="username" className="form-label mb-0">Username</label>
              <input
                type="text"
                className="form-control w-75"
                name="username"
                id="username"
                value={formData.username}
                onChange={handleChange}
                disabled={viewOnly}
                required
              />
            </div>
                <div className="mb-3 d-flex">
              <div className="col me-2 p-2 rounded d-flex align-items-center justify-content-between">
                <label htmlFor="fname" className="form-label mb-0">First Name</label>
                <input
                  type="text"
                  className="form-control w-75"
                  name="fname"
                  id="fname"
                  value={formData.fname}
                  onChange={handleChange}
                  disabled={viewOnly}
                  required
                />
              </div>
              <div className="col p-2 rounded d-flex align-items-center justify-content-between">
                <label htmlFor="lname" className="form-label mb-0">Last Name</label>
                <input
                  type="text"
                  className="form-control w-75"
                  name="lname"
                  id="lname"
                  value={formData.lname}
                  onChange={handleChange}
                  disabled={viewOnly}
                  required
                />
              </div>
            </div>
                <div className="mb-3 d-flex">
              <div className="col me-2 p-2 rounded d-flex align-items-center justify-content-between">
                <label htmlFor="email" className="form-label mb-0">Email Address</label>
                <input
                  type="email"
                  className="form-control w-75"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={viewOnly}
                  required
                />
              </div>
              <div className="col p-2 rounded d-flex align-items-center justify-content-between">
                <label htmlFor="phone" className="form-label mb-0">Contact Number</label>
                <input
                  type="text"
                  className="form-control w-75"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={viewOnly}
                  required
                />
              </div>
            </div>
                <div className="mb-3 d-flex">
              <div className="col me-2 p-2 rounded d-flex align-items-center justify-content-between">
                <label className="form-label mb-0">Gender</label>
                <div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="gender"
                      id="male"
                      value="Male"
                      checked={formData.gender === "Male"}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="male">Male</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="gender"
                      id="female"
                      value="Female"
                      checked={formData.gender === "Female"}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="female">Female</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="gender"
                      id="other"
                      value="Other"
                      checked={formData.gender === "Other"}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="other">Other</label>
                  </div>
                </div>
              </div>
              <div className="col p-2 rounded d-flex align-items-center justify-content-between">
                <label htmlFor="role" className="form-label mb-0">User Role</label>
                <select
                  className="form-select w-75"
                  name="role"
                  id="role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={viewOnly}
                >
                  <option value="">Please select user role</option>
                  <option value="user">USER</option>
                  <option value="MODERATOR">MODERATOR</option>
                  <option value="admin">ADMIN</option>
                </select>
              </div>
            </div>
                {!viewOnly && (
              <>
                <div className="mb-3 p-2 rounded d-flex align-items-center justify-content-between">
                  <label htmlFor="password" className="form-label mb-0">Create Password</label>
                  <input
                    type="password"
                    className="form-control w-75"
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3 p-2 rounded d-flex align-items-center justify-content-between">
                  <label htmlFor="confirmPass" className="form-label mb-0">Confirm Password</label>
                  <input
                    type="password"
                    className="form-control w-75"
                    name="confirmPass"
                    id="confirmPass"
                    value={formData.confirmPass}
                    onChange={handleChange}
                    required
                  />
                </div>
              </>
            )}
    
            {error && <div className="text-danger">{error}</div>}
    
            <div className="d-flex justify-content-end">
              {!viewOnly && (
                <button className="btn btn-success me-2" type="submit">
                  {editingUser ? "Update" : "Create"}
                </button>
              )}
              <button type="button" className="btn btn-danger" onClick={onClose}>
                {viewOnly ? "Close" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

export default Usersform;
