import { useState, useEffect, useCallback } from 'react';
import { healthService } from '../services';

/**
 * Custom hook for monitoring system status
 * @param {number} pollInterval - Polling interval in milliseconds (default 30000)
 * @returns {Object} - System status data
 */
export function useSystemStatus(pollInterval = 30000) {
  const [status, setStatus] = useState({
    backend: { status: 'unknown', version: null, lastChecked: null },
    pendingActions: { supportTickets: 0, p2pCalls: 0 },
    externalServices: {
      esMD: { status: 'unknown', lastChecked: null },
      hets: { status: 'unknown', lastChecked: null },
      pecos: { status: 'unknown', lastChecked: null },
      s3: { status: 'unknown', lastChecked: null },
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStatus = useCallback(async () => {
    try {
      const systemStatus = await healthService.getSystemStatus();
      setStatus(systemStatus);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch system status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchStatus();

    // Set up polling
    const intervalId = setInterval(fetchStatus, pollInterval);

    return () => clearInterval(intervalId);
  }, [fetchStatus, pollInterval]);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchStatus();
  }, [fetchStatus]);

  return {
    ...status,
    loading,
    error,
    refresh,
    isBackendConnected: status.backend.status === 'connected',
  };
}

export default useSystemStatus;
