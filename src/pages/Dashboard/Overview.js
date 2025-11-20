import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import SummarySection from './OwnerComponents/SummarySection';
import './Overview.css';
import './Dashboard.css';

const API_URL = 'http://localhost:3001/api';

export default function Overview({ onOpenConcerns = null }) {
  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState({});
  const [allTenants, setAllTenants] = useState([]);
  const [concernsCount, setConcernsCount] = useState(0);
  const [reminders] = useState([]); // keep empty or populate

  const fetchProperties = useCallback(async () => {
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
        } catch {
          roomsMap[p.id] = [];
        }
      }));
      setRooms(roomsMap);
    } catch {
      setProperties([]);
      setRooms({});
    }
  }, []);

  const fetchConcernsCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/concerns/count`, { headers: { Authorization: `Bearer ${token}` } });
      setConcernsCount(res.data?.count || 0);
    } catch {
      setConcernsCount(0);
    }
  }, []);

  const aggregateTenants = useCallback(() => {
    const tenants = [];
    Object.entries(rooms).forEach(([propertyId, roomList]) => {
      (roomList || []).forEach((room) => {
        (room.tenants || []).forEach((t) => {
          tenants.push({ ...t, roomId: room.id, propertyId: parseInt(propertyId, 10), roomNumber: room.roomNumber });
        });
      });
    });
    setAllTenants(tenants);
  }, [rooms]);

  useEffect(() => { fetchProperties(); fetchConcernsCount(); }, [fetchProperties, fetchConcernsCount]);
  useEffect(() => { aggregateTenants(); }, [aggregateTenants]);

  const totalProperties = properties.length;
  const totalRooms = Object.values(rooms).reduce((sum, arr) => sum + ((arr && arr.length) || 0), 0);
  const occupiedRooms = Object.values(rooms).reduce((sum, arr) => {
    const occ = (arr || []).filter(r => (r.tenants && r.tenants.length > 0)).length;
    return sum + occ;
  }, 0);
  const availableRooms = Math.max(0, totalRooms - occupiedRooms);
  const totalTenants = allTenants.length;

  return (
    <div className="dashboard-container">
      <div style={{ marginBottom: 8 }}>
        <h2 style={{ margin: 0 }}>Overview</h2>
        <p style={{ margin: 0 }}>Quick metrics for your portfolio</p>
      </div>

      <SummarySection
        totalProperties={totalProperties}
        totalRooms={totalRooms}
        occupiedRooms={occupiedRooms}
        availableRooms={availableRooms}
        totalTenants={totalTenants}
        concernsCount={concernsCount}
        reminders={reminders}
        onOpenConcerns={onOpenConcerns}
      />
    </div>
  );
}