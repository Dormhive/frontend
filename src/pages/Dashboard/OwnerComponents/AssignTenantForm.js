import React from 'react';

function AssignTenantForm({
  roomId,
  propertyId,
  tenantFormByRoom,
  handleTenantInputForRoom,
  handleAssignTenant,
}) {
  const current = tenantFormByRoom?.[roomId] || {};

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

        <select
          name="paymentSchedule"
          value={current.paymentSchedule || '1st'}
          onChange={(e) => handleTenantInputForRoom(roomId, e)}
          style={{ width: 150 }}
        >
          <option value="1st">1st of Month</option>
          <option value="15th">15th of Month</option>
        </select>

        <button type="submit" className="submit-btn">Assign Tenant</button>
      </div>
    </form>
  );
}

export default AssignTenantForm;