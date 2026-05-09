import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 120000,
});

// Attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  logout: () => api.post('/auth/logout'),
};

// ── Videos ────────────────────────────────────────────
export const videoAPI = {
  analyze: (data) => api.post('/videos/analyze', data),
  getHistory: (params) => api.get('/videos/history', { params }),
  getVideo: (id) => api.get(`/videos/${id}`),
  toggleFavorite: (id) => api.put(`/videos/${id}/favorite`),
  updateNotes: (id, notes) => api.put(`/videos/${id}/notes`, { notes }),
  deleteVideo: (id) => api.delete(`/videos/${id}`),
  getStats: () => api.get('/videos/stats'),
  chatVideo: (id, message, history) => api.post(`/videos/${id}/chat`, { message, history }),
};

export default api;
