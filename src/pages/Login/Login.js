import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const API_URL = 'http://localhost:3001/api/auth';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

   const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(`${API_URL}/login`, formData);

      // DEBUG: log full response to verify role returned by backend
      console.log('Login response:', response.data);

      // Save token and user role (use value from response, not from other sources)
      const { token, user } = response.data;
      if (!user || !user.role) {
        throw new Error('Missing user role in login response');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('userRole', user.role);

      // explicit mapping: owner -> /owner, tenant -> /tenant, fallback to root
      if (user.role === 'owner') {
        console.log('user.role:', user.role);
        navigate('/owner', { replace: true });
      } else if (user.role === 'tenant') {
        console.log('user.role:', user.role);
        navigate('/tenant', { replace: true });
      } else {
        // unexpected role: log and go to home
        console.warn('Unexpected user.role:', user.role);
        navigate('/', { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred during login.');
    }
  };

  return (
    <div className="login-container">
      <h2>Login to Your Account</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        {error && <p className="form-error">{error}</p>}
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <button type="submit" className="submit-btn">
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;