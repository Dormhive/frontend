import React from 'react';

function AssignTenantForm({
  roomId,
  propertyId,
  tenantFormByRoom,
  handleTenantInputForRoom,
  handleAssignTenant,
}) {
  const current = tenantFormByRoom?.[roomId] || {};
  const today = new Date().toISOString().split('T')[0];

  return (
    <form
      className="assign-tenant-form-inline"
      onSubmit={(e) => handleAssignTenant(e, roomId, propertyId)}
      style={{ marginTop: 8 }}
    >
      <div className="form-row" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="email"
          name="email"
          placeholder="Enter tenant email address"
          value={current.email || ''}
          onChange={(e) => handleTenantInputForRoom(roomId, e)}
          required
          style={{ flex: 1 }}
        />

        <input
          type="date"
          name="move_in"
          value={current.move_in || today}
          onChange={(e) => handleTenantInputForRoom(roomId, e)}
          required
          style={{ width: 150 }}
        />

        <button type="submit" className="submit-btn">Assign Tenant</button>
      </div>
    </form>
  );
}

export default AssignTenantForm;