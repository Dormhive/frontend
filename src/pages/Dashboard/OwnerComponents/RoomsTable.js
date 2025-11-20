import React, { useState } from 'react';
import AssignTenantForm from './AssignTenantForm';

function RoomsTable({
  prop,
  rooms,
  showAddRoomForm,
  // roomForm and handleRoomInput are kept for compatibility but Add Room uses local state now
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
  handleUpdateRoom,
  handleDeleteRoom,
}) {
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [editForm, setEditForm] = useState({
    roomNumber: '',
    type: '',
    monthlyRent: '',
    capacity: '',
    amenities: '',
    paymentSchedule: '1st',
  });

  // LOCAL add-room form state (fixes problems when shared parent state wasn't updated)
  const [localAddRoom, setLocalAddRoom] = useState({
    roomNumber: '',
    type: '',
    monthlyRent: '',
    capacity: '',
    amenities: '',
    paymentSchedule: '1st',
  });

  const startEdit = (r) => {
    setEditingRoomId(r.id);
    setEditForm({
      roomNumber: r.roomNumber || '',
      type: r.type || '',
      monthlyRent: r.monthlyRent || '',
      capacity: r.capacity || '',
      amenities: r.amenities || '',
      paymentSchedule: r.paymentSchedule || '1st',
    });
  };

  const onEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((s) => ({ ...s, [name]: value }));
  };

  const saveEdit = async (e, roomId) => {
    e.preventDefault();
    await handleUpdateRoom(prop.id, roomId, editForm);
    setEditingRoomId(null);
  };

  const removeRoom = async (roomId) => {
    await handleDeleteRoom(prop.id, roomId);
  };

  const onLocalAddChange = (e) => {
    const { name, value } = e.target;
    setLocalAddRoom((s) => ({ ...s, [name]: value }));
  };

  const submitLocalAdd = async (e) => {
    e.preventDefault();
    // call parent with (propertyId, data)
    await handleAddRoomFor(prop.id, {
      roomNumber: localAddRoom.roomNumber,
      type: localAddRoom.type,
      monthlyRent: localAddRoom.monthlyRent,
      capacity: localAddRoom.capacity,
      amenities: localAddRoom.amenities,
      paymentSchedule: localAddRoom.paymentSchedule,
    });
    // clear local form
    setLocalAddRoom({ roomNumber: '', type: '', monthlyRent: '', capacity: '', amenities: '', paymentSchedule: '1st' });
  };

  // NEW: confirm before removing a tenant
  const confirmRemoveTenant = (roomId, tenantId, tenantName) => {
    const label = tenantName ? `"${tenantName}"` : 'this tenant';
    const ok = window.confirm(`Remove ${label} from room ${roomId}? This action cannot be undone.`);
    if (!ok) return;
    handleRemoveTenant(roomId, tenantId, prop.id);
  };

  return (
    <div className="rooms-dropdown">
      <div className="rooms-toolbar" />
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
                  <td>${parseFloat(r.monthlyRent || 0).toFixed(2)}</td>
                  <td>{r.capacity || '-'}</td>
                  <td>{r.amenities || '-'}</td>
                  <td>{r.paymentSchedule || '1st'}</td>
                  <td>
                    <div className="tenants-list">
                      {(r.tenants && r.tenants.length > 0) ? (
                        <ul>
                          {r.tenants.map((tenant) => (
                            <li key={tenant.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span>
                                {tenant.firstName} {tenant.lastName}
                                <span className="payment-schedule"> ({tenant.paymentSchedule || r.paymentSchedule || '1st'})</span>
                              </span>
                              <button
                                className="remove-tenant-btn"
                                onClick={() => confirmRemoveTenant(r.id, tenant.id, `${tenant.firstName} ${tenant.lastName}`)}
                                type="button"
                                aria-label={`Remove tenant ${tenant.firstName} ${tenant.lastName}`}
                                style={{ marginLeft: 8 }}
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
                    <button className="cancel-btn" onClick={() => startEdit(r)} style={{ marginLeft: 8 }}>Edit</button>
                    <button className="cancel-btn" onClick={() => removeRoom(r.id)} style={{ marginLeft: 8 }}>Delete</button>
                  </td>
                </tr>

                {editingRoomId === r.id && (
                  <tr className="edit-room-row">
                    <td colSpan="8">
                      <form className="edit-room-form" onSubmit={(e) => saveEdit(e, r.id)}>
                        <input name="roomNumber" value={editForm.roomNumber} onChange={onEditChange} required />
                        <select name="type" value={editForm.type} onChange={onEditChange} required>
                          <option value="">Select Room Type</option>
                          {ROOM_TYPES.map((rt) => <option key={rt} value={rt}>{rt}</option>)}
                        </select>
                        <input name="monthlyRent" type="number" value={editForm.monthlyRent} onChange={onEditChange} required />
                        <input name="capacity" type="number" value={editForm.capacity} onChange={onEditChange} />
                        <input name="amenities" value={editForm.amenities} onChange={onEditChange} />
                        <select name="paymentSchedule" value={editForm.paymentSchedule} onChange={onEditChange} required>
                          <option value="1st">1st</option>
                          <option value="15th">15th</option>
                        </select>
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <button type="submit" className="submit-btn">Save</button>
                          <button type="button" className="cancel-btn" onClick={() => setEditingRoomId(null)}>Cancel</button>
                        </div>
                      </form>
                    </td>
                  </tr>
                )}

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
        <form className="add-room-form" onSubmit={submitLocalAdd}>
          <input
            type="text"
            name="roomNumber"
            placeholder="Room Number"
            value={localAddRoom.roomNumber}
            onChange={onLocalAddChange}
            required
          />
          <select
            name="type"
            value={localAddRoom.type}
            onChange={onLocalAddChange}
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
            value={localAddRoom.monthlyRent}
            onChange={onLocalAddChange}
            required
          />
          <input
            type="number"
            name="capacity"
            placeholder="Capacity"
            value={localAddRoom.capacity}
            onChange={onLocalAddChange}
          />
          <input
            type="text"
            name="amenities"
            placeholder="Amenities"
            value={localAddRoom.amenities}
            onChange={onLocalAddChange}
          />
          <select
            name="paymentSchedule"
            value={localAddRoom.paymentSchedule}
            onChange={onLocalAddChange}
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