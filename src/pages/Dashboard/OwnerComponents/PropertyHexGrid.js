// ...existing code...
import React from 'react';
import HexGrid from '../../../components/HexGrid';

function PropertyHexGrid({
  properties,
  selectedPropertyId,
  handleSelectProperty,
  handleShowAddPropertyForm,
  onEditProperty,
  onDeleteProperty
}) {
  return (
    <HexGrid
      properties={properties}
      selectedId={selectedPropertyId}
      onSelect={handleSelectProperty}
      onAddClick={handleShowAddPropertyForm}
      onEdit={onEditProperty}
      onDelete={onDeleteProperty}
    />
  );
}

export default PropertyHexGrid;