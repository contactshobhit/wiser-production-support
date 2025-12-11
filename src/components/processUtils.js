// Utility functions for ProcessTracker metrics and filtering

export function getCriticalErrors(packets) {
  // Example: packets stuck >2hr
  const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
  const now = new Date();
  return packets.filter(pkt => {
    const lastUpdate = new Date(pkt.lastUpdate);
    return pkt.status === 'In Progress' && (now - lastUpdate > TWO_HOURS_MS);
  });
}

export function getPendingManualReview(packets) {
  return packets.filter(pkt => pkt.status === 'Manual Correction');
}

export function getProcessingNow(packets) {
  return packets.filter(pkt => pkt.status === 'In Progress');
}

export function getCompletedToday(packets) {
  const today = new Date().toISOString().slice(0, 10);
  return packets.filter(pkt => pkt.status === 'Delivered' && pkt.lastUpdate.startsWith(today));
}

export function filterPackets(packets, type) {
  switch (type) {
    case 'critical':
      return getCriticalErrors(packets);
    case 'manual':
      return getPendingManualReview(packets);
    case 'processing':
      return getProcessingNow(packets);
    case 'completed':
      return getCompletedToday(packets);
    default:
      return packets;
  }
}
