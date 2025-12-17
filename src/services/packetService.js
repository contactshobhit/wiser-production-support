import api from './api';

/**
 * Packet Service
 * Handles CRUD operations for healthcare packets
 */
const packetService = {
  /**
   * Get list of packets with optional filtering and pagination
   * @param {Object} params - Query parameters
   * @param {string} [params.status] - Filter by status (pending, in_review, approved, rejected)
   * @param {string} [params.assigned_to] - Filter by assigned user ID
   * @param {string} [params.sort_by] - Field to sort by
   * @param {string} [params.sort_order] - Sort order (asc/desc)
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.page_size=10] - Items per page
   * @returns {Promise<{success: boolean, data: Array, total: number, page: number, page_size: number}>}
   */
  async getPackets(params = {}) {
    const response = await api.get('/api/packets', { params });
    return response.data;
  },

  /**
   * Get a single packet by ID
   * @param {string} id - Packet ID
   * @returns {Promise<{success: boolean, data: Object}>}
   */
  async getPacket(id) {
    const response = await api.get(`/api/packets/${id}`);
    return response.data;
  },

  /**
   * Create a new packet
   * @param {Object} packetData - Packet data
   * @param {string} packetData.patient_name
   * @param {string} packetData.patient_dob - ISO date string
   * @param {string} packetData.patient_mrn
   * @param {string} packetData.patient_phone
   * @param {string} packetData.patient_email
   * @param {string} packetData.diagnosis
   * @param {string} packetData.referring_provider
   * @param {string} packetData.referring_provider_npi - 10 digit NPI
   * @param {string} packetData.insurance
   * @param {string} [packetData.status='pending']
   * @param {string} [packetData.assigned_to]
   * @param {string} [packetData.notes]
   * @returns {Promise<{success: boolean, data: Object, message: string}>}
   */
  async createPacket(packetData) {
    const response = await api.post('/api/packets', packetData);
    return response.data;
  },

  /**
   * Update an existing packet
   * @param {string} id - Packet ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<{success: boolean, data: Object, message: string}>}
   */
  async updatePacket(id, updateData) {
    const response = await api.put(`/api/packets/${id}`, updateData);
    return response.data;
  },

  /**
   * Delete a packet (Admin only)
   * @param {string} id - Packet ID
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async deletePacket(id) {
    const response = await api.delete(`/api/packets/${id}`);
    return response.data;
  },

  /**
   * Transform backend packet format to frontend format
   * Maps snake_case API fields to the format used by frontend components
   * @param {Object} packet - Packet from API
   * @returns {Object} - Transformed packet for frontend
   */
  transformPacketForFrontend(packet) {
    return {
      id: packet.id,
      packetId: packet.id,
      patient: packet.patient_name,
      patientDob: packet.patient_dob,
      patientMrn: packet.patient_mrn,
      patientPhone: packet.patient_phone,
      patientEmail: packet.patient_email,
      provider: packet.referring_provider,
      providerNpi: packet.referring_provider_npi,
      diagnosis: packet.diagnosis,
      insurance: packet.insurance,
      status: mapBackendStatusToFrontend(packet.status),
      assignedTo: packet.assigned_to,
      notes: packet.notes,
      createdAt: packet.created_at,
      updatedAt: packet.updated_at,
      lastUpdate: formatDate(packet.updated_at),
      auditLog: packet.audit_log || [],
      // Default values for fields not in backend
      channel: 'Provider Portal',
      currentStage: mapStatusToStage(packet.status),
      service: '',
      PHI: true,
    };
  },

  /**
   * Transform list of packets for frontend
   * @param {Array} packets - Packets from API
   * @returns {Array} - Transformed packets
   */
  transformPacketsForFrontend(packets) {
    return packets.map(this.transformPacketForFrontend);
  },
};

// Helper function to map backend status to frontend status
function mapBackendStatusToFrontend(status) {
  const statusMap = {
    pending: 'In Progress',
    in_review: 'In Progress',
    approved: 'Delivered',
    rejected: 'Manual Correction',
  };
  return statusMap[status] || status;
}

// Helper function to map status to pipeline stage
function mapStatusToStage(status) {
  const stageMap = {
    pending: 0,
    in_review: 3,
    approved: 8,
    rejected: 4,
  };
  return stageMap[status] || 0;
}

// Helper function to format date
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default packetService;
