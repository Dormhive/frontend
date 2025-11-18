import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Signup.css';

const API_URL = 'http://localhost:3001/api/auth';

function Signup() {
  const [role, setRole] = useState('tenant'); // 'tenant' or 'owner'
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (!agreedToTerms) {
      return setError('You must agree to the Terms and Conditions.');
    }

    try {
      const payload = { ...formData, role };
      const response = await axios.post(`${API_URL}/signup`, payload);
      setMessage(response.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during signup.');
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-layout">
        <div className="signup-illustration">
          {/* replace with your existing hive/bee SVG or component */}
          <div className="hive-container">
            {/* ...existing illustration markup... */}
          </div>
        </div>

        <div className="signup-container">
          {/* Header styled like Welcome/Login */}
          <div className="form-header">
            <h1>DormHive</h1>
            <p>Your Hub for Campus Living</p>
          </div>

          <h2 className="create-title">Create Your Account</h2>

          <div className="role-selector" role="tablist" aria-label="Account role">
            <button
              type="button"
              className={role === 'tenant' ? 'active' : ''}
              onClick={() => setRole('tenant')}
            >
              I am a Tenant
            </button>
            <button
              type="button"
              className={role === 'owner' ? 'active' : ''}
              onClick={() => setRole('owner')}
            >
              I am an Owner
            </button>
          </div>

          <form className="signup-form" onSubmit={handleSubmit} noValidate>
            {error && <p className="form-error">{error}</p>}
            {message && <p className="form-success">{message}</p>}

            <div className="form-group">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="terms-container">
              <div className="terms-box">
                <p><strong>Terms and Conditions</strong></p>
                <p>
                  This is the default terms and conditions text. By checking this
                  box, you agree to our terms of service, privacy policy, and all
                  house rules set forth by property owners. You also agree to
                  receive OTP messages for verification.
                </p>
              </div>

              <label className="terms-checkbox">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                />
                I agree to the Terms and Conditions
              </label>
            </div>

            <button type="submit" className="submit-btn" disabled={!agreedToTerms}>
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;