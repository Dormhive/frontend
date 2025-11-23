import React, { useState } from 'react';
import axios from 'axios';
import '../TenantPages/MyBills.css';

const API_URL = 'http://localhost:3001/api';

export default function Payment({ amountDue, paymentSchedule, getScheduleLabel, getNextDueDate, onPaymentSuccess }) {
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentType, setPaymentType] = useState(null);
  const [manualAmount, setManualAmount] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const parseAmountDue = (str) => {
    if (!str) return '';
    const n = parseFloat(String(str).replace(/[^0-9.-]+/g, ''));
    return Number.isFinite(n) ? String(n) : '';
  };

  const openPaymentForm = (type) => {
    setPaymentType(type);
    setShowPaymentOptions(false);
    setManualAmount(type === 'rent' ? parseAmountDue(amountDue) : '');
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

    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMsg('Not authenticated — please sign in.');
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
      if (onPaymentSuccess) onPaymentSuccess();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit payment. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
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
    </div>
  );
}