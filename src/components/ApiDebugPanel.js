import React, { useState } from 'react';

const TABS = ["Request", "Response", "Timeline", "Error Details"];

function TabButton({ active, onClick, children }) {
  return (
    <button
      style={{
        padding: '8px 18px',
        border: 'none',
        borderBottom: active ? '2px solid #007bff' : '2px solid #eee',
        background: 'none',
        color: active ? '#007bff' : '#444',
        fontWeight: active ? 600 : 400,
        fontSize: 15,
        cursor: 'pointer',
        outline: 'none',
      }}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function JsonBlock({ data }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div style={{ margin: '8px 0', background: '#f6f8fa', borderRadius: 6, padding: 10, fontSize: 13, position: 'relative' }}>
      <button onClick={() => setCollapsed(!collapsed)} style={{ position: 'absolute', right: 10, top: 10, fontSize: 12, background: 'none', border: 'none', color: '#007bff', cursor: 'pointer' }}>{collapsed ? 'Expand' : 'Collapse'}</button>
      <button onClick={() => navigator.clipboard.writeText(JSON.stringify(data, null, 2))} style={{ position: 'absolute', right: 80, top: 10, fontSize: 12, background: 'none', border: 'none', color: '#007bff', cursor: 'pointer' }}>Copy</button>
      {!collapsed && <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#222' }}><code>{JSON.stringify(data, null, 2)}</code></pre>}
    </div>
  );
}

function InfoRow({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, margin: '4px 0' }}>
      <span style={{ color: '#888' }}>{label}</span>
      <span style={{ color }}>{value}</span>
    </div>
  );
}

export default function ApiDebugPanel({ open, onClose, stageData }) {
  const [tab, setTab] = useState(0);
  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);
  if (!open) return null;

  // Simulated data for demo
  const req = stageData?.request || { url: '/api/demo', headers: { Authorization: 'Bearer ****' }, payload: { id: 'PKT-1001' }, tokenExpiry: '12:30', correlationId: 'abc-123' };
  const res = stageData?.response || { status: 200, headers: { 'Content-Type': 'application/json' }, body: { result: 'ok' }, responseTime: 420, size: 2.1 };
  const timeline = stageData?.timeline || [{ time: '10:15', action: 'Request sent' }, { time: '10:16', action: 'Response received' }];
  const error = stageData?.error || { code: 'ERR-001', message: 'Timeout', retries: 2 };

  // Color coding for response time
  let timeColor = '#28a745';
  if (res.responseTime > 2000) timeColor = '#dc3545';
  else if (res.responseTime > 500) timeColor = '#ffc107';

  return (
    <div style={{ position: 'fixed', top: 60, left: 0, right: 0, bottom: 0, background: '#fff', zIndex: 1000, boxShadow: '0 2px 24px #0002', borderRadius: 12, maxWidth: 700, margin: 'auto', padding: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #eee', padding: '12px 24px', background: '#f8f9fa' }}>
        <span style={{ fontWeight: 600, fontSize: 18 }}>API Debug Panel</span>
        <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', fontSize: 18, color: '#888', cursor: 'pointer' }}>✕</button>
      </div>
      <div style={{ display: 'flex', borderBottom: '1px solid #eee', background: '#f8f9fa' }}>
        {TABS.map((t, i) => <TabButton key={t} active={tab === i} onClick={() => setTab(i)}>{t}</TabButton>)}
      </div>
      <div style={{ padding: '18px 24px', maxHeight: '60vh', overflowY: 'auto' }}>
        {tab === 0 && (
          <>
            <InfoRow label="API Endpoint" value={req.url} />
            <InfoRow label="Auth Token" value={req.headers.Authorization.replace(/.(?=.{4})/g, '*')} />
            <InfoRow label="Token Expiry" value={req.tokenExpiry} />
            <InfoRow label="Correlation ID" value={req.correlationId} />
            <InfoRow label="Request Size" value={JSON.stringify(req.payload).length / 1024 + ' KB'} />
            <JsonBlock data={req.payload} />
          </>
        )}
        {tab === 1 && (
          <>
            <InfoRow label="Status Code" value={res.status} />
            <InfoRow label="Response Time" value={res.responseTime + ' ms'} color={timeColor} />
            <InfoRow label="Response Size" value={res.size + ' KB'} />
            <JsonBlock data={res.body} />
          </>
        )}
        {tab === 2 && (
          <>
            {timeline.map((t, i) => <InfoRow key={i} label={t.time} value={t.action} />)}
            <button style={{ marginTop: 12, background: '#007bff', color: 'white', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}>Download full log</button>
          </>
        )}
        {tab === 3 && (
          <>
            <InfoRow label="Error Code" value={error.code} color="#dc3545" />
            <InfoRow label="Message" value={error.message} />
            <InfoRow label="Retry Count" value={error.retries} />
          </>
        )}
        {/* Special fields for common APIs (stub) */}
        {stageData?.special && (
          <div style={{ marginTop: 18, background: '#f0f4fa', borderRadius: 8, padding: 12 }}>
            {Object.entries(stageData.special).map(([k, v]) => <InfoRow key={k} label={k} value={v} />)}
          </div>
        )}
      </div>
    </div>
  );
}
