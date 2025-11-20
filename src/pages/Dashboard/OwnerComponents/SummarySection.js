import React from 'react';

export default function SummarySection({
  totalProperties = 0,
  totalRooms = 0,
  occupiedRooms = 0,
  availableRooms = 0,
  totalTenants = 0,
  concernsCount = 0,
  monthlyRent = null,
  overdueAmount = null,
  reminders = [], // array of reminder strings
  onOpenConcerns = null,
}) {
  const occupancyPct = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
  const displayMonthly = typeof monthlyRent === 'number' ? `$${monthlyRent.toLocaleString()}` : '—';
  const displayOverdue = typeof overdueAmount === 'number' ? `$${overdueAmount.toLocaleString()}` : '—';

  return (
    <div className="summary-wrap">
      <div className="urgent-banner" role="status" aria-live="polite">
        URGENT: CRITICAL ISSUES REQUIRE IMMEDIATE ATTENTION
      </div>

      <div className="summary-grid-subdiv" aria-label="Summary grid">
        {/* Occupancy Status */}
        <div className="card occupancy-card" role="region" aria-label="Occupancy status">
          <div className="card-head">
            <div>
              <div className="card-title">Occupancy Status</div>
              <div className="card-small">Overview</div>
            </div>
            <div className="hex-icon" aria-hidden>🐝</div>
          </div>

          <div className="occ-body">
            <div className="occ-percent">{occupancyPct}% <span className="occ-label">Occupied</span></div>

            <div className="occ-bar" aria-hidden>
              <div className="occ-bar-fill" style={{ width: `${occupancyPct}%` }} />
            </div>

            <div className="occ-meta">
              <div className="occ-meta-item">
                <div className="occ-meta-num">{totalProperties}</div>
                <div className="occ-meta-label">Properties</div>
              </div>

              <div className="occ-meta-item">
                <div className="occ-meta-num">{totalRooms}</div>
                <div className="occ-meta-label">Total Units</div>
              </div>

              <div className="occ-meta-item">
                <div className="occ-meta-num">{occupiedRooms}</div>
                <div className="occ-meta-label">Occupied</div>
              </div>

              <div className="occ-meta-item">
                <div className="occ-meta-num">{availableRooms}</div>
                <div className="occ-meta-label">Available</div>
              </div>

              <div className="occ-meta-item">
                <div className="occ-meta-num">{totalTenants}</div>
                <div className="occ-meta-label">Active Tenants</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card activity-card" role="region" aria-label="Recent activity">
          <div className="card-head">
            <div className="card-title">Recent Activity</div>
            <div className="card-small">Latest events</div>
          </div>
          <div className="activity-body">
            <div className="activity-empty">No recent activity</div>
          </div>
        </div>

        {/* Concerns & Requests */}
        <div className="card concerns-card" role="region" aria-label="Concerns and requests">
          <div className="card-head">
            <div>
              <div className="card-title">Concerns & Requests</div>
              <div className="card-small">Maintenance & tickets</div>
            </div>

            <button
              className="concern-badge"
              onClick={() => { if (typeof onOpenConcerns === 'function') onOpenConcerns(); }}
              title="Open Concerns"
            >
              {concernsCount > 0 ? `+${concernsCount} New` : 'No new'}
            </button>
          </div>

          <div className="concerns-body">
            <p className="concern-text">Open the Concerns page to manage maintenance requests and tickets.</p>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="card finance-card" role="region" aria-label="Financial summary">
          <div className="card-head">
            <div className="card-title">Financial Summary</div>
            <div className="card-small">Overview</div>
          </div>

          <div className="finance-body">
            <div className="finance-row">
              <div className="finance-label">Monthly Rent</div>
              <div className="finance-value">{displayMonthly}</div>
            </div>

            <div className="finance-row">
              <div className="finance-label">Overdue</div>
              <div className="finance-value overdue">{displayOverdue}</div>
            </div>

            <div className="finance-note">Detailed financials coming in Finance module.</div>
          </div>
        </div>

        {/* Reminders */}
        <div className="card reminders-card" role="region" aria-label="Reminders">
          <div className="card-head">
            <div className="card-title">Reminders</div>
            <div className="card-small">Upcoming</div>
          </div>

          <div className="reminders-body">
            {reminders && reminders.length > 0 ? (
              <ul className="reminders-list">
                {reminders.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            ) : (
              <div className="reminder-empty">No reminders</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}