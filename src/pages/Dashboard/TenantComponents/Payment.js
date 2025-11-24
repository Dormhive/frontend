import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../TenantPages/Rent.css';

const API_URL = 'http://localhost:3001/api';

export default function Payment({ onPaymentSuccess }) {
  const [dueBills, setDueBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentType, setPaymentType] = useState('rent');
  const [manualAmount, setManualAmount] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedBillId, setSelectedBillId] = useState('');
  const [selectedDueDate, setSelectedDueDate] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  useEffect(() => {
    const fetchDueBills = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setErrorMsg('Not authenticated — please sign in.');
          setDueBills([]);
          return;
        }
        const res = await axios.get(`${API_URL}/bills/rent`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Ensure due_date is always in YYYY-MM-DD format
        const bills = (res.data?.bills || []).map(bill => ({
          ...bill,
          due_date: bill.due_date,
        }));
        setDueBills(bills);
        console.log('Fetched dueBills:', bills);
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'Could not load your bills.');
        setDueBills([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDueBills();
  }, []);

  const getOverdueDays = (due_date) => {
    const due = new Date(due_date);
    const now = new Date();
    const diff = Math.floor((now - due) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const openPaymentForm = () => {
    // Filter to only show Unpaid bills in the payment form
    const unpaidBills = dueBills.filter(bill => bill.status === 'Unpaid');
    if (unpaidBills.length > 0) {
      setSelectedBillId(unpaidBills[0].id);
      setSelectedDueDate(unpaidBills[0].due_date);
      setManualAmount(unpaidBills[0].amount_due || unpaidBills[0].amount || '');
      // Extract year and month from due_date
      if (unpaidBills[0].due_date) {
        const d = new Date(unpaidBills[0].due_date);
        setSelectedYear(d.getFullYear());
        setSelectedMonth(d.getMonth() + 1);
      } else {
        setSelectedYear('');
        setSelectedMonth('');
      }
    } else {
      setSelectedBillId('');
      setSelectedDueDate('');
      setManualAmount('');
      setSelectedYear('');
      setSelectedMonth('');
    }
    setPaymentType('rent');
    setReceiptFile(null);
    setShowPaymentForm(true);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleDueDateChange = (e) => {
    const billId = e.target.value;
    const bill = dueBills.find(b => String(b.id) === String(billId));
    setSelectedBillId(billId);
    setSelectedDueDate(bill?.due_date || '');
    setManualAmount(bill?.amount_due || bill?.amount || '');
    // Extract year and month from due_date
    if (bill?.due_date) {
      const d = new Date(bill.due_date);
      setSelectedYear(d.getFullYear());
      setSelectedMonth(d.getMonth() + 1);
    } else {
      setSelectedYear('');
      setSelectedMonth('');
    }
    console.log('Selected bill:', bill);
    console.log('Selected due_date:', bill?.due_date);
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

    if (!selectedBillId) {
      setErrorMsg('Please select a due date to pay.');
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
      form.append('type', paymentType);
      if (receiptFile) form.append('receipt', receiptFile);

      // Send year and month instead of due_date
      form.append('year', selectedYear);
      form.append('month', selectedMonth);

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
      <strong>Payment Due:</strong>
      {loading ? (
        <span>Loading...</span>
      ) : dueBills.length === 0 ? (
        <span> No unpaid bills.</span>
      ) : (
        <div className="bills-summary">
          {dueBills
            .filter(bill => {
              console.log('Filtering bill:', bill.id, 'Status:', bill.status, 'Keep:', bill.status !== 'Paid');
              return bill.status !== 'Paid';
            })
            .map((bill) => {
              let statusClass = '';
              let statusLabel = '';
              let daysInfo = '';

              console.log('Rendering bill:', bill.id, 'Status:', bill.status);

              if (bill.status === 'Pending') {
                statusClass = 'bill-pending';
                statusLabel = 'Pending Verification';
                console.log('Applied PENDING style for Pending bill:', bill.id);
              } else if (bill.status === 'Unpaid') {
                // Calculate days difference
                const dueDate = new Date(bill.due_date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                dueDate.setHours(0, 0, 0, 0);
                const diffTime = dueDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays < 0) {
                  // Overdue
                  statusClass = 'bill-overdue';
                  daysInfo = `Overdue: ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
                  statusLabel = 'Unpaid';
                  console.log('Applied OVERDUE style for Overdue bill:', bill.id, 'Days:', Math.abs(diffDays));
                } else {
                  // Upcoming
                  statusClass = 'bill-upcoming';
                  daysInfo = `Due in: ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
                  statusLabel = 'Unpaid';
                  console.log('Applied UPCOMING style for Upcoming bill:', bill.id, 'Days:', diffDays);
                }
              } else {
                console.log('No style applied for bill:', bill.id, 'Status:', bill.status);
              }

              return (
                <div key={bill.id} className={`bill-card ${statusClass}`}>
                  <div className="bill-header">
                    <span className="bill-date">Due Date: {new Date(bill.due_date).toLocaleDateString()}</span>
                    <span className="bill-status">{statusLabel}</span>
                  </div>
                  <div className="bill-details">
                    <div className="bill-detail-item">
                      <span className="bill-detail-label">Amount Due:</span> ₱{Number(bill.amount_due || bill.amount || 0).toFixed(2)}
                    </div>
                    <div className="bill-detail-item">
                      <span className="bill-detail-label">Schedule:</span> {bill.paymentfrequency}
                    </div>
                    {daysInfo && (
                      <div className="bill-detail-item">
                        <span className="bill-detail-label">{daysInfo}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          <button
            className="pay-now-btn"
            type="button"
            onClick={openPaymentForm}
          >
            Pay Now
          </button>
        </div>
      )}
    </div>

      {successMsg && (
        <div className="mybills-success">
          {successMsg}
        </div>
      )}

      {showPaymentForm && (
        <form onSubmit={handleSubmitPayment} className="mybills-form">
          <div className="mybills-form-row">
            <label className="mybills-label">Select Due Date</label>
            <select
              value={selectedBillId}
              onChange={handleDueDateChange}
              className="mybills-input"
              required
            >
              {dueBills
                .filter(bill => bill.status === 'Unpaid')
                .map((bill) => (
                  <option key={bill.id} value={bill.id}>
                    {new Date(bill.due_date).toLocaleDateString()}
                  </option>
                ))}
            </select>
          </div>

          <div className="mybills-form-row">
            <strong>Payment Type:</strong> Rent
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
                setPaymentType('rent');
                setManualAmount('');
                setReceiptFile(null);
                setErrorMsg('');
                setSelectedBillId('');
                setSelectedDueDate('');
                setSelectedYear('');
                setSelectedMonth('');
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