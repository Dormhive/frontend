// ...existing code...
import React from 'react';

export default function AddPropertyForm({
  showAddPropertyForm,
  setShowAddPropertyForm,
  propertyForm,
  handlePropertyInput,
  handleAddProperty,
  loading,
  error,
}) {
  return (
    <div className="add-property-card" role="region" aria-label="Add property form">
      <div className="add-property-card-header">
        <h4 style={{ margin: 0 }}>Add New Property</h4>
        <button className="add-property-cancel" onClick={() => setShowAddPropertyForm(false)} aria-label="Cancel add property">Cancel</button>
      </div>

      <form className="add-property-form" onSubmit={handleAddProperty}>
        <div className="form-row">
          <label htmlFor="propertyName">Property Name</label>
          <input id="propertyName" name="propertyName" value={propertyForm.propertyName} onChange={handlePropertyInput} required />
        </div>

        <div className="form-row">
          <label htmlFor="address">Address</label>
          <input id="address" name="address" value={propertyForm.address} onChange={handlePropertyInput} required />
        </div>

        <div className="form-row">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" value={propertyForm.description} onChange={handlePropertyInput} rows="3" />
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </button>
          <button type="button" className="cancel-btn" onClick={() => setShowAddPropertyForm(false)}>Close</button>
        </div>
      </form>
    </div>
  );
}