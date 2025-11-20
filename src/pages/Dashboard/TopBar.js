import React from 'react';
import './Dashboard.css';

export default function TopBar({ active = 'overview', onSelect = () => {} }) {
  const items = [
    { id: 'overview', label: 'Overview', icon: '🏠' },
    { id: 'properties', label: 'Properties', icon: '🏘️' },
    { id: 'tenants', label: 'Tenants', icon: '👥' },
    { id: 'finance', label: 'Finance', icon: '💳' },
    { id: 'concerns', label: 'Concerns', icon: '❗' },
  ];

  return (
    <header className="dh-topbar" role="navigation" aria-label="Dashboard navigation">
      <div className="dh-brand">
        <img src="/assets/logo.png" alt="DormHive" onError={(e) => { e.target.style.display = 'none'; }} />
        <span className="dh-brand-title">DormHive</span>
      </div>

      <nav className="dh-nav">
        {items.map((it) => (
          <button
            key={it.id}
            className={`dh-nav-btn${active === it.id ? ' active' : ''}`}
            onClick={() => onSelect(it.id)}
            aria-pressed={active === it.id}
            aria-label={it.label}
            title={it.label}
          >
            <span className="dh-nav-icon" aria-hidden>{it.icon}</span>
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
        >
          Logout
        </button>
      </div>
    </header>
  );
}