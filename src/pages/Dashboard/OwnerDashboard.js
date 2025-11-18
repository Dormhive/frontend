// ...existing code...
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const API_URL = 'http://localhost:3001/api';

function OwnerDashboard() {
  const navigate = useNavigate();

  const [showAddPropertyForm, setShowAddPropertyForm] = useState(false);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // rooms store: { [propertyId]: [ {id, roomNumber, type, monthlyRent, capacity, amenities, tenants, paymentSchedule} ] }
  const [rooms, setRooms] = useState({});
  // UI maps
  const [expanded, setExpanded] = useState({}); // { [propertyId]: true/false }
  const [showAddRoomForm, setShowAddRoomForm] = useState({}); // { [propertyId]: true/false }
  const [showAssignTenantForm, setShowAssignTenantForm] = useState({}); // { [roomId]: true/false }

  // per-room tenant input state to avoid shared/global input collisions
  const [tenantFormByRoom, setTenantFormByRoom] = useState({}); // { [roomId]: { email: '' } }

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

  // ADDED: default paymentSchedule for room when creating
  const [roomForm, setRoomForm] = useState({
    roomNumber: '',
    type: '',
    monthlyRent: '',
    capacity: '',
    amenities: '',
    paymentSchedule: '1st',
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
            paymentSchedule: tenant.paymentSchedule || room.paymentSchedule || '1st',
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

  // NEW: tenant input handler that targets a specific roomId
  const handleTenantInputForRoom = (roomId, e) => {
    const { value } = e.target;
    setTenantFormByRoom((prev) => ({ ...prev, [roomId]: { email: value } }));
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
    // RESET room form including schedule
    setRoomForm({ roomNumber: '', type: '', monthlyRent: '', capacity: '', amenities: '', paymentSchedule: '1st' });
  };

  // Add room to backend and local state
  const handleAddRoomFor = async (e, propertyId) => {
    e.preventDefault();
    setError('');
    const { roomNumber, type, monthlyRent, capacity, amenities, paymentSchedule } = roomForm;
    if (!roomNumber || !type || monthlyRent === '' || monthlyRent === null) {
      setError('Please fill required room fields (number, type, monthly rent).');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/properties/${propertyId}/rooms`,
        { roomNumber, type, monthlyRent, capacity, amenities, paymentSchedule },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const savedRoom = res.data;
      setRooms((r) => {
        const list = (r[propertyId] || []).concat(savedRoom);
        return { ...r, [propertyId]: list };
      });

      setShowAddRoomForm((s) => ({ ...s, [propertyId]: false }));
      setRoomForm({ roomNumber: '', type: '', monthlyRent: '', capacity: '', amenities: '', paymentSchedule: '1st' });
    } catch (err) {
      console.error('Error saving room:', err);
      setError(err.response?.data?.message || 'Error adding room');
    }
  };

  // Toggle assign tenant form for specific room and initialize per-room input
  const toggleAssignTenantFormFor = (roomId) => {
    setShowAssignTenantForm((s) => ({ ...s, [roomId]: !s[roomId] }));
    setTenantFormByRoom((prev) => ({ ...prev, [roomId]: { email: '' } }));
  };

  // Assign tenant to room (tenant inherits room.schedule). Uses per-room input to ensure captured value.
  const handleAssignTenant = async (e, roomId, propertyId) => {
    e.preventDefault();
    setError('');

    const tenantInput = (tenantFormByRoom[roomId] && tenantFormByRoom[roomId].email || '').trim();
    if (!tenantInput) {
      setError('Please enter tenant email address.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/properties/${propertyId}/rooms/${roomId}/assign-tenant`,
        { tenantEmail: tenantInput }, // no schedule in body
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedRoomRaw = res.data;

      // Normalize tenants so each tenant has a paymentSchedule inherited from room when missing.
      const normalizedRoom = {
        ...updatedRoomRaw,
        tenants: (updatedRoomRaw.tenants || []).map((t) => ({
          ...t,
          paymentSchedule: t.paymentSchedule || updatedRoomRaw.paymentSchedule || '1st',
        })),
      };

      setRooms((r) => {
        const updatedRooms = (r[propertyId] || []).map((room) =>
          room.id === roomId ? normalizedRoom : room
        );
        return { ...r, [propertyId]: updatedRooms };
      });

      // clear per-room input and hide form
      setTenantFormByRoom((prev) => ({ ...prev, [roomId]: { email: '' } }));
      setShowAssignTenantForm((s) => ({ ...s, [roomId]: false }));
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

      const updatedRoomRaw = res.data;
      const normalizedRoom = {
        ...updatedRoomRaw,
        tenants: (updatedRoomRaw.tenants || []).map((t) => ({
          ...t,
          paymentSchedule: t.paymentSchedule || updatedRoomRaw.paymentSchedule || '1st',
        })),
      };

      setRooms((r) => {
        const updatedRooms = (r[propertyId] || []).map((room) =>
          room.id === roomId ? normalizedRoom : room
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
              <th>Schedule</th>
              <th>Tenants</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {propRooms.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-row">No rooms added yet.</td>
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
                        <form
                          className="assign-tenant-form-inline"
                          onSubmit={(e) => handleAssignTenant(e, r.id, prop.id)}
                        >
                          <div className="form-row">
                            <input
                              type="email"
                              name="email"
                              placeholder="Enter tenant email address"
                              value={(tenantFormByRoom[r.id] && tenantFormByRoom[r.id].email) || ''}
                              onChange={(e) => handleTenantInputForRoom(r.id, e)}
                              required
                            />
                            <button type="submit" className="submit-btn">Assign Tenant</button>
                          </div>
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
            {/* NEW: owner selects default schedule for this room */}
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
  };

  return (
    <div className="dashboard-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: 0 }}>Owner Dashboard</h2>
          <p style={{ margin: 0 }}>Welcome to your property management dashboard.</p>
        </div>
        <div>
          <button className="submit-btn" type="button" onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('userRole');
            navigate('/', { replace: true });
          }}>
            Logout
          </button>
        </div>
      </div>

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

        <section>
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