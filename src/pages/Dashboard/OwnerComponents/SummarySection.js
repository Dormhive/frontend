import React from 'react';

export default function SummarySection({
  totalProperties,
  totalRooms,
  occupiedRooms,
  availableRooms,
  totalTenants,
  concernsCount,
  reminders,
  onOpenConcerns
}) {
  const occupancyPercent = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  // Hex color mapping for each stat
  const statHex = [
    { color: '#f6c34a' }, // Properties
    { color: '#f6c34a' }, // Total Units
    { color: '#2ecc71' }, // Occupied
    { color: '#7f8c8d' }, // Available
    { color: '#3498db' }, // Active Tenants
  ];

  // Stat values and labels
  const stats = [
    { value: totalProperties, label: 'Properties' },
    { value: totalRooms, label: 'Total Units' },
    { value: occupiedRooms, label: 'Occupied' },
    { value: availableRooms, label: 'Available' },
    { value: totalTenants, label: 'Active Tenants' },
  ];

  return (
    <div className="overview-grid">
      {/* Occupancy Status */}
      <div className="overview-card occupancy-card">
        <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 2 }}>Occupancy Status</div>
        <div style={{ color: '#6d6d6d', fontSize: 18, marginBottom: 20 }}>Portfolio Performance Overview</div>
        <div style={{ fontSize: 48, fontWeight: 800, marginBottom: 4, lineHeight: 1 }}>
          {occupancyPercent}<span style={{ fontSize: 28, fontWeight: 600 }}>%</span>
        </div>
        <div style={{ color: '#6d6d6d', fontWeight: 500, marginBottom: 16, fontSize: 26 }}>Occupied</div>
        {/* Long line */}
        <div style={{
          width: '100%',
          height: 10,
          background: '#f6c34a',
          borderRadius: 8,
          marginBottom: 24
        }}>
          <div style={{
            width: `${occupancyPercent}%`,
            height: '100%',
            background: '#d89a00',
            borderRadius: 8
          }} />
        </div>
        {/* Stat boxes BELOW the long line */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          marginTop: 8,
          gap: '18px'
        }}>
          {stats.map((stat, idx) => (
            <div
              key={stat.label}
              style={{
                background: 'linear-gradient(180deg,#fffde7,#ffe9a7)',
                border: '3px solid #222',
                borderRadius: '14px',
                width: '140px',
                minHeight: '110px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              {/* Hex icon */}
              <div style={{
                width: 28,
                height: 28,
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="28" height="28" viewBox="0 0 28 28">
                  <polygon
                    points="14,3 25,10 25,22 14,27 3,22 3,10"
                    fill={statHex[idx].color}
                    stroke="#e1b12c"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <div style={{ fontWeight: 500, fontSize: 35, marginBottom: 2 }}>{stat.value}</div>
              <div style={{ fontSize: 16, color: '#222', fontWeight: 400 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="overview-card recent-activity-card">
        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 6 }}>Recent Activity</div>
        <div style={{ color: '#6d6d6d', fontSize: 15, marginBottom: 18 }}>Latest events</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <div style={{ textAlign: 'center', color: '#b7b7b7', fontSize: 18 }}>
            <div style={{ marginBottom: 25 }}>
              <span style={{
                background: '#ffe9b3',
                borderRadius: '50%',
                padding: '15px',
                fontSize: 22,
                color: '#ffb700ff'
              }}>
                &#9888;
              </span>
            </div>
            No recent activity
          </div>
        </div>
      </div>

      {/* Concerns & Requests */}
      <div className="overview-card concerns-card">
        <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 6 }}>Concerns & Requests</div>
        <div style={{ color: '#6d6d6d', fontSize: 15, marginBottom: 18 }}>Maintenance & tickets</div>
        <div style={{ position: 'absolute', top: 18, right: 18 }}>
          {concernsCount > 0 && (
            <span style={{
              background: '#ff6b6b',
              color: '#fff',
              borderRadius: 16,
              padding: '4px 12px',
              fontWeight: 700,
              fontSize: 13,
              boxShadow: '0 2px 8px rgba(225,65,65,0.08)'
            }}>
              {concernsCount} new
            </span>
          )}
        </div>
        <div style={{ marginBottom: 18, color: '#575757ff', fontSize: 15 }}>
          Open the Concerns page to manage maintenance requests and tickets.
        </div>
        <button
          className="btn btn-primary"
          style={{ marginTop: 'auto', alignSelf: 'flex-start' }}
          onClick={() => onOpenConcerns && onOpenConcerns()}
        >
          Go to Concerns
        </button>
      </div>

      {/* Financial Summary */}
      <div className="overview-card financial-card">
        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 6 }}>Financial Summary</div>
        <div style={{ color: '#6d6d6d', fontSize: 13, marginBottom: 18 }}>Revenue Overview</div>
        <div style={{ marginBottom: 18 }}>
          <div style={{
            background: '#eafbe7',
            borderRadius: 8,
            padding: '10px 14px',
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontWeight: 600, color: '#2d7a2d' }}>Monthly Rent</span>
            <span style={{
              background: '#2d7a2d',
              height: 8,
              width: 80,
              borderRadius: 8,
              display: 'inline-block'
            }} />
          </div>
          <div style={{
            background: '#ffeaea',
            borderRadius: 8,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontWeight: 600, color: '#e14b4b' }}>Overdue</span>
            <span style={{
              background: '#e14b4b',
              height: 8,
              width: 60,
              borderRadius: 8,
              display: 'inline-block'
            }} />
          </div>
        </div>
        <div style={{ color: '#6d6d6d', fontSize: 13 }}>
          Detailed financials coming in Finance module.
        </div>
      </div>

      {/* Reminders */}
      <div className="overview-card reminders-card">
        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 6 }}>Reminders</div>
        <div style={{ color: '#6d6d6d', fontSize: 13, marginBottom: 18 }}>Upcoming tasks</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <div style={{ textAlign: 'center', color: '#b7b7b7', fontSize: 20 }}>
            <div style={{ marginBottom: 8 }}>
              <span style={{
                background: '#eaf2ff',
                borderRadius: '50%',
                padding: '12px',
                fontSize: 22,
                color: '#3a7ad9'
              }}>
                &#128276;
              </span>
            </div>
            No reminders
          </div>
        </div>
      </div>
    </div>
  );
}