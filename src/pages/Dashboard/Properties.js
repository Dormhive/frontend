import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import AddPropertyForm from './OwnerComponents/AddPropertyForm';
import PropertyHexGrid from './OwnerComponents/PropertyHexGrid';
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
  // Per-room "assign tenant" visibility and form state
  const [showAssignTenantForm, setShowAssignTenantForm] = useState({});
  const [tenantFormByRoom, setTenantFormByRoom] = useState({});

  const [roomForm] = useState({
    roomNumber: '',
    type: '',
    monthlyRent: '',
    capacity: '',
    amenities: '',
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
    await Promise.all((props || []).map(async (p) => {
      try {
        const r = await axios.get(`${API_URL}/properties/${p.id}/rooms`, { headers: { Authorization: `Bearer ${token}` } });
        roomsMap[p.id] = r.data || [];
      } catch {
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
      await fetchAllRooms(props);
    } catch {
      setProperties([]);
      setRooms({});
    }
  }, [fetchAllRooms]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  const handlePropertyInput = (e) => {
    const { name, value } = e.target;
    setPropertyForm((f) => ({ ...f, [name]: value }));
  };

  const handleAddProperty = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/properties`, propertyForm, { headers: { Authorization: `Bearer ${token}` } });
      setShowAddPropertyForm(false);
      setPropertyForm({ propertyName: '', address: '', description: '' });
      fetchProperties();
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding property');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProperty = async (propertyId, updated) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/properties/${propertyId}`, updated, { headers: { Authorization: `Bearer ${token}` } });
      fetchProperties();
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating property');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/properties/${propertyId}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchProperties();
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting property');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (propertyId) => {
    setExpanded((e) => ({ ...e, [propertyId]: !e[propertyId] }));
    setSelectedPropertyId(propertyId);
  };

  const toggleAddRoomFormFor = (propertyId) => {
    setShowAddRoomForm((s) => ({ ...s, [propertyId]: !s[propertyId] }));
    setExpanded((e) => ({ ...e, [propertyId]: true }));
    setSelectedPropertyId(propertyId);
  };

  const toggleAssignTenantFormFor = (roomId) => {
    setShowAssignTenantForm((s) => ({ ...s, [roomId]: !s[roomId] }));
  };

  const handleTenantInputForRoom = (roomId, e) => {
    const { name, value } = e.target;
    setTenantFormByRoom((f) => ({
      ...f,
      [roomId]: { ...(f[roomId] || {}), [name]: value }
    }));
  };

  const handleAssignTenant = async (e, roomId, propertyId) => {
    e.preventDefault();
    setError('');
    const form = tenantFormByRoom?.[roomId] || {};
    const email = (form.email || '').trim();
    const move_in = form.move_in;
    const paymentfrequency = move_in ? new Date(move_in).getDate() : undefined;

    if (!email || !move_in) {
      setError('Please enter tenant email address and move-in date.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/properties/${propertyId}/rooms/${roomId}/assign-tenant`,
        { tenantEmail: email, move_in, paymentfrequency },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedRoom = res.data;
      setRooms((r) => {
        const updated = (r[propertyId] || []).map((room) => (room.id === roomId ? updatedRoom : room));
        return { ...r, [propertyId]: updated };
      });
      setTenantFormByRoom((s) => ({ ...(s || {}), [roomId]: { email: '', move_in: '' } }));
      setShowAssignTenantForm((s) => ({ ...(s || {}), [roomId]: false }));
    } catch (err) {
      setError(err.response?.data?.message || 'Error assigning tenant');
    }
  };

  const handleAddRoomFor = async (propertyId, roomData, callback) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/properties/${propertyId}/rooms`,
        roomData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchProperties();
      if (callback) callback();
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding room');
    } finally {
      setLoading(false);
    }
  };

  // --- FIX: Add these handlers for delete actions ---
  const handleDeleteRoom = async (propertyId, roomId) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/properties/${propertyId}/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchProperties();
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting room');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTenant = async (roomId, tenantId, propertyId) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/properties/${propertyId}/rooms/${roomId}/tenants/${tenantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchProperties();
    } catch (err) {
      setError(err.response?.data?.message || 'Error removing tenant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Properties</h2>
      <PropertyHexGrid
        properties={properties}
        selectedPropertyId={selectedPropertyId}
        handleSelectProperty={setSelectedPropertyId}
        handleShowAddPropertyForm={() => setShowAddPropertyForm(true)}
        onEditProperty={handleUpdateProperty}
        onDeleteProperty={handleDeleteProperty}
      />
      {showAddPropertyForm && (
        <AddPropertyForm
          showAddPropertyForm={showAddPropertyForm}
          setShowAddPropertyForm={setShowAddPropertyForm}
          propertyForm={propertyForm}
          handlePropertyInput={handlePropertyInput}
          handleAddProperty={handleAddProperty}
          loading={loading}
          error={error}
        />
      )}
      {selectedPropertyId && (
        <PropertyDetails
          selectedPropertyId={selectedPropertyId}
          setSelectedPropertyId={setSelectedPropertyId}
          properties={properties}
          expanded={expanded}
          toggleExpand={toggleExpand}
          showAddRoomForm={showAddRoomForm}
          toggleAddRoomFormFor={toggleAddRoomFormFor}
          roomForm={roomForm}
          rooms={rooms}
          ROOM_TYPES={ROOM_TYPES}
          showAssignTenantForm={showAssignTenantForm}
          toggleAssignTenantFormFor={toggleAssignTenantFormFor}
          tenantFormByRoom={tenantFormByRoom}
          handleAssignTenant={handleAssignTenant}
          handleTenantInputForRoom={handleTenantInputForRoom}
          handleUpdateProperty={handleUpdateProperty}
          handleDeleteProperty={handleDeleteProperty}
          handleAddRoomFor={handleAddRoomFor}
          handleRemoveTenant={handleRemoveTenant}
          handleDeleteRoom={handleDeleteRoom}
        />
      )}
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}