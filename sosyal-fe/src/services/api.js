const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, try to refresh
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Retry the original request
            config.headers = this.getAuthHeaders();
            const retryResponse = await fetch(url, config);
            if (!retryResponse.ok) {
              throw new Error(`HTTP error! status: ${retryResponse.status}`);
            }
            return await retryResponse.json();
          } else {
            // Refresh failed, redirect to login
            throw new Error('Authentication failed');
          }
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return false;

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.access_token);
        localStorage.setItem('refreshToken', data.refresh_token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async getUserDetails() {
    return this.request('/users/profile/details');
  }

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  // User methods
  async register(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getUsers() {
    return this.request('/users');
  }

  async getUser(id) {
    return this.request(`/users/${id}`);
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async searchUsers(query, userType, city) {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (userType) params.append('userType', userType);
    if (city) params.append('city', city);
    
    return this.request(`/users/search?${params.toString()}`);
  }

  async getServiceProviders(city, businessType) {
    const params = new URLSearchParams();
    if (city) params.append('city', city);
    if (businessType) params.append('businessType', businessType);
    
    return this.request(`/users/service-providers?${params.toString()}`);
  }

  async getCustomers(city) {
    const params = new URLSearchParams();
    if (city) params.append('city', city);
    
    return this.request(`/users/customers?${city}`);
  }

  // Message methods
  async sendMessage(receiverId, content, type = 'text', fileUrl, fileName, fileSize) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify({
        receiverId,
        content,
        type,
        fileUrl,
        fileName,
        fileSize,
      }),
    });
  }

  async getConversations() {
    return this.request('/messages/conversations');
  }

  async getConversationByParticipants(participantIds) {
    return this.request(`/messages/conversations/by-participants?participants=${participantIds.join(',')}`);
  }

  async getConversationMessages(conversationId, limit = 50, offset = 0) {
    return this.request(`/messages/conversations/${conversationId}?limit=${limit}&offset=${offset}`);
  }

  async markMessageAsRead(messageId) {
    return this.request(`/messages/${messageId}/read`, {
      method: 'PATCH',
    });
  }

  async markConversationAsRead(conversationId) {
    return this.request(`/messages/conversations/${conversationId}/read`, {
      method: 'PATCH',
    });
  }

  async deleteMessage(messageId) {
    return this.request(`/messages/${messageId}`, {
      method: 'DELETE',
    });
  }

  async editMessage(messageId, content) {
    return this.request(`/messages/${messageId}`, {
      method: 'PATCH',
      body: JSON.stringify({ content }),
    });
  }

  async getUnreadCount() {
    return this.request('/messages/unread-count');
  }

  // Update online status
  async updateOnlineStatus(isOnline) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) {
      return this.request(`/users/${user.id}/online-status`, {
        method: 'PATCH',
        body: JSON.stringify({ isOnline }),
      });
    }
  }
}

export default new ApiService();
