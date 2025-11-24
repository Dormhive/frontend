import React, { useEffect, useState } from 'react';

const API_URL = 'http://localhost:3001/api';
export default function Finance() {
  const [pendingBills, setPendingBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  async function fetchPendingBills() {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Decode JWT to see user id (for debugging only)
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('[Finance.js] Sending user.id:', payload.id || payload.userId || payload.user_id || payload.sub, 'role:', payload.role);
      }
      const res = await fetch('/api/bills/owner', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPendingBills(data.bills || []);
    } catch (err) {
      setPendingBills([]);
    }
    setLoading(false);
  }
  fetchPendingBills();
}, []);

  return (
    <div className="dashboard-container">
      <div style={{ marginBottom: 8 }}>
        <h2 style={{ margin: 0 }}>Finance</h2>
        <p style={{ margin: 0 }}>Unverified (Pending) Bills</p>
      </div>

      <section>
        {loading ? (
          <p>Loading...</p>
        ) : pendingBills.length === 0 ? (
          <p>No pending bills found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tenant ID</th>
                <th>Room ID</th>
                <th>Year</th>
                <th>Month</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {pendingBills.map(bill => (
                <tr key={bill.id}>
                  <td>{bill.id}</td>
                  <td>{bill.tenantid}</td>
                  <td>{bill.roomid}</td>
                  <td>{bill.year}</td>
                  <td>{bill.month}</td>
                  <td>{bill.status}</td>
                  <td>{bill.due_date ? new Date(bill.due_date).toLocaleDateString() : ''}</td>
                  <td>
                    {bill.receipt ? (
                      <a href={`/uploads/${bill.receipt}`} target="_blank" rel="noopener noreferrer">View</a>
                    ) : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}