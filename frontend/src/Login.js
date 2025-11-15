import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { MdEmail, MdLock } from 'react-icons/md';
import { authAPI } from './services/api';  // ADD THIS

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);  // ADD THIS

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {  // MAKE IT ASYNC
    e.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      
      try {
        // CALL BACKEND API
        const response = await authAPI.login({ email, password });
        
        // Save token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        alert(`Welcome back, ${response.data.user.name}!`);
        console.log('Logged in user:', response.data.user);
        
        // TODO: Navigate to dashboard
         navigate('/dashboard');
        
      } catch (error) {
        // Handle error
        const errorMsg = error.response?.data?.message || 'Login failed. Please check your credentials.';
        setErrors({ password: errorMsg });
        console.error('Login error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="decorative-circle left-circle"></div>
      
      <div className="login-card">
        <h1 className="logo">TAX-PAL</h1>
        <h2 className="title">Login</h2>
        
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
                className={errors.email ? 'error-input' : ''}
                disabled={loading}
              />
              <MdEmail className="input-icon" />
            </div>
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <div className="input-container">
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errors.password ? 'error-input' : ''}
                disabled={loading}
              />
              <MdLock className="input-icon" />
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="forgot-password">
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }}>
              forgot your password?
            </a>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="signup-text">
          Don't have an account? Click on{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/signup'); }}>
            SignUp
          </a>
        </p>
      </div>

      <div className="decorative-circle right-circle"></div>
    </div>
  );
}

export default Login;
