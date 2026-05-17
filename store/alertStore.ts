import { create } from 'zustand';
import { Alert, AlertType } from '../types';
import { alertsAPI } from '../services/api';

interface AlertState {
  alerts: Alert[];
  unreadCount: number;
  filter: AlertType | 'ALL';
  
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  setFilter: (filter: AlertType | 'ALL') => void;
  clearStore: () => void;
  fetchAlerts: () => Promise<void>;
  getFilteredAlerts: () => Alert[];
}

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: [],
  unreadCount: 0,
  filter: 'ALL',
  
  setAlerts: (alerts) => set({
    alerts,
    unreadCount: alerts.filter((a) => !a.read).length,
  }),
  
  addAlert: (alert) => set((state) => ({
    alerts: [alert, ...state.alerts],
    unreadCount: state.unreadCount + (alert.read ? 0 : 1),
  })),
  
  markAsRead: async (id) => {
    try {
      await alertsAPI.markAsRead(id);
      set((state) => {
        const alerts = state.alerts.map((a) =>
          (a._id || a.id) === id ? { ...a, read: true } : a
        );
        return {
          alerts,
          unreadCount: alerts.filter((a) => !a.read).length,
        };
      });
    } catch (error) {
      console.error('Mark alert as read error:', error);
    }
  },
  
  markAllAsRead: () => set((state) => ({
    alerts: state.alerts.map((a) => ({ ...a, read: true })),
    unreadCount: 0,
  })),
  
  setFilter: (filter) => set({ filter }),

  fetchAlerts: async () => {
    try {
      const response = await alertsAPI.getAll();
      set({
        alerts: response.data,
        unreadCount: response.data.filter((a: any) => !a.read).length,
      });
    } catch (error) {
      console.error('Fetch alerts error:', error);
    }
  },
  
  getFilteredAlerts: () => {
    const { alerts, filter } = get();
    if (filter === 'ALL') return alerts;
    return alerts.filter((a) => a.type === filter);
  },

  clearStore: () => set({ alerts: [], unreadCount: 0, filter: 'ALL' }),
}));
