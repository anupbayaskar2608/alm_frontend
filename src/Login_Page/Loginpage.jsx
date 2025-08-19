import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';  

const Loginpage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
    const [showAdminForm, setShowAdminForm] = useState(false);
    const [adminForm, setAdminForm] = useState({
        fname: '',
        lname: '',
        username: '',
        email: '',
        phone: '',
        password: ''
    });
    const navigate = useNavigate(); 

    const handleSubmit = async (event) => {
        event.preventDefault();

        const loginData = { email, password };

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(loginData),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.access_token);
                setMessage('Login successful!');
                navigate('/dashboard'); 
            } else {
                setMessage('Login failed: ' + data.message);
            }
        } catch (error) {
            setMessage('Error: ' + error.message);
        }
    }

    const createAdmin = async (e) => {
        e.preventDefault();
        setIsCreatingAdmin(true);
        const adminData = {
            ...adminForm,
            gender: "Male",
            role: "admin",
            notes: "NA"
        };

        try {
            const response = await fetch('http://localhost:5000/api/auth/create-admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(adminData),
            });

            const data = await response.json();
            if (response.ok) {
                setMessage('Admin created successfully!');
                setShowAdminForm(false);
                setAdminForm({ fname: '', lname: '', username: '', email: '', phone: '', password: '' });
            } else {
                setMessage('Failed: ' + data.message);
            }
        } catch (error) {
            setMessage('Error: ' + error.message);
        } finally {
            setIsCreatingAdmin(false);
        }
    }

    return (
        <>
            <div className="min-vh-100 d-flex align-items-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-xl-4 col-lg-5 col-md-6">
                            <div className="card shadow-lg border-0" style={{ borderRadius: '20px' }}>
                                <div className="card-body p-5">
                                    <div className="text-center mb-4">
                                        <h3 className="fw-bold text-dark mb-2">Welcome Back</h3>
                                        <p className="text-muted">Application LifeCycle Manager</p>
                                    </div>
                                    
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                            <input
                                                type="email"
                                                className="form-control form-control-lg"
                                                placeholder="Email Address"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                style={{ borderRadius: '12px', border: '2px solid #e9ecef' }}
                                                required
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <input
                                                type="password"
                                                className="form-control form-control-lg"
                                                placeholder="Password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                style={{ borderRadius: '12px', border: '2px solid #e9ecef' }}
                                                required
                                            />
                                        </div>
                                        
                                        <button
                                            type="submit"
                                            className="btn btn-lg w-100 mb-3"
                                            style={{ 
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                border: 'none',
                                                borderRadius: '12px',
                                                color: 'white',
                                                fontWeight: '600'
                                            }}
                                        >
                                            Sign In
                                        </button>
                                    </form>
                                    
                                    <div className="text-center">
                                        <button
                                            onClick={() => setShowAdminForm(true)}
                                            className="btn btn-outline-secondary btn-sm"
                                            style={{ borderRadius: '8px' }}
                                        >
                                            Create Admin
                                        </button>
                                    </div>
                                    
                                    {message && (
                                        <div className={`alert mt-3 ${message.includes('successful') ? 'alert-success' : 'alert-danger'}`} style={{ borderRadius: '12px' }}>
                                            {message}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="text-center mt-4">
                                <p className="text-white-50">
                                    Design & Developed by
                                    <img
                                        src="/smartedge-logo.jpeg"
                                        alt="logo"
                                        className="mx-2"
                                        style={{ width: '80px', height: '40px', borderRadius: '8px' }}
                                    />
                                    Technologies © 2025
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Admin Creation Modal */}
            {showAdminForm && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content shadow-lg" style={{ borderRadius: '25px', border: 'none', overflow: 'hidden' }}>
                            <div className="modal-header border-0 text-center position-relative" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '2rem' }}>
                                <div className="w-100">
                                    <div className="mx-auto mb-3 d-flex align-items-center justify-content-center" 
                                         style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: '2px solid rgba(255,255,255,0.3)' }}>
                                        <i className="fas fa-user-shield text-white" style={{ fontSize: '32px' }}></i>
                                    </div>
                                    <h3 className="modal-title fw-bold text-white mb-2">Create Admin Account</h3>
                                    <p className="text-white-50 mb-0">Setup administrator access for ALM system</p>
                                </div>
                                <button type="button" className="btn-close btn-close-white position-absolute" style={{ top: '20px', right: '20px' }} onClick={() => setShowAdminForm(false)}></button>
                            </div>
                            <div className="modal-body p-5" style={{ background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)' }}>
                                <form onSubmit={createAdmin}>
                                    <div className="row g-4">
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="fname"
                                                    placeholder="First Name"
                                                    value={adminForm.fname}
                                                    onChange={(e) => setAdminForm({...adminForm, fname: e.target.value})}
                                                    style={{ borderRadius: '15px', border: '2px solid #e3e6f0', fontSize: '16px', height: '60px' }}
                                                    required
                                                />
                                                <label htmlFor="fname" className="fw-semibold text-primary">First Name *</label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="lname"
                                                    placeholder="Last Name"
                                                    value={adminForm.lname}
                                                    onChange={(e) => setAdminForm({...adminForm, lname: e.target.value})}
                                                    style={{ borderRadius: '15px', border: '2px solid #e3e6f0', fontSize: '16px', height: '60px' }}
                                                />
                                                <label htmlFor="lname" className="fw-semibold text-primary">Last Name</label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="username"
                                                    placeholder="Username"
                                                    value={adminForm.username}
                                                    onChange={(e) => setAdminForm({...adminForm, username: e.target.value})}
                                                    style={{ borderRadius: '15px', border: '2px solid #e3e6f0', fontSize: '16px', height: '60px' }}
                                                    required
                                                />
                                                <label htmlFor="username" className="fw-semibold text-primary">Username *</label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    id="email"
                                                    placeholder="Email"
                                                    value={adminForm.email}
                                                    onChange={(e) => setAdminForm({...adminForm, email: e.target.value})}
                                                    style={{ borderRadius: '15px', border: '2px solid #e3e6f0', fontSize: '16px', height: '60px' }}
                                                    required
                                                />
                                                <label htmlFor="email" className="fw-semibold text-primary">Email Address *</label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    type="tel"
                                                    className="form-control"
                                                    id="phone"
                                                    placeholder="Phone"
                                                    value={adminForm.phone}
                                                    onChange={(e) => setAdminForm({...adminForm, phone: e.target.value})}
                                                    style={{ borderRadius: '15px', border: '2px solid #e3e6f0', fontSize: '16px', height: '60px' }}
                                                    required
                                                />
                                                <label htmlFor="phone" className="fw-semibold text-primary">Phone Number *</label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    type="password"
                                                    className="form-control"
                                                    id="password"
                                                    placeholder="Password"
                                                    value={adminForm.password}
                                                    onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
                                                    style={{ borderRadius: '15px', border: '2px solid #e3e6f0', fontSize: '16px', height: '60px' }}
                                                    required
                                                />
                                                <label htmlFor="password" className="fw-semibold text-primary">Password *</label>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="card" style={{ borderRadius: '15px', border: '2px solid #e3e6f0', background: 'rgba(103, 126, 234, 0.1)' }}>
                                                <div className="card-body text-center py-3">
                                                    <i className="fas fa-crown text-warning me-2"></i>
                                                    <span className="fw-bold text-primary">Role: Administrator </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-3">
                                        <button
                                            type="submit"
                                            disabled={isCreatingAdmin}
                                            className="btn btn-lg w-100 position-relative overflow-hidden"
                                            style={{ 
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                border: 'none',
                                                borderRadius: '15px',
                                                color: 'white',
                                                fontWeight: '600',
                                                fontSize: '18px',
                                                height: '60px',
                                                boxShadow: '0 8px 25px rgba(103, 126, 234, 0.3)',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            {isCreatingAdmin && <i className="fas fa-spinner fa-spin me-2"></i>}
                                            {isCreatingAdmin ? 'Creating Admin Account...' : '🚀 Create Admin Account'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Loginpage
