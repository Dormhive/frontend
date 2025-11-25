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

export default function OwnerProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // edit state
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        console.log('ownerprofile - token present:', !!token, token ? `${token.slice(0, 10)}...` : null);
        const decoded = token ? parseJwt(token) : null;
        console.log('ownerprofile - decoded token payload:', decoded);

        if (!token) {
          console.warn('ownerprofile - no token found, redirecting to login');
          navigate('/', { replace: true });
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        };
        console.log('ownerprofile - Request -> GET', `${API_URL}/owners/me/profile`, 'Headers:', headers);

        const res = await fetch(`${API_URL}/owners/me/profile`, { headers });
        console.log('ownerprofile - response status:', res.status);

        let data = null;
        try {
          data = await res.json();
          console.log('ownerprofile - response body (json):', data);
        } catch (parseErr) {
          const raw = await res.text().catch(() => null);
          console.log('ownerprofile - response body (text):', raw);
        }

        if (!res.ok) {
          if (res.status === 401) {
            console.warn('ownerprofile - unauthorized (401). Clearing token and redirecting to login.');
            localStorage.removeItem('token');
            navigate('/', { replace: true });
            throw new Error('Unauthorized - please sign in again');
          }
          const msg = data?.error || data?.message || `HTTP ${res.status}`;
          throw new Error(msg);
        }

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

  // prepare form when entering edit mode
  useEffect(() => {
    if (editing && user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || ''
      });
      setSaveError(null);
      setSaveSuccess(null);
    }
  }, [editing, user]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone
      };

      console.log('ownerprofile - Request -> PUT', `${API_URL}/owners/me/profile`, { payload, token: !!token });
      const res = await fetch(`${API_URL}/owners/me/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('ownerprofile - save response status:', res.status);
      const data = await res.json().catch(() => null);
      console.log('ownerprofile - save response body:', data);

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token');
          navigate('/', { replace: true });
          throw new Error('Unauthorized');
        }
        throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
      }

      setUser(data?.user || { ...user, ...payload });
      setEditing(false);
      setSaveSuccess('Profile saved');
    } catch (err) {
      setSaveError(String(err.message || err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="owner-profile">Loading profile…</div>;
  if (error) return <div className="owner-profile error">Error: {error}</div>;
  if (!user) return <div className="owner-profile">No profile data available.</div>;

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || '—';

  return (
    <div className="owner-profile">
      <h2>Profile</h2>

      {!editing && (
        <>
          <div className="profile-row"><strong>ID:</strong> {user.id}</div>
          <div className="profile-row"><strong>Name:</strong> {fullName}</div>
          <div className="profile-row"><strong>Email:</strong> {user.email || '—'}</div>
          <div className="profile-row"><strong>Phone:</strong> {user.phone || '—'}</div>
          <div style={{ marginTop: 12 }}>
            <button onClick={() => setEditing(true)} style={{ marginRight: 8 }}>Edit</button>
          </div>
        </>
      )}

      {editing && (
        <form onSubmit={handleSave} style={{ maxWidth: 520 }}>
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', fontSize: 13 }}>First name</label>
            <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          </div>

          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', fontSize: 13 }}>Last name</label>
            <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </div>

          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', fontSize: 13 }}>Email</label>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>

          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', fontSize: 13 }}>Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>

          {saveError && <div style={{ color: 'red', marginBottom: 8 }}>{saveError}</div>}
          {saveSuccess && <div style={{ color: 'green', marginBottom: 8 }}>{saveSuccess}</div>}

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            <button type="button" onClick={() => setEditing(false)} disabled={saving}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}