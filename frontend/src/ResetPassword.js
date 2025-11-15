import React, { useState } from 'react';
import './ResetPassword.css';
import { FaLock, FaUnlock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';  // ADD THIS

function ResetPassword() {
  const navigate = useNavigate();  // ADD THIS
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // New Password validation
    if (!newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    // Confirm Password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log('New Password:', newPassword);
      alert('Password reset successfully!');
      
      // NAVIGATE TO LOGIN
      navigate('/login');  // ADD THIS LINE
    }
  };

  return (
    <div className="reset-container">
      <div className="decorative-circle left-circle"></div>
      
      <div className="reset-card">
        <h1 className="logo">TAX-PAL</h1>
        <h2 className="title">Reset your Password</h2>
        <p className="subtitle">
          Enter a new password to reset the password on your account. We'll ask for this password whenever you login.
        </p>
        
        <form onSubmit={handleSubmit}>
          {/* New Password */}
          <div className="form-group">
            <label htmlFor="newPassword">New Password:</label>
            <div className="input-container">
              <input
                type={showNewPassword ? "text" : "password"}
                id="newPassword"
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={errors.newPassword ? 'error-input' : ''}
              />
              <div 
                className="input-icon clickable" 
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <FaUnlock /> : <FaLock />}
              </div>
            </div>
            {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm new password:</label>
            <div className="input-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={errors.confirmPassword ? 'error-input' : ''}
              />
              <div 
                className="input-icon clickable" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaUnlock /> : <FaLock />}
              </div>
            </div>
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="reset-button">
            Confirm
          </button>
        </form>
      </div>

      <div className="decorative-circle right-circle"></div>
    </div>
  );
}

export default ResetPassword;
