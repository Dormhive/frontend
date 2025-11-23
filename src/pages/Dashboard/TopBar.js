import React from 'react';
import brandLogo from './images/Logo.png';
import logoutImg from './images/Log.png';
import financeImg from './images/finance.png';
import overviewImg from './images/overviewtab.png'; // Import the new image for Overview
import propertiesImg from './images/properties.png'; // Import the new image for Properties
import tenantsImg from './images/tenants.png'; // Import the new image for Tenants
import concernImg from './images/concern.png'; // Import the new image for Concerns
import './TopBar.css';

export default function TopBar({ active = 'overview', onSelect = () => {} }) {
  const items = [
    { id: 'overview', label: 'Overview', icon: overviewImg }, // Use the new image for Overview
    { id: 'properties', label: 'Properties', icon: propertiesImg }, // Use the new image for Properties
    { id: 'tenants', label: 'Tenants', icon: tenantsImg }, // Use the new image for Tenants
    { id: 'finance', label: 'Finance', icon: financeImg },
    { id: 'concerns', label: 'Concerns', icon: concernImg }, // Use the new image for Concerns
  ];

  return (
    <header className="dh-topbar" role="navigation" aria-label="Dashboard navigation">
      <div className="dh-brand">
        <img className="dh-logo" src={brandLogo} alt="DormHive" />
        <span className="dh-brand-title">DormHive</span>
      </div>

      <nav className="dh-nav" role="tablist" aria-label="Main sections">
        {items.map((it) => (
          <button
            key={it.id}
            className={`dh-nav-btn${active === it.id ? ' active' : ''}`}
            role="tab"
            aria-selected={active === it.id}
            tabIndex={active === it.id ? 0 : -1}
            onClick={() => onSelect(it.id)}
          >
            <img src={it.icon} alt="" className="dh-nav-icon-img" aria-hidden="true" />
            <span className="dh-nav-label">{it.label}</span>
          </button>
        ))}
      </nav>

      <div className="dh-actions">
        <button
          className="submit-btn"
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('userRole');
            window.location.href = '/';
          }}
          aria-label="Logout"
        >
          <span className="hex-badge" aria-hidden="true">
            <img src={logoutImg} alt="" className="hex-badge-img" />
          </span>
          Logout
        </button>
      </div>
    </header>
  );
}