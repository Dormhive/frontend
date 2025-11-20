import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import PropertyHexGrid from './OwnerComponents/PropertyHexGrid';
import AddPropertyForm from './OwnerComponents/AddPropertyForm';
import PropertyDetails from './OwnerComponents/PropertyDetails';

const API_URL = 'http://localhost:3001/api';

export default function PropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState({});
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [showAddPropertyForm, setShowAddPropertyForm] = useState(false);
  const [propertyForm, setPropertyForm] = useState({ propertyName: '', address: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // UI state for property details / rooms
  const [expanded, setExpanded] = useState({});
  const [showAddRoomForm, setShowAddRoomForm] = useState({});
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

  const fetchAllRooms = useCallback(async (props) => {
    const token = localStorage.getItem('token');
    const roomsMap = {};
    await Promise.all(props.map(async (p) => {
      try {
        const r = await axios.get(`${API_URL}/properties/${p.id}/rooms`, { headers: { Authorization: `Bearer ${token}` } });
        roomsMap[p.id] = r.data || [];
      } catch (err) {
        roomsMap[p.id] = [];
      }
    }));
    setRooms(roomsMap);
  }, []);

  const fetchProperties = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/properties`, { headers: { Authorization: `Bearer ${token}` } });
      const props = res.data || [];
      setProperties(props);

      // initialize expanded / add-room state for each property
      const initialExpanded = {};
      const initialAddForm = {};
      props.forEach((p) => {
        initialExpanded[p.id] = false;
        initialAddForm[p.id] = false;
      });
      setExpanded(initialExpanded);
      setShowAddRoomForm(initialAddForm);

      await fetchAllRooms(props);
    } catch (err) {
      setProperties([]);
      setRooms({});
    }
  }, [fetchAllRooms]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  const handlePropertyInput = (e) => {
    const { name, value } = e.target;
    setPropertyForm((s) => ({ ...s, [name]: value }));
  };

  const handleAddProperty = async (e) => {
    e.preventDefault();
    if (!propertyForm.propertyName || !propertyForm.address) {
      setError('Please fill property name and address.');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/properties`, propertyForm, { headers: { Authorization: `Bearer ${token}` } });
      const newProp = res.data;
      setProperties((p) => [...p, newProp]);
      setRooms((r) => ({ ...r, [newProp.id]: [] }));
      setPropertyForm({ propertyName: '', address: '', description: '' });
      setShowAddPropertyForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding property');
    } finally {
      setLoading(false);
    }
  };

  // update property
  const handleUpdateProperty = async (propertyId, updated) => {
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API_URL}/properties/${propertyId}`, updated, { headers: { Authorization: `Bearer ${token}` } });
      const updatedProp = res.data;
      setProperties((p) => p.map((prop) => (prop.id === updatedProp.id ? updatedProp : prop)));
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating property');
    }
  };

  // delete property (confirm)
  const handleDeleteProperty = async (propertyId) => {
    const ok = window.confirm('Delete this property and all its rooms? This action cannot be undone.');
    if (!ok) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/properties/${propertyId}`, { headers: { Authorization: `Bearer ${token}` } });
      setProperties((p) => p.filter((prop) => prop.id !== propertyId));
      setRooms((r) => {
        const copy = { ...r };
        delete copy[propertyId];
        return copy;
      });
      if (selectedPropertyId === propertyId) setSelectedPropertyId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting property');
    }
  };

  // --- Room / detail handlers used by PropertyDetails / RoomsTable ---
  const toggleExpand = (propertyId) => {
    setExpanded((s) => ({ ...s, [propertyId]: !s[propertyId] }));
    setSelectedPropertyId(propertyId);
  };

  const toggleAddRoomFormFor = (propertyId) => {
    setShowAddRoomForm((s) => ({ ...s, [propertyId]: !s[propertyId] }));
    setRoomForm({ roomNumber: '', type: '', monthlyRent: '', capacity: '', amenities: '', paymentSchedule: '1st' });
  };

  const handleRoomInput = (e) => {
    const { name, value } = e.target;
    setRoomForm((s) => ({ ...s, [name]: value }));
  };

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
      setError(err.response?.data?.message || 'Error adding room');
    }
  };

  // update room
  const handleUpdateRoom = async (propertyId, roomId, data) => {
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API_URL}/properties/${propertyId}/rooms/${roomId}`, data, { headers: { Authorization: `Bearer ${token}` } });
      const updatedRoom = res.data;
      setRooms((r) => {
        const updated = (r[propertyId] || []).map((rm) => (rm.id === updatedRoom.id ? updatedRoom : rm));
        return { ...r, [propertyId]: updated };
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating room');
    }
  };

  // delete room (confirm)
  const handleDeleteRoom = async (propertyId, roomId) => {
    const ok = window.confirm('Delete this room and its tenant assignments? This action cannot be undone.');
    if (!ok) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/properties/${propertyId}/rooms/${roomId}`, { headers: { Authorization: `Bearer ${token}` } });
      setRooms((r) => {
        const list = (r[propertyId] || []).filter((rm) => rm.id !== roomId);
        return { ...r, [propertyId]: list };
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting room');
    }
  };

  const handleAssignTenant = async (e, roomId, propertyId, tenantEmail) => {
    e.preventDefault();
    setError('');
    const email = (tenantEmail || '').trim();
    if (!email) {
      setError('Please enter tenant email address.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/properties/${propertyId}/rooms/${roomId}/assign-tenant`,
        { tenantEmail: email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedRoom = res.data;
      setRooms((r) => {
        const updated = (r[propertyId] || []).map((room) => (room.id === roomId ? updatedRoom : room));
        return { ...r, [propertyId]: updated };
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Error assigning tenant');
    }
  };

  const handleRemoveTenant = async (roomId, tenantId, propertyId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(
        `${API_URL}/properties/${propertyId}/rooms/${roomId}/tenants/${tenantId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedRoom = res.data;
      setRooms((r) => {
        const updated = (r[propertyId] || []).map((room) => (room.id === roomId ? updatedRoom : room));
        return { ...r, [propertyId]: updated };
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Error removing tenant');
    }
  };

  return (
    <div className="dashboard-container">
      <div style={{ marginBottom: 8 }}>
        <h2 style={{ margin: 0 }}>Properties</h2>
        <p style={{ margin: 0 }}>Manage your properties, rooms and details</p>
      </div>

      <PropertyHexGrid
        properties={properties}
        selectedPropertyId={selectedPropertyId}
        handleSelectProperty={(id) => setSelectedPropertyId((prev) => (prev === id ? null : id))}
        handleShowAddPropertyForm={() => setShowAddPropertyForm(true)}
      />

      {showAddPropertyForm && (
        <div className="add-property-panel">
          <AddPropertyForm
            showAddPropertyForm={showAddPropertyForm}
            setShowAddPropertyForm={setShowAddPropertyForm}
            propertyForm={propertyForm}
            handlePropertyInput={handlePropertyInput}
            handleAddProperty={handleAddProperty}
            loading={loading}
            error={error}
          />
        </div>
      )}

      <PropertyDetails
        selectedPropertyId={selectedPropertyId}
        setSelectedPropertyId={setSelectedPropertyId}
        properties={properties}
        rooms={rooms}
        expanded={expanded}
        toggleExpand={toggleExpand}
        showAddRoomForm={showAddRoomForm}
        toggleAddRoomFormFor={toggleAddRoomFormFor}
        roomForm={roomForm}
        handleRoomInput={handleRoomInput}
        handleAddRoomFor={handleAddRoomFor}
        ROOM_TYPES={ROOM_TYPES}
        showAssignTenantForm={{}} // kept simple here; RoomsTable controls UI
        toggleAssignTenantFormFor={() => {}}
        tenantFormByRoom={{}}
        handleAssignTenant={handleAssignTenant}
        handleTenantInputForRoom={() => {}}
        handleRemoveTenant={handleRemoveTenant}
        handleUpdateProperty={handleUpdateProperty}
        handleDeleteProperty={handleDeleteProperty}
        handleUpdateRoom={handleUpdateRoom}
        handleDeleteRoom={handleDeleteRoom}
      />
    </div>
  );
}