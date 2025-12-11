import React, { useState } from 'react';

const processStages = [
  'Packet Intake',
  'OCR & Digitization',
  'Manual Correction',
  'Eligibility Check (HETS)',
  'Provider NPI Check (PECOS)',
  'Medical Review Intake',
  'Medical Review',
  'Letter Generation',
  'Delivery (WestFax/Mailroom)'
];

// Simulated packets for demo
const samplePackets = [
  {
    id: 'PKT-1001',
    channel: 'Fax',
    currentStage: 2,
    status: 'In Progress',
    lastUpdate: '2025-12-11 10:15',
  },
  {
    id: 'PKT-1002',
    channel: 'eSMD',
    currentStage: 5,
    status: 'Manual Correction',
    lastUpdate: '2025-12-11 10:10',
  },
  {
    id: 'PKT-1003',
    channel: 'Provider Portal',
    currentStage: 8,
    status: 'Delivered',
    lastUpdate: '2025-12-11 09:55',
  },
];

export default function ProcessTracker() {
  const [packets] = useState(samplePackets);

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>End-to-End Process Tracker</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
        <thead>
          <tr style={{ background: '#f5f7fa' }}>
            <th style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0' }}>Packet ID</th>
            <th style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0' }}>Channel</th>
            <th style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0' }}>Current Stage</th>
            <th style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0' }}>Status</th>
            <th style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0' }}>Last Update</th>
          </tr>
        </thead>
        <tbody>
          {packets.map((pkt, idx) => (
            <tr key={pkt.id} style={{ borderBottom: '1px solid #f0f0f0', background: idx % 2 === 0 ? '#fff' : '#fafbfc' }}>
              <td style={{ padding: '12px 16px', borderRight: '1px solid #f0f0f0' }}>{pkt.id}</td>
              <td style={{ padding: '12px 16px', borderRight: '1px solid #f0f0f0' }}>{pkt.channel}</td>
              <td style={{ padding: '12px 16px', borderRight: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 600 }}>{processStages[pkt.currentStage]}</span>
                  <progress value={pkt.currentStage + 1} max={processStages.length} style={{ width: 180, marginTop: 4 }} />
                </div>
              </td>
              <td style={{ padding: '12px 16px', borderRight: '1px solid #f0f0f0' }}>{pkt.status}</td>
              <td style={{ padding: '12px 16px' }}>{pkt.lastUpdate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
