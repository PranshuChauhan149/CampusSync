import axios from "axios";

/* =========================================================
   AXIOS INSTANCE FOR ADMIN (COOKIE-BASED AUTH)
   ========================================================= */

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001",
  withCredentials: true,
});

/* =========================================================
   REQUEST INTERCEPTOR
   ========================================================= */

api.interceptors.request.use(
  (config) => {
    console.log("📤 API Request:", config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================================================
   RESPONSE INTERCEPTOR
   ========================================================= */

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("⚠️ Unauthorized – Admin session expired");
      localStorage.removeItem("adminToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

/* =========================================================
   ADMIN AUTH ENDPOINTS
   ========================================================= */

export const adminAuth = {
  login: (email, password) => api.post("/api/admin/login", { email, password }),
  logout: () => api.post("/api/admin/logout"),
  getMe: () => api.get("/api/admin/me"),
  verifyToken: () => api.get("/api/admin/verify"),
};

/* =========================================================
   ADMIN USERS ENDPOINTS
   ========================================================= */

export const adminUsers = {
  getAll: (page = 1, limit = 10, search = "") =>
    api.get("/api/admin/users", { params: { page, limit, search } }),
  getById: (userId) => api.get(`/api/admin/users/${userId}`),
  updateUser: (userId, data) => api.patch(`/api/admin/users/${userId}`, data),
  deleteUser: (userId) => api.delete(`/api/admin/users/${userId}`),
  getUserStats: () => api.get("/api/admin/users/stats"),
};

/* =========================================================
   ADMIN BOOKS ENDPOINTS
   ========================================================= */

export const adminBooks = {
  getAll: (page = 1, limit = 10, search = "") =>
    api.get("/api/admin/books", { params: { page, limit, search } }),
  getById: (bookId) => api.get(`/api/admin/books/${bookId}`),
  updateBook: (bookId, data) => api.patch(`/api/admin/books/${bookId}`, data),
  deleteBook: (bookId) => api.delete(`/api/admin/books/${bookId}`),
  getBookStats: () => api.get("/api/admin/books/stats"),
  approvePending: (bookId) => api.post(`/api/admin/books/${bookId}/approve`),
  rejectPending: (bookId) => api.post(`/api/admin/books/${bookId}/reject`),
};

/* =========================================================
   ADMIN ITEMS ENDPOINTS
   ========================================================= */

export const adminItems = {
  getAll: (page = 1, limit = 10, search = "") =>
    api.get("/api/admin/items", { params: { page, limit, search } }),
  getById: (itemId) => api.get(`/api/admin/items/${itemId}`),
  updateItem: (itemId, data) => api.patch(`/api/admin/items/${itemId}`, data),
  deleteItem: (itemId) => api.delete(`/api/admin/items/${itemId}`),
  getItemStats: () => api.get("/api/admin/items/stats"),
  approvePending: (itemId) => api.post(`/api/admin/items/${itemId}/approve`),
  rejectPending: (itemId) => api.post(`/api/admin/items/${itemId}/reject`),
};

/* =========================================================
   ADMIN DASHBOARD ENDPOINTS
   ========================================================= */

export const adminDashboard = {
  getStats: () => api.get("/api/admin/dashboard/stats"),
  getActivityChart: () => api.get("/api/admin/dashboard/activity"),
  getRecentActivity: () => api.get("/api/admin/dashboard/recent-activity"),
};

/* =========================================================
   ADMIN ANALYTICS ENDPOINTS
   ========================================================= */

export const adminAnalytics = {
  getUserAnalytics: () => api.get("/api/admin/analytics/users"),
  getBookAnalytics: () => api.get("/api/admin/analytics/books"),
  getItemAnalytics: () => api.get("/api/admin/analytics/items"),
  getTrendAnalytics: () => api.get("/api/admin/analytics/trends"),
};

/* =========================================================
   ADMIN NOTIFICATIONS ENDPOINTS
   ========================================================= */

export const adminNotifications = {
  getAll: (page = 1, limit = 20) =>
    api.get("/api/admin/notifications", { params: { page, limit } }),
  markAsRead: (notificationId) =>
    api.patch(`/api/admin/notifications/${notificationId}/read`),
  delete: (notificationId) =>
    api.delete(`/api/admin/notifications/${notificationId}`),
};

export default api;
