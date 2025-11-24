import React, { useEffect, useState } from 'react';
<<<<<<< HEAD
=======

const API_URL = 'http://localhost:3001/api';
>>>>>>> d5cf48c (finance page commit)

const API_URL = 'http://localhost:3001/api';
export default function Finance() {
<<<<<<< HEAD
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
=======
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBills() {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/bills/owner`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setBills(data.bills || []);
      } catch (err) {
        setBills([]);
      }
      setLoading(false);
    }
    fetchBills();
  }, []);
>>>>>>> d5cf48c (finance page commit)

  return (
    <div className="dashboard-container">
      <div style={{ marginBottom: 8 }}>
        <h2 style={{ margin: 0 }}>Finance</h2>
        <p style={{ margin: 0 }}>Unverified (Pending) Bills</p>
      </div>

      <section>
<<<<<<< HEAD
        {loading ? (
          <p>Loading...</p>
        ) : pendingBills.length === 0 ? (
          <p>No pending bills found.</p>
=======
        <h3>Tenant Bills</h3>
        {loading ? (
          <p>Loading...</p>
        ) : bills.length === 0 ? (
          <p>No bills found.</p>
>>>>>>> d5cf48c (finance page commit)
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
<<<<<<< HEAD
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
=======
                <th>Status</th>
                <th>Due Date</th>
                <th>Room ID</th>
                <th>Tenant ID</th>
                <th>Tenant Name</th>
                <th>Monthly Rent</th>
                <th>Amount Due</th>
                <th>Year</th>
                <th>Month</th>
              </tr>
            </thead>
            <tbody>
              {bills.map(bill => (
                <tr key={bill.id}>
                  <td>{bill.status}</td>
                  <td>{bill.due_date ? new Date(bill.due_date).toLocaleDateString() : '-'}</td>
                  <td>{bill.roomid}</td>
                  <td>{bill.tenantid}</td>
                  <td>{bill.tenant_name}</td>
                  <td>{bill.monthlyRent}</td>
                  <td>{bill.amount_due || bill.amount}</td>
                  <td>{bill.year}</td>
                  <td>{bill.month}</td>
>>>>>>> d5cf48c (finance page commit)
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}