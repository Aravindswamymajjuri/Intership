import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// import './Profile.css'; // Make sure to create this CSS file

function Profile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }
      
      try {
        const response = await axios.get('http://127.0.0.1:5000/user', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setUserData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user data. Please try again later.');
        setLoading(false);
        
        // If unauthorized, redirect to login
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return <div className="profile-container">Loading...</div>;
  }

  if (error) {
    return <div className="profile-container error">{error}</div>;
  }

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      {userData && (
        <div className="profile-info">
          <p><strong>Username:</strong> {userData.username}</p>
          {/* You can display more user information here if needed */}
        </div>
      )}
      <button onClick={handleLogout} className="btn btn-danger">
        Logout
      </button>
    </div>
  );
}

export default Profile;