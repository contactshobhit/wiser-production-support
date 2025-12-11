import React from 'react';

const cardStyles = {
  base: {
    flex: 1,
    minWidth: 180,
    background: '#fff',
    borderRadius: 8,
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    padding: '16px 18px 12px 12px',
    margin: '0 12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    cursor: 'pointer',
    borderLeft: '6px solid',
    transition: 'box-shadow 0.2s',
  },
  red: { borderColor: '#dc3545' },
  orange: { borderColor: '#fd7e14' },
  blue: { borderColor: '#007bff' },
  green: { borderColor: '#28a745' },
};

const MetricCard = ({ color, count, label, percent, direction, onClick }) => (
  <div
    style={{ ...cardStyles.base, ...cardStyles[color] }}
    onClick={onClick}
    tabIndex={0}
    aria-label={label}
    role="button"
  >
    <div style={{ fontSize: 32, fontWeight: 700, color: cardStyles[color].borderColor }}>{count}</div>
    <div style={{ fontSize: 14, color: '#444', marginTop: 4 }}>{label}</div>
    <div style={{ fontSize: 12, color: direction === 'up' ? '#28a745' : '#dc3545', marginTop: 2 }}>
      {direction === 'up' ? '↑' : '↓'}{percent}% from yesterday
    </div>
  </div>
);

const MetricsRow = ({ metrics, onFilter }) => (
  <div
    style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: 0,
      margin: '18px 0 24px 0',
      width: '100%',
      boxSizing: 'border-box',
    }}
  >
    {metrics.map((m, i) => (
      <MetricCard key={i} {...m} onClick={() => onFilter(m.filterType)} />
    ))}
  </div>
);

export default MetricsRow;
