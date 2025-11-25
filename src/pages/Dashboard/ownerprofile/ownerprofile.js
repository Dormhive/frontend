import React, { useEffect, useState } from 'react';
import '../OwnerDashboard.css';
import './ownerprofile.css';

export default function OwnerProfile() {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    emergencyContact: '',
    profile_picture: null,
  });

  const [original, setOriginal] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function fetchProfile() {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('/api/owners/profile', {
          headers: { Authorization: token ? `Bearer ${token}` : '' },
        });
        if (!res.ok) { if (mounted) setLoading(false); return; }
        const data = await res.json();
        if (!mounted) return;

        let firstName = data.firstName || '';
        let lastName = data.lastName || '';
        if (!firstName && !lastName && data.fullName) {
          const parts = String(data.fullName || '').trim().split(/\s+/);
          firstName = parts.shift() || '';
          lastName = parts.join(' ') || '';
        }

        const next = {
          firstName,
          lastName,
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          emergencyContact: data.emergencyContact || '',
          profile_picture: data.profile_picture || null,
        };

        setProfile(next);
        setOriginal(next);
        setPreviewUrl(data.profile_picture ? `/uploads/${data.profile_picture}` : null);
      } catch (err) {
        console.error('owner fetch error', err);
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

  function startEdit() {
    setMessage('');
    setEditing(true);
    if (original) setProfile(original);
  }

  function cancelEdit() {
    setMessage('');
    setEditing(false);
    if (original) setProfile(original);
    if (original?.profile_picture) setPreviewUrl(original.profile_picture ? `/uploads/${original.profile_picture}` : null);
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
        fd.append('firstName', profile.firstName);
        fd.append('lastName', profile.lastName);
        fd.append('email', profile.email);
        fd.append('phone', profile.phone);
        fd.append('address', profile.address);
        fd.append('emergencyContact', profile.emergencyContact);
        fd.append('profile_picture', profile.profile_picture);
        opts.body = fd;
      } else {
        opts.headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phone: profile.phone,
          address: profile.address,
          emergencyContact: profile.emergencyContact,
        });
      }
      const res = await fetch('/api/owners/profile', opts);
      const body = await res.json();
      if (!res.ok) setMessage(body?.message || 'Failed to save profile');
      else {
        setMessage('Profile saved');
        const pic = body?.profile?.profile_picture || body?.profile_picture;
        if (pic) {
          setPreviewUrl(`/uploads/${pic}`);
          setProfile((p) => ({ ...p, profile_picture: pic }));
        }
        const updatedSnapshot = {
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phone: profile.phone,
          address: profile.address,
          emergencyContact: profile.emergencyContact,
          profile_picture: (pic || profile.profile_picture) ?? null,
        };
        setOriginal(updatedSnapshot);
        setProfile(updatedSnapshot);
        setEditing(false);
      }
    } catch (err) {
      console.error('owner save error', err);
      setMessage('Error saving profile');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="card owner-profile">Loading profile…</div>;

  const initials = (profile.firstName || 'O')[0]?.toUpperCase();

  return (
    <div className="card owner-profile">
      <div className="card-head">
        <div>
          <div className="card-title">Owner Profile</div>
          <div className="card-small">View or edit your owner account</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '.85rem', color: '#666' }}>Status</div>
          <div style={{ fontWeight: 700 }}>{profile.email ? 'Active' : 'Incomplete'}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 16, marginTop: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          <div className="profile-avatar">
            {previewUrl ? <img src={previewUrl} alt="avatar" /> : <div className="avatar-placeholder">{initials}</div>}
          </div>
          {editing ? <input type="file" accept="image/*" onChange={handleFile} /> : null}
        </div>

        <div style={{ display: 'grid', gap: 8 }}>
          {!editing ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <div className="card-small">First name</div>
                  <div style={{ padding: 8 }}>{profile.firstName || '—'}</div>
                </div>
                <div>
                  <div className="card-small">Last name</div>
                  <div style={{ padding: 8 }}>{profile.lastName || '—'}</div>
                </div>
              </div>

              <div>
                <div className="card-small">Email</div>
                <div style={{ padding: 8 }}>{profile.email || '—'}</div>
              </div>

              <div>
                <div className="card-small">Phone</div>
                <div style={{ padding: 8 }}>{profile.phone || '—'}</div>
              </div>

              <div>
                <div className="card-small">Address</div>
                <div style={{ padding: 8 }}>{profile.address || '—'}</div>
              </div>

              <div>
                <div className="card-small">Emergency contact</div>
                <div style={{ padding: 8 }}>{profile.emergencyContact || '—'}</div>
              </div>

              <div style={{ marginTop: 12 }}>
                <button className="submit-btn" onClick={startEdit}>Edit profile</button>
              </div>
            </>
          ) : (
            <form onSubmit={save} style={{ display: 'grid', gap: 8 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <label>
                  <div className="card-small">First name</div>
                  <input className="input-field" value={profile.firstName} onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))} />
                </label>

                <label>
                  <div className="card-small">Last name</div>
                  <input className="input-field" value={profile.lastName} onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))} />
                </label>
              </div>

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
                <button type="button" className="cancel-btn" onClick={cancelEdit} disabled={saving}>Cancel</button>
                {message && <div className="message">{message}</div>}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}