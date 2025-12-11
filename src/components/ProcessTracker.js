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

// Simulated error logs for demo
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
];

// Simulated payloads for demo
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
      <h2 style={{ marginBottom: 24 }}>WISeR Production Support Dashboard</h2>
      <section aria-label="Process Table">
        <table 
          style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}
          aria-label="End-to-End Process Tracker Table"
        >
          <caption className="sr-only">End-to-End Process Tracker Table</caption>
          <thead>
            <tr style={{ background: '#f5f7fa' }}>
              <th scope="col" style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0' }}>Packet ID</th>
              <th scope="col" style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0' }}>Channel</th>
              <th scope="col" style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0' }}>Current Stage</th>
              <th scope="col" style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0' }}>Status</th>
              <th scope="col" style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0' }}>Last Update</th>
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
                    <progress 
                      value={pkt.currentStage + 1} 
                      max={processStages.length} 
                      style={{ width: 180, marginTop: 4 }} 
                      aria-valuenow={pkt.currentStage + 1}
                      aria-valuemin={1}
                      aria-valuemax={processStages.length}
                      aria-label={`Progress: ${pkt.currentStage + 1} of ${processStages.length}`}
                    />
                  </div>
                </td>
                <td style={{ padding: '12px 16px', borderRight: '1px solid #f0f0f0' }}>{pkt.status}</td>
                <td style={{ padding: '12px 16px' }}>{pkt.lastUpdate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
