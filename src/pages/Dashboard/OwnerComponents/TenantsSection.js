import React from 'react';

function TenantsSection({
  allTenants,
  filteredTenants,
  selectedPropertyFilter,
  setSelectedPropertyFilter,
  expandedTenantId,
  setExpandedTenantId,
  properties,
}) {
  return (
    <>
      <h3>Tenants</h3>
      <p>View and manage your current tenants across all properties.</p>
      {allTenants.length > 0 ? (
        <div className="tenants-section">
          <div className="tenants-filter">
            <label htmlFor="property-filter"><strong>Filter by Property:</strong></label>
            <select
              id="property-filter"
              value={selectedPropertyFilter}
              onChange={(e) => setSelectedPropertyFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Properties</option>
              {properties.map((prop) => (
                <option key={prop.id} value={prop.id}>
                  {prop.propertyName}
                </option>
              ))}
            </select>
          </div>
          <div className="tenants-list-container">
            {filteredTenants.length > 0 ? (
              filteredTenants.map((tenant) => (
                <div key={`${tenant.id}-${tenant.roomId}`} className="tenant-card">
                  <button
                    className="tenant-card-header"
                    onClick={() =>
                      setExpandedTenantId(
                        expandedTenantId === `${tenant.id}-${tenant.roomId}`
                          ? null
                          : `${tenant.id}-${tenant.roomId}`
                      )
                    }
                  >
                    <span className="tenant-name">
                      {tenant.firstName} {tenant.lastName}
                    </span>
                    <span className="expand-icon">
                      {expandedTenantId === `${tenant.id}-${tenant.roomId}` ? '▼' : '▶'}
                    </span>
                  </button>
                  {expandedTenantId === `${tenant.id}-${tenant.roomId}` && (
                    <div className="tenant-details">
                      <div className="detail-row">
                        <span className="detail-label">Email:</span>
                        <span className="detail-value">{tenant.email}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Phone:</span>
                        <span className="detail-value">{tenant.phone || 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Property:</span>
                        <span className="detail-value">{tenant.propertyName}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Address:</span>
                        <span className="detail-value">{tenant.propertyAddress}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Room Number:</span>
                        <span className="detail-value">{tenant.roomNumber}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Payment Schedule:</span>
                        <span className="detail-value">{tenant.paymentSchedule || 'N/A'}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="empty-message">No tenants in selected property.</p>
            )}
          </div>
        </div>
      ) : (
        <p style={{ color: '#999', marginTop: '1rem' }}>No tenants assigned yet.</p>
      )}
    </>
  );
}

export default TenantsSection;