import React, { useState, useEffect } from "react";

const DepartmentForm = ({ onClose, editingDepartment, onSuccess, viewOnly }) => {
  const [formData, setFormData] = useState({
    department_name: "",
    department_head: "",
    team_members: [],
    notes: ""
  });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
    if (editingDepartment) {
      const headMember = editingDepartment.dept_members?.find(m => m.key === "Department_Head");
      const teamMembers = editingDepartment.dept_members
        ?.filter(m => m.key === "Member")
        .map(m => m.user_id) || [];

      setFormData({
        department_name: editingDepartment.department_name || "",
        department_head: headMember?.user_id || "",
        team_members: teamMembers,
        notes: editingDepartment.notes || ""
      });
    }
  }, [editingDepartment]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMultiSelectChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      team_members: selectedOptions
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const method = editingDepartment ? "PUT" : "POST";
      const url = editingDepartment
        ? `http://localhost:5000/dept/${editingDepartment._id}`
        : "http://localhost:5000/dept";

      const departmentData = {
        department_name: formData.department_name,
        dept_head: formData.department_head,
        dept_members: formData.team_members, 
        notes: formData.notes
      };
      if (editingDepartment) {
        departmentData.dept_headedit = formData.department_head; 
        departmentData.dept_membersedit = formData.team_members; 
        delete departmentData.dept_members; 
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(departmentData)
      });

      if (!response.ok) throw new Error("Failed to save department");

      alert(editingDepartment ? "Department Updated!" : "Department Added!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving department:", error);
      alert("Error saving department");
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {editingDepartment ? "Edit Department" : "Add Department"}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
         
              <div className="mb-3 row">
                <label className="col-sm-3 col-form-label">Department Name</label>
                <div className="col-sm-9">
                  <input
                    type="text"
                    className="form-control"
                    name="department_name"
                    value={formData.department_name}
                    onChange={handleChange}
                    disabled={viewOnly}
                    required
                  />
                </div>
              </div>

              <div className="mb-3 row">
                <label className="col-sm-3 col-form-label">Department Head</label>
                <div className="col-sm-9">
                  {viewOnly ? (
                    <p>
                      {formData.department_head
                        ? (
                            <span className="badge bg-danger me-2">
                              {users.find(user => user._id === formData.department_head)?.fname || "N/A"}
                            </span>
                          )
                        : "N/A"}
                    </p>
                  ) : (
                    <select
                      className="form-control"
                      name="department_head"
                      value={formData.department_head}
                      onChange={handleChange}
                      disabled={viewOnly}
                      required
                    >
                      <option value="">Select Department Head</option>
                      {users.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.fname} {user.lname}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="mb-3 row">
                <label className="col-sm-3 col-form-label">Team Members</label>
                <div className="col-sm-9">
                  {viewOnly ? (
                    <p>
                      {formData.team_members.length > 0
                        ? formData.team_members.map(id => {
                            const user = users.find(user => user._id === id);
                            return user ? (
                              <span key={id} className="badge bg-success me-2">
                                {user.fname} {user.lname}
                              </span>
                            ) : "N/A";
                          })
                        : "N/A"}
                    </p>
                  ) : (
                    <select
                      className="form-control"
                      name="team_members"
                      multiple
                      value={formData.team_members}
                      onChange={handleMultiSelectChange}
                      disabled={viewOnly}
                    >
                      {users.map((user) => ( 
                        <option key={user._id} value={user._id}>
                          {user.fname} {user.lname} 
                        </option>
                      ))}
                    </select>
                  )}
                  {!viewOnly && (
                    <small className="form-text text-muted">
                      Hold Ctrl/Cmd to select multiple members
                    </small>
                  )}
                </div>
              </div>

              <div className="mb-3 row">
                <label className="col-sm-3 col-form-label">Comments</label>
                <div className="col-sm-9">
                  {viewOnly ? (
                    <p>{formData.notes || "No comments"}</p>
                  ) : (
                    <textarea
                      className="form-control"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      disabled={viewOnly}
                    />
                  )}
                </div>
              </div>

              {!viewOnly && (
                <div className="d-flex justify-content-between">
                  <button type="submit" className="btn btn-success">
                    {editingDepartment ? "Update" : "Add"}
                  </button>
                  <button type="button" className="btn btn-danger" onClick={onClose}>
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentForm;
