import React from 'react';

const NotificationBell = ({ count = 0 }) => (
  <div style={{ position: 'relative', cursor: 'pointer' }} title="Critical Error Notifications">
    <span style={{ fontSize: 28, color: '#dc2626' }}>🔔</span>
    {count > 0 && (
      <span style={{ position: 'absolute', top: 0, right: 0, background: '#dc2626', color: 'white', borderRadius: '50%', fontSize: 13, fontWeight: 700, padding: '2px 7px', border: '2px solid #fff' }}>{count}</span>
    )}
  </div>
);

export default NotificationBell;
