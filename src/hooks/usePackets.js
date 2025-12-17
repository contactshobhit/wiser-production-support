import { useState, useEffect, useCallback } from 'react';
import { packetService } from '../services';

/**
 * Custom hook for fetching and managing packets
 * @param {Object} initialParams - Initial query parameters
 * @returns {Object} - Packets data, loading state, error, and methods
 */
export function usePackets(initialParams = {}) {
  const [packets, setPackets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 10,
  });

  const fetchPackets = useCallback(async (queryParams = params) => {
    setLoading(true);
    setError(null);
    try {
      const response = await packetService.getPackets(queryParams);
      if (response.success) {
        const transformedPackets = packetService.transformPacketsForFrontend(response.data);
        setPackets(transformedPackets);
        setPagination({
          total: response.total,
          page: response.page,
          pageSize: response.page_size,
        });
      } else {
        setError('Failed to fetch packets');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch packets');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchPackets();
  }, [fetchPackets]);

  const updateParams = useCallback((newParams) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  const refresh = useCallback(() => {
    fetchPackets(params);
  }, [fetchPackets, params]);

  const createPacket = useCallback(async (packetData) => {
    try {
      const response = await packetService.createPacket(packetData);
      if (response.success) {
        refresh();
        return { success: true, data: response.data };
      }
      return { success: false, error: response.message };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [refresh]);

  const updatePacket = useCallback(async (id, updateData) => {
    try {
      const response = await packetService.updatePacket(id, updateData);
      if (response.success) {
        setPackets(prev => prev.map(p =>
          p.id === id ? packetService.transformPacketForFrontend(response.data) : p
        ));
        return { success: true, data: response.data };
      }
      return { success: false, error: response.message };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const deletePacket = useCallback(async (id) => {
    try {
      const response = await packetService.deletePacket(id);
      if (response.success) {
        setPackets(prev => prev.filter(p => p.id !== id));
        return { success: true };
      }
      return { success: false, error: response.message };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  return {
    packets,
    loading,
    error,
    pagination,
    params,
    updateParams,
    refresh,
    createPacket,
    updatePacket,
    deletePacket,
  };
}

export default usePackets;
