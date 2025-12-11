import React from 'react';

const iconStyles = {
  base: {
    border: '1px solid #ccc',
    background: 'none',
    borderRadius: '50%',
    width: 32,
    height: 32,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 4px',
    cursor: 'pointer',
    outline: 'none',
    transition: 'background 0.2s, border-color 0.2s',
    color: '#888',
    fontSize: 18,
    position: 'relative',
  },
  view: { ':hover': { background: '#e3f0ff', borderColor: '#007bff', color: '#007bff' } },
  retry: { ':hover': { background: '#e6f9ed', borderColor: '#28a745', color: '#28a745' } },
  override: { ':hover': { background: '#fff4e3', borderColor: '#fd7e14', color: '#fd7e14' } },
  download: { ':hover': { background: '#f0f0f0', borderColor: '#888', color: '#444' } },
  disabled: { opacity: 0.5, cursor: 'not-allowed' },
};

const icons = {
  view: <span role="img" aria-label="View Details">👁️</span>,
  retry: <span role="img" aria-label="Retry">🔄</span>,
  override: <span role="img" aria-label="Override">➡️</span>,
  download: <span role="img" aria-label="Download">⬇️</span>,
};

function ActionButton({ type, tooltip, onClick, disabled }) {
  const [hovered, setHovered] = React.useState(false);
  const style = {
    ...iconStyles.base,
    boxShadow: hovered
      ? '0 4px 8px rgba(0,0,0,0.3)'
      : '0 2px 5px rgba(0,0,0,0.2)',
    transform: hovered ? 'translateY(-2px)' : 'none',
    transition: 'box-shadow 0.2s, transform 0.2s',
    cursor: disabled ? 'not-allowed' : 'pointer',
    ...(iconStyles[type] && !disabled ? iconStyles[type][':hover'] : {}),
    ...(disabled ? iconStyles.disabled : {}),
  };
  return (
    <button
      style={style}
      onClick={disabled ? undefined : onClick}
      title={tooltip}
      aria-label={tooltip}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      tabIndex={0}
      role="button"
    >
      {icons[type]}
    </button>
  );
}

export default function ActionsCell({ packet, onRetry, onView, onOverride, onDownload }) {
  const isError = packet.status === 'In Progress' || packet.status === 'Manual Correction';
  const isCompleted = packet.status === 'Delivered';

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
      {isError && (
        <>
          <ActionButton type="retry" tooltip="Retry: Attempt to reprocess packet" onClick={() => onRetry(packet)} disabled={false} />
          <ActionButton type="view" tooltip="View Details: See error logs and history" onClick={() => onView(packet)} disabled={false} />
          <ActionButton type="override" tooltip="Override: Manually advance to next stage" onClick={() => onOverride(packet)} disabled={false} />
        </>
      )}
      {isCompleted && (
        <>
          <ActionButton type="view" tooltip="View Details: See transaction history" onClick={() => onView(packet)} disabled={false} />
          <ActionButton type="download" tooltip="Download: Export packet documentation" onClick={() => onDownload(packet)} disabled={false} />
        </>
      )}
      {!isError && !isCompleted && (
        <ActionButton type="view" tooltip="View Details" onClick={() => onView(packet)} disabled={false} />
      )}
    </div>
  );
}
