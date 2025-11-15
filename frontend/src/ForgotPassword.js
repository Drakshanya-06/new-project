import React, { useState } from 'react';
import './ForgotPassword.css';
import { MdEmail, MdArrowBack, MdEdit } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      setError('Email is required');
      return false;
    } else if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateEmail()) {
      try {
        setLoading(true);
        setError('');
        
        // Call backend API to send OTP
        const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: email })
        });

        const data = await response.json();

        if (data.success) {
          // OTP sent successfully
          console.log('OTP sent successfully!', data);
          alert(`OTP sent to ${email}! Please check your inbox (and spam folder).`);
          
          // Disable email editing
          setIsEditingEmail(false);
          
          // Navigate to OTP entry page with email
          navigate('/otp-entry', { state: { email: email } });
        } else {
          // Show error from backend
          setError(data.message || 'Failed to send OTP');
        }
      } catch (error) {
        console.error('Error sending OTP:', error);
        setError('Failed to send OTP. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChangeEmail = () => {
    setIsEditingEmail(true);
    setError('');
  };

  const handleBack = () => {
    navigate('/login');
  };

  return (
    <div className="forgot-container">
      <div className="decorative-circle left-circle"></div>
      
      <div className="forgot-card">
        {/* Back Button */}
        <button className="back-button" onClick={handleBack}>
          <MdArrowBack className="back-icon" />
          Back
        </button>

        <h1 className="logo">TAX-PAL</h1>
        <h2 className="title">Forgot your Password?</h2>
        <p className="subtitle">
          To keep your TaxPal account safe, please enter your registered email address below to receive OTP.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <div className="input-container">
              <input
                type="email"
                id="email"
                placeholder="Enter your Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={error ? 'error-input' : ''}
                disabled={!isEditingEmail || loading}
              />
              <MdEmail className="input-icon" />
            </div>
            {error && <span className="error-message">{error}</span>}
            
            {/* Change Email Button */}
            {!isEditingEmail && (
              <button 
                type="button" 
                className="change-email-btn"
                onClick={handleChangeEmail}
              >
                <MdEdit className="edit-icon" />
                Change Email
              </button>
            )}
          </div>

          {/* Get OTP Button */}
          <button 
            type="submit" 
            className="otp-button"
            disabled={loading}
          >
            {loading ? 'Sending OTP...' : 'Get OTP'}
          </button>
        </form>
      </div>

      <div className="decorative-circle right-circle"></div>
    </div>
  );
}

export default ForgotPassword;