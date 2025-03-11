import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './register.css';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone_number, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log("Sending registration data:", { username, password, phone_number });
      const response = await axios.post('http://localhost:5000/register', {
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
      console.error("Registration error details:", error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log("Error response data:", error.response.data);
        console.log("Error response status:", error.response.status);
        alert('Registration failed: ' + JSON.stringify(error.response.data));
      } else if (error.request) {
        // The request was made but no response was received
        console.log("Error request:", error.request);
        alert('Network error: Server not responding. Please check if the backend server is running.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error message:', error.message);
        alert('Registration error: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='register-container'>
      <form className='form-container' onSubmit={handleRegister}>
        <h3>Sign Up</h3>
        <div className="mb-3">
          <label>Username</label>
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
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ backgroundColor: '#6f42c1' }}
            disabled={loading}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
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