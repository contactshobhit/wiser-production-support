import React, { useState } from 'react';
import MetricsRow from './MetricsRow';
import ActionsCell from './ActionsCell';
import Pipeline from './Pipeline';
import FilterBar from './FilterBar';
import ApiDebugPanel from './ApiDebugPanel';
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
  const [debugOpen, setDebugOpen] = useState(false);
  const [debugStageData, setDebugStageData] = useState(null);

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

  // Handler for pipeline stage click
  const handleStageClick = (stage, packet) => {
    // Dummy request/response data for demo
    setDebugStageData({
      request: {
        url: `/api/${stage.toLowerCase().replace(/ /g, '-')}`,
        headers: { Authorization: 'Bearer abcd****1234', 'Content-Type': 'application/json' },
        payload: { packetId: packet.id, stage },
        tokenExpiry: '2025-12-11T12:30:00Z',
        correlationId: 'corr-xyz-789',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Request-ID': 'req-5678' },
        body: { result: 'success', details: `Stage ${stage} completed.` },
        responseTime: 350,
        size: 1.2,
      },
      timeline: [
        { time: '10:15', action: 'Request sent' },
        { time: '10:16', action: 'Response received' },
      ],
      error: { code: '', message: '', retries: 0 },
      special:
        stage === 'Eligibility Check'
          ? { 'Member ID': '1EG4TE5MK72', 'Eligibility Status': 'Active', 'Coverage Dates': '2025-01-01 to 2025-12-31' }
          : stage === 'Validation'
          ? { 'Validation Result': 'Passed', 'Error Count': 0 }
          : stage === 'Medical Review'
          ? { 'Review Decision': 'Approved', 'Reviewer ID': 'REV-123', 'Reason Codes': 'N/A' }
          : stage === 'Delivery'
          ? { 'Package ID': packet.id, 'File Count': 3, 'Delivery Status': 'Delivered' }
          : undefined,
    });
    setDebugOpen(true);
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
    <div
      style={{
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',
        minWidth: '320px',
        maxWidth: '100%',
      }}
    >
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
      <section aria-label="Process Table" style={{ width: '100%', overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            minWidth: '600px',
            maxWidth: '100%',
            borderCollapse: 'collapse',
            background: 'white',
            boxSizing: 'border-box',
          }}
          aria-label="End-to-End Process Tracker Table"
        >
          <caption className="sr-only">End-to-End Process Tracker Table</caption>
          <thead>
            <tr style={{ background: '#f5f7fa' }}>
              <th scope="col" style={{ padding: '8px 10px', borderBottom: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0', minWidth: 80 }}>Packet ID</th>
              <th scope="col" style={{ padding: '8px 10px', borderBottom: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0', minWidth: 80 }}>Channel</th>
              <th scope="col" style={{ padding: '8px 10px', borderBottom: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0', minWidth: 140 }}>Current Stage</th>
              <th scope="col" style={{ padding: '8px 10px', borderBottom: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0', minWidth: 90 }}>Status</th>
              <th scope="col" style={{ padding: '8px 10px', borderBottom: '1px solid #e0e0e0', minWidth: 90 }}>Last Update</th>
              <th scope="col" style={{ padding: '8px 10px', borderBottom: '1px solid #e0e0e0', minWidth: 90 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPacketsToShow.map((pkt, idx) => (
              <tr key={pkt.id} style={{ borderBottom: '1px solid #f0f0f0', background: idx % 2 === 0 ? '#fff' : '#fafbfc' }}>
                <td style={{ padding: '8px 10px', borderRight: '1px solid #f0f0f0', minWidth: 80 }}>{pkt.id}</td>
                <td style={{ padding: '8px 10px', borderRight: '1px solid #f0f0f0', minWidth: 80 }}>{pkt.channel}</td>
                <td style={{ padding: '8px 10px', borderRight: '1px solid #f0f0f0', minWidth: 140 }}>
                  <Pipeline packet={pkt} audit={pkt.audit} onStageClick={stage => handleStageClick(stage, pkt)} />
                </td>
                <td style={{ padding: '8px 10px', borderRight: '1px solid #f0f0f0', minWidth: 90 }}>{pkt.status}</td>
                <td style={{ padding: '8px 10px', minWidth: 90 }}>{pkt.lastUpdate}</td>
                <td style={{ padding: '8px 10px', minWidth: 90 }}>
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
      <ApiDebugPanel open={debugOpen} onClose={() => setDebugOpen(false)} stageData={debugStageData} />
    </div>
  );
}
