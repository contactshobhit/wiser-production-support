import { useState, useEffect, useCallback } from 'react';
import { operationsService } from '../services';

/**
 * Custom hook for managing support tickets
 * @param {Object} initialParams - Initial query parameters
 */
export function useSupportTickets(initialParams = {}) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchTickets = useCallback(async (queryParams = params) => {
    setLoading(true);
    setError(null);
    try {
      const response = await operationsService.getSupportTickets(queryParams);
      if (response.success) {
        setTickets(response.data.map(operationsService.transformSupportTicket));
      } else {
        setError('Failed to fetch support tickets');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch support tickets');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const updateParams = useCallback((newParams) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  const refresh = useCallback(() => {
    fetchTickets(params);
  }, [fetchTickets, params]);

  const updateTicket = useCallback(async (id, updateData) => {
    try {
      const response = await operationsService.updateSupportTicket(id, updateData);
      if (response.success) {
        setTickets(prev => prev.map(t =>
          t.id === id ? operationsService.transformSupportTicket(response.data) : t
        ));
        return { success: true, data: response.data };
      }
      return { success: false, error: response.message };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  return {
    tickets,
    loading,
    error,
    params,
    updateParams,
    refresh,
    updateTicket,
  };
}

/**
 * Custom hook for managing P2P calls
 * @param {Object} initialParams - Initial query parameters
 */
export function useP2PCalls(initialParams = {}) {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchCalls = useCallback(async (queryParams = params) => {
    setLoading(true);
    setError(null);
    try {
      const response = await operationsService.getP2PCalls(queryParams);
      if (response.success) {
        setCalls(response.data.map(operationsService.transformP2PCall));
      } else {
        setError('Failed to fetch P2P calls');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch P2P calls');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchCalls();
  }, [fetchCalls]);

  const updateParams = useCallback((newParams) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  const refresh = useCallback(() => {
    fetchCalls(params);
  }, [fetchCalls, params]);

  const updateCall = useCallback(async (id, updateData) => {
    try {
      const response = await operationsService.updateP2PCall(id, updateData);
      if (response.success) {
        setCalls(prev => prev.map(c =>
          c.id === id ? operationsService.transformP2PCall(response.data) : c
        ));
        return { success: true, data: response.data };
      }
      return { success: false, error: response.message };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  return {
    calls,
    loading,
    error,
    params,
    updateParams,
    refresh,
    updateCall,
  };
}

/**
 * Custom hook for fetching analytics data
 */
export function useAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await operationsService.getAnalytics();
      if (response.success) {
        setAnalytics(response.data);
      } else {
        setError('Failed to fetch analytics');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const refresh = useCallback(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refresh,
  };
}

/**
 * Custom hook for fetching pending action counts
 */
export function usePendingActions(pollInterval = 60000) {
  const [pendingActions, setPendingActions] = useState({
    supportTicketsPending: 0,
    p2pCallsNew: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPendingActions = useCallback(async () => {
    try {
      const response = await operationsService.getPendingActions();
      setPendingActions(response);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch pending actions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingActions();

    const intervalId = setInterval(fetchPendingActions, pollInterval);
    return () => clearInterval(intervalId);
  }, [fetchPendingActions, pollInterval]);

  return {
    ...pendingActions,
    loading,
    error,
    refresh: fetchPendingActions,
  };
}
