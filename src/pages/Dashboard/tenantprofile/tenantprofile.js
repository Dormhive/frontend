import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3001/api';

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export default function TenantProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        console.log('tenantprofile - token present:', !!token, token ? `${token.slice(0, 10)}...` : null);
        const decoded = token ? parseJwt(token) : null;
        console.log('tenantprofile - decoded token payload:', decoded);

        if (!token) {
          console.warn('tenantprofile - no token found, redirecting to login');
          navigate('/', { replace: true });
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        };
        console.log('tenantprofile - Request -> GET', `${API_URL}/tenants/me/profile`, 'Headers:', headers);

        const res = await fetch(`${API_URL}/tenants/me/profile`, { headers });
        console.log('tenantprofile - response status:', res.status);

        let data = null;
        try {
          data = await res.json();
          console.log('tenantprofile - response body (json):', data);
        } catch (parseErr) {
          const raw = await res.text().catch(() => null);
          console.log('tenantprofile - response body (text):', raw);
        }

        if (!res.ok) {
          if (res.status === 401) {
            console.warn('tenantprofile - unauthorized (401). Clearing token and redirecting to login.');
            localStorage.removeItem('token');
            navigate('/', { replace: true });
            throw new Error('Unauthorized - please sign in again');
          }
          const msg = data?.error || data?.message || `HTTP ${res.status}`;
          throw new Error(msg);
        }

        // adapted to camelCase fields returned by backend
        setUser(data?.user || null);
      } catch (err) {
        setError(String(err.message || err));
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) return <div className="tenant-profile">Loading profile…</div>;
  if (error) return <div className="tenant-profile error">Error: {error}</div>;
  if (!user) return <div className="tenant-profile">No profile data available.</div>;

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || '—';
  return (
    <div className="tenant-profile">
      <h2>Profile</h2>
      <div className="profile-row"><strong>ID:</strong> {user.id}</div>
      <div className="profile-row"><strong>Name:</strong> {fullName}</div>
      <div className="profile-row"><strong>Email:</strong> {user.email || '—'}</div>
      <div className="profile-row"><strong>Phone:</strong> {user.phone || '—'}</div>
      <div className="profile-row"><strong>Role:</strong> {user.role || '—'}</div>
      <div className="profile-row"><strong>Created:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleString() : '—'}</div>
    </div>
  );
}