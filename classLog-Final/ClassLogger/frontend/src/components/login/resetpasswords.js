// PasswordReset.jsx
import React, { useState } from 'react';
import axios from 'axios';
import './resetpasswords.css';

const PasswordReset = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Request password reset (step 1)
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post('http://127.0.0.1:5000/forgot-password', { email });
      setMessage(response.data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP (step 2)
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post('http://127.0.0.1:5000/verify-otp', { email, otp });
      setMessage(response.data.message);
      setResetToken(response.data.reset_token);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Reset password (step 3)
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:5000/reset-password', {
        reset_token: resetToken,
        new_password: newPassword
      });
      setMessage(response.data.message);
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="password-reset-container">
      <div className="password-reset-card">
        <div className="card-header">
          <h2>Password Reset</h2>
        </div>
        
        <div className="step-indicator">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className={`step ${step >= num ? 'active' : ''}`}>
              {num}
            </div>
          ))}
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Step 1: Request Password Reset */}
        {step === 1 && (
          <div className="step-container">
            <p>Enter your email address to receive a password reset OTP.</p>
            <form onSubmit={handleRequestReset}>
              <div className="form-group">
                <label htmlFor="email">Email address</label>
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Enter OTP */}
        {step === 2 && (
          <div className="step-container">
            <p>Enter the 6-digit OTP sent to your email.</p>
            <form onSubmit={handleVerifyOtp}>
              <div className="form-group">
                <label htmlFor="otp">One-Time Password</label>
                <input
                  type="text"
                  id="otp"
                  className="form-control otp-input"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength="6"
                  required
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
          </div>
        )}

        {/* Step 3: Reset Password */}
        {step === 3 && (
          <div className="step-container">
            <p>Create a new password.</p>
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  className="form-control"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="step-container">
            <div className="success-message">
              <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>
              <p>Your password has been reset successfully!</p>
              <a href="/login" className="btn btn-primary">Go to Login</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordReset;