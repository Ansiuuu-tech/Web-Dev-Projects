import { create } from 'zustand';
import { io } from 'socket.io-client';
import { authAPI } from '../api';

let socket = null;

export const useAuthStore = create((set, get) => ({
  user:    null,
  token:   localStorage.getItem('de_access_token'),
  loading: false,
  socket:  null,

  // ── Initialize ─────────────────────────
  init: async () => {
    const token = localStorage.getItem('de_access_token');
    if (!token) return;
    try {
      const { data } = await authAPI.getMe();
      set({ user: data.data.user });
      get().connectSocket(token);
    } catch {
      localStorage.removeItem('de_access_token');
      localStorage.removeItem('de_refresh_token');
    }
  },

  // ── Login / Register ───────────────────
  login: async (email, password) => {
    set({ loading: true });
    try {
      const { data } = await authAPI.login({ email, password });
      const { user, tokens } = data.data;
      localStorage.setItem('de_access_token',  tokens.access);
      localStorage.setItem('de_refresh_token', tokens.refresh);
      set({ user, token: tokens.access, loading: false });
      get().connectSocket(tokens.access);
      return { success: true, user };
    } catch (err) {
      set({ loading: false });
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    }
  },

  register: async (name, email, password, role = 'donor') => {
    set({ loading: true });
    try {
      const { data } = await authAPI.register({ name, email, password, role });
      const { user, tokens } = data.data;
      localStorage.setItem('de_access_token',  tokens.access);
      localStorage.setItem('de_refresh_token', tokens.refresh);
      set({ user, token: tokens.access, loading: false });
      get().connectSocket(tokens.access);
      return { success: true, user };
    } catch (err) {
      set({ loading: false });
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    }
  },

  // ── OTP login ─────────────────────────
  sendOTP: async (phone) => {
    try {
      const { data } = await authAPI.sendOTP({ phone });
      return { success: true, devOtp: data._dev_otp };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to send OTP' };
    }
  },

  verifyOTP: async (phone, otp) => {
    set({ loading: true });
    try {
      const { data } = await authAPI.verifyOTP({ phone, otp });
      const { user, tokens } = data.data;
      localStorage.setItem('de_access_token',  tokens.access);
      localStorage.setItem('de_refresh_token', tokens.refresh);
      set({ user, token: tokens.access, loading: false });
      get().connectSocket(tokens.access);
      return { success: true, user };
    } catch (err) {
      set({ loading: false });
      return { success: false, message: err.response?.data?.message || 'Invalid OTP' };
    }
  },

  // ── Logout ────────────────────────────
  logout: () => {
    localStorage.clear();
    if (socket) socket.disconnect();
    set({ user: null, token: null, socket: null });
  },

  // ── Socket ────────────────────────────
  connectSocket: (token) => {
    if (socket?.connected) return;
    socket = io(window.location.origin, {
      auth: { token },
      transports: ['websocket']
    });
    socket.on('connect', () => console.log('🔌 Socket connected'));
    socket.on('disconnect', () => console.log('🔌 Socket disconnected'));
    set({ socket });
  },

  updateUser: (user) => set({ user }),
}));

// ── Notification store ─────────────────────
export const useNotifStore = create((set, get) => ({
  notifications: [],
  unread: 0,
  setNotifications: (notifications, unread) => set({ notifications, unread }),
  addNotification:  (n) => set(s => ({ notifications: [n, ...s.notifications], unread: s.unread + 1 })),
  markRead:         (id) => set(s => ({
    notifications: s.notifications.map(n => n._id === id ? { ...n, isRead: true } : n),
    unread: Math.max(0, s.unread - 1)
  })),
  markAllRead: () => set(s => ({
    notifications: s.notifications.map(n => ({ ...n, isRead: true })),
    unread: 0
  })),
}));
