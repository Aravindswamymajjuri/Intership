import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://127.0.0.1:5000/login', {
        username,
        password,
      });
      localStorage.setItem('token', response.data.access_token);

      navigate('/profile'); // Navigate to the profile page after successful login
    } catch (error) {
      console.error(error);
      alert("Invalid Credentials: " + error);
    }
  };

  return (
    <form className='form-container' onSubmit={handleLogin}>
      <h3>Sign In</h3>
      <div className="mb-3">
        <label> Username</label>
        <input
          type="text"
          className="form-control"
          placeholder="Enter username"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label>Password</label>
        <input
          type="password"
          className="form-control"
          placeholder="Enter password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <div className="custom-control custom-checkbox">
          <input
            type="checkbox"
            className="custom-control-input"
            id="customCheck1"
          />
          <label className="custom-control-label" htmlFor="customCheck1">
              Remember me
          </label>
        </div>
      </div>
      <div className="d-grid">
        <button type="submit" className="btn btn-primary" style={{backgroundColor: '#6f42c1'}}>
          Submit
        </button>
      </div>
      <div className="forgot-password text-right">
        Forgot <a href="/request_reset_password">password?</a>
      </div>
      <div className="text-center mt-3">
        <span>Don't have an account? </span>
        <Link to="/register" style={{ textDecoration: 'underline' }}>Register</Link>
      </div>
    </form>
  );
}

export default Login;
