import React from 'react';
import { useSystemStatus } from '../hooks';

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
  if (status === 'connected' || status === 'valid' || status === 'ok') return '#28a745';
  if (status === 'degraded' || status === 'unknown') return '#ffc107';
  return '#dc3545';
};

const SystemStatusBar = () => {
  const { backend, pendingActions, loading, isBackendConnected } = useSystemStatus(30000);

  // Calculate time since last check
  const getTimeSinceCheck = () => {
    if (!backend.lastChecked) return 'Never';
    const diff = Math.floor((Date.now() - new Date(backend.lastChecked).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    return `${Math.floor(diff / 60)}m ago`;
  };

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
        <StatusDot color={getStatusColor(backend.status)} />
        Backend API: <span style={{ color: '#888' }}>
          {loading ? 'Checking...' : (isBackendConnected ? 'Connected' : backend.status)}
        </span>
        {backend.version && (
          <span style={{ color: '#aaa', marginLeft: 4 }}>v{backend.version}</span>
        )}
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <StatusDot color={getStatusColor(isBackendConnected ? 'connected' : 'down')} />
        Last Check: <span style={{ color: '#888' }}>{getTimeSinceCheck()}</span>
      </span>
      {pendingActions.supportTickets > 0 && (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#dc3545' }}>
          Support Tickets: <strong>{pendingActions.supportTickets}</strong> pending
        </span>
      )}
      {pendingActions.p2pCalls > 0 && (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fd7e14' }}>
          P2P Calls: <strong>{pendingActions.p2pCalls}</strong> new
        </span>
      )}
    </div>
  );
};

export default SystemStatusBar;
