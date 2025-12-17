import api from './api';

/**
 * Operations Service
 * Handles support tickets, P2P calls, and analytics
 */
const operationsService = {
  // ==================== Support Tickets ====================

  /**
   * Get list of support tickets with optional filtering
   * @param {Object} params - Query parameters
   * @param {string} [params.status] - Filter by status (open, in_progress, pending, resolved, closed)
   * @param {string} [params.priority] - Filter by priority (low, medium, high, urgent)
   * @returns {Promise<{success: boolean, data: Array}>}
   */
  async getSupportTickets(params = {}) {
    const response = await api.get('/api/support-tickets', { params });
    return response.data;
  },

  /**
   * Get a single support ticket by ID
   * @param {string} id - Ticket ID
   * @returns {Promise<{success: boolean, data: Object}>}
   */
  async getSupportTicket(id) {
    const response = await api.get(`/api/support-tickets/${id}`);
    return response.data;
  },

  /**
   * Update a support ticket
   * @param {string} id - Ticket ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<{success: boolean, data: Object}>}
   */
  async updateSupportTicket(id, updateData) {
    const response = await api.patch(`/api/support-tickets/${id}`, updateData);
    return response.data;
  },

  // ==================== P2P Calls ====================

  /**
   * Get list of P2P calls with optional filtering
   * @param {Object} params - Query parameters
   * @param {string} [params.status] - Filter by status (new, scheduled, in_progress, completed, cancelled, no_show)
   * @param {string} [params.urgency] - Filter by urgency (routine, urgent, expedited)
   * @returns {Promise<{success: boolean, data: Array}>}
   */
  async getP2PCalls(params = {}) {
    const response = await api.get('/api/p2p-calls', { params });
    return response.data;
  },

  /**
   * Get a single P2P call by ID
   * @param {string} id - P2P call ID
   * @returns {Promise<{success: boolean, data: Object}>}
   */
  async getP2PCall(id) {
    const response = await api.get(`/api/p2p-calls/${id}`);
    return response.data;
  },

  /**
   * Update a P2P call
   * @param {string} id - P2P call ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<{success: boolean, data: Object}>}
   */
  async updateP2PCall(id, updateData) {
    const response = await api.patch(`/api/p2p-calls/${id}`, updateData);
    return response.data;
  },

  // ==================== Analytics ====================

  /**
   * Get comprehensive analytics data
   * @returns {Promise<{success: boolean, data: Object}>}
   */
  async getAnalytics() {
    const response = await api.get('/api/analytics');
    return response.data;
  },

  // ==================== Pending Actions ====================

  /**
   * Get pending action counts for badge notifications
   * @returns {Promise<{supportTicketsPending: number, p2pCallsNew: number}>}
   */
  async getPendingActions() {
    const response = await api.get('/api/pending-actions');
    return response.data;
  },

  // ==================== Transformers ====================

  /**
   * Transform support ticket for frontend display
   * @param {Object} ticket - Ticket from API
   * @returns {Object}
   */
  transformSupportTicket(ticket) {
    return {
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      category: ticket.category,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      assignedTo: ticket.assignedTo,
      requesterName: ticket.requesterName,
      requesterEmail: ticket.requesterEmail,
      packetId: ticket.packetId,
      // Computed properties for UI
      priorityColor: getPriorityColor(ticket.priority),
      statusColor: getStatusColor(ticket.status),
    };
  },

  /**
   * Transform P2P call for frontend display
   * @param {Object} call - P2P call from API
   * @returns {Object}
   */
  transformP2PCall(call) {
    return {
      id: call.id,
      requestId: call.requestId,
      status: call.status,
      requestedBy: call.requestedBy,
      requestedByRole: call.requestedByRole,
      patientName: call.patientName,
      patientMemberId: call.patientMemberId,
      packetId: call.packetId,
      scheduledDate: call.scheduledDate,
      scheduledTime: call.scheduledTime,
      mdReviewer: call.mdReviewer,
      notes: call.notes,
      createdAt: call.createdAt,
      updatedAt: call.updatedAt,
      urgency: call.urgency,
      // Computed properties for UI
      urgencyColor: getUrgencyColor(call.urgency),
      statusColor: getP2PStatusColor(call.status),
    };
  },
};

// Helper functions for UI colors
function getPriorityColor(priority) {
  const colors = {
    low: '#28a745',
    medium: '#ffc107',
    high: '#fd7e14',
    urgent: '#dc3545',
  };
  return colors[priority] || '#6c757d';
}

function getStatusColor(status) {
  const colors = {
    open: '#007bff',
    in_progress: '#ffc107',
    pending: '#fd7e14',
    resolved: '#28a745',
    closed: '#6c757d',
  };
  return colors[status] || '#6c757d';
}

function getUrgencyColor(urgency) {
  const colors = {
    routine: '#28a745',
    urgent: '#dc3545',
    expedited: '#fd7e14',
  };
  return colors[urgency] || '#6c757d';
}

function getP2PStatusColor(status) {
  const colors = {
    new: '#007bff',
    scheduled: '#17a2b8',
    in_progress: '#ffc107',
    completed: '#28a745',
    cancelled: '#6c757d',
    no_show: '#dc3545',
  };
  return colors[status] || '#6c757d';
}

export default operationsService;
