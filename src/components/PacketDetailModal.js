import React from 'react';

function PacketDetailModal({ selected, onClose, authorized, setAuthorized, processStages, getAging }) {
  React.useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(30, 41, 59, 0.45)', // deeper overlay
      zIndex: 1000,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      overflowY: 'auto',
      paddingTop: 60
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)',
        borderRadius: 16,
        boxShadow: '0 4px 32px #64748b33',
        padding: 36,
        minWidth: 340,
        maxWidth: 900,
        position: 'relative',
        margin: '40px 0',
        width: '100%',
        maxHeight: 'calc(100vh - 80px)',
        overflowY: 'auto',
        border: '1.5px solid #cbd5e1',
      }}>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{ position: 'absolute', top: 16, right: 16, background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 36, height: 36, fontSize: 22, fontWeight: 700, color: '#334155', cursor: 'pointer', zIndex: 10, boxShadow: '0 1px 4px #cbd5e1' }}
        >
          ×
        </button>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 18, color: '#1e293b', letterSpacing: 0.5 }}>Packet Details: {selected.id}</h2>
        <div style={{ marginBottom: 24, background: '#f1f5f9', borderRadius: 8, padding: '16px 20px', boxShadow: '0 1px 4px #e0e7ef' }}>
          <span style={{ fontWeight: 700, color: '#334155' }}>Channel:</span> <span style={{ color: '#2563eb', fontWeight: 700 }}>{selected.channel}</span><br />
          <span style={{ fontWeight: 700, color: '#334155' }}>Status:</span> <span style={{ color: selected.status === 'API Error' ? '#dc2626' : '#059669', fontWeight: 700 }}>{selected.status}</span><br />
          <span style={{ fontWeight: 700, color: '#334155' }}>Aging:</span> <span style={{ color: '#be185d', fontWeight: 700 }}>{getAging(selected.lastUpdate)}</span><br />
          <span style={{ fontWeight: 700, color: '#334155' }}>Last Update:</span> <span style={{ color: '#64748b' }}>{selected.lastUpdate}</span>
        </div>
        <div style={{ marginBottom: 24 }}>
          <span style={{ fontWeight: 700, color: '#334155', fontSize: 16 }}>Process Road:</span>
          <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto', paddingBottom: 12, marginTop: 8 }}>
            {processStages.map((stage, idx) => {
              const isCurrent = idx === selected.currentStage;
              const isCompleted = idx < selected.currentStage;
              return (
                <div key={stage} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    minWidth: 120,
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: isCurrent ? '#2563eb' : isCompleted ? '#22c55e' : '#e2e8f0',
                    color: isCurrent || isCompleted ? 'white' : '#334155',
                    fontWeight: isCurrent ? 800 : 600,
                    boxShadow: isCurrent ? '0 2px 8px #2563eb44' : undefined,
                    position: 'relative',
                    cursor: 'pointer',
                    border: isCurrent ? '2px solid #2563eb' : isCompleted ? '2px solid #22c55e' : 'none',
                    transition: 'background 0.2s, color 0.2s',
                  }}
                    title={stage}
                  >
                    {stage}
                    <button
                      style={{ marginLeft: 8, background: '#f1f5f9', color: '#2563eb', border: '1px solid #2563eb', borderRadius: 4, padding: '2px 8px', fontWeight: 600, cursor: 'pointer', fontSize: 13, boxShadow: '0 1px 2px #cbd5e1' }}
                      onClick={e => {
                        e.stopPropagation();
                        alert(`Request Payload for ${stage}:\n${JSON.stringify(selected.payload.details, null, 2)}\n\nResponse Payload for ${stage}:\n(Simulated)`);
                      }}
                    >View Payloads</button>
                  </div>
                  {idx < processStages.length - 1 && (
                    <div style={{ width: 40, height: 4, background: isCompleted ? '#22c55e' : '#cbd5e1', margin: '0 8px', borderRadius: 2 }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontWeight: 700, color: '#334155', fontSize: 16 }}>Error Logs:</span>
          {selected.errorLogs.length === 0 ? (
            <div style={{ color: '#64748b', marginTop: 8, fontStyle: 'italic' }}>No error logs for this packet.</div>
          ) : (
            <div style={{ marginTop: 8 }}>
              {selected.errorLogs.map((log, idx) => (
                <div key={idx} style={{
                  background: '#f8fafc',
                  borderRadius: 10,
                  boxShadow: '0 1px 4px #e0e7ef',
                  marginBottom: 18,
                  padding: '18px 22px',
                  borderLeft: `6px solid ${log.severity === 'Critical' ? '#dc2626' : log.severity === 'High' ? '#f59e42' : '#059669'}`,
                  position: 'relative',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, color: '#334155', fontSize: 15 }}>
                      {log.errorName} 
                      <a
                        href={`https://support.wiser.com/resolution-guides/${log.code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`View resolution guide for ${log.code}`}
                        style={{ color: '#64748b', fontWeight: 500, fontSize: 13, textDecoration: 'underline dotted', marginLeft: 4, cursor: 'help' }}
                        onClick={e => e.stopPropagation()}
                      >
                        ({log.code})
                      </a>
                    </span>
                    <span style={{ fontWeight: 700, color: log.severity === 'Critical' ? '#dc2626' : log.severity === 'High' ? '#f59e42' : '#059669', fontSize: 14 }}>{log.severity}</span>
                  </div>
                  <div style={{ color: '#64748b', fontSize: 13, marginBottom: 8 }}><span style={{ fontWeight: 700, color: '#0e7490' }}>{log.category}</span> | <span style={{ color: '#334155' }}>{log.type}</span> | <span style={{ color: '#334155' }}>{log.source || '-'}</span> | <span style={{ color: '#64748b' }}>{log.state}</span></div>
                  <div style={{ color: '#334155', fontSize: 15, marginBottom: 8 }}><span style={{ fontWeight: 700 }}>Message:</span> {log.message}</div>
                  <div style={{ color: '#334155', fontSize: 15, marginBottom: 8 }}><span style={{ fontWeight: 700 }}>Description:</span> {log.description}</div>
                  <div style={{ color: '#334155', fontSize: 15, marginBottom: 8 }}><span style={{ fontWeight: 700 }}>Resolution:</span> {log.resolution}</div>
                  <div style={{ color: '#334155', fontSize: 15, marginBottom: 8 }}><span style={{ fontWeight: 700 }}>Auto-Retry Status:</span> <span style={{ color: log.autoRetryStatus === 'Enabled' ? '#059669' : '#dc2626', fontWeight: 700 }}>{log.autoRetryStatus}</span></div>
                  {log.manualOverrideOptions && log.manualOverrideOptions.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, color: '#334155' }}>Manual Override:</span>
                      {log.manualOverrideOptions.map((option, i) => (
                        <button
                          key={i}
                          style={{
                            marginLeft: 10,
                            background: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            padding: '5px 14px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: 14,
                            boxShadow: '0 1px 2px #cbd5e1',
                          }}
                          onClick={() => alert(`Manual override: ${option} for error ${log.code}`)}
                        >{option}</button>
                      ))}
                    </div>
                  )}
                  {log.autoRetryStatus === 'Enabled' && (
                    <button
                      style={{
                        background: '#059669',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        padding: '6px 18px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: 15,
                        marginTop: 6,
                        boxShadow: '0 1px 2px #cbd5e1',
                      }}
                      onClick={() => alert(`Retry triggered for error ${log.code}`)}
                    >Retry Now</button>
                  )}
                  <div style={{ position: 'absolute', top: 16, right: 18, color: '#64748b', fontSize: 13 }}>{log.time}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontWeight: 700, color: '#334155', fontSize: 16 }}>Payload Details:</span>
          <div style={{ marginTop: 8, background: '#f8fafc', borderRadius: 8, padding: '14px 18px', boxShadow: '0 1px 4px #e0e7ef' }}>
            <span style={{ fontWeight: 700, color: '#0e7490' }}>Patient:</span> <span style={{ color: '#334155' }}>{selected.payload.patient}</span><br />
            <span style={{ fontWeight: 700, color: '#0e7490' }}>Provider:</span> <span style={{ color: '#334155' }}>{selected.payload.provider}</span><br />
            <span style={{ fontWeight: 700, color: '#0e7490' }}>Service:</span> <span style={{ color: '#334155' }}>{selected.payload.service}</span><br />
            <span style={{ fontWeight: 700, color: '#0e7490' }}>Current State:</span> <span style={{ color: '#be185d' }}>{selected.payload.state}</span><br />
            <span style={{ fontWeight: 700, color: '#0e7490' }}>Audit Trail:</span>
            <ul style={{ margin: '8px 0 0 0', padding: 0, listStyle: 'none' }}>
              {selected.payload.audit.map((a, i) => (
                <li key={i} style={{ fontSize: 13, color: '#64748b' }}>
                  <span style={{ fontWeight: 700 }}>{a.state}</span> <span style={{ color: '#94a3b8' }}>({a.time})</span>
                </li>
              ))}
            </ul>
            {selected.payload.PHI && !authorized ? (
              <div>
                <div style={{ color: '#dc2626', marginBottom: 8, fontWeight: 700 }}>This payload contains PHI. Authorization required.</div>
                <button
                  onClick={() => setAuthorized(true)}
                  style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: 4, padding: '6px 16px', fontWeight: 700, cursor: 'pointer', marginTop: 8, boxShadow: '0 1px 2px #cbd5e1' }}
                >
                  Authorize & View PHI
                </button>
              </div>
            ) : (
              <pre style={{ background: '#f1f5f9', padding: 12, borderRadius: 6, marginTop: 8, fontSize: 15, color: '#334155', border: '1px solid #cbd5e1' }}>{selected.payload.details}</pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PacketDetailModal;
