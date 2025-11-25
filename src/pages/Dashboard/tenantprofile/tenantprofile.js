import React, { useEffect, useState } from 'react';
import '../TenantDashboard.css';        // corrected relative path
import './tenantprofile.css';          // local styles for this component

export default function TenantProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    emergencyContact: '',
    profile_picture: null,
  });

  useEffect(() => {
    let mounted = true;
    async function fetchProfile() {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('/api/tenants/profile', {
          headers: { Authorization: token ? `Bearer ${token}` : '' },
        });
        if (!res.ok) {
          console.warn('/api/tenants/profile GET failed', res.status);
          if (mounted) setLoading(false);
          return;
        }
        const data = await res.json();
        if (!mounted) return;
        setProfile({
          fullName: data.fullName || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          emergencyContact: data.emergencyContact || '',
          profile_picture: data.profile_picture || null,
        });
        setPreviewUrl(data.profile_picture ? `/uploads/${data.profile_picture}` : null);
      } catch (err) {
        console.error('fetch profile error', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchProfile();
    return () => { mounted = false; };
  }, []);

  function handleFile(e) {
    const f = e.target.files?.[0] || null;
    if (f) {
      setProfile((p) => ({ ...p, profile_picture: f }));
      setPreviewUrl(URL.createObjectURL(f));
    }
  }

  async function save(e) {
    e?.preventDefault();
    setSaving(true);
    setMessage('');
    const token = localStorage.getItem('token');

    try {
      const opts = { method: 'PUT', headers: { Authorization: token ? `Bearer ${token}` : '' } };

      if (profile.profile_picture instanceof File) {
        const fd = new FormData();
        fd.append('fullName', profile.fullName);
        fd.append('email', profile.email);
        fd.append('phone', profile.phone);
        fd.append('address', profile.address);
        fd.append('emergencyContact', profile.emergencyContact);
        fd.append('profile_picture', profile.profile_picture);
        opts.body = fd;
      } else {
        opts.headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify({
          fullName: profile.fullName,
          email: profile.email,
          phone: profile.phone,
          address: profile.address,
          emergencyContact: profile.emergencyContact,
        });
      }

      const res = await fetch('/api/tenants/profile', opts);
      const body = await res.json();

      if (!res.ok) {
        setMessage(body?.message || 'Failed to save profile');
      } else {
        setMessage('Profile saved');
        const pic = body?.profile?.profile_picture || body?.profile_picture;
        if (pic) {
          setPreviewUrl(`/uploads/${pic}`);
          setProfile((p) => ({ ...p, profile_picture: pic }));
        }
      }
    } catch (err) {
      console.error('save profile error', err);
      setMessage('Error saving profile');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="card tenant-profile">Loading profile…</div>;

  return (
    <div className="card tenant-profile">
      <div className="card-head">
        <div>
          <div className="card-title">My Profile</div>
          <div className="card-small">Manage your tenant profile</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '.85rem', color: '#666' }}>Status</div>
          <div style={{ fontWeight: 700 }}>{profile.email ? 'Active' : 'Incomplete'}</div>
        </div>
      </div>

      <form onSubmit={save} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 16, marginTop: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          <div className="profile-avatar">
            {previewUrl ? <img src={previewUrl} alt="avatar" /> : <div className="avatar-placeholder">{(profile.fullName || 'T')[0].toUpperCase()}</div>}
          </div>
          <input type="file" accept="image/*" onChange={handleFile} />
        </div>

        <div style={{ display: 'grid', gap: 8 }}>
          <label>
            <div className="card-small">Full name</div>
            <input className="input-field" value={profile.fullName} onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))} />
          </label>

          <label>
            <div className="card-small">Email</div>
            <input className="input-field" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} />
          </label>

          <label>
            <div className="card-small">Phone</div>
            <input className="input-field" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
          </label>

          <label>
            <div className="card-small">Address</div>
            <input className="input-field" value={profile.address} onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))} />
          </label>

          <label>
            <div className="card-small">Emergency contact</div>
            <input className="input-field" value={profile.emergencyContact} onChange={(e) => setProfile((p) => ({ ...p, emergencyContact: e.target.value }))} />
          </label>

          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <button type="submit" className="submit-btn" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            <button type="button" className="cancel-btn" onClick={() => setMessage('')}>Cancel</button>
            {message && <div style={{ marginLeft: 10, color: '#333' }}>{message}</div>}
          </div>
        </div>
      </form>
    </div>
  );
}