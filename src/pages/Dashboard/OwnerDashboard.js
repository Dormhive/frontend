import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Dashboard.css';

const API_URL = 'http://localhost:3001/api';

function OwnerDashboard() {
  const [showAddPropertyForm, setShowAddPropertyForm] = useState(false);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // rooms store: { [propertyId]: [ {id, roomNumber, type, monthlyRent, capacity, amenities, tenants} ] }
  const [rooms, setRooms] = useState({});
  // UI maps
  const [expanded, setExpanded] = useState({}); // { [propertyId]: true/false }
  const [showAddRoomForm, setShowAddRoomForm] = useState({}); // { [propertyId]: true/false }
  const [showAssignTenantForm, setShowAssignTenantForm] = useState({}); // { [roomId]: true/false }

  // All tenants aggregated across all properties and rooms
  const [allTenants, setAllTenants] = useState([]);
  const [filteredTenants, setFilteredTenants] = useState([]);
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState('all'); // 'all' or propertyId
  const [expandedTenantId, setExpandedTenantId] = useState(null); // track which tenant detail is expanded

  const [propertyForm, setPropertyForm] = useState({
    propertyName: '',
    address: '',
    description: '',
  });

  const [roomForm, setRoomForm] = useState({
    roomNumber: '',
    type: '',
    monthlyRent: '',
    capacity: '',
    amenities: '',
  });

  const [tenantForm, setTenantForm] = useState({
    email: '',
  });

  const ROOM_TYPES = [
    'Bedspace',
    'Studio',
    'One Bedroom',
    'Two Bedroom',
    'Condo Sharing'
  ];

  // new: selected hexagon (property) id
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);

  const aggregateTenants = useCallback(() => {
    const tenantsList = [];

    Object.entries(rooms).forEach(([propertyId, roomList]) => {
      const property = properties.find((p) => p.id === parseInt(propertyId));
      if (!property) return;

      (roomList || []).forEach((room) => {
        (room.tenants || []).forEach((tenant) => {
          tenantsList.push({
            ...tenant,
            roomId: room.id,
            roomNumber: room.roomNumber,
            propertyId: parseInt(propertyId),
            propertyName: property.propertyName,
            propertyAddress: property.address,
          });
        });
      });
    });

    setAllTenants(tenantsList);
  }, [rooms, properties]);

  const fetchAllRooms = useCallback(async (props) => {
    const token = localStorage.getItem('token');
    const allRooms = {};

    try {
      await Promise.all(
        props.map(async (prop) => {
          try {
            const res = await axios.get(`${API_URL}/properties/${prop.id}/rooms`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            allRooms[prop.id] = res.data || [];
          } catch (err) {
            console.error(`Error fetching rooms for property ${prop.id}:`, err);
            allRooms[prop.id] = [];
          }
        })
      );
      setRooms(allRooms);
    } catch (err) {
      console.error('Error fetching all rooms:', err);
    }
  }, []);

  const fetchProperties = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/properties`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const props = res.data || [];
      setProperties(props);

      // initialize maps for properties and fetch all rooms at once
      const initialRooms = {};
      const initialExpanded = {};
      const initialAddForm = {};
      props.forEach((p) => {
        initialRooms[p.id] = [];
        initialExpanded[p.id] = false;
        initialAddForm[p.id] = false;
      });
      setRooms(initialRooms);
      setExpanded(initialExpanded);
      setShowAddRoomForm(initialAddForm);

      // fetch rooms for all properties automatically
      fetchAllRooms(props);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties');
    }
  }, [fetchAllRooms]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Aggregate all tenants from all properties/rooms whenever rooms change
  useEffect(() => {
    aggregateTenants();
  }, [aggregateTenants]);

  // Filter tenants based on selected property
  useEffect(() => {
    if (selectedPropertyFilter === 'all') {
      setFilteredTenants(allTenants);
    } else {
      setFilteredTenants(
        allTenants.filter((t) => t.propertyId === parseInt(selectedPropertyFilter))
      );
    }
  }, [allTenants, selectedPropertyFilter]);

  const handlePropertyInput = (e) => {
    const { name, value } = e.target;
    setPropertyForm((s) => ({ ...s, [name]: value }));
  };

  const handleRoomInput = (e) => {
    const { name, value } = e.target;
    setRoomForm((s) => ({ ...s, [name]: value }));
  };

  const handleTenantInput = (e) => {
    const { name, value } = e.target;
    setTenantForm((s) => ({ ...s, [name]: value }));
  };

  const handleAddProperty = async (e) => {
    e.preventDefault();
    setError('');
    if (!propertyForm.propertyName || !propertyForm.address) {
      setError('Please fill property name and address.');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/properties`, propertyForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const newProp = res.data;
      setProperties((p) => [...p, newProp]);
      setRooms((r) => ({ ...r, [newProp.id]: [] }));
      setExpanded((ex) => ({ ...ex, [newProp.id]: false }));
      setShowAddRoomForm((sf) => ({ ...sf, [newProp.id]: false }));
      setPropertyForm({ propertyName: '', address: '', description: '' });
      setShowAddPropertyForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding property');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle expand/collapse to show rooms table
  const toggleExpand = async (propertyId) => {
    const willExpand = !expanded[propertyId];
    setExpanded((s) => ({ ...s, [propertyId]: willExpand }));
  };

  // Toggle add-room form visibility for a specific property
  const toggleAddRoomFormFor = (propertyId) => {
    setShowAddRoomForm((s) => ({ ...s, [propertyId]: !s[propertyId] }));
    setRoomForm({ roomNumber: '', type: '', monthlyRent: '', capacity: '', amenities: '' });
  };

  // Add room to backend and local state
  const handleAddRoomFor = async (e, propertyId) => {
    e.preventDefault();
    setError('');
    const { roomNumber, type, monthlyRent, capacity, amenities } = roomForm;
    if (!roomNumber || !type || monthlyRent === '' || monthlyRent === null) {
      setError('Please fill required room fields (number, type, monthly rent).');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/properties/${propertyId}/rooms`,
        { roomNumber, type, monthlyRent, capacity, amenities },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const savedRoom = res.data;
      setRooms((r) => {
        const list = (r[propertyId] || []).concat(savedRoom);
        return { ...r, [propertyId]: list };
      });

      setShowAddRoomForm((s) => ({ ...s, [propertyId]: false }));
      setRoomForm({ roomNumber: '', type: '', monthlyRent: '', capacity: '', amenities: '' });
    } catch (err) {
      console.error('Error saving room:', err);
      setError(err.response?.data?.message || 'Error adding room');
    }
  };

  // Toggle assign tenant form
  const toggleAssignTenantFormFor = (roomId) => {
    setShowAssignTenantForm((s) => ({ ...s, [roomId]: !s[roomId] }));
    setTenantForm({ email: '' });
  };

  // Assign tenant to room
  const handleAssignTenant = async (e, roomId, propertyId) => {
    e.preventDefault();
    setError('');

    if (!tenantForm.email.trim()) {
      setError('Please enter tenant email address.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/properties/${propertyId}/rooms/${roomId}/assign-tenant`,
        { tenantEmail: tenantForm.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedRoom = res.data;

      // Update local rooms state with updated tenants list
      setRooms((r) => {
        const updatedRooms = r[propertyId].map((room) =>
          room.id === roomId ? updatedRoom : room
        );
        return { ...r, [propertyId]: updatedRooms };
      });

      setShowAssignTenantForm((s) => ({ ...s, [roomId]: false }));
      setTenantForm({ email: '' });
    } catch (err) {
      console.error('Error assigning tenant:', err);
      setError(err.response?.data?.message || 'Error assigning tenant');
    }
  };

  // Remove tenant from room
  const handleRemoveTenant = async (roomId, tenantId, propertyId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(
        `${API_URL}/properties/${propertyId}/rooms/${roomId}/tenants/${tenantId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedRoom = res.data;

      setRooms((r) => {
        const updatedRooms = r[propertyId].map((room) =>
          room.id === roomId ? updatedRoom : room
        );
        return { ...r, [propertyId]: updatedRooms };
      });
    } catch (err) {
      console.error('Error removing tenant:', err);
      setError(err.response?.data?.message || 'Error removing tenant');
    }
  };

  // new: select / toggle hexagon
  const handleSelectProperty = (propertyId) => {
    setSelectedPropertyId((prev) => (prev === propertyId ? null : propertyId));
  };

  // render rooms dropdown for selected property
  const renderRoomsForProperty = (prop) => {
    const propRooms = rooms[prop.id] || [];
    return (
      <div className="rooms-dropdown" key={`rooms-${prop.id}`}>
        <div className="rooms-toolbar">
          <button
            className="add-room-inline-btn"
            onClick={() => toggleAddRoomFormFor(prop.id)}
          >
            {showAddRoomForm[prop.id] ? 'Cancel' : 'Add Room'}
          </button>
        </div>

        <table className="rooms-table">
          <thead>
            <tr>
              <th>Room #</th>
              <th>Type</th>
              <th>Monthly Rent</th>
              <th>Capacity</th>
              <th>Amenities</th>
              <th>Tenants</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {propRooms.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-row">No rooms added yet.</td>
              </tr>
            ) : (
              propRooms.map((r) => (
                <React.Fragment key={r.id}>
                  <tr>
                    <td>{r.roomNumber}</td>
                    <td>{r.type}</td>
                    <td>${parseFloat(r.monthlyRent).toFixed(2)}</td>
                    <td>{r.capacity || '-'}</td>
                    <td>{r.amenities || '-'}</td>
                    <td>
                      <div className="tenants-list">
                        {(r.tenants && r.tenants.length > 0) ? (
                          <ul>
                            {r.tenants.map((tenant) => (
                              <li key={tenant.id}>
                                {tenant.firstName} {tenant.lastName}
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
                      <td colSpan="7">
                        <form
                          className="assign-tenant-form-inline"
                          onSubmit={(e) => handleAssignTenant(e, r.id, prop.id)}
                        >
                          <input
                            type="email"
                            name="email"
                            placeholder="Enter tenant email address"
                            value={tenantForm.email}
                            onChange={handleTenantInput}
                            required
                          />
                          <button type="submit" className="submit-btn">Assign Tenant</button>
                        </form>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>

        {showAddRoomForm[prop.id] && (
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
            <button type="submit" className="submit-btn">Add Room</button>
          </form>
        )}
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <h2>Owner Dashboard</h2>
      <p>Welcome to your property management dashboard.</p>

      <div className="dashboard-content">
        <section>
          <h3>My Properties</h3>

          <button
            className="add-property-btn"
            onClick={() => setShowAddPropertyForm((s) => !s)}
          >
            {showAddPropertyForm ? 'Cancel' : 'Add Properties'}
          </button>

          {error && <p className="form-error">{error}</p>}

          {showAddPropertyForm && (
            <form className="add-property-form" onSubmit={handleAddProperty}>
              <input
                type="text"
                name="propertyName"
                placeholder="Property Name"
                value={propertyForm.propertyName}
                onChange={handlePropertyInput}
                required
              />
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={propertyForm.address}
                onChange={handlePropertyInput}
                required
              />
              <input
                type="text"
                name="description"
                placeholder="Description"
                value={propertyForm.description}
                onChange={handlePropertyInput}
              />
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          )}

          {properties.length > 0 ? (
            <>
              {/* HEX GRID: shows up to 5 properties arranged in hex-outline */}
              <div className="hex-grid" role="list">
                {properties.slice(0, 5).map((prop, idx) => (
                  <button
                    key={prop.id}
                    type="button"
                    className={`hex ${selectedPropertyId === prop.id ? 'selected' : ''}`}
                    onClick={() => handleSelectProperty(prop.id)}
                    aria-pressed={selectedPropertyId === prop.id}
                    role="listitem"
                  >
                    <div className="hex-inner">
                      <div className="hex-title">{prop.propertyName}</div>
                      <div className="hex-address">{prop.address}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Expanded details panel for selected hexagon */}
              {selectedPropertyId && (
                <div className="hex-details">
                  {(() => {
                    const prop = properties.find((p) => p.id === selectedPropertyId);
                    if (!prop) return null;
                    return (
                      <>
                        <div className="hex-details-head">
                          <h4>{prop.propertyName}</h4>
                          <p className="small">{prop.address}</p>
                        </div>

                        <div className="hex-details-body">
                          <p>{prop.description || 'No description provided.'}</p>

                          <div className="hex-details-actions">
                            <button
                              className="view-rooms-btn"
                              onClick={() => toggleExpand(prop.id)}
                            >
                              {expanded[prop.id] ? 'Hide Rooms' : 'View Rooms'}
                            </button>

                            <button
                              className="add-room-inline-btn"
                              onClick={() => toggleAddRoomFormFor(prop.id)}
                            >
                              {showAddRoomForm[prop.id] ? 'Cancel Add Room' : 'Add Room'}
                            </button>

                            <button
                              className="submit-btn"
                              onClick={() => {
                                setSelectedPropertyId(null);
                              }}
                            >
                              Close
                            </button>
                          </div>
                        </div>

                        {/* Render rooms dropdown here when expanded */}
                        {expanded[prop.id] && renderRoomsForProperty(prop)}
                      </>
                    );
                  })()}
                </div>
              )}
            </>
          ) : (
            <p style={{ color: '#999', marginTop: '1rem' }}>No properties yet. Add one to get started!</p>
          )}
        </section>

        {/* TENANTS SECTION */}
        <section>
          <h3>Tenants</h3>
          <p>View and manage your current tenants across all properties.</p>

          {allTenants.length > 0 ? (
            <div className="tenants-section">
              {/* Filter dropdown */}
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

              {/* Tenants list with collapsible details */}
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

                      {/* Expanded details */}
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
        </section>

        <section>
          <h3>Earnings</h3>
          <p>Track your rental income.</p>
        </section>
      </div>
    </div>
  );
}

export default OwnerDashboard;
