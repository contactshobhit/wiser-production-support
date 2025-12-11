import React, { useState } from 'react';
import Header from './components/Header';
import NavBar from './components/NavBar';
import ApiHealthDashboard from './components/ApiHealthDashboard';
import ProcessTracker from './components/ProcessTracker';
import SystemStatusBar from './components/SystemStatusBar';

function App() {
  const [screen, setScreen] = useState('api');
  let content;
  if (screen === 'api') content = <ApiHealthDashboard />;
  else if (screen === 'process') content = <ProcessTracker />;
  // removed packet intake and outbound communication screens
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
      <NavBar current={screen} onNavigate={setScreen} />
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
