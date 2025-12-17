import React, { useState } from 'react';
import MetricsRow from './MetricsRow';
import ActionsCell from './ActionsCell';
import Pipeline from './Pipeline';
import FilterBar from './FilterBar';
import ApiDebugPanel from './ApiDebugPanel';
import PacketDetailModal from './PacketDetailModal';
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
    time: '2025-12-17 10:15',
    type: 'API',
    source: 'HETS',
    message: 'Timeout error',
    severity: 'High',
    errorName: 'HETS API Timeout',
    code: 'HETS-5001',
    category: 'External API',
    description: 'The HETS eligibility service did not respond within the timeout period.',
    resolution: 'Retry the request or check HETS service status.',
    autoRetryStatus: 'Enabled',
    manualOverrideOptions: ['Skip Eligibility', 'Mark as Verified'],
    state: 'Eligibility Check (HETS)',
    audit: [
      { state: 'Packet Intake', time: '2025-12-17 09:45' },
      { state: 'OCR & Digitization', time: '2025-12-17 09:50' },
      { state: 'Eligibility Check (HETS)', time: '2025-12-17 10:15' },
    ],
  },
  {
    id: 2,
    packetId: 'PKT-1002',
    time: '2025-12-17 10:10',
    type: 'OCR',
    source: 'Packet Intake',
    message: 'OCR failed on coversheet',
    severity: 'Medium',
    errorName: 'OCR Processing Failed',
    code: 'OCR-2003',
    category: 'Document Processing',
    description: 'The OCR engine could not extract text from the coversheet due to poor image quality.',
    resolution: 'Request a clearer copy or manually enter the data.',
    autoRetryStatus: 'Disabled',
    manualOverrideOptions: ['Manual Entry', 'Request Rescan'],
    state: 'OCR & Digitization',
    audit: [
      { state: 'Packet Intake', time: '2025-12-17 09:55' },
      { state: 'OCR & Digitization', time: '2025-12-17 10:10' },
    ],
  },
  {
    id: 3,
    packetId: 'PKT-1005',
    time: '2025-12-17 09:30',
    type: 'API',
    source: 'PECOS',
    message: 'NPI validation failed - Provider not found',
    severity: 'Critical',
    errorName: 'PECOS NPI Lookup Failed',
    code: 'PECOS-4001',
    category: 'External API',
    description: 'The provider NPI could not be verified in the PECOS database.',
    resolution: 'Verify the NPI number is correct or contact the provider.',
    autoRetryStatus: 'Disabled',
    manualOverrideOptions: ['Override NPI Check', 'Request Updated NPI'],
    state: 'Provider NPI Check (PECOS)',
    audit: [
      { state: 'Packet Intake', time: '2025-12-17 08:00' },
      { state: 'OCR & Digitization', time: '2025-12-17 08:15' },
      { state: 'Eligibility Check (HETS)', time: '2025-12-17 08:45' },
      { state: 'Provider NPI Check (PECOS)', time: '2025-12-17 09:30' },
    ],
  },
  {
    id: 4,
    packetId: 'PKT-1008',
    time: '2025-12-17 08:45',
    type: 'Validation',
    source: 'Medical Review',
    message: 'Missing required documentation - Letter of Medical Necessity',
    severity: 'High',
    errorName: 'Documentation Incomplete',
    code: 'DOC-3002',
    category: 'Document Validation',
    description: 'The packet is missing the Letter of Medical Necessity (LMN) required for DME authorization.',
    resolution: 'Request LMN from the ordering physician.',
    autoRetryStatus: 'Disabled',
    manualOverrideOptions: ['Request Documents', 'Mark as Complete'],
    state: 'Medical Review Intake',
    audit: [
      { state: 'Packet Intake', time: '2025-12-17 07:30' },
      { state: 'OCR & Digitization', time: '2025-12-17 07:45' },
      { state: 'Eligibility Check (HETS)', time: '2025-12-17 08:00' },
      { state: 'Provider NPI Check (PECOS)', time: '2025-12-17 08:15' },
      { state: 'Medical Review Intake', time: '2025-12-17 08:45' },
    ],
  },
  {
    id: 5,
    packetId: 'PKT-1012',
    time: '2025-12-17 11:20',
    type: 'Delivery',
    source: 'WestFax',
    message: 'Fax transmission failed - Line busy',
    severity: 'Medium',
    errorName: 'Fax Delivery Failed',
    code: 'FAX-6001',
    category: 'Delivery',
    description: 'The fax could not be delivered after 3 attempts due to busy line.',
    resolution: 'Will auto-retry in 30 minutes or try alternate delivery method.',
    autoRetryStatus: 'Enabled',
    manualOverrideOptions: ['Retry Now', 'Send via Email', 'Send via Mail'],
    state: 'Delivery (WestFax/Mailroom)',
    audit: [
      { state: 'Packet Intake', time: '2025-12-17 09:00' },
      { state: 'OCR & Digitization', time: '2025-12-17 09:15' },
      { state: 'Eligibility Check (HETS)', time: '2025-12-17 09:30' },
      { state: 'Provider NPI Check (PECOS)', time: '2025-12-17 09:45' },
      { state: 'Medical Review Intake', time: '2025-12-17 10:00' },
      { state: 'Medical Review', time: '2025-12-17 10:30' },
      { state: 'Letter Generation', time: '2025-12-17 11:00' },
      { state: 'Delivery (WestFax/Mailroom)', time: '2025-12-17 11:20' },
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
      { state: 'Packet Intake', time: '2025-12-17 09:45' },
      { state: 'OCR & Digitization', time: '2025-12-17 09:50' },
      { state: 'Eligibility Check (HETS)', time: '2025-12-17 10:15' },
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
      { state: 'Packet Intake', time: '2025-12-17 09:55' },
      { state: 'OCR & Digitization', time: '2025-12-17 10:10' },
    ],
  },
  {
    id: 'PKT-1003',
    patient: 'Robert Davis',
    provider: 'Community Health Center',
    service: 'L0648',
    PHI: true,
    details: '{ "mbi": "2XY3ZA4BC56", "dob": "1955-08-22", "diagnosis": "M54.5" }',
    state: 'Delivery (WestFax/Mailroom)',
    audit: [
      { state: 'Packet Intake', time: '2025-12-17 08:00' },
      { state: 'OCR & Digitization', time: '2025-12-17 08:15' },
      { state: 'Manual Correction', time: '2025-12-17 08:30' },
      { state: 'Eligibility Check (HETS)', time: '2025-12-17 08:45' },
      { state: 'Provider NPI Check (PECOS)', time: '2025-12-17 09:00' },
      { state: 'Medical Review Intake', time: '2025-12-17 09:15' },
      { state: 'Medical Review', time: '2025-12-17 09:30' },
      { state: 'Letter Generation', time: '2025-12-17 09:45' },
      { state: 'Delivery (WestFax/Mailroom)', time: '2025-12-17 09:55' },
    ],
  },
  {
    id: 'PKT-1004',
    patient: 'Patricia Williams',
    provider: 'Sunrise Medical Supply',
    service: 'E0601',
    PHI: true,
    details: '{ "mbi": "3KL4MN5OP67", "dob": "1948-03-15", "diagnosis": "G47.33" }',
    state: 'Medical Review',
    audit: [
      { state: 'Packet Intake', time: '2025-12-17 07:00' },
      { state: 'OCR & Digitization', time: '2025-12-17 07:20' },
      { state: 'Eligibility Check (HETS)', time: '2025-12-17 07:35' },
      { state: 'Provider NPI Check (PECOS)', time: '2025-12-17 07:50' },
      { state: 'Medical Review Intake', time: '2025-12-17 08:10' },
      { state: 'Medical Review', time: '2025-12-17 08:45' },
    ],
  },
  {
    id: 'PKT-1005',
    patient: 'Michael Brown',
    provider: 'Elite DME Solutions',
    service: 'K0823',
    PHI: true,
    details: '{ "mbi": "4QR5ST6UV78", "dob": "1962-11-08", "diagnosis": "G12.21" }',
    state: 'Provider NPI Check (PECOS)',
    audit: [
      { state: 'Packet Intake', time: '2025-12-17 08:00' },
      { state: 'OCR & Digitization', time: '2025-12-17 08:15' },
      { state: 'Eligibility Check (HETS)', time: '2025-12-17 08:45' },
      { state: 'Provider NPI Check (PECOS)', time: '2025-12-17 09:30' },
    ],
  },
  {
    id: 'PKT-1006',
    patient: 'Linda Garcia',
    provider: 'Coastal Respiratory Care',
    service: 'E0470',
    PHI: true,
    details: '{ "mbi": "5WX6YZ7AB89", "dob": "1958-07-22", "diagnosis": "J44.1" }',
    state: 'Letter Generation',
    audit: [
      { state: 'Packet Intake', time: '2025-12-17 06:30' },
      { state: 'OCR & Digitization', time: '2025-12-17 06:45' },
      { state: 'Eligibility Check (HETS)', time: '2025-12-17 07:00' },
      { state: 'Provider NPI Check (PECOS)', time: '2025-12-17 07:15' },
      { state: 'Medical Review Intake', time: '2025-12-17 07:30' },
      { state: 'Medical Review', time: '2025-12-17 08:00' },
      { state: 'Letter Generation', time: '2025-12-17 08:30' },
    ],
  },
  {
    id: 'PKT-1007',
    patient: 'James Martinez',
    provider: 'Metro Mobility Inc',
    service: 'K0861',
    PHI: true,
    details: '{ "mbi": "6CD7EF8GH90", "dob": "1975-09-30", "diagnosis": "T84.031A" }',
    state: 'Delivery (WestFax/Mailroom)',
    audit: [
      { state: 'Packet Intake', time: '2025-12-17 05:00' },
      { state: 'OCR & Digitization', time: '2025-12-17 05:15' },
      { state: 'Eligibility Check (HETS)', time: '2025-12-17 05:30' },
      { state: 'Provider NPI Check (PECOS)', time: '2025-12-17 05:45' },
      { state: 'Medical Review Intake', time: '2025-12-17 06:00' },
      { state: 'Medical Review', time: '2025-12-17 06:30' },
      { state: 'Letter Generation', time: '2025-12-17 07:00' },
      { state: 'Delivery (WestFax/Mailroom)', time: '2025-12-17 07:15' },
    ],
  },
  {
    id: 'PKT-1008',
    patient: 'Elizabeth Anderson',
    provider: 'Valley Home Health',
    service: 'E0260',
    PHI: true,
    details: '{ "mbi": "7IJ8KL9MN01", "dob": "1940-12-05", "diagnosis": "I50.9" }',
    state: 'Medical Review Intake',
    audit: [
      { state: 'Packet Intake', time: '2025-12-17 07:30' },
      { state: 'OCR & Digitization', time: '2025-12-17 07:45' },
      { state: 'Eligibility Check (HETS)', time: '2025-12-17 08:00' },
      { state: 'Provider NPI Check (PECOS)', time: '2025-12-17 08:15' },
      { state: 'Medical Review Intake', time: '2025-12-17 08:45' },
    ],
  },
  {
    id: 'PKT-1009',
    patient: 'William Taylor',
    provider: 'Premier Prosthetics',
    service: 'L5301',
    PHI: true,
    details: '{ "mbi": "8OP9QR0ST12", "dob": "1968-04-18", "diagnosis": "S88.111A" }',
    state: 'Manual Correction',
    audit: [
      { state: 'Packet Intake', time: '2025-12-17 09:00' },
      { state: 'OCR & Digitization', time: '2025-12-17 09:15' },
      { state: 'Manual Correction', time: '2025-12-17 09:45' },
    ],
  },
  {
    id: 'PKT-1010',
    patient: 'Susan Thomas',
    provider: 'Heartland Medical Supply',
    service: 'E1390',
    PHI: true,
    details: '{ "mbi": "9UV0WX1YZ23", "dob": "1952-06-28", "diagnosis": "E11.65" }',
    state: 'Delivery (WestFax/Mailroom)',
    audit: [
      { state: 'Packet Intake', time: '2025-12-17 04:00' },
      { state: 'OCR & Digitization', time: '2025-12-17 04:15' },
      { state: 'Eligibility Check (HETS)', time: '2025-12-17 04:30' },
      { state: 'Provider NPI Check (PECOS)', time: '2025-12-17 04:45' },
      { state: 'Medical Review Intake', time: '2025-12-17 05:00' },
      { state: 'Medical Review', time: '2025-12-17 05:30' },
      { state: 'Letter Generation', time: '2025-12-17 06:00' },
      { state: 'Delivery (WestFax/Mailroom)', time: '2025-12-17 06:30' },
    ],
  },
  {
    id: 'PKT-1011',
    patient: 'Richard Jackson',
    provider: 'Comfort Care DME',
    service: 'E0277',
    PHI: true,
    details: '{ "mbi": "1AB2CD3EF45", "dob": "1945-02-14", "diagnosis": "L89.153" }',
    state: 'Eligibility Check (HETS)',
    audit: [
      { state: 'Packet Intake', time: '2025-12-17 10:00' },
      { state: 'OCR & Digitization', time: '2025-12-17 10:15' },
      { state: 'Eligibility Check (HETS)', time: '2025-12-17 10:30' },
    ],
  },
  {
    id: 'PKT-1012',
    patient: 'Barbara White',
    provider: 'Pacific Orthotics',
    service: 'L1970',
    PHI: true,
    details: '{ "mbi": "2GH3IJ4KL56", "dob": "1960-10-20", "diagnosis": "M21.6X1" }',
    state: 'Delivery (WestFax/Mailroom)',
    audit: [
      { state: 'Packet Intake', time: '2025-12-17 09:00' },
      { state: 'OCR & Digitization', time: '2025-12-17 09:15' },
      { state: 'Eligibility Check (HETS)', time: '2025-12-17 09:30' },
      { state: 'Provider NPI Check (PECOS)', time: '2025-12-17 09:45' },
      { state: 'Medical Review Intake', time: '2025-12-17 10:00' },
      { state: 'Medical Review', time: '2025-12-17 10:30' },
      { state: 'Letter Generation', time: '2025-12-17 11:00' },
      { state: 'Delivery (WestFax/Mailroom)', time: '2025-12-17 11:20' },
    ],
  },
  {
    id: 'PKT-1013',
    patient: 'Charles Harris',
    provider: 'Mountain View Medical',
    service: 'K0856',
    PHI: true,
    details: '{ "mbi": "3MN4OP5QR67", "dob": "1978-08-12", "diagnosis": "G80.0" }',
    state: 'OCR & Digitization',
    audit: [
      { state: 'Packet Intake', time: '2025-12-17 10:45' },
      { state: 'OCR & Digitization', time: '2025-12-17 11:00' },
    ],
  },
  {
    id: 'PKT-1014',
    patient: 'Jennifer Clark',
    provider: 'Unity Health Services',
    service: 'E0431',
    PHI: true,
    details: '{ "mbi": "4ST5UV6WX78", "dob": "1955-01-25", "diagnosis": "G47.31" }',
    state: 'Medical Review',
    audit: [
      { state: 'Packet Intake', time: '2025-12-17 06:00' },
      { state: 'OCR & Digitization', time: '2025-12-17 06:15' },
      { state: 'Eligibility Check (HETS)', time: '2025-12-17 06:30' },
      { state: 'Provider NPI Check (PECOS)', time: '2025-12-17 06:45' },
      { state: 'Medical Review Intake', time: '2025-12-17 07:00' },
      { state: 'Medical Review', time: '2025-12-17 07:30' },
    ],
  },
  {
    id: 'PKT-1015',
    patient: 'Daniel Lewis',
    provider: 'Apex Mobility Solutions',
    service: 'K0898',
    PHI: true,
    details: '{ "mbi": "5YZ6AB7CD89", "dob": "1982-05-03", "diagnosis": "G35" }',
    state: 'Provider NPI Check (PECOS)',
    audit: [
      { state: 'Packet Intake', time: '2025-12-17 09:30' },
      { state: 'OCR & Digitization', time: '2025-12-17 09:45' },
      { state: 'Eligibility Check (HETS)', time: '2025-12-17 10:00' },
      { state: 'Provider NPI Check (PECOS)', time: '2025-12-17 10:15' },
    ],
  },
];

// Simulated packets for demo - matches processStages indices
// 0: Packet Intake, 1: OCR & Digitization, 2: Manual Correction, 3: Eligibility Check (HETS)
// 4: Provider NPI Check (PECOS), 5: Medical Review Intake, 6: Medical Review, 7: Letter Generation
// 8: Delivery (WestFax/Mailroom)
const samplePackets = [
  {
    id: 'PKT-1001',
    channel: 'Fax',
    currentStage: 3,
    status: 'Manual Correction',
    lastUpdate: '2025-12-17 10:15',
    errorMsg: 'HETS API timeout after 30 seconds',
  },
  {
    id: 'PKT-1002',
    channel: 'eSMD',
    currentStage: 1,
    status: 'Manual Correction',
    lastUpdate: '2025-12-17 10:10',
    errorMsg: 'OCR failed - poor image quality on coversheet',
  },
  {
    id: 'PKT-1003',
    channel: 'Provider Portal',
    currentStage: 8,
    status: 'Delivered',
    lastUpdate: '2025-12-17 09:55',
  },
  {
    id: 'PKT-1004',
    channel: 'Fax',
    currentStage: 6,
    status: 'In Progress',
    lastUpdate: '2025-12-17 08:45',
  },
  {
    id: 'PKT-1005',
    channel: 'eSMD',
    currentStage: 4,
    status: 'Manual Correction',
    lastUpdate: '2025-12-17 09:30',
    errorMsg: 'Provider NPI not found in PECOS database',
  },
  {
    id: 'PKT-1006',
    channel: 'Provider Portal',
    currentStage: 7,
    status: 'In Progress',
    lastUpdate: '2025-12-17 08:30',
  },
  {
    id: 'PKT-1007',
    channel: 'Fax',
    currentStage: 8,
    status: 'Delivered',
    lastUpdate: '2025-12-17 07:15',
  },
  {
    id: 'PKT-1008',
    channel: 'eSMD',
    currentStage: 5,
    status: 'Manual Correction',
    lastUpdate: '2025-12-17 08:45',
    errorMsg: 'Missing Letter of Medical Necessity (LMN)',
  },
  {
    id: 'PKT-1009',
    channel: 'Provider Portal',
    currentStage: 2,
    status: 'Manual Correction',
    lastUpdate: '2025-12-17 09:45',
    errorMsg: 'Data extraction failed - illegible handwriting',
  },
  {
    id: 'PKT-1010',
    channel: 'Fax',
    currentStage: 8,
    status: 'Delivered',
    lastUpdate: '2025-12-17 06:30',
  },
  {
    id: 'PKT-1011',
    channel: 'eSMD',
    currentStage: 3,
    status: 'In Progress',
    lastUpdate: '2025-12-17 10:30',
  },
  {
    id: 'PKT-1012',
    channel: 'Fax',
    currentStage: 8,
    status: 'Manual Correction',
    lastUpdate: '2025-12-17 11:20',
    errorMsg: 'Fax transmission failed - line busy after 3 attempts',
  },
  {
    id: 'PKT-1013',
    channel: 'Provider Portal',
    currentStage: 1,
    status: 'In Progress',
    lastUpdate: '2025-12-17 11:00',
  },
  {
    id: 'PKT-1014',
    channel: 'eSMD',
    currentStage: 6,
    status: 'In Progress',
    lastUpdate: '2025-12-17 07:30',
  },
  {
    id: 'PKT-1015',
    channel: 'Fax',
    currentStage: 4,
    status: 'In Progress',
    lastUpdate: '2025-12-17 10:15',
  },
];

// Helper function to get aging
const getAging = (lastUpdate) => {
  const now = new Date();
  const updateDate = new Date(lastUpdate);
  const diffMs = now - updateDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d ${diffHours % 24}h ago`;
  if (diffHours > 0) return `${diffHours}h ${diffMins % 60}m ago`;
  return `${diffMins}m ago`;
};

export default function ProcessTracker() {
  const [packets, setPackets] = useState(samplePackets);
  const [filter, setFilter] = useState(null);
  const [filters, setFilters] = useState({ search: '', status: [], channel: [], date: 'today' });
  const [filteredPackets, setFilteredPackets] = useState(packets);
  const [debugOpen, setDebugOpen] = useState(false);
  const [debugStageData, setDebugStageData] = useState(null);

  // State for packet detail modal
  const [selectedPacket, setSelectedPacket] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  // State for action feedback
  const [actionFeedback, setActionFeedback] = useState(null);

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

  // === ACTION HANDLERS ===

  // Retry action - attempt to reprocess the packet
  const handleRetry = (packet) => {
    setActionFeedback({ type: 'info', message: `Retrying packet ${packet.id}...` });

    // Simulate API call
    setTimeout(() => {
      // Update packet to show it's being reprocessed
      setPackets(prev => prev.map(p =>
        p.id === packet.id
          ? { ...p, status: 'In Progress', lastUpdate: new Date().toLocaleString() }
          : p
      ));
      setActionFeedback({ type: 'success', message: `Packet ${packet.id} retry initiated successfully.` });

      // Clear feedback after 3 seconds
      setTimeout(() => setActionFeedback(null), 3000);
    }, 1000);
  };

  // View action - show packet details in modal
  const handleView = (packet) => {
    // Find payload and error logs for this packet
    const payload = samplePayloads.find(p => p.id === packet.id) || {
      id: packet.id,
      patient: 'Unknown',
      provider: 'Unknown',
      service: 'N/A',
      PHI: false,
      details: '{}',
      state: processStages[packet.currentStage],
      audit: [],
    };

    const errorLogs = sampleLogs.filter(log => log.packetId === packet.id);

    setSelectedPacket({
      ...packet,
      payload,
      errorLogs,
    });
    setAuthorized(false);
    setDetailModalOpen(true);
  };

  // Override action - manually advance to next stage
  const handleOverride = (packet) => {
    const currentStage = packet.currentStage;
    const nextStage = Math.min(currentStage + 1, processStages.length - 1);

    if (currentStage >= processStages.length - 1) {
      setActionFeedback({ type: 'warning', message: `Packet ${packet.id} is already at the final stage.` });
      setTimeout(() => setActionFeedback(null), 3000);
      return;
    }

    const confirmOverride = window.confirm(
      `Are you sure you want to override packet ${packet.id}?\n\n` +
      `Current Stage: ${processStages[currentStage]}\n` +
      `Next Stage: ${processStages[nextStage]}\n\n` +
      `This action will be logged for audit purposes.`
    );

    if (confirmOverride) {
      setActionFeedback({ type: 'info', message: `Processing override for ${packet.id}...` });

      // Simulate API call
      setTimeout(() => {
        setPackets(prev => prev.map(p =>
          p.id === packet.id
            ? {
                ...p,
                currentStage: nextStage,
                status: nextStage === processStages.length - 1 ? 'Delivered' : 'In Progress',
                lastUpdate: new Date().toLocaleString()
              }
            : p
        ));
        setActionFeedback({
          type: 'success',
          message: `Packet ${packet.id} advanced to ${processStages[nextStage]}.`
        });
        setTimeout(() => setActionFeedback(null), 3000);
      }, 1000);
    }
  };

  // Download action - export packet documentation
  const handleDownload = (packet) => {
    const payload = samplePayloads.find(p => p.id === packet.id);

    // Create export data
    const exportData = {
      packetId: packet.id,
      channel: packet.channel,
      status: packet.status,
      currentStage: processStages[packet.currentStage],
      lastUpdate: packet.lastUpdate,
      payload: payload || {},
      exportedAt: new Date().toISOString(),
      exportedBy: 'Current User',
    };

    // Create and download JSON file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${packet.id}_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setActionFeedback({ type: 'success', message: `Packet ${packet.id} exported successfully.` });
    setTimeout(() => setActionFeedback(null), 3000);
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
      {/* Action Feedback Toast */}
      {actionFeedback && (
        <div style={{
          position: 'fixed',
          top: 80,
          right: 20,
          padding: '12px 20px',
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1001,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: actionFeedback.type === 'success' ? '#dcfce7'
            : actionFeedback.type === 'error' ? '#fee2e2'
            : actionFeedback.type === 'warning' ? '#fef3c7'
            : '#dbeafe',
          color: actionFeedback.type === 'success' ? '#166534'
            : actionFeedback.type === 'error' ? '#991b1b'
            : actionFeedback.type === 'warning' ? '#92400e'
            : '#1e40af',
          border: `1px solid ${
            actionFeedback.type === 'success' ? '#86efac'
            : actionFeedback.type === 'error' ? '#fca5a5'
            : actionFeedback.type === 'warning' ? '#fcd34d'
            : '#93c5fd'
          }`,
        }}>
          <span style={{ fontSize: 16 }}>
            {actionFeedback.type === 'success' ? '✓'
              : actionFeedback.type === 'error' ? '✕'
              : actionFeedback.type === 'warning' ? '⚠'
              : '↻'}
          </span>
          <span style={{ fontWeight: 500 }}>{actionFeedback.message}</span>
        </div>
      )}

      <MetricsRow metrics={metrics} onFilter={handleFilter} activeFilter={filter} />
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        resultCount={filteredPacketsToShow.length}
        totalCount={packets.length}
        onSearch={handleSearch}
        onClear={handleClear}
        onAdvanced={() => {}}
        quickFilter={filter}
        onClearQuickFilter={() => setFilter(null)}
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
                    onRetry={handleRetry}
                    onView={handleView}
                    onOverride={handleOverride}
                    onDownload={handleDownload}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* API Debug Panel */}
      <ApiDebugPanel open={debugOpen} onClose={() => setDebugOpen(false)} stageData={debugStageData} />

      {/* Packet Detail Modal */}
      {detailModalOpen && selectedPacket && (
        <PacketDetailModal
          selected={selectedPacket}
          onClose={() => {
            setDetailModalOpen(false);
            setSelectedPacket(null);
          }}
          authorized={authorized}
          setAuthorized={setAuthorized}
          processStages={processStages}
          getAging={getAging}
        />
      )}
    </div>
  );
}
