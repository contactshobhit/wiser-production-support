import React from 'react';

const STAGES = [
  'Received',
  'Validation',
  'Eligibility Check',
  'Medical Review',
  'Decision',
  'Delivery',
];

const getStageStatus = (packet, idx) => {
  // Simulated logic for demo
  if (packet.failedStage === idx) return 'failed';
  if (idx < packet.currentStage) return 'completed';
  if (idx === packet.currentStage) return 'current';
  if (packet.skippedStages && packet.skippedStages.includes(idx)) return 'skipped';
  return 'upcoming';
};

const stageColors = {
  completed: '#28a745',
  current: '#007bff',
  failed: '#dc3545',
  upcoming: '#ccc',
  skipped: '#bbb',
};

const StageCircle = ({ status, tooltip, onClick }) => {
  let content;
  if (status === 'completed') content = <span style={{ color: 'white', fontWeight: 700 }}>✓</span>;
  else if (status === 'failed') content = <span style={{ color: 'white', fontWeight: 700 }}>✗</span>;
  else if (status === 'skipped') content = <span style={{ color: 'white', fontWeight: 700 }}>–</span>;
  else content = null;

  const [hovered, setHovered] = React.useState(false);
  const baseStyle = {
    width: 22,
    height: 22,
    borderRadius: '50%',
    background: status === 'current' ? stageColors.current : stageColors[status],
    border: status === 'current' ? '2px solid #007bff' : '2px solid #eee',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 4px',
    position: 'relative',
    boxShadow: hovered
      ? '0 4px 8px rgba(0,0,0,0.3)'
      : '0 2px 5px rgba(0,0,0,0.2)',
    transform: hovered ? 'translateY(-2px)' : 'none',
    transition: 'box-shadow 0.2s, transform 0.2s',
    color: status === 'completed' || status === 'failed' || status === 'skipped' ? 'white' : '#888',
    backgroundColor: status === 'upcoming' ? '#fff' : stageColors[status],
    cursor: 'pointer',
  };

  return (
    <div
      style={baseStyle}
      title={tooltip}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      tabIndex={0}
      role="button"
      aria-label={tooltip}
    >
      {content}
    </div>
  );
};

const Pipeline = ({ packet, audit, onStageClick = () => {} }) => {
  // Simulated audit: [{ state: 'Received', time: '...' }, ...]
  return (
    <div style={{ display: 'flex', alignItems: 'center', minWidth: 180 }}>
      {STAGES.map((stage, idx) => {
        const status = getStageStatus(packet, idx);
        const auditEntry = audit && audit.find(a => a.state === stage);
        let tooltip = `${stage}`;
        if (auditEntry) tooltip += `\nCompleted: ${auditEntry.time}`;
        if (status === 'failed') tooltip += `\nError: ${packet.errorMsg || 'Unknown error'}`;
        // Simulate time spent
        tooltip += `\nTime spent: 5m`;
        return (
          <React.Fragment key={stage}>
            <StageCircle status={status} tooltip={tooltip} onClick={() => onStageClick && onStageClick(stage)} />
            {idx < STAGES.length - 1 && (
              <div style={{
                height: 4,
                width: 24,
                background: status === 'completed' ? stageColors.completed : '#eee',
                borderRadius: 2,
                margin: '0 2px',
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Pipeline;
