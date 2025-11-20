import React, { useState } from 'react';
import RoomsTable from './RoomsTable';

function PropertyDetails({
  selectedPropertyId,
  setSelectedPropertyId,
  properties = [],
  expanded = {},
  toggleExpand = () => {},
  showAddRoomForm = {},
  toggleAddRoomFormFor = () => {},
  roomForm = {},
  handleRoomInput = () => {},
  handleAddRoomFor = () => {},
  rooms = {},
  ROOM_TYPES = [],
  showAssignTenantForm = {},
  toggleAssignTenantFormFor = () => {},
  tenantFormByRoom = {},
  handleAssignTenant = () => {},
  handleTenantInputForRoom = () => {},
  handleRemoveTenant = () => {},
  handleUpdateProperty = () => {},
  handleDeleteProperty = () => {},
  handleUpdateRoom = () => {},
  handleDeleteRoom = () => {},
}) {
  if (!selectedPropertyId) return null;

  // use loose equality to tolerate string/number mismatch from parent
  const prop = properties.find((p) => p.id == selectedPropertyId);
  if (!prop) return null;

  const isExpanded = Boolean(expanded?.[prop.id]);
  const isAddingRoom = Boolean(showAddRoomForm?.[prop.id]);
  const roomsForProp = rooms?.[prop.id] || [];

  // local edit state for property
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    propertyName: prop.propertyName || '',
    address: prop.address || '',
    description: prop.description || '',
  });

  const onEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((s) => ({ ...s, [name]: value }));
  };

  const saveProperty = async (e) => {
    e.preventDefault();
    await handleUpdateProperty(prop.id, editForm);
    setEditing(false);
  };

  const deleteProperty = async () => {
    await handleDeleteProperty(prop.id);
  };

  return (
    <div className="hex-details">
      <div className="hex-details-head">
        <h4>{prop.propertyName}</h4>
        <p className="small">{prop.address}</p>
      </div>

      <div className="hex-details-body">
        {!editing ? (
          <>
            <p>{prop.description || 'No description provided.'}</p>
            <div className="hex-details-actions">
              <button className="view-rooms-btn" onClick={() => toggleExpand(prop.id)}>
                {isExpanded ? 'Hide Rooms' : 'View Rooms'}
              </button>
              <button className="add-room-inline-btn" onClick={() => toggleAddRoomFormFor(prop.id)}>
                {isAddingRoom ? 'Cancel Add Room' : 'Add Room'}
              </button>
              <button className="submit-btn" onClick={() => setSelectedPropertyId(null)}>
                Close
              </button>
              <button className="cancel-btn" onClick={() => { setEditing(true); setEditForm({ propertyName: prop.propertyName, address: prop.address, description: prop.description || '' }); }}>
                Edit
              </button>
              <button className="cancel-btn" onClick={deleteProperty}>
                Delete
              </button>
            </div>
          </>
        ) : (
          <form className="edit-property-form" onSubmit={saveProperty}>
            <input name="propertyName" value={editForm.propertyName} onChange={onEditChange} required />
            <input name="address" value={editForm.address} onChange={onEditChange} required />
            <textarea name="description" value={editForm.description} onChange={onEditChange} />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="submit" className="submit-btn">Save</button>
              <button type="button" className="cancel-btn" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>

      {isExpanded && (
        <RoomsTable
          prop={prop}
          rooms={roomsForProp}
          showAddRoomForm={isAddingRoom}
          roomForm={roomForm}
          handleRoomInput={handleRoomInput}
          handleAddRoomFor={handleAddRoomFor}
          ROOM_TYPES={ROOM_TYPES}
          showAssignTenantForm={showAssignTenantForm}
          toggleAssignTenantFormFor={toggleAssignTenantFormFor}
          tenantFormByRoom={tenantFormByRoom}
          handleAssignTenant={handleAssignTenant}
          handleTenantInputForRoom={handleTenantInputForRoom}
          handleRemoveTenant={handleRemoveTenant}
          handleUpdateRoom={handleUpdateRoom}
          handleDeleteRoom={handleDeleteRoom}
        />
      )}
    </div>
  );
}

export default PropertyDetails;