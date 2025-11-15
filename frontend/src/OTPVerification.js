import React, { useState } from 'react';
import './OTPVerification.css';
import { MdEmail, MdPhone } from 'react-icons/md';

function OTPVerification() {
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Phone validation
    if (!phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (phoneNumber.length < 10) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log('Email:', email);
      console.log('Phone:', phoneNumber);
      alert('OTP sent successfully!');
      // Add your OTP sending logic here
    }
  };

  return (
    <div className="otp-container">
      <div className="decorative-circle left-circle"></div>
      
      <div className="otp-card">
        <h1 className="logo">TAX-PAL</h1>
        <h2 className="title">OTP Verification</h2>
        <p className="subtitle">
          Enter Email Address and Phone Number to send One Time Password.
        </p>
        
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <div className="input-container">
              <input
                type="email"
                id="email"
                placeholder="Enter your Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? 'error-input' : ''}
              />
              <MdEmail className="input-icon" />
            </div>
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          {/* Phone Number */}
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number:</label>
            <div className="input-container">
              <input
                type="tel"
                id="phoneNumber"
                placeholder="Enter your registered phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className={errors.phoneNumber ? 'error-input' : ''}
              />
              <MdPhone className="input-icon" />
            </div>
            {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
          </div>

          <button type="submit" className="otp-button">
            Get OTP
          </button>
        </form>
      </div>

      <div className="decorative-circle right-circle"></div>
    </div>
  );
}

export default OTPVerification;
