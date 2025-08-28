const API_BASE_URL = "http://localhost:3001/api";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem("accessToken");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    // For multipart form data, don't set Content-Type header
    let headers = {};
    if (options.body instanceof FormData) {
      // Let browser set Content-Type with boundary for FormData
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    } else {
      // For JSON requests, use default headers
      headers = this.getAuthHeaders();
    }

    const config = {
      headers,
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
            if (!(options.body instanceof FormData)) {
              config.headers = this.getAuthHeaders();
            }
            const retryResponse = await fetch(url, config);
            if (!retryResponse.ok) {
              throw new Error(`HTTP error! status: ${retryResponse.status}`);
            }
            // Check if retry response has content before trying to parse JSON
            const retryText = await retryResponse.text();

            if (!retryText) {
              return {};
            }
            return JSON.parse(retryText);
          } else {
            // Refresh failed, redirect to login
            throw new Error("Authentication failed");
          }
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if response has content before trying to parse JSON
      const text = await response.text();

      if (!text) {
        // Return empty object for empty responses
        return {};
      }
      return JSON.parse(text);
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Authentication methods
  async login(credentials) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) return false;

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const text = await response.text();
        if (!text) {
          console.error("Empty response from refresh token endpoint");
          return false;
        }
        const data = JSON.parse(text);
        localStorage.setItem("accessToken", data.access_token);
        localStorage.setItem("refreshToken", data.refresh_token);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  }

  async logout() {
    try {
      await this.request("/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.location.href = "/giris-yap";
    }
  }

  async getProfile() {
    return this.request("/auth/profile");
  }

  async getUserDetails() {
    return this.request("/users/profile/complete");
  }

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(userData),
    });
  }

  // User methods
  async register(userData, photoFiles) {
    const formData = new FormData();
    formData.append("userData", JSON.stringify(userData));

    if (photoFiles && photoFiles.length > 0) {
      photoFiles.forEach((file) => {
        formData.append("photos", file);
      });
    }

    // For multipart form data, don't set Content-Type header
    // Let the browser set it automatically with the boundary
    const headers = {};
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return this.request("/users/register-with-photos", {
      method: "POST",
      headers,
      body: formData,
    });
  }

  async removePhoto(photoUrl) {
    return this.request(`/users/remove-photo`, {
      method: "DELETE",
      body: JSON.stringify({ url: photoUrl }),
    });
  }

  async uploadPhotos(photoFiles) {
    const formData = new FormData();

    if (photoFiles && photoFiles.length > 0) {
      photoFiles.forEach((file) => {
        formData.append("photos", file);
      });
    }

    // For multipart form data, don't set Content-Type header
    const headers = {};
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return this.request("/users/upload-photos", {
      method: "POST",
      headers,
      body: formData,
    });
  }

  async getUsers() {
    return this.request("/users");
  }

  async getUser(id) {
    return this.request(`/users/${id}`);
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: "DELETE",
    });
  }

  async searchUsers(query, userType, city) {
    const params = new URLSearchParams();
    if (query) params.append("q", query);
    if (userType) params.append("userType", userType);
    if (city) params.append("city", city);

    return this.request(`/users/search?${params.toString()}`);
  }

  async getServiceProviders(city, sector) {
    const params = new URLSearchParams();
    if (city) params.append("city", city);
    sector && params.append("businessSector", sector);

    return this.request(`/users/service-providers?${params.toString()}`);
  }

  async getCustomers(city) {
    const params = new URLSearchParams();
    if (city) params.append("city", city);

    return this.request(`/users/customers?${city}`);
  }

  // Message methods
  async sendMessage(
    receiverId,
    content,
    type = "text",
    fileUrl,
    fileName,
    fileSize
  ) {
    return this.request("/messages", {
      method: "POST",
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
    return this.request("/messages/conversations");
  }

  async getConversationByParticipants(participantIds) {
    return this.request(
      `/messages/conversations/by-participants?participants=${participantIds.join(
        ","
      )}`
    );
  }

  async getConversationMessages(conversationId, limit = 50, offset = 0) {
    return this.request(
      `/messages/conversations/${conversationId}?limit=${limit}&offset=${offset}`
    );
  }

  async markMessageAsRead(messageId) {
    return this.request(`/messages/${messageId}/read`, {
      method: "PATCH",
    });
  }

  async markConversationAsRead(conversationId) {
    return this.request(`/messages/conversations/${conversationId}/read`, {
      method: "PATCH",
    });
  }

  async deleteMessage(messageId) {
    return this.request(`/messages/${messageId}`, {
      method: "DELETE",
    });
  }

  async editMessage(messageId, content) {
    return this.request(`/messages/${messageId}`, {
      method: "PATCH",
      body: JSON.stringify({ content }),
    });
  }

  async getUnreadCount() {
    return this.request("/messages/unread-count");
  }

  // Update online status
  async updateOnlineStatus(isOnline) {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.id) {
      return this.request(`/users/${user.id}/online-status`, {
        method: "PATCH",
        body: JSON.stringify({ isOnline }),
      });
    }
  }

  // Review methods
  async createReview(businessId, rating, comment) {
    return this.request("/reviews", {
      method: "POST",
      body: JSON.stringify({
        businessId,
        rating,
        comment,
      }),
    });
  }

  async getBusinessReviews(businessId, page = 1, limit = 10) {
    return this.request(`/reviews/business/${businessId}?page=${page}&limit=${limit}`);
  }

  async getUserReview(businessId) {
    return this.request(`/reviews/user/${businessId}`);
  }

  async updateReview(reviewId, rating, comment) {
    return this.request(`/reviews/${reviewId}`, {
      method: "PUT",
      body: JSON.stringify({
        rating,
        comment,
      }),
    });
  }

  async deleteReview(reviewId) {
    return this.request(`/reviews/${reviewId}`, {
      method: "DELETE",
    });
  }
}

export default new ApiService();
