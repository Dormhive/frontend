import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Welcome.css';
import beeImg from '../../assets/bee.png';
import keyImg from '../../assets/key.png';

const API_URL = 'http://localhost:3001/api/auth';

function Welcome() {
  const [role, setRole] = useState('owner');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError('Please enter your email and password.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/login`, formData);

      const token = response.data?.token || response.data?.accessToken;
      const user = response.data?.user || response.data;
      const roleFromResponse = user?.role || role;

      if (token) localStorage.setItem('token', token);
      if (user) localStorage.setItem('user', JSON.stringify(user));
      if (roleFromResponse) localStorage.setItem('userRole', roleFromResponse);
      if (rememberMe) localStorage.setItem('rememberEmail', formData.email);

      if (roleFromResponse === 'owner') {
        navigate('/owner', { replace: true });
      } else if (roleFromResponse === 'tenant') {
        navigate('/tenant', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="welcome-container">
      {/* Left Side - Illustration */}
      <div className="illustration-section">
        <div className="hive-container">
          <img
            src={keyImg}
            alt="Key"
            className="key-fly-anim"
            draggable={false}
          />
          <img
            src={beeImg}
            alt="Bee"
            className="bee-fly-anim"
            draggable={false}
          />
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="form-section">
        <div className="form-container">
          <div className="form-header">
            <h1>DormHive</h1>
            <p>Your Hub for Campus Living</p>
          </div>

          {/* Hidden role selection */}
          <div className="role-selection"></div>

          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email or Username"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-footer">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                <span>Remember me</span>
              </label>

              <Link to="/forgot-password" className="forgot-password">
                Forgot Password?
              </Link>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'LOGIN'}
            </button>
          </form>

          <div className="signup-link">
            Don't have an account? <Link to="/signup">Sign up now</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Welcome;
