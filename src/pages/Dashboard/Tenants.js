import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import TenantsSection from './OwnerComponents/TenantsSection';

const API_URL = 'http://localhost:3001/api';

export default function TenantsPage() {
  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState({});
  const [allTenants, setAllTenants] = useState([]);
  const [filteredTenants, setFilteredTenants] = useState([]);
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState('all');

  // <-- fix: keep track of expanded tenant so "details" button can toggle
  const [expandedTenantId, setExpandedTenantId] = useState(null);

  const fetchPropertiesAndRooms = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/properties`, { headers: { Authorization: `Bearer ${token}` } });
      const props = res.data || [];
      setProperties(props);

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
    } catch (err) {
      setProperties([]);
    }
  }, []);

  const aggregateTenants = useCallback(() => {
    const tenantsList = [];
    Object.entries(rooms).forEach(([propertyId, roomList]) => {
      const property = properties.find((p) => p.id === parseInt(propertyId, 10));
      if (!property) return;
      (roomList || []).forEach((room) => {
        (room.tenants || []).forEach((tenant) => {
          tenantsList.push({
            ...tenant,
            roomId: room.id,
            roomNumber: room.roomNumber,
            propertyId: parseInt(propertyId, 10),
            propertyName: property.propertyName,
            propertyAddress: property.address,
            paymentSchedule: tenant.paymentSchedule || room.paymentSchedule || '1st',
          });
        });
      });
    });
    setAllTenants(tenantsList);
  }, [rooms, properties]);

  useEffect(() => { fetchPropertiesAndRooms(); }, [fetchPropertiesAndRooms]);
  useEffect(() => { aggregateTenants(); }, [aggregateTenants]);
  useEffect(() => {
    if (selectedPropertyFilter === 'all') setFilteredTenants(allTenants);
    else setFilteredTenants(allTenants.filter((t) => t.propertyId === parseInt(selectedPropertyFilter, 10)));
  }, [allTenants, selectedPropertyFilter]);

  return (
    <div className="dashboard-container">
      <div style={{ marginBottom: 8 }}>
        <h2 style={{ margin: 0 }}>Tenants</h2>
        <p style={{ margin: 0 }}>Tenant list and management</p>
      </div>

      <TenantsSection
        allTenants={allTenants}
        filteredTenants={filteredTenants}
        selectedPropertyFilter={selectedPropertyFilter}
        setSelectedPropertyFilter={setSelectedPropertyFilter}
        expandedTenantId={expandedTenantId}
        setExpandedTenantId={setExpandedTenantId}
        properties={properties}
      />
    </div>
  );
}