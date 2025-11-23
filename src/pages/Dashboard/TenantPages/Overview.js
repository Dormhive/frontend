import React from 'react';

export default function OverviewPage({ loading, error, room, owner, property }) {
  return (
    <section>
      <h3>My Room</h3>
      {loading && <p style={{ fontStyle: 'italic', color: '#666' }}>Loading...</p>}
      {!loading && error && (
        <div style={{ background: '#ffe6e6', padding: 12, borderRadius: 6, color: '#c33' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      {!loading && !error && !room && (
        <div style={{ background: '#f0f0f0', padding: 12, borderRadius: 6, color: '#666' }}>
          Not yet assigned to any room.
        </div>
      )}
      {!loading && !error && room && (
        <div style={{ background: '#fafafa', padding: 16, borderRadius: 8, border: '1px solid #eee' }}>
          <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #eee' }}>
            <span style={{ fontWeight: 600 }}>Owner:</span>{' '}
            {room ? `${room.owner_firstName || (owner && owner.firstName) || 'N/A'} ${room.owner_lastName || (owner && owner.lastName) || ''}`.trim() : 'N/A'}
          </div>
          <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #eee' }}>
            <span style={{ fontWeight: 600 }}>Owner ID:</span> {' '}
            {owner ? owner.id : 'N/A'}
          </div>
          <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #eee' }}>
            <span style={{ fontWeight: 600 }}>Property ID:</span>{' '}
            {property ? property.id : 'N/A'}
          </div>
          <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #eee' }}>
            <span style={{ fontWeight: 600 }}>Property:</span>{' '}
            {property ? property.propertyName : 'N/A'}
          </div>
          <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #eee' }}>
            <span style={{ fontWeight: 600 }}>Address:</span>{' '}
            {property ? property.address : 'N/A'}
          </div>
          <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #eee' }}>
            <span style={{ fontWeight: 600 }}>Room ID:</span> {room.id ?? 'N/A'}
          </div>
          <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #eee' }}>
            <span style={{ fontWeight: 600 }}>Room Number:</span> {room.roomNumber ?? 'N/A'}
          </div>
          <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #eee' }}>
            <span style={{ fontWeight: 600 }}>Room Type:</span> {room.type || 'N/A'}
          </div>
          <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #eee' }}>
            <span style={{ fontWeight: 600 }}>Monthly Rent:</span>{' '}
            {room.monthlyRent != null ? `$${parseFloat(room.monthlyRent).toFixed(2)}` : 'N/A'}
          </div>
          {room.capacity != null && (
            <div>
              <span style={{ fontWeight: 600 }}>Capacity:</span> {room.capacity}{' '}
              {room.capacity === 1 ? 'person' : 'people'}
            </div>
          )}
        </div>
      )}
    </section>
  );
}