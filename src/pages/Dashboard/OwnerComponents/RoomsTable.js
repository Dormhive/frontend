import React, { useState } from 'react';
import AssignTenantForm from './AssignTenantForm';

// Helper to get ordinal suffix and superscript
function getOrdinalSuperscript(n) {
  if (!n) return '';
  const num = parseInt(n, 10);
  let suffix = 'th';
  if (num % 100 < 11 || num % 100 > 13) {
    switch (num % 10) {
      case 1: suffix = 'st'; break;
      case 2: suffix = 'nd'; break;
      case 3: suffix = 'rd'; break;
      default: suffix = 'th';
    }
  }
  const supers = {
    st: '\u02E2\u1D57', // ˢᵗ
    nd: '\u207F\u1D48', // ⁿᵈ
    rd: '\u02B3\u1D49', // ʳᵈ
    th: '\u1D57\u02B0', // ᵗʰ
  };
  return (
    <>
      {num}
      <sup style={{ fontSize: '0.8em' }}>{supers[suffix] || supers.th}</sup>
    </>
  );
}

function RoomsTable({
  prop,
  rooms = [],
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
  });

  const [localAddRoom, setLocalAddRoom] = useState({
    roomNumber: '',
    type: '',
    monthlyRent: '',
    capacity: '',
    amenities: '',
  });

  // Tenant editing state
  const [editingTenantId, setEditingTenantId] = useState(null);
  const [tenantEditForm, setTenantEditForm] = useState({
    move_in: '',
    paymentfrequency: '',
  });

  // Start editing a tenant (move_in and paymentfrequency)
  const startEditTenant = (tenant) => {
    setEditingTenantId(tenant.id);
    setTenantEditForm({
      move_in: tenant.move_in || '',
      paymentfrequency: tenant.paymentfrequency || '',
    });
  };

  // Handle tenant edit form change
  const onTenantEditChange = (e) => {
    const { name, value } = e.target;
    setTenantEditForm((s) => ({ ...s, [name]: value }));
  };

  // Save tenant edit and update in database with confirmation
  const saveTenantEdit = async (roomId, tenantId) => {
    if (!window.confirm('Save changes to tenant details?')) return;
    try {
      // Call backend API to update tenant move_in and paymentfrequency
      await fetch(`/api/properties/${prop.id}/rooms/${roomId}/tenants/${tenantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          move_in: tenantEditForm.move_in,
          paymentfrequency: tenantEditForm.paymentfrequency,
        }),
      });
      setEditingTenantId(null);
      // Optionally refresh data here if needed
    } catch (err) {
      alert('Failed to save tenant details.');
    }
  };

  const startEdit = (r) => {
    setEditingRoomId(r.id);
    setEditForm({
      roomNumber: r.roomNumber || '',
      type: r.type || '',
      monthlyRent: r.monthlyRent || '',
      capacity: r.capacity || '',
      amenities: r.amenities || '',
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
    await handleAddRoomFor(prop.id, {
      roomNumber: localAddRoom.roomNumber,
      type: localAddRoom.type,
      monthlyRent: localAddRoom.monthlyRent,
      capacity: localAddRoom.capacity,
      amenities: localAddRoom.amenities,
    });
    setLocalAddRoom({ roomNumber: '', type: '', monthlyRent: '', capacity: '', amenities: '' });
  };

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
            <th>Payment Frequency</th>
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
                  <td>
                    {(r.tenants && r.tenants.length > 0)
                      ? r.tenants.map((tenant, idx) =>
                          <div key={tenant.id || idx}>
                            {tenant.paymentfrequency
                              ? <>{getOrdinalSuperscript(tenant.paymentfrequency)} of month</>
                              : '-'}
                          </div>
                        )
                      : '-'
                    }
                  </td>
                  <td>
                    <div className="tenants-list">
                      {(r.tenants && r.tenants.length > 0) ? (
                        <ul>
                          {r.tenants.map((tenant) => (
                            <li key={tenant.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {editingTenantId === tenant.id ? (
                                <form
                                  style={{ display: 'flex', gap: 8, alignItems: 'center' }}
                                  onSubmit={async (e) => {
                                    e.preventDefault();
                                    await saveTenantEdit(r.id, tenant.id);
                                  }}
                                >
                                  <input
                                    name="move_in"
                                    type="date"
                                    value={tenantEditForm.move_in}
                                    onChange={onTenantEditChange}
                                    style={{ width: 120 }}
                                    required
                                  />
                                  <input
                                    name="paymentfrequency"
                                    type="number"
                                    min="1"
                                    max="31"
                                    value={tenantEditForm.paymentfrequency}
                                    onChange={onTenantEditChange}
                                    placeholder="Day"
                                    style={{ width: 60 }}
                                    required
                                  />
                                  <button type="submit" className="submit-btn">Save</button>
                                  <button type="button" className="cancel-btn" onClick={() => setEditingTenantId(null)}>Cancel</button>
                                </form>
                              ) : (
                                <>
                                  <span>
                                    {tenant.firstName} {tenant.lastName}
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
                                  <button
                                    className="edit-tenant-btn"
                                    onClick={() => startEditTenant(tenant)}
                                    type="button"
                                    aria-label={`Edit tenant ${tenant.firstName} ${tenant.lastName}`}
                                    style={{ marginLeft: 8 }}
                                  >
                                    Edit
                                  </button>
                                </>
                              )}
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
          <button type="submit" className="submit-btn">Add Room</button>
        </form>
      )}
    </div>
  );
}

export default RoomsTable;