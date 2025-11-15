// frontend/src/SignUp.js
import React, { useState } from 'react';
import './SignUp.css';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaUnlock, FaGlobe } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { authAPI } from './services/api';

function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    country: '',
    age: '',
    dob: '',
    businessType: '',
    incomeType: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long!');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.fullName, // backend expects 'name'
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        country: formData.country,
        age: Number(formData.age),
        dob: formData.dob,
        businessType: formData.businessType,
        incomeType: formData.incomeType,
        password: formData.password,
      };

      await authAPI.register(payload);

      alert('Sign Up successful! Please login.');
      navigate('/login'); // go to login after signup
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Sign up failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="circle-bg top-left"></div>
      <div className="circle-bg bottom-right"></div>

      <div className="signup-card">
        <h1 className="logo">TAX-PAL</h1>
        <h2 className="title">Sign Up</h2>
        <p className="subtitle">Create your account to get started with TaxPal!</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group half">
              <label>Full Name</label>
              <div className="input-container">
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter your Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
                <FaUser className="input-icon" />
              </div>
            </div>

            <div className="form-group half">
              <label>Email</label>
              <div className="input-container">
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <FaEnvelope className="input-icon" />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Phone Number</label>
              <div className="input-container">
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="Enter your Phone Number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
                <FaPhone className="input-icon" />
              </div>
            </div>

            <div className="form-group half">
              <label>Country</label>
              <div className="input-container">
                <input
                  type="text"
                  name="country"
                  placeholder="Enter your Country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                />
                <FaGlobe className="input-icon" />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Age</label>
              <input
                type="number"
                name="age"
                placeholder="Age"
                value={formData.age}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group half">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Business Type</label>
              <select
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                required
              >
                <option value="">Select Business Type</option>
                <option value="Individual">Individual</option>
                <option value="Startup">Startup</option>
                <option value="Company">Company</option>
              </select>
            </div>
            <div className="form-group half">
              <label>Income Type</label>
              <select
                name="incomeType"
                value={formData.incomeType}
                onChange={handleChange}
                required
              >
                <option value="">Select Income Type</option>
                <option value="Salary">Salary</option>
                <option value="Business">Business</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Password</label>
              <div className="input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
                <div
                  className="input-icon clickable"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaUnlock /> : <FaLock />}
                </div>
              </div>
            </div>

            <div className="form-group half">
              <label>Confirm Password</label>
              <div className="input-container">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Re-enter Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
                <div
                  className="input-icon clickable"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaUnlock /> : <FaLock />}
                </div>
              </div>
            </div>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>

        <p className="switch-text">
          Already have an account?{' '}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate('/login');
            }}
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}

export default SignUp;
