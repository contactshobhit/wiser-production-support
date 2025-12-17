import api from './api';

/**
 * Health Service
 * Handles API health checks and system status monitoring
 */
const healthService = {
  /**
   * Check backend API health
   * @returns {Promise<{status: string, version: string}>}
   */
  async checkHealth() {
    const response = await api.get('/health');
    return response.data;
  },

  /**
   * Get pending action counts
   * @returns {Promise<{supportTicketsPending: number, p2pCallsNew: number}>}
   */
  async getPendingActions() {
    const response = await api.get('/api/pending-actions');
    return response.data;
  },

  /**
   * Check if the backend API is reachable
   * @returns {Promise<boolean>}
   */
  async isBackendAvailable() {
    try {
      const response = await api.get('/health', { timeout: 5000 });
      return response.data.status === 'ok';
    } catch {
      return false;
    }
  },

  /**
   * Get comprehensive system status for the SystemStatusBar component
   * This aggregates health info and checks various external services
   * @returns {Promise<Object>}
   */
  async getSystemStatus() {
    try {
      const [healthResponse, pendingActions] = await Promise.all([
        this.checkHealth(),
        this.getPendingActions().catch(() => ({ supportTicketsPending: 0, p2pCallsNew: 0 })),
      ]);

      return {
        backend: {
          status: healthResponse.status === 'ok' ? 'connected' : 'degraded',
          version: healthResponse.version,
          lastChecked: new Date().toISOString(),
        },
        pendingActions: {
          supportTickets: pendingActions.supportTicketsPending || 0,
          p2pCalls: pendingActions.p2pCallsNew || 0,
        },
        // External services status would come from additional API endpoints
        // For now, return unknown status for external services
        externalServices: {
          esMD: { status: 'unknown', lastChecked: null },
          hets: { status: 'unknown', lastChecked: null },
          pecos: { status: 'unknown', lastChecked: null },
          s3: { status: 'unknown', lastChecked: null },
        },
      };
    } catch (error) {
      return {
        backend: {
          status: 'down',
          version: null,
          lastChecked: new Date().toISOString(),
          error: error.message,
        },
        pendingActions: {
          supportTickets: 0,
          p2pCalls: 0,
        },
        externalServices: {
          esMD: { status: 'unknown', lastChecked: null },
          hets: { status: 'unknown', lastChecked: null },
          pecos: { status: 'unknown', lastChecked: null },
          s3: { status: 'unknown', lastChecked: null },
        },
      };
    }
  },

  /**
   * Poll system status at regular intervals
   * @param {Function} callback - Called with system status on each poll
   * @param {number} intervalMs - Poll interval in milliseconds (default 30000)
   * @returns {Function} - Function to stop polling
   */
  startStatusPolling(callback, intervalMs = 30000) {
    // Initial check
    this.getSystemStatus().then(callback);

    // Set up interval
    const intervalId = setInterval(async () => {
      const status = await this.getSystemStatus();
      callback(status);
    }, intervalMs);

    // Return cleanup function
    return () => clearInterval(intervalId);
  },
};

export default healthService;
