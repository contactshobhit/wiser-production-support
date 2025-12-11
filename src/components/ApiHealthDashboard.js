import React, { useEffect, useState } from 'react';

const initialApis = [
  { name: 'HETS', status: 'unknown', latency: null, lastChecked: null },
  { name: 'PECOS', status: 'unknown', latency: null, lastChecked: null },
  { name: 'WestFax', status: 'unknown', latency: null, lastChecked: null },
  { name: 'OCR', status: 'unknown', latency: null, lastChecked: null },
  { name: 'eSMD', status: 'unknown', latency: null, lastChecked: null },
];

const statusIcon = {
  healthy: { icon: '🟢', label: 'Healthy' },
  degraded: { icon: '🟠', label: 'Degraded' },
  down: { icon: '🔴', label: 'Down' },
  unknown: { icon: '⚪', label: 'Unknown' },
};

// Dummy data for API health trends
const apiTrendDefs = [
  { key: 'esMD', label: 'esMD API' },
  { key: 'HETS', label: 'HETS Eligibility' },
  { key: 'S3', label: 'S3 Sync' },
  { key: 'Auth', label: 'Auth Token' },
];
const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
const statusTrend = apiTrendDefs.map(api => hours.map(h => Math.random() > 0.95 ? 'down' : 'up'));
const latencyTrend = apiTrendDefs.map(api => hours.map(h => Math.floor(Math.random() * 2000) + 100));
const errorTrend = apiTrendDefs.map(api => hours.map(h => Math.floor(Math.random() * 5)));

function TrendChart({ data, label, color, yLabel }) {
  // Simple line chart mockup
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', height: 60, background: '#f8f9fa', borderRadius: 6, padding: '6px 0' }}>
        {data.map((v, i) => (
          <div key={i} style={{
            width: 10,
            height: typeof v === 'number' ? Math.max(6, v / 40) : 12,
            background: typeof v === 'string' ? (v === 'up' ? '#28a745' : '#dc3545') : color,
            margin: '0 1px',
            borderRadius: 3,
            position: 'relative',
          }} title={hours[i] + (typeof v === 'number' ? `: ${v}${yLabel}` : v === 'up' ? ': Up' : ': Down')}>
            {typeof v === 'string' && v === 'down' && <span style={{ position: 'absolute', top: -18, left: -2, color: '#dc3545', fontSize: 10 }}>↓</span>}
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{yLabel}</div>
    </div>
  );
}

export default function ApiHealthDashboard() {
  const [apis, setApis] = useState(initialApis);

  // Simulate API health polling
  useEffect(() => {
    const interval = setInterval(() => {
      setApis(prev => prev.map(api => ({
        ...api,
        status: Math.random() > 0.1 ? 'healthy' : 'degraded',
        latency: (Math.random() * 500 + 100).toFixed(0),
        lastChecked: new Date().toLocaleTimeString(),
      })));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 18 }}>API Health Dashboard</div>
      {/* Historical Trends */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
        {apiTrendDefs.map((api, i) => (
          <div key={api.key} style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 6px #0001', padding: 18, minWidth: 220 }}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{api.label}</div>
            <TrendChart data={statusTrend[i]} label="Uptime (24h)" color="#28a745" yLabel="" />
            <TrendChart data={latencyTrend[i]} label="Latency (ms)" color="#007bff" yLabel=" ms" />
            <TrendChart data={errorTrend[i]} label="Error Rate" color="#dc3545" yLabel=" errors" />
          </div>
        ))}
      </div>
      {/* Uptime Summary */}
      <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 6px #0001', padding: 18, marginBottom: 32 }}>
        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 10 }}>Uptime Summary</div>
        {apiTrendDefs.map((api, i) => {
          const upCount = statusTrend[i].filter(v => v === 'up').length;
          const percent = Math.round((upCount / 24) * 100);
          return (
            <div key={api.key} style={{ marginBottom: 8, fontSize: 14 }}>
              <span style={{ fontWeight: 500 }}>{api.label}:</span> <span style={{ color: percent > 98 ? '#28a745' : percent > 90 ? '#ffc107' : '#dc3545' }}>{percent}%</span> uptime
            </div>
          );
        })}
      </div>
      {/* Diagnostics */}
      <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 6px #0001', padding: 18 }}>
        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 10 }}>Deeper Diagnostics</div>
        {apiTrendDefs.map((api, i) => (
          <div key={api.key} style={{ marginBottom: 14 }}>
            <span style={{ fontWeight: 500 }}>{api.label}:</span>
            <span style={{ marginLeft: 8, color: '#007bff' }}>Avg Latency: {Math.round(latencyTrend[i].reduce((a, b) => a + b, 0) / 24)} ms</span>
            <span style={{ marginLeft: 18, color: '#dc3545' }}>Errors: {errorTrend[i].reduce((a, b) => a + b, 0)}</span>
            <span style={{ marginLeft: 18, color: '#888' }}>Downtime: {statusTrend[i].filter(v => v === 'down').length} hrs</span>
          </div>
        ))}
      </div>
    </div>
  );
}
