import React, { useState } from 'react';
import { useAuth } from '../context';

// Available mock users for quick login
const availableUsers = [
  { username: 'admin', password: 'adminpass', role: 'Admin' },
  { username: 'reviewer1', password: 'reviewer1pass', role: 'Reviewer' },
  { username: 'coordinator1', password: 'coordinator1pass', role: 'Coordinator' },
  { username: 'guest1', password: 'guest1pass', role: 'Guest' },
];

export default function Login() {
  const { login, loading, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!username || !password) {
      setLocalError('Please enter username and password');
      return;
    }

    const result = await login(username, password);
    if (!result.success) {
      setLocalError(result.error || 'Login failed');
    }
  };

  const handleQuickLogin = async (user) => {
    setUsername(user.username);
    setPassword(user.password);
    setLocalError('');

    const result = await login(user.username, user.password);
    if (!result.success) {
      setLocalError(result.error || 'Login failed');
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#f5f7fa',
    }}>
      <div style={{
        background: 'white',
        padding: 40,
        borderRadius: 12,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: 400,
      }}>
        <h1 style={{
          margin: '0 0 8px 0',
          fontSize: 24,
          fontWeight: 700,
          color: '#1a1a2e',
          textAlign: 'center',
        }}>
          WISeR Dashboard
        </h1>
        <p style={{
          margin: '0 0 24px 0',
          color: '#666',
          fontSize: 14,
          textAlign: 'center',
        }}>
          Sign in to your account
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block',
              marginBottom: 6,
              fontSize: 14,
              fontWeight: 500,
              color: '#333',
            }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: 14,
                border: '1px solid #ddd',
                borderRadius: 6,
                boxSizing: 'border-box',
                outline: 'none',
              }}
              placeholder="Enter your username"
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block',
              marginBottom: 6,
              fontSize: 14,
              fontWeight: 500,
              color: '#333',
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: 14,
                border: '1px solid #ddd',
                borderRadius: 6,
                boxSizing: 'border-box',
                outline: 'none',
              }}
              placeholder="Enter your password"
            />
          </div>

          {(localError || error) && (
            <div style={{
              padding: '10px 12px',
              marginBottom: 16,
              background: '#fee2e2',
              color: '#dc2626',
              borderRadius: 6,
              fontSize: 14,
            }}>
              {localError || error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: 14,
              fontWeight: 600,
              color: 'white',
              background: loading ? '#93c5fd' : '#2563eb',
              border: 'none',
              borderRadius: 6,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Quick login buttons for development */}
        <div style={{
          marginTop: 24,
          paddingTop: 24,
          borderTop: '1px solid #e2e8f0',
        }}>
          <p style={{
            fontSize: 14,
            color: '#64748b',
            marginBottom: 12,
            textAlign: 'center',
          }}>
            Quick login (Dev only)
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
          }}>
            {availableUsers.map((user) => (
              <button
                key={user.username}
                type="button"
                onClick={() => handleQuickLogin(user)}
                disabled={loading}
                style={{
                  padding: '10px 12px',
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#374151',
                  background: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1,
                  transition: 'background 0.2s',
                }}
                onMouseOver={(e) => !loading && (e.target.style.background = '#e5e7eb')}
                onMouseOut={(e) => (e.target.style.background = '#f3f4f6')}
              >
                {user.role}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
