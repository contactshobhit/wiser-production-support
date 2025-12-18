import React, { useState } from 'react';

// Dummy data for demo
const trendingIssues = [
  { label: 'Most frequent error', value: 'HETS-401 Authentication Failed - 23 occurrences' },
  { label: 'Unusual spike detected', value: 'Medical Review timeout errors ↑300% vs yesterday' },
  { label: 'Provider-specific pattern', value: 
    "Dr. Smith's office - 8 failed submissions today" },
  { label: 'New error code detected', value: 'First occurrence of ESMD-527 in production' },
];

const errorCodes = ['HETS-401', 'ESMD-527', 'MR-408', 'FAX-100', 'OCR-300'];
const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
const heatmapData = errorCodes.map(code => hours.map(h => Math.floor(Math.random() * 10)));

const rootCauses = [
  '15 packets failed after 10:00 AM - Check if maintenance window affected Auth service',
  'All Fax channel errors from same originating number - Possible provider system issue',
  'Eligibility checks failing for specific MAC - HETS connectivity issue for Region 2',
];

export default function ErrorAnalytics() {
  const [selectedCell, setSelectedCell] = useState(null);

  return (
    <div style={{ width: '100%', boxSizing: 'border-box', padding: '24px 0' }}>
      {/* Top Section - Trending Issues */}
      <section style={{ display: 'flex', gap: 18, marginBottom: 32, flexWrap: 'wrap' }}>
        {trendingIssues.map((issue, i) => (
          <div key={i} style={{
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 2px 8px #0001',
            padding: '18px 22px',
            minWidth: 220,
            flex: '1 1 220px',
            fontWeight: 500,
            fontSize: 16,
            color: '#003366',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            <span style={{ fontSize: 13, color: '#888', marginBottom: 6 }}>{issue.label}</span>
            <span>{issue.value}</span>
          </div>
        ))}
      </section>

      {/* Middle Section - Error Heatmap */}
      <section style={{ marginBottom: 32 }}>
        <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 10 }}>Error Heatmap (last 24 hours)</div>
        <div style={{ display: 'grid', gridTemplateColumns: `120px repeat(${hours.length}, 1fr)`, gap: 2 }}>
          <div></div>
          {hours.map(h => (
            <div key={h} style={{ fontSize: 11, color: '#888', textAlign: 'center' }}>{h}</div>
          ))}
          {errorCodes.map((code, rowIdx) => (
            <React.Fragment key={code}>
              <div style={{ fontSize: 13, color: '#003366', fontWeight: 500, textAlign: 'right', paddingRight: 6 }}>{code}</div>
              {heatmapData[rowIdx].map((count, colIdx) => {
                const color = count === 0 ? '#fffbe6' : count < 3 ? '#fff3cd' : count < 7 ? '#ffd6b3' : '#dc3545';
                return (
                  <div
                    key={colIdx}
                    style={{
                      height: 28,
                      background: color,
                      borderRadius: 4,
                      textAlign: 'center',
                      fontSize: 12,
                      color: count > 7 ? 'white' : '#444',
                      cursor: count ? 'pointer' : 'default',
                      boxShadow: count ? '0 2px 5px rgba(0,0,0,0.08)' : 'none',
                      border: selectedCell && selectedCell[0] === rowIdx && selectedCell[1] === colIdx ? '2px solid #007bff' : '1px solid #eee',
                      transition: 'border 0.2s',
                    }}
                    onClick={() => count ? setSelectedCell([rowIdx, colIdx]) : null}
                    title={count ? `Click to view packets` : ''}
                  >
                    {count || ''}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        {selectedCell && (
          <div style={{ marginTop: 14, background: '#f8f9fa', borderRadius: 8, padding: 12, boxShadow: '0 1px 4px #0001' }}>
            <b>Affected Packet IDs:</b> <span style={{ color: '#007bff' }}>[Demo] PKT-{selectedCell[0]}-{selectedCell[1]}</span>
          </div>
        )}
      </section>

      {/* Bottom Section - Root Cause Suggestions */}
      <section style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 8px #0001', padding: 18 }}>
        <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 10 }}>Root Cause Suggestions</div>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {rootCauses.map((cause, i) => (
            <li key={i} style={{ marginBottom: 8 }}>{cause}</li>
          ))}
        </ul>
        <button style={{ marginTop: 12, background: '#007bff', color: 'white', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 500, cursor: 'pointer', boxShadow: '0 2px 8px #007bff33' }}>
          Mark as Known Issue
        </button>
      </section>
    </div>
  );
}
