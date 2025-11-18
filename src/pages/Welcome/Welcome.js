import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Welcome.css';

const API_URL = 'http://localhost:3001/api/auth';

function Welcome() {
  const [role, setRole] = useState('owner'); // 'owner' or 'tenant'
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

      // normalize response
      const token = response.data?.token || response.data?.accessToken;
      const user = response.data?.user || response.data;

      // determine role: prefer backend role, fallback to selected role
      const roleFromResponse = (user && user.role) ? user.role : role;

      // persist auth info
      if (token) localStorage.setItem('token', token);
      if (user) localStorage.setItem('user', JSON.stringify(user));
      if (roleFromResponse) localStorage.setItem('userRole', roleFromResponse);
      if (rememberMe) localStorage.setItem('rememberEmail', formData.email);

      console.log('Login success:', { roleFromResponse, user });

      // navigate based on role
      if (roleFromResponse === 'owner') {
        navigate('/owner', { replace: true });
      } else if (roleFromResponse === 'tenant') {
        navigate('/tenant', { replace: true });
      } else {
        // fallback: navigate to home
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
          {/* Decorative bee with floating animation */}
          <svg className="bee" viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="30" cy="35" rx="22" ry="28" fill="#b3d9ff" stroke="#4a90a4" strokeWidth="2" className="bee-wings" />
            <ellipse cx="90" cy="35" rx="22" ry="28" fill="#b3d9ff" stroke="#4a90a4" strokeWidth="2" className="bee-wings" />
            <circle cx="60" cy="50" r="20" fill="#f4c430" stroke="#d4a428" strokeWidth="2" />
            <circle cx="52" cy="46" r="3" fill="#2c2c2c" />
            <circle cx="68" cy="46" r="3" fill="#2c2c2c" />
            <path d="M 54 54 Q 60 57 66 54" stroke="#2c2c2c" strokeWidth="2" fill="none" strokeLinecap="round" />
            <ellipse cx="60" cy="70" rx="22" ry="18" fill="#f4c430" stroke="#d4a428" strokeWidth="2" />
            <ellipse cx="60" cy="70" rx="18" ry="16" fill="none" stroke="#2c2c2c" strokeWidth="3" />
            <ellipse cx="60" cy="80" rx="18" ry="4" fill="#2c2c2c" />
            <ellipse cx="60" cy="95" rx="24" ry="22" fill="#ffd700" stroke="#d4a428" strokeWidth="2" />
            <path d="M 38 90 Q 60 92 82 90" stroke="#2c2c2c" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 36 100 Q 60 102 84 100" stroke="#2c2c2c" strokeWidth="3" fill="none" strokeLinecap="round" />
            <line x1="50" y1="80" x2="40" y2="100" stroke="#2c2c2c" strokeWidth="2" strokeLinecap="round" />
            <line x1="70" y1="80" x2="80" y2="100" stroke="#2c2c2c" strokeWidth="2" strokeLinecap="round" />
          </svg>

          {/* Hive building (optional SVG fallback) */}
          <svg className="hive-svg" viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg">
            <rect x="50" y="80" width="200" height="280" fill="#4a9b8e" stroke="#2d6b64" strokeWidth="2" />
            <polygon points="50,80 150,20 250,80" fill="#d4a574" stroke="#2d6b64" strokeWidth="2" />
            <rect x="70" y="100" width="50" height="50" fill="#f4d9a6" stroke="#8b7355" strokeWidth="1" />
            <line x1="95" y1="100" x2="95" y2="150" stroke="#8b7355" />
            <line x1="70" y1="125" x2="120" y2="125" stroke="#8b7355" />
            <rect x="140" y="100" width="50" height="50" fill="#f4d9a6" stroke="#8b7355" strokeWidth="1" />
            <line x1="165" y1="100" x2="165" y2="150" stroke="#8b7355" />
            <line x1="140" y1="125" x2="190" y2="125" stroke="#8b7355" />
            <rect x="210" y="100" width="50" height="50" fill="#f4d9a6" stroke="#8b7355" strokeWidth="1" />
            <line x1="235" y1="100" x2="235" y2="150" stroke="#8b7355" />
            <line x1="210" y1="125" x2="260" y2="125" stroke="#8b7355" />
            <rect x="70" y="170" width="50" height="50" fill="#f4d9a6" stroke="#8b7355" strokeWidth="1" />
            <line x1="95" y1="170" x2="95" y2="220" stroke="#8b7355" />
            <line x1="70" y1="195" x2="120" y2="195" stroke="#8b7355" />
            <rect x="140" y="170" width="50" height="50" fill="#f4d9a6" stroke="#8b7355" strokeWidth="1" />
            <line x1="165" y1="170" x2="165" y2="220" stroke="#8b7355" />
            <line x1="140" y1="195" x2="190" y2="195" stroke="#8b7355" />
            <rect x="210" y="170" width="50" height="50" fill="#f4d9a6" stroke="#8b7355" strokeWidth="1" />
            <line x1="235" y1="170" x2="235" y2="220" stroke="#8b7355" />
            <line x1="210" y1="195" x2="260" y2="195" stroke="#8b7355" />
            <rect x="70" y="240" width="50" height="50" fill="#f4d9a6" stroke="#8b7355" strokeWidth="1" />
            <line x1="95" y1="240" x2="95" y2="290" stroke="#8b7355" />
            <line x1="70" y1="265" x2="120" y2="265" stroke="#8b7355" />
            <rect x="140" y="240" width="50" height="50" fill="#f4d9a6" stroke="#8b7355" strokeWidth="1" />
            <line x1="165" y1="240" x2="165" y2="290" stroke="#8b7355" />
            <line x1="140" y1="265" x2="190" y2="265" stroke="#8b7355" />
            <rect x="210" y="240" width="50" height="50" fill="#f4d9a6" stroke="#8b7355" strokeWidth="1" />
            <line x1="235" y1="240" x2="235" y2="290" stroke="#8b7355" />
            <line x1="210" y1="265" x2="260" y2="265" stroke="#8b7355" />
            <rect x="135" y="310" width="30" height="50" fill="#8b7355" stroke="#2d6b64" strokeWidth="1" />
            <circle cx="162" cy="335" r="2" fill="#d4a574" />
            <ellipse cx="150" cy="360" rx="120" ry="20" fill="#6ba594" opacity="0.3" />
          </svg>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="form-section">
        <div className="form-container">
          {/* Logo & Title */}
          <div className="form-header">
            <h1>DormHive</h1>
            <p>Your Hub for Campus Living</p>
          </div>

          {/* Role Selection */}
          <div className="role-selection">
            <button
              type="button"
              className={`role-btn ${role === 'owner' ? 'active' : ''}`}
              onClick={() => setRole('owner')}
            >
              Dorm Owner
            </button>
            <button
              type="button"
              className={`role-btn ${role === 'tenant' ? 'active' : ''}`}
              onClick={() => setRole('tenant')}
            >
              Tenant
            </button>
          </div>

          {/* Login Form */}
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

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'LOGIN'}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="signup-link">
            Don't have an account?{' '}
            <Link to="/signup">
              Sign up now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Welcome;