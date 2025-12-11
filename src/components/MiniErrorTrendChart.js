import React from 'react';

const MiniErrorTrendChart = ({ data = [] }) => {
  // Dummy bar chart: 8 bars, heights based on data or random
  const bars = data.length === 8 ? data : Array.from({ length: 8 }, () => Math.floor(Math.random() * 10));
  const max = Math.max(...bars, 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', height: 40, width: 120, gap: 2 }}>
      {bars.map((count, i) => (
        <div key={i} title={`Hour: ${i} | Errors: ${count}`}
          style={{ height: `${(count / max) * 36}px`, width: 10, background: count > 0 ? '#dc2626' : '#cbd5e1', borderRadius: 2, transition: 'height 0.3s' }} />
      ))}
    </div>
  );
};

export default MiniErrorTrendChart;
