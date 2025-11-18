import React from 'react';
import Hexagon from './Hexagon';

export default function HexGrid({ properties = [], selectedId, onSelect, onAdd }) {
  // render up to 5 properties in honeycomb layout; add-hex shown after last item
  const items = properties.slice(0, 5);
  return (
    <div className="hex-grid" role="list" aria-label="Properties honeycomb">
      {items.map((p) => (
        <Hexagon
          key={p.id}
          title={p.propertyName}
          address={p.address}
          selected={selectedId === p.id}
          onClick={() => onSelect(p.id)}
        />
      ))}

      {/* ensure add hex is rendered last so CSS can place it to the right */}
      <Hexagon key="add-hex" isAdd onClick={onAdd} ariaLabel="Add property" />
    </div>
  );
}