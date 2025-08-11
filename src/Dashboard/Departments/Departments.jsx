import React, { useState, useEffect } from 'react';
import DepartmentsForm from './Departmentsform';
import { FaEdit, FaEye, FaHome, FaTrash } from "react-icons/fa";
import { useNavigate} from 'react-router-dom';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [search, setSearch] = useState("");  
  const navigate = useNavigate();
  useEffect(() => {
    fetchDepartments();
    fetchUsers();  
  }, []); 
  
  useEffect(() => {
    setSearch("");
  }, [departments]);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('http://localhost:5000/dept');
      const data = await response.json();
      setDepartments(data.departments);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/users');
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setShowForm(true);
  };

  const viewUserHandler = (department) => {
    setEditingDepartment(department);
    setViewOnly(true); 
    setShowForm(true);
  };

  const handleDelete = async (departmentId) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;

    try {
      const response = await fetch(`http://localhost:5000/dept/${departmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete department');
      
      await fetchDepartments(); 
      alert('Department deleted successfully!');
    } catch (error) {
      console.error('Error deleting department:', error);
      alert('Error deleting department');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingDepartment(null);
  };

  const getDepartmentHead = (deptMembers) => {
    if (!deptMembers || deptMembers.length === 0) return "N/A";

    const headMember = deptMembers.find(member => member.key === "Department_Head");
    if (!headMember) return "N/A";

    const headUserId = headMember.user_id;
    const user = users.find(u => u._id === headUserId);
    return user ? `${user.fname} ${user.lname}` : "N/A"; 
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const filteredDepartments = departments.filter((department) => {
    return department.department_name.toLowerCase().includes(search.toLowerCase()) ||
           department.notes.toLowerCase().includes(search.toLowerCase());
  });
  const HomeClick = () => {
    navigate("/dashboard");
  };
  return (
    <div className="container mt-5">
      <h2 className="mb-4">Departments</h2>
  <div className="d-flex mb-3">
              <button onClick={HomeClick} className="btn btn-light">
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
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
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
                    <button
                      className="btn btn-info btn-sm me-2" 
                      onClick={() => viewUserHandler(department)}
                    >
                      <FaEye size={24} />
                    </button>
                    <button 
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => handleEdit(department)}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(department._id)}
                    >
                      <FaTrash /> Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No Record Found
                </td> 
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <DepartmentsForm 
          onClose={handleFormClose}
          editingDepartment={editingDepartment}
          onSuccess={fetchDepartments}
          viewOnly={viewOnly}
        />
      )}
    </div>
  );
};

export default Departments;
