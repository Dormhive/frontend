import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../TenantPages/Rent.css';

const API_URL = 'http://localhost:3001/api';

export default function History() {
  const [bills, setBills] = useState([]);
  const [loadingBills, setLoadingBills] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupSrc, setPopupSrc] = useState('');
  const [zoom, setZoom] = useState(1);

  const fetchBills = async () => {
    setLoadingBills(true);
    setErrorMsg('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setErrorMsg('Not authenticated — please sign in.');
        setBills([]);
        return;
      }
      const res = await axios.get(`${API_URL}/bills`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBills(res.data?.bills || []);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Could not load your payments.');
      setBills([]);
    } finally {
      setLoadingBills(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  // For parent to trigger refresh
  History.refresh = fetchBills;

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