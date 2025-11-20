import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export default function MyBills({ amountDue, paymentSchedule, getScheduleLabel, getNextDueDate }) {
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  // payment form states
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentType, setPaymentType] = useState(null); // 'rent' | 'utility'
  const [manualAmount, setManualAmount] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const openPaymentForm = (type) => {
    setPaymentType(type);
    setShowPaymentOptions(false);
    setShowPaymentForm(true);
    setManualAmount('');
    setReceiptFile(null);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleFileChange = (e) => {
    setReceiptFile(e.target.files?.[0] || null);
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

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
      const token = localStorage.getItem('token');
      const form = new FormData();
      if (manualAmount) form.append('amount', manualAmount);
      form.append('type', paymentType === 'rent' ? 'rent' : 'utility');
      if (receiptFile) form.append('receipt', receiptFile);

      // backend should derive tenant from token; adjust endpoint if your API differs
      const res = await axios.post(`${API_URL}/bills`, form, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          // Note: axios will set correct multipart boundary for FormData automatically
        },
      });

      setSuccessMsg(res.data?.message || 'Payment record submitted. Owner will verify receipt.');
      setShowPaymentForm(false);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit payment. Try again.');
      console.error('Payment submit error:', err);
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
        <button
          className="submit-btn"
          onClick={() => setShowPaymentOptions((s) => !s)}
          type="button"
        >
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
    </div>
  );
}