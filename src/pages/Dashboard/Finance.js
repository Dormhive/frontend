import React, { useEffect, useState } from 'react';

const API_URL = 'http://localhost:3001/api';

export default function Finance() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBills() {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');

        // optional debug: decode token payload for troubleshooting (safe to drop in production)
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('[Finance.js] user.id:', payload.id || payload.userId || payload.user_id || payload.sub, 'role:', payload.role);
          } catch (err) {
            // ignore decode errors
          }
        }

        const res = await fetch(`${API_URL}/bills/owner`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setBills(data.bills || []);
      } catch (err) {
        setBills([]);
      } finally {
        setLoading(false);
      }
    }

    fetchBills();
  }, []);

  return (
    <div className="dashboard-container">
      <div style={{ marginBottom: 8 }}>
        <h2 style={{ margin: 0 }}>Finance</h2>
        <p style={{ margin: 0 }}>Unverified (Pending) Bills</p>
      </div>

      <section>
        <h3>Tenant Bills</h3>
        {loading ? (
          <p>Loading...</p>
        ) : bills.length === 0 ? (
          <p>No bills found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
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
                  <td>{bill.roomid ?? '-'}</td>
                  <td>{bill.tenantid ?? '-'}</td>
                  <td>{bill.tenant_name ?? '-'}</td>
                  <td>{bill.monthlyRent ?? '-'}</td>
                  <td>{bill.amount_due ?? bill.amount ?? '-'}</td>
                  <td>{bill.year ?? '-'}</td>
                  <td>{bill.month ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}