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
  // Check if this stage has an error based on packet status
  if (idx === packet.currentStage) {
    if (packet.status === 'Manual Correction') return 'error';
    if (packet.status === 'In Progress') return 'current';
    if (packet.status === 'Delivered') return 'completed';
  }

  if (packet.failedStage === idx) return 'failed';
  if (idx < packet.currentStage) return 'completed';
  if (idx === packet.currentStage) return 'current';
  if (packet.skippedStages && packet.skippedStages.includes(idx)) return 'skipped';
  return 'upcoming';
};

// Colors matching the metric cards for consistency
const stageColors = {
  completed: '#28a745',  // Green - matches "Completed Today"
  current: '#007bff',    // Blue - matches "Processing Now"
  error: '#dc3545',      // Red - matches "Critical Errors"
  warning: '#fd7e14',    // Orange - matches "Pending Manual Review"
  failed: '#dc3545',     // Red
  upcoming: '#ccc',
  skipped: '#bbb',
};

const StageCircle = ({ status, tooltip, onClick, isCurrentStage, packetStatus }) => {
  // Determine the display status based on packet status for current stage
  let displayStatus = status;
  let pulseAnimation = false;

  if (isCurrentStage) {
    if (packetStatus === 'Manual Correction') {
      displayStatus = 'error';
      pulseAnimation = true;
    } else if (packetStatus === 'In Progress') {
      displayStatus = 'current';
      pulseAnimation = true;
    }
  }

  let content;
  if (displayStatus === 'completed') content = <span style={{ color: 'white', fontWeight: 700, fontSize: 12 }}>✓</span>;
  else if (displayStatus === 'failed' || displayStatus === 'error') content = <span style={{ color: 'white', fontWeight: 700, fontSize: 12 }}>!</span>;
  else if (displayStatus === 'warning') content = <span style={{ color: 'white', fontWeight: 700, fontSize: 10 }}>⚠</span>;
  else if (displayStatus === 'skipped') content = <span style={{ color: 'white', fontWeight: 700 }}>–</span>;
  else if (displayStatus === 'current') content = <span style={{ color: 'white', fontWeight: 700, fontSize: 10 }}>●</span>;
  else content = null;

  const [hovered, setHovered] = React.useState(false);

  const bgColor = displayStatus === 'upcoming' ? '#fff' : stageColors[displayStatus];
  const borderColor = displayStatus === 'upcoming' ? '#eee' : stageColors[displayStatus];

  const baseStyle = {
    width: 24,
    height: 24,
    borderRadius: '50%',
    background: bgColor,
    border: `2px solid ${borderColor}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 4px',
    position: 'relative',
    boxShadow: hovered
      ? `0 4px 10px ${stageColors[displayStatus]}60`
      : displayStatus === 'error'
        ? `0 0 8px ${stageColors.error}50`
        : '0 2px 5px rgba(0,0,0,0.15)',
    transform: hovered ? 'translateY(-2px) scale(1.1)' : 'none',
    transition: 'box-shadow 0.2s, transform 0.2s',
    color: displayStatus === 'upcoming' ? '#888' : 'white',
    cursor: 'pointer',
    animation: pulseAnimation && displayStatus === 'error' ? 'pulse-error 2s infinite' :
               pulseAnimation && displayStatus === 'current' ? 'pulse-current 2s infinite' : 'none',
  };

  return (
    <>
      <style>{`
        @keyframes pulse-error {
          0%, 100% { box-shadow: 0 0 8px ${stageColors.error}50; }
          50% { box-shadow: 0 0 16px ${stageColors.error}80; }
        }
        @keyframes pulse-current {
          0%, 100% { box-shadow: 0 0 8px ${stageColors.current}50; }
          50% { box-shadow: 0 0 16px ${stageColors.current}80; }
        }
      `}</style>
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
    </>
  );
};

const Pipeline = ({ packet, audit, onStageClick = () => {} }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', minWidth: 180 }}>
      {STAGES.map((stage, idx) => {
        const status = getStageStatus(packet, idx);
        const isCurrentStage = idx === packet.currentStage;
        const auditEntry = audit && audit.find(a => a.state === stage);

        let tooltip = `${stage}`;
        if (auditEntry) tooltip += `\nCompleted: ${auditEntry.time}`;
        if (isCurrentStage && packet.status === 'Manual Correction') {
          tooltip += `\n⚠ Needs Manual Correction`;
        }
        if (status === 'failed') tooltip += `\nError: ${packet.errorMsg || 'Unknown error'}`;
        if (status === 'completed') tooltip += `\nTime spent: 5m`;

        // Get connector color
        const connectorColor = idx < packet.currentStage ? stageColors.completed : '#eee';

        return (
          <React.Fragment key={stage}>
            <StageCircle
              status={status}
              tooltip={tooltip}
              onClick={() => onStageClick && onStageClick(stage)}
              isCurrentStage={isCurrentStage}
              packetStatus={packet.status}
            />
            {idx < STAGES.length - 1 && (
              <div style={{
                height: 4,
                width: 20,
                background: connectorColor,
                borderRadius: 2,
                margin: '0 1px',
              }} />
            )}
          </React.Fragment>
        );
      })}

      {/* Status indicator label */}
      {packet.status === 'Manual Correction' && (
        <span style={{
          marginLeft: 8,
          background: stageColors.error,
          color: 'white',
          fontSize: 10,
          fontWeight: 600,
          padding: '2px 6px',
          borderRadius: 4,
          whiteSpace: 'nowrap',
        }}>
          ERROR
        </span>
      )}
      {packet.status === 'Delivered' && (
        <span style={{
          marginLeft: 8,
          background: stageColors.completed,
          color: 'white',
          fontSize: 10,
          fontWeight: 600,
          padding: '2px 6px',
          borderRadius: 4,
          whiteSpace: 'nowrap',
        }}>
          DONE
        </span>
      )}
    </div>
  );
};

export default Pipeline;
