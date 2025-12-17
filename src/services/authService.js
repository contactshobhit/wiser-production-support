import api from './api';

/**
 * Authentication Service
 * Handles login, logout, token refresh, and user management
 */
const authService = {
  /**
   * Login with username and password
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{success: boolean, data: {id: string, username: string, role: string}, message: string}>}
   */
  async login(username, password) {
    const response = await api.post('/api/auth/login', { username, password });

    if (response.data.success && response.data.data) {
      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }

    return response.data;
  },

  /**
   * Logout the current user
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async logout() {
    try {
      const response = await api.post('/api/auth/logout');
      return response.data;
    } finally {
      // Always clear local storage on logout attempt
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
  },

  /**
   * Refresh the access token using refresh token cookie
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async refreshToken() {
    const response = await api.post('/api/auth/refresh-token');
    return response.data;
  },

  /**
   * Get the current authenticated user
   * @returns {Promise<{success: boolean, data: {id: string, username: string, role: string}}>}
   */
  async getCurrentUser() {
    const response = await api.get('/api/auth/me');

    if (response.data.success && response.data.data) {
      // Update stored user info
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }

    return response.data;
  },

  /**
   * Get stored user from localStorage (synchronous)
   * @returns {{id: string, username: string, role: string} | null}
   */
  getStoredUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * Check if user is authenticated (has stored user data)
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!this.getStoredUser();
  },

  /**
   * Check if current user has specific role
   * @param {string|string[]} roles - Role or array of roles to check
   * @returns {boolean}
   */
  hasRole(roles) {
    const user = this.getStoredUser();
    if (!user) return false;

    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  },
};

export default authService;
