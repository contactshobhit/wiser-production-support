import React, { useState } from 'react';
import { useAuth } from '../context';

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
          fontWeight: 600,
          color: '#1a1a2e',
        }}>
          WISeR Production Support
        </h1>
        <p style={{
          margin: '0 0 24px 0',
          color: '#666',
          fontSize: 14,
        }}>
          Sign in to access the dashboard
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

        <div style={{
          marginTop: 24,
          padding: 16,
          background: '#f8fafc',
          borderRadius: 6,
          fontSize: 13,
          color: '#64748b',
        }}>
          <strong>Test Accounts:</strong>
          <div style={{ marginTop: 8 }}>
            <div>admin / adminpass (Full access)</div>
            <div>reviewer1 / reviewer1pass (Reviewer)</div>
            <div>coordinator1 / coordinator1pass (Coordinator)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
