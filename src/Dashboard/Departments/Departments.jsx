import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaEye, FaHome, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useConfirm } from 'react-use-confirming-dialog';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [formData, setFormData] = useState({
    department_name: '',
    department_head: '',
    team_members: [],
    notes: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const confirm = useConfirm();

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/dept`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDepartments(res.data.departments);
      setFilteredDepartments(res.data.departments);
    } catch (err) {
      console.error('Error fetching departments:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
      toast.error('Error loading departments.');
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.users);
    } catch (err) {
      console.error('Error fetching users:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
      toast.error('Error loading users.');
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchUsers();
  }, []);

  useEffect(() => {
    setFilteredDepartments(
      departments.filter(
        (department) =>
          (department.department_name || '').toLowerCase().includes(search.toLowerCase()) ||
          (department.notes || '').toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, departments]);

  useEffect(() => {
    if (editingDepartment) {
      const headMember = editingDepartment.dept_members?.find((m) => m.key === 'Department_Head');
      const teamMembers = editingDepartment.dept_members
        ?.filter((m) => m.key === 'Member')
        .map((m) => m.user_id) || [];
      setFormData({
        department_name: editingDepartment.department_name || '',
        department_head: headMember?.user_id || '',
        team_members: teamMembers,
        notes: editingDepartment.notes || '',
      });
    } else {
      setFormData({
        department_name: '',
        department_head: '',
        team_members: [],
        notes: '',
      });
    }
  }, [editingDepartment]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
    setFormData((prev) => ({ ...prev, team_members: selectedOptions }));
  };

  const handleDelete = async (department) => {
    const ok = await confirm({
      title: 'Delete Department',
      message: `Are you sure you want to delete the department "${department.department_name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });
    if (!ok) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BASE_URL}/dept/${department._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDepartments();
      toast.success(`Department "${department.department_name}" deleted successfully!`);
    } catch (err) {
      console.error('Error deleting department:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
      toast.error('Error deleting department.');
    }
  };

  const openAddForm = () => {
    setEditingDepartment(null);
    setViewOnly(false);
    setError(null);
    setShowForm(true);
  };

  const openEditForm = (department) => {
    setEditingDepartment(department);
    setViewOnly(false);
    setError(null);
    setShowForm(true);
  };

  const openViewForm = (department) => {
    setEditingDepartment(department);
    setViewOnly(true);
    setError(null);
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.department_name || !formData.department_head) {
      setError('Please fill out all required fields.');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const method = editingDepartment ? 'put' : 'post';
      const url = editingDepartment ? `${BASE_URL}/dept/${editingDepartment._id}` : `${BASE_URL}/dept`;

      const departmentData = {
        department_name: formData.department_name,
        dept_head: formData.department_head,
        dept_members: formData.team_members,
        notes: formData.notes,
      };
      if (editingDepartment) {
        departmentData.dept_headedit = formData.department_head;
        departmentData.dept_membersedit = formData.team_members;
        delete departmentData.dept_members;
      }

      await axios[method](url, departmentData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowForm(false);
      fetchDepartments();
      toast.success(editingDepartment ? 'Department updated successfully!' : 'Department added successfully!');
    } catch (err) {
      console.error('Error saving department:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
      setError(err.response?.data?.message || 'Error saving department.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingDepartment(null);
    setViewOnly(false);
    setError(null);
  };

  const getDepartmentHead = (deptMembers) => {
    if (!deptMembers || deptMembers.length === 0) return 'N/A';
    const headMember = deptMembers.find((member) => member.key === 'Department_Head');
    if (!headMember) return 'N/A';
    const headUserId = headMember.user_id;
    const user = users.find((u) => u._id === headUserId);
    return user ? `${user.fname} ${user.lname}` : 'N/A';
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Departments</h2>
      <div className="d-flex mb-3">
        <button onClick={() => navigate('/dashboard')} className="btn btn-light">
          <FaHome size={20} color="gray" /> <b>Home</b>
        </button>
      </div>
      <div className="d-flex justify-content-between mb-3">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Search here..."
          value={search}
          onChange={handleSearch}
        />
        <button className="btn btn-primary" onClick={openAddForm}>
          ADD +
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>Department Name</th>
              <th>Department Head</th>
              <th>Comments</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDepartments.length > 0 ? (
              filteredDepartments.map((department) => (
                <tr key={department._id}>
                  <td>{department.department_name}</td>
                  <td>{getDepartmentHead(department.dept_members)}</td>
                  <td>{department.notes}</td>
                  <td>
                    <button className="btn btn-info btn-sm me-2" onClick={() => openViewForm(department)}>
                      <FaEye />
                    </button>
                    <button className="btn btn-warning btn-sm me-2" onClick={() => openEditForm(department)}>
                      <FaEdit />
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(department)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">
                  No Record Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {viewOnly ? 'View Department' : editingDepartment ? 'Edit Department' : 'Add Department'}
                </h5>
                <button type="button" className="btn-close" onClick={handleCloseForm}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSave}>
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
                          {formData.department_head ? (
                            <span className="badge bg-danger me-2">
                              {users.find((user) => user._id === formData.department_head)?.fname || 'N/A'}
                            </span>
                          ) : (
                            'N/A'
                          )}
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
                            ? formData.team_members.map((id) => {
                                const user = users.find((user) => user._id === id);
                                return user ? (
                                  <span key={id} className="badge bg-success me-2">
                                    {user.fname} {user.lname}
                                  </span>
                                ) : (
                                  'N/A'
                                );
                              })
                            : 'N/A'}
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
                        <p>{formData.notes || 'No comments'}</p>
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

                  {error && <div className="alert alert-danger">{error}</div>}

                  <div className="d-flex justify-content-between">
                    {!viewOnly && (
                      <button type="submit" className="btn btn-success" disabled={loading}>
                        {loading ? 'Saving...' : editingDepartment ? 'Update' : 'Add'}
                      </button>
                    )}
                    <button type="button" className="btn btn-danger" onClick={handleCloseForm}>
                      Cancel
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

export default Departments;