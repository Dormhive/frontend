import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const categories = [
  'Other',
  'Payment',
  'People',
  'Request Repair'
];

// Helper to format the date for history
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return `Sent just now`;
  if (diffMin < 60) return `Sent ${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  if (diffHr < 24) return `Sent ${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
  if (diffDay === 1) return `Sent yesterday`;
  if (diffDay < 7) return `Sent ${diffDay} days ago`;
  return `Sent at ${date.toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })}`;
}

export default function SubmitTicketPage({ tenantid, ownerid, propertyid, roomid }) {
  const [ticketText, setTicketText] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [ticketError, setTicketError] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState('');
  const [ticketSubmitting, setTicketSubmitting] = useState(false);

  // Concerns history state
  const [concerns, setConcerns] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterWord, setFilterWord] = useState('');

  // Fetch concerns history
  useEffect(() => {
    const fetchConcerns = async () => {
      setHistoryLoading(true);
      try {
        const token = localStorage.getItem('token');
        const params = {};
        if (filterMonth) params.month = filterMonth;
        if (filterWord) params.word = filterWord;
        const res = await axios.get(`${API_URL}/concerns/history`, {
          params,
          headers: { Authorization: `Bearer ${token}` }
        });
        setConcerns(res.data.concerns || []);
      } catch (err) {
        setConcerns([]);
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchConcerns();
  }, [filterMonth, filterWord, ticketSuccess]);

  // Get unique months for filter dropdown
  const months = Array.from(
    new Set(concerns.map(c => new Date(c.created_at).toLocaleString('default', { month: 'long', year: 'numeric' })))
  );

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    setTicketError('');
    setTicketSuccess('');
    setTicketSubmitting(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setTicketError('Not authenticated.');
      setTicketSubmitting(false);
      return;
    }

    // Log values for debugging
    console.log('Submitting ticket:', {
      tenantid,
      ownerid,
      propertyid,
      roomid,
      category,
      message: ticketText
    });

    if (!tenantid || !ownerid || !propertyid || !roomid) {
      setTicketError('Missing required information (tenant, owner, room, or property).');
      setTicketSubmitting(false);
      return;
    }

    try {
      await axios.post(`${API_URL}/concerns`, {
        tenantid,
        ownerid,
        propertyid,
        roomid,
        category,
        message: ticketText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTicketSuccess('Ticket submitted successfully.');
      setTicketText('');
    } catch (err) {
      setTicketError(err.response?.data?.message || `Failed to submit ticket. ${err.message}`);
    } finally {
      setTicketSubmitting(false);
    }
  };

  const handleCancel = () => {
    setTicketText('');
    setCategory(categories[0]);
    setTicketError('');
    setTicketSuccess('');
  };

  return (
    <section style={{ marginTop: 20 }}>
      <h3>Submit Ticket</h3>
      <form onSubmit={handleSubmitTicket} style={{ marginTop: 12, background: '#fff', padding: 12, border: '1px solid #eee', borderRadius: 6 }}>
        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Category</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', marginBottom: 8 }}
            required
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
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
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Concerns History */}
      <div style={{ marginTop: 40 }}>
        <h4>My Concerns History</h4>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <select
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
          >
            <option value="">All Months</option>
            {months.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Find word..."
            value={filterWord}
            onChange={e => setFilterWord(e.target.value)}
            style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc', minWidth: 160 }}
          />
        </div>
        {historyLoading ? (
          <div style={{ color: '#888' }}>Loading...</div>
        ) : concerns.length === 0 ? (
          <div style={{ color: '#888' }}>This is where your complaints will appear. 🐝</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {concerns
              .filter(c => !filterMonth || new Date(c.created_at).toLocaleString('default', { month: 'long', year: 'numeric' }) === filterMonth)
              .filter(c => !filterWord || c.message.toLowerCase().includes(filterWord.toLowerCase()))
              .map(c => (
                <div key={c.id} style={{
                  background: '#f8f8ff',
                  border: '1px solid #eee',
                  borderRadius: 8,
                  padding: 16,
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 8,
                    left: 12,
                    fontSize: 13,
                    color: '#555',
                    opacity: 0.6,
                    fontStyle: 'italic'
                  }}>
                    {formatDate(c.created_at)}
                  </div>
                  <div style={{ marginTop: 28 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{c.category}</div>
                    <div>{c.message}</div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}