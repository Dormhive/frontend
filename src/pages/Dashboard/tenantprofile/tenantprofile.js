import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    emergencyContact: '',
    profilePicture: ''
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [originalProfile, setOriginalProfile] = useState(null);

  // picture-specific state (independent from editing other fields)
  const [pictureEditing, setPictureEditing] = useState(false);
  const [selectedPictureFile, setSelectedPictureFile] = useState(null);
  const [pictureSaving, setPictureSaving] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const previewRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    async function fetchProfile() {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const storedId = localStorage.getItem('userId'); // fallback id
        let url = `${API_URL}/profiles/me`;
        if (!token && storedId) url += `?id=${encodeURIComponent(storedId)}`;

        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(url, { headers });
        if (!mounted) return;
        const data = res.data?.profile || res.data?.user || {};
        setProfile({
          firstName: data.firstName || data.first_name || '',
          lastName: data.lastName || data.last_name || '',
          email: data.email || '',
          phone: data.phone || '',
          emergencyContact: data.emergencyContact || data.emergency_contact || '',
          profilePicture: data.profilePicture || data.profile_picture || ''
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
        console.error('fetchProfile error', err?.response || err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchProfile();
    return () => { mounted = false; };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'email') return; // keep email read-only
    setProfile((p) => ({ ...p, [name]: value }));
  };

  const handlePictureFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    setSelectedPictureFile(f);
    if (f && previewRef.current) previewRef.current.src = URL.createObjectURL(f);
  };

  const handleCancel = () => {
    if (originalProfile) setProfile(originalProfile);
    setSelectedPictureFile(null);
    setEditing(false);
    setOriginalProfile(null);
    setError('');
    setSuccess('');
  };

  async function handleSaveProfile(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const res = await axios.put(`${API_URL}/profiles/me`, {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        emergencyContact: profile.emergencyContact
      }, { headers });

      const data = res.data?.profile || res.data?.user || {};
      setProfile({
        firstName: data.firstName || data.first_name || '',
        lastName: data.lastName || data.last_name || '',
        email: data.email || '',
        phone: data.phone || '',
        emergencyContact: data.emergencyContact || data.emergency_contact || '',
        profilePicture: data.profilePicture || data.profile_picture || profile.profilePicture
      });

      setSuccess('Profile updated successfully');
      setEditing(false);
      setOriginalProfile(null);
    } catch (err) {
      console.error('handleSaveProfile error', err?.response || err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  async function handleUploadPicture(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (!selectedPictureFile) {
      setError('No picture selected');
      return;
    }

    setError('');
    setSuccess('');
    setPictureSaving(true);

    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('profilePicture', selectedPictureFile, selectedPictureFile.name);

      const res = await axios.put(`${API_URL}/profiles/me`, fd, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = res.data?.profile || res.data?.user || {};
      setProfile((p) => ({
        ...p,
        profilePicture: data.profilePicture || data.profile_picture || p.profilePicture
      }));

      setSelectedPictureFile(null);
      setPictureEditing(false);
      setSuccess('Profile photo updated');
    } catch (err) {
      console.error('handleUploadPicture error', err?.response || err);
      setError(err.response?.data?.message || 'Failed to upload picture');
    } finally {
      setPictureSaving(false);
    }
  }

  const handleTogglePictureEdit = () => {
    setSelectedPictureFile(null);
    setPictureEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancelPictureEdit = () => {
    setSelectedPictureFile(null);
    setPictureEditing(false);
    if (previewRef.current) {
      if (profile.profilePicture) previewRef.current.src = `${API_URL.replace('/api', '')}/uploads/${profile.profilePicture}`;
      else previewRef.current.removeAttribute('src');
    }
    setError('');
    setSuccess('');
  };

  const handlePrimary = async (e) => {
    if (!editing) {
      setOriginalProfile(profile);
      setEditing(true);
      setSuccess('');
      setError('');
      return;
    }
    await handleSaveProfile(e);
  };

  if (loading) return <div className="tenant-profile">Loading profile…</div>;

  // UI look only — no function changes
  const pageStyle = {
    display: 'flex',
    justifyContent: 'center',
    padding: '32px 24px',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    color: '#222'
  };

  const cardStyle = {
    width: '100%',
    maxWidth: 980,
    background: '#ffffffcc',
    padding: 24,
    borderRadius: 12,
    boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
    border: '1px solid rgba(0,0,0,0.04)'
  };

  const headerArea = {
    display: 'flex',
    alignItems: 'center',
    gap: 22,
    marginBottom: 18
  };

  const photoBox = {
    width: 140,
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    background: '#f7f7f7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px dashed rgba(0,0,0,0.06)'
  };

  const headerText = { flex: 1 };
  const titleStyle = { margin: 0, fontSize: 22, fontWeight: 700 };
  const subtitleStyle = { margin: '6px 0 0', color: '#6b6b6b' };

  const formArea = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 8 };
  const fullWidth = { gridColumn: '1 / -1' };

  const labelStyle = { display: 'block', marginBottom: 8, fontWeight: 700, color: '#333', fontSize: 13 };
  const displayBox = { padding: 12, background: '#f4f6f7', borderRadius: 8, color: '#444' };
  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.08)', fontSize: 14 };

  const actions = { display: 'flex', gap: 12, marginTop: 18, justifyContent: 'flex-end' };
  const primaryBtn = { flex: 1, padding: '10px 14px', borderRadius: 8, background: '#ffb74d', border: 'none', cursor: 'pointer', color: '#fff', fontWeight: 700 };
  const cancelBtn = { flex: 1, padding: '10px 14px', borderRadius: 8, background: '#9e9e9e', border: 'none', cursor: 'pointer', color: '#fff' };

  const msgError = { marginBottom: 12, padding: '10px 12px', background: '#ffefef', color: '#b00020', borderRadius: 8, border: '1px solid #ffd7d7' };
  const msgSuccess = { marginBottom: 12, padding: '10px 12px', background: '#f0fff2', color: '#1b7a23', borderRadius: 8, border: '1px solid #d7f2d7' };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={headerArea}>
          <div style={photoBox}>
            {selectedPictureFile ? (
              <img ref={previewRef} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : profile.profilePicture ? (
              <img ref={previewRef} src={`${API_URL.replace('/api', '')}/uploads/${profile.profilePicture}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ color: '#9aa0a6', fontSize: 13 }}>No photo</div>
            )}
          </div>

          <div style={headerText}>
            <h2 style={titleStyle}>My Profile</h2>
            <p style={subtitleStyle}>Manage your account information</p>
            <div style={{ marginTop: 10 }}>
              {!pictureEditing ? (
                <button
                  type="button"
                  onClick={handleTogglePictureEdit}
                  style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.06)', background: '#fff', cursor: 'pointer' }}
                >
                  Change Photo
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="file" accept="image/*" onChange={handlePictureFileChange} disabled={pictureSaving} />
                  <button type="button" onClick={handleUploadPicture} disabled={pictureSaving} style={{ padding: '8px 12px', borderRadius: 8, background: '#4caf50', color: '#fff', border: 'none', cursor: 'pointer' }}>
                    {pictureSaving ? 'Uploading…' : 'Upload'}
                  </button>
                  <button type="button" onClick={handleCancelPictureEdit} disabled={pictureSaving} style={{ padding: '8px 12px', borderRadius: 8, background: '#e0e0e0', border: 'none', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {error && <div style={msgError}>{error}</div>}
        {success && <div style={msgSuccess}>{success}</div>}

        <form onSubmit={handleSaveProfile}>
          <div style={formArea}>
            <div>
              <label style={labelStyle}>First name</label>
              {editing ? (
                <input name="firstName" value={profile.firstName} onChange={handleInputChange} style={inputStyle} />
              ) : (
                <div style={displayBox}>{profile.firstName || '—'}</div>
              )}
            </div>

            <div>
              <label style={labelStyle}>Last name</label>
              {editing ? (
                <input name="lastName" value={profile.lastName} onChange={handleInputChange} style={inputStyle} />
              ) : (
                <div style={displayBox}>{profile.lastName || '—'}</div>
              )}
            </div>

            {!editing && (
              <div style={fullWidth}>
                <label style={labelStyle}>Email</label>
                <div style={displayBox}>{profile.email || '—'}</div>
              </div>
            )}

            <div>
              <label style={labelStyle}>Phone</label>
              {editing ? (
                <input name="phone" value={profile.phone} onChange={handleInputChange} style={inputStyle} />
              ) : (
                <div style={displayBox}>{profile.phone || '—'}</div>
              )}
            </div>

            <div>
              <label style={labelStyle}>Emergency contact</label>
              {editing ? (
                <input name="emergencyContact" value={profile.emergencyContact} onChange={handleInputChange} style={inputStyle} />
              ) : (
                <div style={displayBox}>{profile.emergencyContact || '—'}</div>
              )}
            </div>
          </div>

          <div style={actions}>
            <button type="button" onClick={handlePrimary} disabled={saving} style={primaryBtn}>
              {editing ? (saving ? 'Saving...' : 'Save Changes') : 'Edit Information'}
            </button>

            {editing && (
              <button type="button" onClick={handleCancel} disabled={saving} style={cancelBtn}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}