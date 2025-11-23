import React from 'react';
import '../TenantComponents/tenantOverview.css';

export default function OverviewPage({ loading, error, room, owner, property }) {
  return (
    <div className="tenant-dashboard-base">
      <div className="tenant-dashboard-header">
        <h2>Overview</h2>
        <p>Your current announcements, payments, tickets, and room info</p>
      </div>
      <section className="dashboard-container tenant-dashboard-overview">
        <div className="tenant-sections-grid">
          {/* Announcements */}
          <section className="tenant-announcement-section">
            <h2>Announcements</h2>
            {/* Announcements content here */}
          </section>

          {/* Payment Due */}
          <section className="tenant-payment-section">
            <h2>Payment Due</h2>
            {/* Payment info here */}
          </section>

          {/* Submitted Tickets */}
          <section className="tenant-tickets-section">
            <h2>Submitted Tickets</h2>
            {/* Tickets info here */}
          </section>

          {/* My Room Info */}
          <section className="tenant-roominfo-section">
            <h2>My Room Info</h2>
            {loading && <div>Loading...</div>}
            {error && <div style={{ color: 'red' }}>{error}</div>}
            {!loading && !error && room && property && (
              <div>
                <div><b>Property:</b> {property.propertyName}</div>
                <div><b>Address:</b> {property.address}</div>
                <div><b>Room Number:</b> {room.roomNumber}</div>
                <div><b>Room Type:</b> {room.type}</div>
                <div><b>Monthly Rent:</b> {room.monthlyRent ? `$${parseFloat(room.monthlyRent).toFixed(2)}` : 'N/A'}</div>
                <div><b>Capacity:</b> {room.capacity}</div>
                <div><b>Owner:</b> {owner ? `${owner.firstName} ${owner.lastName}` : 'N/A'}</div>
              </div>
            )}
            {!loading && !error && !room && (
              <div>No room assigned.</div>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}