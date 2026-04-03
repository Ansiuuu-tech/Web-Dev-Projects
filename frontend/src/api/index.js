import axios from 'axios';
import toast from 'react-hot-toast';
const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

// ── Attach token ──────────────────────────
api.interceptors.request.use(config => {
  const token = localStorage.getItem('de_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auto refresh + error handling ─────────
api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('de_refresh_token');
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken: refresh });
          localStorage.setItem('de_access_token', data.data.accessToken);
          original.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return api(original);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      } else {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────
export const authAPI = {
  register:   (d) => api.post('/auth/register', d),
  login:      (d) => api.post('/auth/login', d),
  sendOTP:    (d) => api.post('/auth/send-otp', d),
  verifyOTP:  (d) => api.post('/auth/verify-otp', d),
  refresh:    (d) => api.post('/auth/refresh', d),
  getMe:      ()  => api.get('/auth/me'),
};

// ── Donations ─────────────────────────────
export const donationAPI = {
  create:          (d) => api.post('/donations', d),
  getAll:          (p) => api.get('/donations', { params: p }),
  getAllAdmin:      (p) => api.get('/donations/all', { params: p }),
  getOne:          (id) => api.get(`/donations/${id}`),
  updateStatus:    (id, d) => api.patch(`/donations/${id}/status`, d),
  reschedule:      (id, d) => api.patch(`/donations/${id}/reschedule`, d),
  cancel:          (id) => api.patch(`/donations/${id}/cancel`),
  communityImpact: ()  => api.get('/donations/community/impact'),
};

// ── Payments ──────────────────────────────
export const paymentAPI = {
  createOrder: (d) => api.post('/payments/create-order', d),
  verify:      (d) => api.post('/payments/verify', d),
  history:     ()  => api.get('/payments/history'),
};

// ── NGOs ──────────────────────────────────
export const ngoAPI = {
  getAll: (p) => api.get('/ngos', { params: p }),
  getOne: (id) => api.get(`/ngos/${id}`),
  create: (d)  => api.post('/ngos', d),
};

// ── Users ─────────────────────────────────
export const userAPI = {
  getProfile:    ()  => api.get('/users/profile'),
  updateProfile: (d) => api.patch('/users/profile', d),
  getImpact:     ()  => api.get('/users/impact'),
};

// ── Analytics ─────────────────────────────
export const analyticsAPI = {
  dashboard: () => api.get('/analytics/dashboard'),
  impact:    () => api.get('/analytics/impact'),
};

// ── Vehicles ──────────────────────────────
export const vehicleAPI = {
  getAll: () => api.get('/vehicles'),
};

// ── Notifications ─────────────────────────
export const notifAPI = {
  getAll:      () => api.get('/notifications'),
  markRead:    (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/mark-all-read'),
};

// ── Reports ───────────────────────────────
export const reportAPI = {
  create: (d) => api.post('/reports', d),
  getAll: ()  => api.get('/reports'),
};

// ── Tracking ──────────────────────────────
export const trackingAPI = {
  getByTrackingId: (id) => api.get(`/tracking/${id}`),
};

export default api;
