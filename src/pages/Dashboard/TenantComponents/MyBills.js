import React, { useEffect, useState } from 'react';
import axios from 'axios';

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

export default function MyBills({ amountDue, paymentSchedule, getScheduleLabel, getNextDueDate }) {
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentType, setPaymentType] = useState(null); // 'rent'|'utility'
  const [manualAmount, setManualAmount] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [bills, setBills] = useState([]);
  const [loadingBills, setLoadingBills] = useState(false);

  const parseAmountDue = (str) => {
    if (!str) return '';
    const n = parseFloat(String(str).replace(/[^0-9.-]+/g, ''));
    return Number.isFinite(n) ? String(n) : '';
  };

  const getValidToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return { ok: false, reason: 'missing' };
    const payload = parseJwt(token);
    if (!payload) return { ok: false, reason: 'invalid' };
    if (payload.exp && Date.now() >= payload.exp * 1000) return { ok: false, reason: 'expired' };
    return { ok: true, token };
  };

  const fetchBills = async () => {
    setLoadingBills(true);
    setErrorMsg('');
    try {
      const { ok, token, reason } = getValidToken();
      if (!ok) {
        if (reason === 'missing') setErrorMsg('Not authenticated — please sign in.');
        else if (reason === 'expired') setErrorMsg('Session expired — please sign in again.');
        else setErrorMsg('Invalid session token.');
        setBills([]);
        return;
      }

      const res = await axios.get(`${API_URL}/bills`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBills(res.data?.bills || []);
    } catch (err) {
      console.error('Failed fetching bills:', err);
      setErrorMsg(err.response?.data?.message || 'Could not load your payments.');
      setBills([]);
    } finally {
      setLoadingBills(false);
    }
  };

  useEffect(() => {
    fetchBills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openPaymentForm = (type) => {
    setPaymentType(type);
    setShowPaymentOptions(false);
    const noBills = !bills || bills.length === 0;
    if (type === 'rent' && noBills) {
      setManualAmount(parseAmountDue(amountDue));
    } else {
      setManualAmount('');
    }
    setReceiptFile(null);
    setShowPaymentForm(true);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleFileChange = (e) => setReceiptFile(e.target.files?.[0] || null);

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const { ok, token, reason } = getValidToken();
    if (!ok) {
      if (reason === 'missing') setErrorMsg('Not authenticated — please sign in.');
      else if (reason === 'expired') setErrorMsg('Session expired — please sign in again.');
      else setErrorMsg('Invalid session token.');
      return;
    }

    if (!manualAmount && !receiptFile) {
      setErrorMsg('Please provide an amount and/or upload a receipt.');
      return;
    }
    const amountVal = manualAmount ? Number(manualAmount) : null;
    if (manualAmount && (isNaN(amountVal) || amountVal <= 0)) {
      setErrorMsg('Please enter a valid amount.');
      return;
    }

    setSubmitting(true);
    try {
      const form = new FormData();
      if (manualAmount) form.append('amount', manualAmount);
      form.append('type', paymentType === 'rent' ? 'rent' : 'utility');
      if (receiptFile) form.append('receipt', receiptFile);

      await axios.post(`${API_URL}/bills`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccessMsg('Payment submitted. Verification pending.');
      setShowPaymentForm(false);
      await fetchBills();
    } catch (err) {
      console.error('Payment submit error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to submit payment. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: 12, padding: 12, background: '#fff', border: '1px solid #eee', borderRadius: 6 }}>
      <div style={{ marginBottom: 8 }}>
        <strong>Rent Due:</strong> {amountDue}
      </div>
      <div style={{ marginBottom: 8 }}>
        <strong>Schedule of Payment:</strong> {getScheduleLabel(paymentSchedule)}
      </div>
      <div style={{ marginBottom: 12 }}>
        <strong>Next Due Date:</strong> {getNextDueDate(paymentSchedule)}
      </div>

      <div style={{ marginTop: 8 }}>
        <button className="submit-btn" onClick={() => setShowPaymentOptions((s) => !s)} type="button">
          Proceed to Payment
        </button>
      </div>

      {showPaymentOptions && (
        <div style={{ marginTop: 12, padding: 12, background: '#f9f9ff', border: '1px solid #e6e6ff', borderRadius: 6 }}>
          <div style={{ marginBottom: 8, fontWeight: 600 }}>Kindly choose the payment category:</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="submit-btn" onClick={() => openPaymentForm('rent')}>Rent</button>
            <button type="button" className="submit-btn" onClick={() => openPaymentForm('utility')}>Utility Bills</button>
          </div>
        </div>
      )}

      {showPaymentForm && (
        <form onSubmit={handleSubmitPayment} style={{ marginTop: 12, padding: 12, background: '#fff', border: '1px solid #eee', borderRadius: 6 }}>
          <div style={{ marginBottom: 8 }}>
            <strong>Payment Type:</strong> {paymentType === 'rent' ? 'Rent' : 'Utility Bills'}
          </div>

          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>Amount (optional if uploading receipt)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter amount paid"
              value={manualAmount}
              onChange={(e) => setManualAmount(e.target.value)}
              style={{ padding: 8, width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>Upload receipt (image or PDF)</label>
            <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} />
            {receiptFile && <div style={{ marginTop: 6, fontSize: 13 }}>{receiptFile.name}</div>}
          </div>

          {errorMsg && <div style={{ color: '#c33', marginBottom: 8 }}>{errorMsg}</div>}
          {successMsg && <div style={{ color: '#188a00', marginBottom: 8 }}>{successMsg}</div>}

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="submit-btn" type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Payment'}
            </button>
            <button
              type="button"
              className="submit-btn"
              onClick={() => {
                setShowPaymentForm(false);
                setPaymentType(null);
                setManualAmount('');
                setReceiptFile(null);
                setErrorMsg('');
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div style={{ marginTop: 16 }}>
        <h4>Submitted Payments</h4>
        {loadingBills ? (
          <div style={{ fontStyle: 'italic' }}>Loading payments...</div>
        ) : bills.length === 0 ? (
          <div style={{ color: '#666' }}>No submitted payments yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {bills.map((b) => (
              <div key={b.id} style={{ padding: 8, borderRadius: 6, border: '1px solid #eee', background: '#fafafa' }}>
                <div><strong>Type:</strong> {b.type}</div>
                <div><strong>Amount:</strong> ${Number(b.amount || 0).toFixed(2)}</div>
                <div><strong>Status:</strong> {b.status}</div>
                <div><strong>Verification:</strong> {b.verification}</div>
                <div style={{ fontSize: 12, color: '#666' }}>{new Date(b.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}