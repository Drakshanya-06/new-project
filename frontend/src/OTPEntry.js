import React, { useState, useRef } from 'react';
import './OTPEntry.css';
import { useNavigate } from 'react-router-dom';  // ADD THIS

function OTPEntry() {
  const navigate = useNavigate();  // ADD THIS
  const [otp, setOtp] = useState(['', '', '', '']);
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];


  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^[0-9]$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length; i++) {
      if (/^[0-9]$/.test(pastedData[i])) {
        newOtp[i] = pastedData[i];
      }
    }
    
    setOtp(newOtp);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    
    if (otpValue.length !== 4) {
      alert('Please enter complete OTP');
      return;
    }
    
    console.log('OTP:', otpValue);
    alert('OTP Verified Successfully!');
    
    // NAVIGATE TO RESET PASSWORD
    navigate('/reset-password');  // ADD THIS LINE
  };

  return (
    <div className="otp-entry-container">
      <div className="decorative-circle left-circle"></div>
      
      <div className="otp-entry-card">
        <h1 className="logo">TAX-PAL</h1>
        <h2 className="title">OTP Verification</h2>
        <p className="subtitle">
          Enter the One Time Password we've sent you on Email or Registered Phone Number.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="otp-section">
            <label className="otp-label">Enter OTP:</label>
            <div className="otp-inputs">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="otp-box"
                />
              ))}
            </div>
          </div>

          <button type="submit" className="confirm-button">
            Confirm OTP
          </button>
        </form>
      </div>

      <div className="decorative-circle right-circle"></div>
    </div>
  );
}

export default OTPEntry;
