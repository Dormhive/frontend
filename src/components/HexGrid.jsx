// ...existing code...
import React from 'react';
import defaultIcon from '../assets/beehive.jpg';

export default function HexGrid({ properties = [], selectedId, onSelect, onAddClick, onEdit, onDelete }) {
  const items = (properties || []).slice(0, 5);

  return (
    <div className="property-tile-grid" role="list" aria-label="Properties">
      {items.map((p) => (
        <button
          key={p.id}
          className={`property-tile${selectedId === p.id ? ' selected' : ''}`}
          onClick={() => onSelect && onSelect(p.id)}
          role="listitem"
          aria-pressed={selectedId === p.id}
        >
          <img
            src={p.imageUrl || defaultIcon}
            alt={p.propertyName || 'Property image'}
            className="property-tile-img"
          />
          <div className="img-overlay" aria-hidden>
            {/* Edit / delete small icons */}
            <div style={{ display:'flex', gap:8 }}>
              <button
                type="button"
                aria-label="Edit property"
                title="Edit"
                onClick={(e) => { e.stopPropagation(); onEdit && onEdit(p); }}
                style={{ background:'transparent', border:'none', cursor:'pointer' }}
              >
                ✎
              </button>
              <button
                type="button"
                aria-label="Delete property"
                title="Delete"
                onClick={(e) => { e.stopPropagation(); onDelete && onDelete(p.id); }}
                style={{ background:'transparent', border:'none', cursor:'pointer' }}
              >
                🗑
              </button>
            </div>
          </div>

          <div className="property-tile-info">
            <div className="property-tile-title">{p.propertyName || 'Untitled Property'}</div>
            <div className="property-tile-address">{p.address || 'No address provided'}</div>
          </div>
        </button>
      ))}

      <button
        className="property-tile add-tile"
        onClick={() => onAddClick && onAddClick()}
        aria-label="Add property"
        title="Add property"
      >
        <span className="add-plus">+</span>
      </button>
    </div>
  );
}