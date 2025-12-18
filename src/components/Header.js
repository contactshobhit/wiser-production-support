import React from 'react';

export default function Header({ user, onLogout }) {
  return (
    <header style={{
      background: 'linear-gradient(90deg, #003366 0%, #005fa3 100%)',
      color: 'white',
      padding: '12px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* Genzeon Logo */}
        <img
          src="/images/genzeon-logo.svg"
          alt="Genzeon"
          style={{
            height: 40,
            filter: 'brightness(0) invert(1)',
          }}
        />

        {/* Vertical Separator */}
        <div style={{
          width: 1,
          height: 36,
          background: 'rgba(255, 255, 255, 0.4)',
        }} />

        {/* HIP One Logo */}
        <img
          src="/images/hip-one-logo.svg"
          alt="HIP One"
          style={{
            height: 36,
            filter: 'brightness(0) invert(1)',
          }}
        />

        {/* Vertical Separator */}
        <div style={{
          width: 1,
          height: 36,
          background: 'rgba(255, 255, 255, 0.4)',
        }} />

        {/* Title */}
        <div style={{ fontWeight: 600, fontSize: 20, letterSpacing: 0.5 }}>
          Production Support
        </div>
      </div>
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 600,
            }}>
              {user.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div style={{ fontSize: 14 }}>
              <div style={{ fontWeight: 500 }}>{user.username}</div>
              <div style={{ fontSize: 12, opacity: 0.8, textTransform: 'capitalize' }}>
                {user.role}
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 4,
              padding: '6px 14px',
              fontSize: 13,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.25)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
