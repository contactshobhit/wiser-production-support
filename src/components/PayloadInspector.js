import React from 'react';
// Simulated payload data (with PHI)
// Simulated payload data (with PHI, state, and audit trail)
const samplePayloads = [
  {
    id: 'PKT-1001',
    patient: 'John Smith',
    provider: 'ABC Medical Clinic',
    service: 'L0450',
    PHI: true,
    details: '{ "mbi": "1EG4TE5MK72", "dob": "1970-01-01", "diagnosis": "S82.001A" }',
    state: 'Eligibility Check (HETS)',
    audit: [
      { state: 'Packet Intake', time: '2025-12-11 09:45' },
      { state: 'OCR & Digitization', time: '2025-12-11 09:50' },
      { state: 'Eligibility Check (HETS)', time: '2025-12-11 10:15' },
    ],
  },
  {
    id: 'PKT-1002',
    patient: 'Mary Johnson',
    provider: 'XYZ Health',
    service: 'L0454',
    PHI: true,
    details: '{ "mbi": "1AB2CD3EF45", "dob": "1965-05-12", "diagnosis": "M17.11" }',
    state: 'OCR & Digitization',
    audit: [
      { state: 'Packet Intake', time: '2025-12-11 09:55' },
      { state: 'OCR & Digitization', time: '2025-12-11 10:10' },
    ],
  },
  {
    id: 'PKT-1003',
    patient: 'Robert Williams',
    provider: 'City Orthopedics',
    service: 'L0631',
    PHI: false,
    details: '{ "mbi": "1GH4IJ5KL67", "dob": "1980-09-23", "diagnosis": "M54.5" }',
    state: 'Delivery (WestFax/Mailroom)',
    audit: [
      { state: 'Packet Intake', time: '2025-12-11 09:30' },
      { state: 'Delivery (WestFax/Mailroom)', time: '2025-12-11 09:55' },
    ],
  },
];

export default function PayloadInspector() {
  const [payloads] = React.useState(samplePayloads);
  const [selected, setSelected] = React.useState(null);
  const [authorized, setAuthorized] = React.useState(false); // Simulate PHI access
  const [search, setSearch] = React.useState('');
  const [phi, setPhi] = React.useState('all');

  // For real data, replace samplePayloads with API call and useEffect
  const filtered = payloads.filter(p => {
    const matchesSearch =
      p.patient.toLowerCase().includes(search.toLowerCase()) ||
      p.provider.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase());
    const matchesPhi = phi === 'all' || (phi === 'yes' ? p.PHI : !p.PHI);
    return matchesSearch && matchesPhi;
  });

  return (
    <section style={{ padding: 24 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Payload Inspector</h2>
      <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search patient, provider, or packet ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search patient, provider, or packet ID"
          style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', minWidth: 200 }}
        />
        <select value={phi} onChange={e => setPhi(e.target.value)} aria-label="Filter by PHI" style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}>
          <option value="all">All Payloads</option>
          <option value="yes">PHI Only</option>
          <option value="no">Non-PHI Only</option>
        </select>
      </div>
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: 32, minHeight: 200 }}>
        <table 
          style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}
          aria-label="Payloads Table"
        >
          <caption className="sr-only">Payloads Table</caption>
          <thead>
            <tr style={{ background: '#f5f7fa' }}>
              <th scope="col" style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0' }}>Packet ID</th>
              <th scope="col" style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0' }}>Patient</th>
              <th scope="col" style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0' }}>Provider</th>
              <th scope="col" style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0' }}>Service</th>
              <th scope="col" style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0' }}>State</th>
              <th scope="col" style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0' }}>Audit Trail</th>
              <th scope="col" style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, idx) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f0f0f0', background: idx % 2 === 0 ? '#fff' : '#fafbfc' }}>
                <td style={{ padding: '12px 16px', borderRight: '1px solid #f0f0f0' }}>{p.id}</td>
                <td style={{ padding: '12px 16px', borderRight: '1px solid #f0f0f0' }}>{p.patient}</td>
                <td style={{ padding: '12px 16px', borderRight: '1px solid #f0f0f0' }}>{p.provider}</td>
                <td style={{ padding: '12px 16px', borderRight: '1px solid #f0f0f0' }}>{p.service}</td>
                <td style={{ padding: '12px 16px', borderRight: '1px solid #f0f0f0', fontWeight: 600 }}>{p.state}</td>
                <td style={{ padding: '12px 16px', borderRight: '1px solid #f0f0f0' }}>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                    {p.audit.map((a, i) => (
                      <li key={i} style={{ fontSize: 13, color: '#555' }}>
                        <span style={{ fontWeight: 600 }}>{a.state}</span> <span style={{ color: '#888' }}>({a.time})</span>
                      </li>
                    ))}
                  </ul>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <button
                    onClick={() => setSelected(p)}
                    aria-label={`View payload for packet ${p.id}`}
                    style={{ background: '#005fa3', color: 'white', border: 'none', borderRadius: 4, padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    View Payload
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div aria-live="polite" style={{ color: '#b00020', marginTop: 24 }}>No payloads found for selected filters.</div>}
        {selected && (
          <div role="dialog" aria-modal="true" aria-label={`Payload details for packet ${selected.id}`} style={{ marginTop: 16, padding: 16, background: '#f5f7fa', borderRadius: 8 }}>
            <div style={{ marginBottom: 8, fontWeight: 600 }}>Packet ID: {selected.id}</div>
            <div style={{ marginBottom: 8, fontWeight: 600 }}>Current State: {selected.state}</div>
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontWeight: 600 }}>Audit Trail:</span>
              <ul style={{ margin: '8px 0 0 0', padding: 0, listStyle: 'none' }}>
                {selected.audit.map((a, i) => (
                  <li key={i} style={{ fontSize: 13, color: '#555' }}>
                    <span style={{ fontWeight: 600 }}>{a.state}</span> <span style={{ color: '#888' }}>({a.time})</span>
                  </li>
                ))}
              </ul>
            </div>
            {selected.PHI && !authorized ? (
              <div>
                <div style={{ color: '#b00020', marginBottom: 8 }}>This payload contains PHI. Authorization required.</div>
                <button
                  onClick={() => setAuthorized(true)}
                  aria-label="Authorize and view PHI"
                  style={{ background: '#b00020', color: 'white', border: 'none', borderRadius: 4, padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Authorize & View PHI
                </button>
              </div>
            ) : (
              <pre style={{ background: '#fff', padding: 12, borderRadius: 6, marginTop: 8, fontSize: 15, color: '#222', border: '1px solid #e0e0e0' }}>{selected.details}</pre>
            )}
            <button
              onClick={() => { setSelected(null); setAuthorized(false); }}
              aria-label="Close payload details"
              style={{ marginTop: 12, background: '#888', color: 'white', border: 'none', borderRadius: 4, padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
