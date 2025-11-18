import React from 'react';

function AssignTenantForm({
  roomId,
  propertyId,
  tenantFormByRoom,
  handleTenantInputForRoom,
  handleAssignTenant,
}) {
  return (
    <form
      className="assign-tenant-form-inline"
      onSubmit={(e) => handleAssignTenant(e, roomId, propertyId)}
    >
      <div className="form-row">
        <input
          type="email"
          name="email"
          placeholder="Enter tenant email address"
          value={(tenantFormByRoom[roomId] && tenantFormByRoom[roomId].email) || ''}
          onChange={(e) => handleTenantInputForRoom(roomId, e)}
          required
        />
        <button type="submit" className="submit-btn">Assign Tenant</button>
      </div>
    </form>
  );
}

export default AssignTenantForm;