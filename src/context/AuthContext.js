import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage and verify with backend
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = authService.getStoredUser();
      if (storedUser) {
        try {
          // Verify the session is still valid
          const response = await authService.getCurrentUser();
          if (response.success) {
            setUser(response.data);
          } else {
            // Session invalid, clear stored data
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
          }
        } catch {
          // Token might be expired, try to refresh
          try {
            await authService.refreshToken();
            const response = await authService.getCurrentUser();
            if (response.success) {
              setUser(response.data);
            }
          } catch {
            // Refresh also failed, clear auth
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
          }
        }
      }
      setLoading(false);
    };

    initAuth();

    // Listen for logout events from API interceptor
    const handleLogout = () => {
      setUser(null);
    };
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const login = useCallback(async (username, password) => {
    setError(null);
    setLoading(true);
    try {
      const response = await authService.login(username, password);
      if (response.success) {
        setUser(response.data);
        return { success: true };
      } else {
        setError(response.message || 'Login failed');
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch {
      // Ignore logout errors, clear state anyway
    } finally {
      setUser(null);
      setLoading(false);
    }
  }, []);

  const hasRole = useCallback((roles) => {
    return authService.hasRole(roles);
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
