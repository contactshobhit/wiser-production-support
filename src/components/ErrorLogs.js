import React from 'react';
// Simulated error log data
// Simulated error log data with state machine and audit trail
const sampleLogs = [
  {
    id: 1,
    packetId: 'PKT-1001',
    time: '2025-12-11 10:15',
    type: 'API',
    source: 'HETS',
    message: 'Timeout error',
    severity: 'High',
    state: 'Eligibility Check (HETS)',
    audit: [
      { state: 'Packet Intake', time: '2025-12-11 09:45' },
      { state: 'OCR & Digitization', time: '2025-12-11 09:50' },
      { state: 'Eligibility Check (HETS)', time: '2025-12-11 10:15' },
    ],
  },
  {
    id: 2,
    packetId: 'PKT-1002',
    time: '2025-12-11 10:10',
    type: 'OCR',
    source: 'Packet Intake',
    message: 'OCR failed on coversheet',
    severity: 'Medium',
    state: 'OCR & Digitization',
    audit: [
      { state: 'Packet Intake', time: '2025-12-11 09:55' },
      { state: 'OCR & Digitization', time: '2025-12-11 10:10' },
    ],
  },
  {
    id: 3,
    packetId: 'PKT-1003',
    time: '2025-12-11 09:55',
    type: 'Delivery',
    source: 'WestFax',
    message: 'Fax delivery failed',
    severity: 'High',
    state: 'Delivery (WestFax/Mailroom)',
    audit: [
      { state: 'Packet Intake', time: '2025-12-11 09:30' },
      { state: 'Delivery (WestFax/Mailroom)', time: '2025-12-11 09:55' },
    ],
  },
  {
    id: 4,
    packetId: 'PKT-1004',
    time: '2025-12-11 09:50',
    type: 'API',
    source: 'PECOS',
    message: 'NPI not found',
    severity: 'Low',
    state: 'Provider NPI Check (PECOS)',
    audit: [
      { state: 'Packet Intake', time: '2025-12-11 09:40' },
      { state: 'Provider NPI Check (PECOS)', time: '2025-12-11 09:50' },
    ],
  },
];

export default function ErrorLogs() {
  const [logs] = React.useState(sampleLogs);
  const [search, setSearch] = React.useState('');
  const [type, setType] = React.useState('all');
  const [severity, setSeverity] = React.useState('all');
  // For real data, replace sampleLogs with API call and useEffect

  const filtered = logs.filter(log => {
    const matchesSearch =
      log.message.toLowerCase().includes(search.toLowerCase()) ||
      log.source.toLowerCase().includes(search.toLowerCase());
    const matchesType = type === 'all' || log.type === type;
    const matchesSeverity = severity === 'all' || log.severity === severity;
    return matchesSearch && matchesType && matchesSeverity;
  });

  return (
    <section style={{ padding: 24 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Error Logs</h2>
      <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search message or source..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', minWidth: 200 }}
        />
        <select value={type} onChange={e => setType(e.target.value)} style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}>
          <option value="all">All Types</option>
          <option value="API">API</option>
          <option value="OCR">OCR</option>
          <option value="Delivery">Delivery</option>
        </select>
        <select value={severity} onChange={e => setSeverity(e.target.value)} style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}>
          <option value="all">All Severities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
        <thead>
          <tr style={{ background: '#f5f7fa' }}>
            <th style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0' }}>Packet ID</th>
            <th style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0' }}>Time</th>
            <th style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0' }}>Type</th>
            <th style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0' }}>Source</th>
            <th style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0' }}>Message</th>
            <th style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0' }}>Severity</th>
            <th style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0' }}>State</th>
            <th style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0' }}>Audit Trail</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((log, idx) => (
            <tr key={log.id} style={{ borderBottom: '1px solid #f0f0f0', background: idx % 2 === 0 ? '#fff' : '#fafbfc' }}>
              <td style={{ padding: '12px 16px', borderRight: '1px solid #f0f0f0', fontWeight: 600, color: '#2563eb' }}>{log.packetId}</td>
              <td style={{ padding: '12px 16px', borderRight: '1px solid #f0f0f0' }}>{log.time}</td>
              <td style={{ padding: '12px 16px', borderRight: '1px solid #f0f0f0' }}>{log.type}</td>
              <td style={{ padding: '12px 16px', borderRight: '1px solid #f0f0f0' }}>{log.source}</td>
              <td style={{ padding: '12px 16px', borderRight: '1px solid #f0f0f0' }}>{log.message}</td>
              <td style={{ padding: '12px 16px', color: log.severity === 'High' ? '#b00020' : log.severity === 'Medium' ? '#b36b00' : '#006400', fontWeight: 600 }}>{log.severity}</td>
              <td style={{ padding: '12px 16px', borderRight: '1px solid #f0f0f0', fontWeight: 600 }}>{log.state}</td>
              <td style={{ padding: '12px 16px' }}>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {log.audit.map((a, i) => (
                    <li key={i} style={{ fontSize: 13, color: '#555' }}>
                      <span style={{ fontWeight: 600 }}>{a.state}</span> <span style={{ color: '#888' }}>({a.time})</span>
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filtered.length === 0 && <div style={{ color: '#b00020', marginTop: 24 }}>No logs found for selected filters.</div>}
    </section>
  );
}
