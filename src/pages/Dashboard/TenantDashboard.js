import React from 'react';
import './Dashboard.css';

function TenantDashboard() {
  return (
    <div className="dashboard-container">
      <h2>Tenant Dashboard</h2>
      <p>Welcome to your housing dashboard.</p>
      <div className="dashboard-content">
        <section>
          <h3>My Room</h3>
          <p>View details about your current room.</p>
        </section>
        <section>
          <h3>Lease Agreement</h3>
          <p>View your lease terms and conditions.</p>
        </section>
        <section>
          <h3>Maintenance Requests</h3>
          <p>Submit and track maintenance requests.</p>
        </section>
      </div>
    </div>
  );
}

export default TenantDashboard;