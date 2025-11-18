import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

import PropertyHexGrid from './OwnerComponents/PropertyHexGrid';
import PropertyDetails from './OwnerComponents/PropertyDetails';
import AddPropertyForm from './OwnerComponents/AddPropertyForm';
import TenantsSection from './OwnerComponents/TenantsSection';

const API_URL = 'http://localhost:3001/api';

export default function OwnerDashboard() {
  const navigate = useNavigate();

  const [showAddPropertyForm, setShowAddPropertyForm] = useState(false);
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [rooms, setRooms] = useState({});
  const [expanded, setExpanded] = useState({});
  const [showAddRoomForm, setShowAddRoomForm] = useState({});
  const [showAssignTenantForm, setShowAssignTenantForm] = useState({});
  const [tenantFormByRoom, setTenantFormByRoom] = useState({});

  const [allTenants, setAllTenants] = useState([]);
  const [filteredTenants, setFilteredTenants] = useState([]);
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState('all');
  const [expandedTenantId, setExpandedTenantId] = useState(null);

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
    paymentSchedule: '1st',
  });

  const ROOM_TYPES = [
    'Bedspace',
    'Studio',
    'One Bedroom',
    'Two Bedroom',
    'Condo Sharing'
  ];

  const [selectedPropertyId, setSelectedPropertyId] = useState(null);

  // --- Logic ---
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
            allRooms[prop.id] = [];
          }
        })
      );
      setRooms(allRooms);
    } catch (err) {
      // ignore
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
      fetchAllRooms(props);
    } catch (err) {
      setError('Failed to load properties');
    }
  }, [fetchAllRooms]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);
  useEffect(() => { aggregateTenants(); }, [aggregateTenants]);
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
      setShowAddPropertyForm(false); // close modal on success
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding property');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (propertyId) => {
    const willExpand = !expanded[propertyId];
    setExpanded((s) => ({ ...s, [propertyId]: willExpand }));
  };

  const toggleAddRoomFormFor = (propertyId) => {
    setShowAddRoomForm((s) => ({ ...s, [propertyId]: !s[propertyId] }));
    setRoomForm({ roomNumber: '', type: '', monthlyRent: '', capacity: '', amenities: '', paymentSchedule: '1st' });
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

  const toggleAssignTenantFormFor = (roomId) => {
    setShowAssignTenantForm((s) => ({ ...s, [roomId]: !s[roomId] }));
    setTenantFormByRoom((prev) => ({ ...prev, [roomId]: { email: '' } }));
  };

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
        { tenantEmail: tenantInput },
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
      setTenantFormByRoom((prev) => ({ ...prev, [roomId]: { email: '' } }));
      setShowAssignTenantForm((s) => ({ ...s, [roomId]: false }));
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
      setError(err.response?.data?.message || 'Error removing tenant');
    }
  };

  // When a tile is clicked open details modal (do not remove existing behavior)
  const handleSelectProperty = (propertyId) => {
    // toggle selection as before
    setSelectedPropertyId((prev) => {
      const next = prev === propertyId ? null : propertyId;
      setShowPropertyDetails(next !== null);
      return next;
    });
  };

  const handleShowAddPropertyForm = () => setShowAddPropertyForm(true);

  const closeAddPropertyModal = () => setShowAddPropertyForm(false);
  const closePropertyDetailsModal = () => {
    setShowPropertyDetails(false);
    setSelectedPropertyId(null);
  };

  // --- Render ---
  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ position:'relative' }}>
        <div className="brand">
          <img src="/assets/logo.png" alt="DormHive" onError={(e)=>{e.target.style.display='none'}} />
          <div>
            <h2 style={{ margin: 0 }}>Owner Dashboard</h2>
            <p style={{ margin: 0 }}>Welcome to your property management dashboard.</p>
          </div>
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

          <PropertyHexGrid
            properties={properties}
            selectedPropertyId={selectedPropertyId}
            handleSelectProperty={handleSelectProperty}
            handleShowAddPropertyForm={handleShowAddPropertyForm}
          />
        </section>

        <section>
          <TenantsSection
            allTenants={allTenants}
            filteredTenants={filteredTenants}
            selectedPropertyFilter={selectedPropertyFilter}
            setSelectedPropertyFilter={setSelectedPropertyFilter}
            expandedTenantId={expandedTenantId}
            setExpandedTenantId={setExpandedTenantId}
            properties={properties}
          />
        </section>

        <section>
          <h3>Earnings</h3>
          <p>Track your rental income.</p>
        </section>
      </div>

      {/* Add Property Modal */}
      {showAddPropertyForm && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Add property">
          <div className="modal-card">
            <div className="modal-close">
              <button onClick={closeAddPropertyModal} className="cancel-btn">×</button>
            </div>
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
        </div>
      )}

      {/* Property Details Modal */}
      {showPropertyDetails && selectedPropertyId != null && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Property details">
          <div className="modal-card">
            <div className="modal-close">
              <button onClick={closePropertyDetailsModal} className="cancel-btn">×</button>
            </div>
            <PropertyDetails
              selectedPropertyId={selectedPropertyId}
              setSelectedPropertyId={setSelectedPropertyId}
              properties={properties}
              expanded={expanded}
              toggleExpand={toggleExpand}
              showAddRoomForm={showAddRoomForm}
              toggleAddRoomFormFor={toggleAddRoomFormFor}
              roomForm={roomForm}
              handleRoomInput={handleRoomInput}
              handleAddRoomFor={handleAddRoomFor}
              rooms={rooms}
              ROOM_TYPES={ROOM_TYPES}
              showAssignTenantForm={showAssignTenantForm}
              toggleAssignTenantFormFor={toggleAssignTenantFormFor}
              tenantFormByRoom={tenantFormByRoom}
              handleAssignTenant={handleAssignTenant}
              handleTenantInputForRoom={handleTenantInputForRoom}
              handleRemoveTenant={handleRemoveTenant}
              // pass optional onClose so component can close itself if needed
              onClose={closePropertyDetailsModal}
            />
          </div>
        </div>
      )}
    </div>
  );
}