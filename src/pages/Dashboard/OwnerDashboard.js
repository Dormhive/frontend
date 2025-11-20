import React, { useState } from 'react';
import './Dashboard.css';
import TopBar from './TopBar';
import Overview from './Overview';
import PropertiesPage from './Properties';
import TenantsPage from './Tenants';
import Finance from './Finance';
import Concerns from './Concerns';

/**
 * OwnerDashboard shell — topbar + page switcher.
 */
export default function OwnerDashboard() {
  const [active, setActive] = useState('overview');

  return (
    <div className="dashboard-shell">
      <TopBar active={active} onSelect={(page) => setActive(page)} />
      <div className="dashboard-page-wrapper">
        {active === 'overview' && <Overview onOpenConcerns={() => setActive('concerns')} />}
        {active === 'properties' && <PropertiesPage />}
        {active === 'tenants' && <TenantsPage />}
        {active === 'finance' && <Finance />}
        {active === 'concerns' && <Concerns />}
      </div>
    </div>
  );
}