import React, { useState } from 'react';
import Header from './components/Header';
import NavBar from './components/NavBar';
import ApiHealthDashboard from './components/ApiHealthDashboard';
import ProcessTracker from './components/ProcessTracker';
import SystemStatusBar from './components/SystemStatusBar';
import ErrorAnalytics from './components/ErrorAnalytics';

function App() {
  const [screen, setScreen] = useState('api');
  const [dashboardTab, setDashboardTab] = useState('process');
  let content;
  if (screen === 'api') content = <ApiHealthDashboard />;
  else if (screen === 'process') content = <ProcessTracker />;
  else if (screen === 'error') content = <ErrorAnalytics />;
  else content = <div style={{ padding: 32, color: '#888' }}>Coming soon...</div>;
  return (
    <div
      style={{
        fontFamily: 'Segoe UI, Arial, sans-serif',
        background: '#f5f7fa',
        minHeight: '100vh',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <Header />
      <SystemStatusBar />
      <nav style={{ display: 'flex', gap: 24, background: '#f5f7fa', borderBottom: '1px solid #e0e0e0', padding: '12px 32px', fontSize: 16 }}>
        <button
          onClick={() => setScreen('api')}
          style={{
            background: screen === 'api' ? '#005fa3' : 'transparent',
            color: screen === 'api' ? 'white' : '#003366',
            border: 'none',
            borderRadius: 4,
            padding: '8px 20px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          API Health
        </button>
        <button
          onClick={() => setScreen('process')}
          style={{
            background: screen === 'process' ? '#005fa3' : 'transparent',
            color: screen === 'process' ? 'white' : '#003366',
            border: 'none',
            borderRadius: 4,
            padding: '8px 20px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          Process Tracker
        </button>
        <button
          onClick={() => setScreen('error')}
          style={{
            background: screen === 'error' ? '#005fa3' : 'transparent',
            color: screen === 'error' ? 'white' : '#003366',
            border: 'none',
            borderRadius: 4,
            padding: '8px 20px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          Error Analytics
        </button>
      </nav>
      <main
          style={{ 
            width: '100vw',
            margin: 0,
          background: 'white',
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'wrap',
          boxSizing: 'border-box',
        }}
      >
        {content}
      </main>
    </div>
  );
}

export default App;
