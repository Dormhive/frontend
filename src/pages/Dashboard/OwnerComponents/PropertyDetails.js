import React from 'react';
import RoomsTable from './RoomsTable';

function PropertyDetails({
  selectedPropertyId,
  setSelectedPropertyId,
  properties,
  expanded,
  toggleExpand,
  showAddRoomForm,
  toggleAddRoomFormFor,
  roomForm,
  handleRoomInput,
  handleAddRoomFor,
  rooms,
  ROOM_TYPES,
  showAssignTenantForm,
  toggleAssignTenantFormFor,
  tenantFormByRoom,
  handleAssignTenant,
  handleTenantInputForRoom,
  handleRemoveTenant,
}) {
  if (!selectedPropertyId) return null;
  const prop = properties.find((p) => p.id === selectedPropertyId);
  if (!prop) return null;

  return (
    <div className="hex-details">
      <div className="hex-details-head">
        <h4>{prop.propertyName}</h4>
        <p className="small">{prop.address}</p>
      </div>
      <div className="hex-details-body">
        <p>{prop.description || 'No description provided.'}</p>
        <div className="hex-details-actions">
          <button className="view-rooms-btn" onClick={() => toggleExpand(prop.id)}>
            {expanded[prop.id] ? 'Hide Rooms' : 'View Rooms'}
          </button>
          <button className="add-room-inline-btn" onClick={() => toggleAddRoomFormFor(prop.id)}>
            {showAddRoomForm[prop.id] ? 'Cancel Add Room' : 'Add Room'}
          </button>
          <button className="submit-btn" onClick={() => setSelectedPropertyId(null)}>
            Close
          </button>
        </div>
      </div>
      {expanded[prop.id] && (
        <RoomsTable
          prop={prop}
          rooms={rooms[prop.id] || []}
          showAddRoomForm={showAddRoomForm[prop.id]}
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
        />
      )}
    </div>
  );
}

export default PropertyDetails;