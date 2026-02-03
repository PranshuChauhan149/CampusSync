import axios from "axios";

/* =========================================================
   AXIOS INSTANCE (COOKIE-BASED AUTH)
   ========================================================= */

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
  withCredentials: true,
});

/* =========================================================
   REQUEST INTERCEPTOR
   (NO TOKEN / NO AUTH HEADER)
   ========================================================= */

api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

/* =========================================================
   RESPONSE INTERCEPTOR
   ========================================================= */

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized – session expired or not logged in");
      // ❌ No localStorage clearing
      // ❌ No forced redirect here
      // AuthContext + ProtectedRoute will handle it
    }
    return Promise.reject(error);
  }
);

/* =========================================================
   AUTH APIs
   ========================================================= */

export const authAPI = {
  // 🔐 Login → cookie set by backend
  login: (credentials) => api.post("/users/login", credentials),

  // 📝 Register
  register: (userData) => api.post("/users/register", userData),

  // 🚪 Logout → cookie cleared by backend
  logout: () => api.post("/users/logout"),

  // 👤 Get current logged-in user
  getMe: () => api.get("/users/me"),

  // ✏️ Update profile
  updateProfile: (data) => api.put("/users/profile", data),
};

/* =========================================================
   FAVORITES APIs
   ========================================================= */

export const favoritesAPI = {
  addToFavorites: (itemId, type) =>
    api.post("/users/favorites/add", { itemId, type }),
  removeFromFavorites: (itemId, type) =>
    api.post("/users/favorites/remove", { itemId, type }),
  getFavorites: (params) =>
    api.get("/users/favorites", { params }),
  checkFavorite: (itemId, type) =>
    api.get("/users/favorites/check", { params: { itemId, type } }),
};

/* =========================================================
   ITEMS APIs
   ========================================================= */

export const itemsAPI = {
  getItems: (params) => api.get("/items", { params }),
  getItemById: (id) => api.get(`/items/${id}`),
  createItem: (data) => api.post("/items", data),
  updateItem: (id, data) => api.put(`/items/${id}`, data),
  deleteItem: (id) => api.delete(`/items/${id}`),
  claimItem: (id, data) => api.post(`/items/${id}/claim`, data),
  getMyItems: () => api.get("/items/my-items"),
  getReceivedClaims: () => api.get("/items/claims/received"),
  getSentClaims: () => api.get("/items/claims/sent"),
  updateClaimStatus: (claimId, status) => api.put(`/items/claims/${claimId}/status`, { status }),
};

/* =========================================================
   BOOKS APIs
   ========================================================= */

export const booksAPI = {
  getBooks: (params) => api.get("/books", { params }),
  getBookById: (id) => api.get(`/books/${id}`),
  createBook: (data) => api.post("/books", data),
  updateBook: (id, data) => api.put(`/books/${id}`, data),
  deleteBook: (id) => api.delete(`/books/${id}`),
  getMyBooks: () => api.get("/books/my-books"),
};

/* =========================================================
   NOTIFICATIONS APIs
   ========================================================= */

export const notificationsAPI = {
  getNotifications: () => api.get("/notifications"),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put("/notifications/read-all"),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

/* =========================================================
   CHAT APIs
   ========================================================= */

export const chatAPI = {
  getConversations: () => api.get("/chat/conversations"),
  getOrCreateConversation: (otherUserId) => api.get(`/chat/conversations/${otherUserId}`),
  getMessages: (conversationId, params) =>
    api.get(`/chat/conversations/${conversationId}/messages`, { params }),
  sendMessage: (conversationId, data) => {
    return api.post(`/chat/conversations/${conversationId}/messages`, data);
  },
  markAsRead: (conversationId) =>
    api.put(`/chat/conversations/${conversationId}/read`),
  deleteMessage: (messageId) =>
    api.delete(`/chat/messages/${messageId}`),
  searchUsers: (search) =>
    api.get("/chat/search-users", { params: { search } }),
};

/* =========================================================
   STATS APIs
   ========================================================= */

export const statsAPI = {
  getStats: () => api.get("/stats"),
  getUserStats: () => api.get("/stats/user"),
};

/* =========================================================
   ADMIN APIs
   ========================================================= */

export const adminAPI = {
  getAllClaims: () => api.get("/admin/claims/all"),
  getAdminStats: () => api.get("/admin/statistics"),
  getUsers: () => api.get("/admin/users"),
  getItems: () => api.get("/admin/items"),
  getBooks: () => api.get("/admin/books"),
};

export default api;
