import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone_number, setPhone] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:5000/register', {
        username,
        password,
        phone_number,
      });
      if (response.status === 201) {
        if (response.data.message === 'User registered successfully') {
          navigate('/login');
        } else {
          alert("Registration error: " + response.data.message);
        }
      } else {
        alert("Registration failed with code " + response.status);
      }
    } catch (error) {
      console.error(error);
      alert('Registration failed: ' + error);
    }
  };

  return (
    <div className='register-container'>
      <form className='form-container' onSubmit={handleRegister}>
        <h3>Sign Up</h3>
        <div className="mb-3">
          <label>First name</label>
          <input
            type="text"
            className="form-control"
            placeholder="First name"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>Last name</label>
          <input type="text" className="form-control" placeholder="Last name" />
        </div>
        <div className="mb-3">
          <label>Phone</label>
          <input
            type="number"
            className="form-control"
            placeholder="Phone number"
            id="phone_number"
            value={phone_number}
            onChange={(e) => setPhone(e.target.value)}
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
        <div className="d-grid">
          <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#6f42c1' }}>
            Sign Up
          </button>
        </div>
        <p className="forgot-password text-right">
          Already registered <Link to="/login" style={{ textDecoration: 'underline' }}>sign in?</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
