import React from 'react';

export default function Header() {
  return (
    <header style={{
      background: 'linear-gradient(90deg, #003366 0%, #005fa3 100%)',
      color: 'white',
      padding: '20px 32px',
      display: 'flex',
      alignItems: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    }}>
      {/* Replace with <img src="/logo.png" ... /> if you have a logo */}
      <div style={{ fontWeight: 700, fontSize: 28, letterSpacing: 1 }}>
        Wiser Genzeon Production Support
      </div>
    </header>
  );
}
