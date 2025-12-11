import React, { useState } from 'react';
import MetricsRow from './MetricsRow';
import ActionsCell from './ActionsCell';
import Pipeline from './Pipeline';
import FilterBar from './FilterBar';
import { getCriticalErrors, getPendingManualReview, getProcessingNow, getCompletedToday, filterPackets } from './processUtils';

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
  const [packets, setPackets] = useState(samplePackets);
  const [filter, setFilter] = useState(null);
  const [filters, setFilters] = useState({ search: '', status: [], channel: [], date: 'today' });
  const [filteredPackets, setFilteredPackets] = useState(packets);

  // Demo metric data
  const metrics = [
    {
      color: 'red',
      count: getCriticalErrors(packets).length,
      label: 'Critical Errors',
      percent: 12,
      direction: 'up',
      filterType: 'critical',
    },
    {
      color: 'orange',
      count: getPendingManualReview(packets).length,
      label: 'Pending Manual Review',
      percent: 5,
      direction: 'down',
      filterType: 'manual',
    },
    {
      color: 'blue',
      count: getProcessingNow(packets).length,
      label: 'Processing Now',
      percent: 8,
      direction: 'up',
      filterType: 'processing',
    },
    {
      color: 'green',
      count: getCompletedToday(packets).length,
      label: 'Completed Today',
      percent: 3,
      direction: 'up',
      filterType: 'completed',
    },
  ];

  const handleFilter = (type) => {
    setFilter(type);
  };

  // Filtering logic stub
  const applyFilters = () => {
    let result = packets;
    // Quick search
    if (filters.search) {
      result = result.filter(pkt => pkt.id.includes(filters.search));
    }
    // Status pills
    if (filters.status.length) {
      result = result.filter(pkt => {
        if (filters.status.includes('errors')) return pkt.status === 'Manual Correction';
        if (filters.status.includes('inProgress')) return pkt.status === 'In Progress';
        if (filters.status.includes('delivered')) return pkt.status === 'Delivered';
        if (filters.status.includes('stuck')) return false; // Add stuck logic
        return true;
      });
    }
    // Channel selector
    if (filters.channel.length) {
      result = result.filter(pkt => filters.channel.includes(pkt.channel));
    }
    // Date range picker stub
    // ...
    setFilteredPackets(result);
  };

  React.useEffect(applyFilters, [filters, packets]);

  const handleSearch = (val) => setFilters(f => ({ ...f, search: val }));
  const handleClear = () => setFilters({ search: '', status: [], channel: [], date: 'today' });

  const filteredPacketsToShow = filter ? filterPackets(packets, filter) : filteredPackets;

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>WISeR Production Support Dashboard</h2>
      <MetricsRow metrics={metrics} onFilter={handleFilter} />
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        resultCount={filteredPackets.length}
        totalCount={packets.length}
        onSearch={handleSearch}
        onClear={handleClear}
        onAdvanced={() => {}}
      />
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
              <th scope="col" style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPacketsToShow.map((pkt, idx) => (
              <tr key={pkt.id} style={{ borderBottom: '1px solid #f0f0f0', background: idx % 2 === 0 ? '#fff' : '#fafbfc' }}>
                <td style={{ padding: '12px 16px', borderRight: '1px solid #f0f0f0' }}>{pkt.id}</td>
                <td style={{ padding: '12px 16px', borderRight: '1px solid #f0f0f0' }}>{pkt.channel}</td>
                <td style={{ padding: '12px 16px', borderRight: '1px solid #f0f0f0' }}>
                  <Pipeline packet={pkt} audit={pkt.audit} />
                </td>
                <td style={{ padding: '12px 16px', borderRight: '1px solid #f0f0f0' }}>{pkt.status}</td>
                <td style={{ padding: '12px 16px' }}>{pkt.lastUpdate}</td>
                <td style={{ padding: '12px 16px' }}>
                  <ActionsCell
                    packet={pkt}
                    onRetry={(packet) => {/* TODO: implement retry */}}
                    onView={(packet) => {/* TODO: implement view details */}}
                    onOverride={(packet) => {/* TODO: implement override */}}
                    onDownload={(packet) => {/* TODO: implement download */}}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
