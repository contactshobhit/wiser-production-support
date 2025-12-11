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
    <section aria-labelledby="api-dashboard-title" style={{ padding: 24 }}>
      <h2 id="api-dashboard-title" style={{ marginBottom: 24 }}>API Health & Performance Dashboard</h2>
      <table
        style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}
        aria-label="API health and performance table"
      >
        <thead>
          <tr style={{ background: '#f5f7fa' }}>
            <th scope="col" style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0', color: '#1a1a1a' }}>API</th>
            <th scope="col" style={{ textAlign: 'center', padding: '12px 16px', borderBottom: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0', color: '#1a1a1a' }}>Status</th>
            <th scope="col" style={{ textAlign: 'right', padding: '12px 16px', borderBottom: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0', color: '#1a1a1a' }}>Latency (ms)</th>
            <th scope="col" style={{ textAlign: 'center', padding: '12px 16px', borderBottom: '1px solid #e0e0e0', color: '#1a1a1a' }}>Last Checked</th>
          </tr>
        </thead>
        <tbody>
          {apis.map(({ name, status, latency, lastChecked }, idx) => (
            <tr
              key={name}
              style={{ borderBottom: '1px solid #f0f0f0', background: idx % 2 === 0 ? '#fff' : '#fafbfc' }}
              tabIndex={0}
              aria-label={`Row for ${name} API, status ${statusIcon[status].label}`}
            >
              <th scope="row" style={{ padding: '12px 16px', borderRight: '1px solid #f0f0f0', fontWeight: 600, color: '#222' }}>{name}</th>
              <td style={{ textAlign: 'center', padding: '12px 16px', borderRight: '1px solid #f0f0f0', fontWeight: 600 }}>
                <span
                  role="img"
                  aria-label={statusIcon[status].label}
                  style={{ fontSize: 20, verticalAlign: 'middle', marginRight: 8 }}
                >
                  {statusIcon[status].icon}
                </span>
                <span style={{ color: status === 'down' ? '#b00020' : status === 'degraded' ? '#b36b00' : '#006400' }}>{statusIcon[status].label}</span>
              </td>
              <td style={{ textAlign: 'right', padding: '12px 16px', borderRight: '1px solid #f0f0f0', color: '#222' }}>{latency || '-'}</td>
              <td style={{ textAlign: 'center', padding: '12px 16px', color: '#222' }}>{lastChecked || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
