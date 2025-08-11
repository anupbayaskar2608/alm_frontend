import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';  

const Loginpage = () => {
    const [username, setUsername] = useState('');
const [password, setPassword] = useState('');
const [message, setMessage] = useState('');
const navigate = useNavigate(); 
  const handleSubmit = async (event) => {
    event.preventDefault();

    const loginData = { username, password };

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Login successful!');
        navigate('/dashboard'); 
      } else {
        setMessage('Login failed: ' + data.message);
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    }
}
  return (
    <>
       <div className="container d-flex flex-column justify-content-between vh-100">
        <div className="row justify-content-center mt-5">
          <div className="col-xl-5 col-lg-6 col-md-10">
            <div className="card">
              <div className="card-header bg-primary">
                <div className="app-brand">
                  <h4 className="text-uppercase mt-2 text-white text-center">
                    Application LifeCycle Manager
                  </h4>
                </div>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleSubmit} id="loginForm">
                  <div className="row">
                    <div className="form-group col-md-12 mb-4">
                      <input
                        type="text"
                        id="username"
                        name="username"
                        className="form-control"
                        placeholder="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group col-md-12 mb-4">
                      <input
                        type="password"
                        className="form-control input-lg"
                        id="password"
                        name="password"
                        placeholder="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <div>
                      <button
                        type="submit"
                        className="col-md-12 btn btn-lg btn-primary btn-block mb-4"
                      >
                        Sign In
                      </button>
                      <hr />
                    </div>
                  </div>
                </form>
                <div>{message && <p>{message}</p>}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="copyright pl-0">
          <p className="text-center text-muted font-weight-bold">
            <b>
              Design & Developed by
              <img
                src="/smartedge-logo.jpeg"
                alt="logo"
                className="mt-2"
                style={{ width: '100px', height: '50px' }}
              />
              Technologies &copy; 2025
            </b>
          </p>
        </div>
      </div>
    </>
    
  )
}

export default Loginpage
