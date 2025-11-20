import React from 'react';

export default function SummarySection({
  totalProperties = 0,
  totalRooms = 0,
  occupiedRooms = 0,
  availableRooms = 0,
  totalTenants = 0,
}) {
  return (
    <div className="summary-grid" style={{ marginTop: 18 }}>
      <div className="summary-card" role="region" aria-label="Properties summary">
        <div className="summary-card-title">Properties</div>
        <div className="summary-card-value">{totalProperties}</div>
        <div className="summary-card-sub">Total owned</div>
      </div>

      <div className="summary-card" role="region" aria-label="Rooms summary">
        <div className="summary-card-title">Rooms</div>
        <div className="summary-card-value">{totalRooms}</div>
        <div className="summary-card-sub">{occupiedRooms} occupied • {availableRooms} available</div>
      </div>

      <div className="summary-card" role="region" aria-label="Tenants summary">
        <div className="summary-card-title">Tenants</div>
        <div className="summary-card-value">{totalTenants}</div>
        <div className="summary-card-sub">Active tenants</div>
      </div>
    </div>
  );
}