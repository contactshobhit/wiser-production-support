import React from 'react';

export default function NavBar({ current, onNavigate }) {
  const navItems = [
    { key: 'api', label: 'API Health' },
    { key: 'process', label: 'Process Tracker' }
  ];
  return (
    <nav style={{
      display: 'flex',
      gap: 24,
      background: '#f5f7fa',
      borderBottom: '1px solid #e0e0e0',
      padding: '12px 32px',
      fontSize: 16
    }}>
      {navItems.map(item => (
        <button
          key={item.key}
          onClick={() => onNavigate(item.key)}
          style={{
            background: current === item.key ? '#005fa3' : 'transparent',
            color: current === item.key ? 'white' : '#003366',
            border: 'none',
            borderRadius: 4,
            padding: '8px 20px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
