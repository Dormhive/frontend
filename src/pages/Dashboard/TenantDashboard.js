import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TenantDashboard.css';
import icon1 from '../../assets/top-icons/td1.png';
import icon2 from '../../assets/top-icons/td2.png';
import icon3 from '../../assets/top-icons/td3.png';
import icon4 from '../../assets/top-icons/td4.png';

// Page components
import OverviewPage from './TenantPages/Overview';
import MyBillsPage from './TenantPages/MyBills';
import PaymentHistoryPage from './TenantPages/PaymentHistory';
import InvoicePage from './TenantPages/Invoice';
import SubmitTicketPage from './TenantPages/Tickets';

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

        const res = await fetch(`${API_URL}/properties/tenants/me/room`, { headers });
        const data = await res.json();
        setRoom(data?.room || null);
        setOwner(data?.owner || null);
        setProperty(data?.property || null);
      } catch (err) {
        setError('Failed to load room information');
        setRoom(null);
        setOwner(null);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Utility functions
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

      await fetch(`${API_URL}/tickets`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      setTicketSuccess('Ticket submitted to owner.');
      setTicketText('');
      setShowTicketForm(false);
      setActiveTab('Overview');
    } catch (err) {
      setTicketError('Failed to submit ticket');
    } finally {
      setTicketSubmitting(false);
    }
  };

  const onTabClick = (tabKey) => {
    setActiveTab(tabKey);
    setShowTicketForm(tabKey === 'Submit Ticket');
  };

  // Render correct page
  let PageComponent = null;
  switch (activeTab) {
    case 'Overview':
      PageComponent = (
        <OverviewPage
          loading={loading}
          error={error}
          room={room}
          owner={owner}
          property={property}
        />
      );
      break;
    case 'My Bills':
      PageComponent = (
        <MyBillsPage
          amountDue={amountDue}
          paymentSchedule={paymentSchedule}
          getScheduleLabel={getScheduleLabel}
          getNextDueDate={getNextDueDate}
        />
      );
      break;
    case 'Payment History':
      PageComponent = <PaymentHistoryPage />;
      break;
    case 'Invoice':
      PageComponent = <InvoicePage />;
      break;
    case 'Submit Ticket':
      PageComponent = (
        <SubmitTicketPage
          ticketText={ticketText}
          setTicketText={setTicketText}
          ticketError={ticketError}
          ticketSuccess={ticketSuccess}
          ticketSubmitting={ticketSubmitting}
          handleSubmitTicket={handleSubmitTicket}
          handleCancel={() => {
            setShowTicketForm(false);
            setTicketText('');
            setTicketError(null);
            setTicketSuccess(null);
            setActiveTab('Overview');
          }}
        />
      );
      break;
    default:
      PageComponent = null;
  }

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
        {PageComponent}
      </div>
    </div>
  );
}