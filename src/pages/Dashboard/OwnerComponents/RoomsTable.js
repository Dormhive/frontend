import React from 'react';
import AssignTenantForm from './AssignTenantForm';

function RoomsTable({
  prop,
  rooms,
  showAddRoomForm,
  roomForm,
  handleRoomInput,
  handleAddRoomFor,
  ROOM_TYPES,
  showAssignTenantForm,
  toggleAssignTenantFormFor,
  tenantFormByRoom,
  handleAssignTenant,
  handleTenantInputForRoom,
  handleRemoveTenant,
}) {
  return (
    <div className="rooms-dropdown">
      <div className="rooms-toolbar">
        {/* Add Room button handled in PropertyDetails */}
      </div>
      <table className="rooms-table">
        <thead>
          <tr>
            <th>Room #</th>
            <th>Type</th>
            <th>Monthly Rent</th>
            <th>Capacity</th>
            <th>Amenities</th>
            <th>Schedule</th>
            <th>Tenants</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rooms.length === 0 ? (
            <tr>
              <td colSpan="8" className="empty-row">No rooms added yet.</td>
            </tr>
          ) : (
            rooms.map((r) => (
              <React.Fragment key={r.id}>
                <tr>
                  <td>{r.roomNumber}</td>
                  <td>{r.type}</td>
                  <td>${parseFloat(r.monthlyRent).toFixed(2)}</td>
                  <td>{r.capacity || '-'}</td>
                  <td>{r.amenities || '-'}</td>
                  <td>{r.paymentSchedule || '1st'}</td>
                  <td>
                    <div className="tenants-list">
                      {(r.tenants && r.tenants.length > 0) ? (
                        <ul>
                          {r.tenants.map((tenant) => (
                            <li key={tenant.id}>
                              {tenant.firstName} {tenant.lastName}
                              <span className="payment-schedule"> ({tenant.paymentSchedule || r.paymentSchedule || '1st'})</span>
                              <button
                                className="remove-tenant-btn"
                                onClick={() => handleRemoveTenant(r.id, tenant.id, prop.id)}
                                type="button"
                              >
                                ✕
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="no-tenants">No tenants assigned</p>
                      )}
                    </div>
                  </td>
                  <td>
                    <button
                      className="assign-tenant-btn"
                      onClick={() => toggleAssignTenantFormFor(r.id)}
                      type="button"
                    >
                      {showAssignTenantForm[r.id] ? 'Hide' : 'Add Tenant'}
                    </button>
                  </td>
                </tr>
                {showAssignTenantForm[r.id] && (
                  <tr className="assign-tenant-row">
                    <td colSpan="8">
                      <AssignTenantForm
                        roomId={r.id}
                        propertyId={prop.id}
                        tenantFormByRoom={tenantFormByRoom}
                        handleTenantInputForRoom={handleTenantInputForRoom}
                        handleAssignTenant={handleAssignTenant}
                      />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>
      {showAddRoomForm && (
        <form className="add-room-form" onSubmit={(e) => handleAddRoomFor(e, prop.id)}>
          <input
            type="text"
            name="roomNumber"
            placeholder="Room Number"
            value={roomForm.roomNumber}
            onChange={handleRoomInput}
            required
          />
          <select
            name="type"
            value={roomForm.type}
            onChange={handleRoomInput}
            required
          >
            <option value="">Select Room Type</option>
            {ROOM_TYPES.map((roomType) => (
              <option key={roomType} value={roomType}>
                {roomType}
              </option>
            ))}
          </select>
          <input
            type="number"
            name="monthlyRent"
            placeholder="Monthly Rent"
            value={roomForm.monthlyRent}
            onChange={handleRoomInput}
            required
          />
          <input
            type="number"
            name="capacity"
            placeholder="Capacity"
            value={roomForm.capacity}
            onChange={handleRoomInput}
          />
          <input
            type="text"
            name="amenities"
            placeholder="Amenities"
            value={roomForm.amenities}
            onChange={handleRoomInput}
          />
          <select
            name="paymentSchedule"
            value={roomForm.paymentSchedule}
            onChange={handleRoomInput}
            required
          >
            <option value="1st">1st of Month</option>
            <option value="15th">15th of Month</option>
          </select>
          <button type="submit" className="submit-btn">Add Room</button>
        </form>
      )}
    </div>
  );
}

export default RoomsTable;