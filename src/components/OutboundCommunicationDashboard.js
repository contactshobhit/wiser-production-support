import React from 'react';

export default function OutboundCommunicationDashboard({ onNavigate }) {
  return (
    <section style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <button
          onClick={() => onNavigate('packet')}
          style={{ background: '#005fa3', color: 'white', border: 'none', borderRadius: 4, padding: '10px 20px', fontWeight: 600, cursor: 'pointer' }}
          aria-label="Go to Packet Intake Dashboard"
        >
          ← Packet Intake
        </button>
        <h2 style={{ fontSize: 28, fontWeight: 700 }}>Outbound Communication Dashboard</h2>
        <div />
      </div>
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: 32, minHeight: 300 }}>
        {/* Table and filters would go here, modeled after your reference HTML */}
        <p style={{ color: '#888', fontSize: 18 }}>Outbound communication data table and filters coming soon...</p>
      </div>
    </section>
  );
}
