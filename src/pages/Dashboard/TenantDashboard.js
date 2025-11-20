import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TenantDashboard.css';
import MyBills from './TenantComponents/MyBills';

// optional icons — add these files to frontend/src/assets/top-icons/
// td1.png, td2.png, td3.png, td4.png (small PNG/SVG icons)
import icon1 from '../../assets/top-icons/td1.png';
import icon2 from '../../assets/top-icons/td2.png';
import icon3 from '../../assets/top-icons/td3.png';
import icon4 from '../../assets/top-icons/td4.png';

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

function isTokenValid(token) {
  if (!token) return false;
  const payload = parseJwt(token);
  if (!payload) return false;
  if (payload.exp && Date.now() >= payload.exp * 1000) return false;
  return true;
}

export default function TenantDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState(null);
  const [room, setRoom] = useState(null);
  const [owner, setOwner] = useState(null);
  const [property, setProperty] = useState(null);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('Overview');
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketText, setTicketText] = useState('');
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketError, setTicketError] = useState(null);
  const [ticketSuccess, setTicketSuccess] = useState(null);

  const tabs = [
    { key: 'Overview', label: 'Overview', icon: icon1 },
    { key: 'My Bills', label: 'My Bills', icon: icon2 },
    { key: 'Payment History', label: 'Payment History', icon: icon3 },
    { key: 'Invoice', label: 'Invoice', icon: icon4 },
    { key: 'Submit Ticket', label: 'Submit Ticket', icon: icon1 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');

        // if token exists but invalid, clear it to avoid repeated 401s
        if (token && !isTokenValid(token)) {
          localStorage.removeItem('token');
          setUserId(null);
          setUserName(null);
        } else if (token && isTokenValid(token)) {
          const payload = parseJwt(token);
          if (payload) {
            const id = payload.id || payload.userId || payload.sub || null;
            const name =
              payload.name ||
              (payload.firstName
                ? `${payload.firstName} ${payload.lastName || ''}`.trim()
                : null) ||
              payload.email ||
              null;
            setUserId(id);
            setUserName(name);
          }
        }

        const headers = isTokenValid(localStorage.getItem('token'))
          ? { Authorization: `Bearer ${localStorage.getItem('token')}` }
          : {};

        const res = await axios.get(`${API_URL}/properties/tenants/me/room`, { headers });
        setRoom(res.data?.room || null);
        setOwner(res.data?.owner || null);
        setProperty(res.data?.property || null);
      } catch (err) {
        // clear token on 401 (unauthenticated) and show friendly message
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          setUserId(null);
          setUserName(null);
          setError('Not authenticated — please sign in.');
        } else if (err.response?.status === 404) {
          setRoom(null);
          setOwner(null);
          setProperty(null);
          setError(null);
        } else {
          setError(err.response?.data?.message || 'Failed to load room information');
          setRoom(null);
          setOwner(null);
          setProperty(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const normalizeSchedule = (sched) => {
    if (!sched) return 'Every 1st day of every month';
    const s = String(sched).toLowerCase();
    if (s.includes('15')) return 'Every 15th day of every month';
    return 'Every 1st day of every month';
  };

  const getScheduleLabel = (sched) => normalizeSchedule(sched);

  const getNextDueDate = (sched) => {
    const normalized = normalizeSchedule(sched);
    const day = normalized.includes('15') ? 15 : 1;
    const today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth();
    if (today.getDate() > day) {
      month = month + 1;
      if (month > 11) {
        month = 0;
        year += 1;
      }
    }
    const due = new Date(year, month, day);
    return due.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const amountDue = (room && room.monthlyRent != null)
    ? `$${parseFloat(room.monthlyRent).toFixed(2)}`
    : 'N/A';

  const paymentSchedule = normalizeSchedule(room && (room.paymentSchedule || room.tenantPaymentSchedule));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    navigate('/', { replace: true });
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    setTicketError(null);
    setTicketSuccess(null);

    const text = (ticketText || '').trim();
    if (!text) {
      setTicketError('Please enter a complaint or message.');
      return;
    }
    if (!room || !property) {
      setTicketError('No room/property information available.');
      return;
    }

    setTicketSubmitting(true);
    try {
      const headers = isTokenValid(localStorage.getItem('token'))
        ? { Authorization: `Bearer ${localStorage.getItem('token')}` }
        : {};

      const payload = {
        tenantId: userId,
        ownerId: owner?.id || room.owner_id || null,
        propertyId: property?.id || null,
        roomId: room.id,
        message: text,
      };

      await axios.post(`${API_URL}/tickets`, payload, { headers });

      setTicketSuccess('Ticket submitted to owner.');
      setTicketText('');
      setShowTicketForm(false);
      setActiveTab('Overview');
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        setUserId(null);
        setUserName(null);
        setTicketError('Not authenticated — please sign in.');
      } else {
        setTicketError(err.response?.data?.message || 'Failed to submit ticket');
      }
    } finally {
      setTicketSubmitting(false);
    }
  };

  const onTabClick = (tabKey) => {
    setActiveTab(tabKey);
    if (tabKey === 'Submit Ticket') setShowTicketForm(true);
    else setShowTicketForm(false);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-topbar">
        <div className="brand-left">
          <div className="brand-title">DormHive</div>
        </div>

        <div className="topbar-tabs" role="tablist" aria-label="Dashboard tabs">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`tab ${activeTab === t.key ? 'active' : ''}`}
              onClick={() => onTabClick(t.key)}
            >
              {t.icon && <img src={t.icon} alt={`${t.label} icon`} className="tab-icon" />}
              <span className="tab-label">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="topbar-actions">
          <div className="user-inline" title={userName || ''}>
            <div className="user-name-short">{userName || 'Not signed in'}</div>
            <div className="user-id-short">{userId ? String(userId) : 'N/A'}</div>
          </div>
          <button className="submit-btn" type="button" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="dashboard-content">
        {activeTab === 'Overview' && (
          <section>
            <h3>My Room</h3>
            {loading && <p style={{ fontStyle: 'italic', color: '#666' }}>Loading...</p>}
            {!loading && error && (
              <div style={{ background: '#ffe6e6', padding: 12, borderRadius: 6, color: '#c33' }}>
                <strong>Error:</strong> {error}
              </div>
            )}
            {!loading && !error && !room && (
              <div style={{ background: '#f0f0f0', padding: 12, borderRadius: 6, color: '#666' }}>
                Not yet assigned to any room.
              </div>
            )}
            {!loading && !error && room && (
              <div style={{ background: '#fafafa', padding: 16, borderRadius: 8, border: '1px solid #eee' }}>
                <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #eee' }}>
                  <span style={{ fontWeight: 600 }}>Owner:</span>{' '}
                  {room ? `${room.owner_firstName || (owner && owner.firstName) || 'N/A'} ${room.owner_lastName || (owner && owner.lastName) || ''}`.trim() : 'N/A'}
                </div>

                <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #eee' }}>
                  <span style={{ fontWeight: 600 }}>Property:</span>{' '}
                  {property ? property.propertyName : 'N/A'}
                </div>

                <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #eee' }}>
                  <span style={{ fontWeight: 600 }}>Address:</span>{' '}
                  {property ? property.address : 'N/A'}
                </div>

                <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #eee' }}>
                  <span style={{ fontWeight: 600 }}>Room ID:</span> {room.id ?? 'N/A'}
                </div>

                <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #eee' }}>
                  <span style={{ fontWeight: 600 }}>Room Number:</span> {room.roomNumber ?? 'N/A'}
                </div>

                <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #eee' }}>
                  <span style={{ fontWeight: 600 }}>Room Type:</span> {room.type || 'N/A'}
                </div>

                <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #eee' }}>
                  <span style={{ fontWeight: 600 }}>Monthly Rent:</span>{' '}
                  {room.monthlyRent != null ? `$${parseFloat(room.monthlyRent).toFixed(2)}` : 'N/A'}
                </div>

                {room.capacity != null && (
                  <div>
                    <span style={{ fontWeight: 600 }}>Capacity:</span> {room.capacity}{' '}
                    {room.capacity === 1 ? 'person' : 'people'}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {activeTab === 'My Bills' && (
          <section>
            <MyBills
              amountDue={amountDue}
              paymentSchedule={paymentSchedule}
              getScheduleLabel={getScheduleLabel}
              getNextDueDate={getNextDueDate}
            />
          </section>
        )}

        {activeTab === 'Payment History' && (
          <section>
            <h3>Payment History</h3>
            <p>Payment history not implemented yet.</p>
          </section>
        )}

        {activeTab === 'Invoice' && (
          <section>
            <h3>Invoice</h3>
            <p>Invoice module not implemented yet.</p>
          </section>
        )}

        {(activeTab === 'Submit Ticket' || showTicketForm) && (
          <section style={{ marginTop: 20 }}>
            <h3>Submit Ticket</h3>
            <form onSubmit={handleSubmitTicket} style={{ marginTop: 12, background: '#fff', padding: 12, border: '1px solid #eee', borderRadius: 6 }}>
              <div style={{ marginBottom: 8 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Describe your complaint</label>
                <textarea
                  value={ticketText}
                  onChange={(e) => setTicketText(e.target.value)}
                  rows={5}
                  style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                  placeholder="Type your complaint or message to the owner..."
                  required
                />
              </div>

              {ticketError && (
                <div style={{ marginBottom: 8, color: '#c33' }}>
                  {ticketError}
                </div>
              )}
              {ticketSuccess && (
                <div style={{ marginBottom: 8, color: '#188a00' }}>
                  {ticketSuccess}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="submit-btn" type="submit" disabled={ticketSubmitting}>
                  {ticketSubmitting ? 'Submitting...' : 'Send to Owner'}
                </button>
                <button
                  type="button"
                  className="submit-btn"
                  onClick={() => {
                    setShowTicketForm(false);
                    setTicketText('');
                    setTicketError(null);
                    setTicketSuccess(null);
                    setActiveTab('Overview');
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}