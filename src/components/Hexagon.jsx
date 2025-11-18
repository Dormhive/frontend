import React from 'react';
import PropTypes from 'prop-types';

export default function Hexagon({ title, address, onClick, selected, isAdd, ariaLabel }) {
  const cls = ['hex'];
  if (isAdd) cls.push('hex-add');
  if (selected) cls.push('selected');

  return (
    <button
      type="button"
      className={cls.join(' ')}
      onClick={onClick}
      aria-label={ariaLabel || (isAdd ? 'Add property' : title)}
    >
      <svg
        className="hex-svg"
        viewBox="0 0 100 86"
        preserveAspectRatio="none"
        role="img"
        aria-hidden={isAdd ? 'false' : 'true'}
      >
        <polygon
          points="50,3 97,25 97,61 50,83 3,61 3,25"
          fill={isAdd ? '#fff6d0' : '#ffd24d'}
          stroke="#b24700"
          strokeWidth={isAdd ? 5 : 6}
          strokeLinejoin="round"
          strokeDasharray={isAdd ? '6,6' : '0'}
        />
        {isAdd && (
          <text
            x="50"
            y="54"
            fontSize="36"
            fontFamily="Arial,Helvetica,sans-serif"
            fill="#b24700"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            +
          </text>
        )}
      </svg>

      <div className="hex-inner">
        {!isAdd && (
          <>
            <div className="hex-title" title={title}>{title}</div>
            {address && <div className="hex-address" title={address}>{address}</div>}
          </>
        )}
      </div>
    </button>
  );
}

Hexagon.propTypes = {
  title: PropTypes.string,
  address: PropTypes.string,
  onClick: PropTypes.func,
  selected: PropTypes.bool,
  isAdd: PropTypes.bool,
  ariaLabel: PropTypes.string,
};