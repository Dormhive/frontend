import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../TenantPages/MyBills.css';

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
  const [paymentType, setPaymentType] = useState(null);
  const [manualAmount, setManualAmount] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [bills, setBills] = useState([]);
  const [loadingBills, setLoadingBills] = useState(false);

  const [popupOpen, setPopupOpen] = useState(false);
  const [popupSrc, setPopupSrc] = useState('');
  const [zoom, setZoom] = useState(1);

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

  const handleViewReceipt = (receipt) => {
    setPopupSrc(`http://localhost:3001/uploads/${receipt}`);
    setZoom(1);
    setPopupOpen(true);
  };

  const handleClosePopup = () => {
    setPopupOpen(false);
    setPopupSrc('');
    setZoom(1);
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));

  return (
    <div className="mybills-container">
      <div className="mybills-section">
        <strong>Rent Due:</strong> {amountDue}
      </div>
      <div className="mybills-section">
        <strong>Schedule of Payment:</strong> {getScheduleLabel(paymentSchedule)}
      </div>
      <div className="mybills-section">
        <strong>Next Due Date:</strong> {getNextDueDate(paymentSchedule)}
      </div>

      <div className="mybills-btn-row">
        <button className="submit-btn" onClick={() => setShowPaymentOptions((s) => !s)} type="button">
          Proceed to Payment
        </button>
      </div>

      {successMsg && (
        <div className="mybills-success">
          {successMsg}
        </div>
      )}

      {showPaymentOptions && (
        <div className="mybills-options">
          <div className="mybills-options-title">Kindly choose the payment category:</div>
          <div className="mybills-btn-row">
            <button type="button" className="submit-btn" onClick={() => openPaymentForm('rent')}>Rent</button>
            <button type="button" className="submit-btn" onClick={() => openPaymentForm('utility')}>Utility Bills</button>
          </div>
        </div>
      )}

      {showPaymentForm && (
        <form onSubmit={handleSubmitPayment} className="mybills-form">
          <div className="mybills-form-row">
            <strong>Payment Type:</strong> {paymentType === 'rent' ? 'Rent' : 'Utility Bills'}
          </div>

          <div className="mybills-form-row">
            <label className="mybills-label">Amount (optional if uploading receipt)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter amount paid"
              value={manualAmount}
              onChange={(e) => setManualAmount(e.target.value)}
              className="mybills-input"
            />
          </div>

          <div className="mybills-form-row">
            <label className="mybills-label">Upload receipt (image or PDF)</label>
            <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} className="mybills-input" />
            {receiptFile && <div className="mybills-file">{receiptFile.name}</div>}
          </div>

          {errorMsg && <div className="mybills-error">{errorMsg}</div>}

          <div className="mybills-btn-row">
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

      <div className="mybills-history">
        <h4>Payment History</h4>
        {loadingBills ? (
          <div className="mybills-loading">Loading payments...</div>
        ) : bills.length === 0 ? (
          <div className="mybills-empty">No submitted payments yet.</div>
        ) : (
          <div className="mybills-history-list">
            {bills.map((b) => (
              <div key={b.id} className="mybills-history-item">
                <div><strong>Type:</strong> {b.type}</div>
                <div><strong>Amount:</strong> ${Number(b.amount || 0).toFixed(2)}</div>
                <div><strong>Status:</strong> {b.status}</div>
                <div><strong>Verification:</strong> {b.verification}</div>
                <div>
                  <strong>Receipt:</strong>{' '}
                  {b.receipt ? (
                    <button
                      type="button"
                      className="mybills-view-btn"
                      onClick={() => handleViewReceipt(b.receipt)}
                    >
                      View
                    </button>
                  ) : (
                    'N/A'
                  )}
                </div>
                <div className="mybills-date">{new Date(b.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {popupOpen && (
        <div className="mybills-popup-overlay" onClick={handleClosePopup}>
          <div className="mybills-popup" onClick={(e) => e.stopPropagation()}>
            <img
              src={popupSrc}
              alt="Receipt"
              className="mybills-popup-img"
              style={{
                transform: `scale(${zoom})`,
                transition: 'transform 0.2s',
              }}
            />
            <div className="mybills-popup-zoom">
              <button onClick={handleZoomOut}>-</button>
              <span>{Math.round(zoom * 100)}%</span>
              <button onClick={handleZoomIn}>+</button>
            </div>
            <button
              onClick={handleClosePopup}
              className="mybills-popup-close"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}