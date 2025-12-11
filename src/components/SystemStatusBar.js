import React, { useEffect, useState } from 'react';

// Helper for status dot
const StatusDot = ({ color }) => (
  <span style={{
    display: 'inline-block',
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: color,
    marginRight: 6,
    verticalAlign: 'middle',
    border: '1px solid #ccc',
  }} />
);

const getStatusColor = (status) => {
  if (status === 'connected' || status === 'valid') return '#28a745';
  if (status === 'degraded') return '#ffc107';
  return '#dc3545';
};

const SystemStatusBar = ({
  esmdStatus = 'connected',
  hetsStatus = 'connected',
  s3LastSync = 5,
  authTokenExpiry = 120,
}) => {
  return (
    <div style={{
      background: '#F8F9FA',
      height: 30,
      display: 'flex',
      alignItems: 'center',
      fontSize: 12,
      color: '#222',
      padding: '0 32px',
      borderBottom: '1px solid #eee',
      gap: 32,
    }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <StatusDot color={getStatusColor(esmdStatus)} />
        esMD API: <span style={{ color: '#888' }}>{esmdStatus === 'connected' ? 'Connected' : 'Disconnected'}</span>
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <StatusDot color={getStatusColor(hetsStatus)} />
        HETS: <span style={{ color: '#888' }}>{hetsStatus === 'connected' ? 'Connected' : 'Disconnected'}</span>
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <StatusDot color={getStatusColor(s3LastSync < 15 ? 'connected' : 'degraded')} />
        S3 Sync: <span style={{ color: '#888' }}>Last sync: {s3LastSync} min ago</span>
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <StatusDot color={getStatusColor(authTokenExpiry > 10 ? 'valid' : 'degraded')} />
        Auth Token: <span style={{ color: '#888' }}>{authTokenExpiry} min left</span>
      </span>
    </div>
  );
};

export default SystemStatusBar;
