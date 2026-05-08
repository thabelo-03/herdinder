/**
 * HerdFinder Alert Store (Zustand)
 */

import { create } from 'zustand';
import { Alert, AlertType } from '../types';
import { mockAlerts } from '../data/mockData';

interface AlertState {
  alerts: Alert[];
  unreadCount: number;
  filter: AlertType | 'ALL';
  
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  setFilter: (filter: AlertType | 'ALL') => void;
  getFilteredAlerts: () => Alert[];
}

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: mockAlerts,
  unreadCount: mockAlerts.filter((a) => !a.read).length,
  filter: 'ALL',
  
  setAlerts: (alerts) => set({
    alerts,
    unreadCount: alerts.filter((a) => !a.read).length,
  }),
  
  addAlert: (alert) => set((state) => ({
    alerts: [alert, ...state.alerts],
    unreadCount: state.unreadCount + (alert.read ? 0 : 1),
  })),
  
  markAsRead: (id) => set((state) => {
    const alerts = state.alerts.map((a) =>
      a.id === id ? { ...a, read: true } : a
    );
    return {
      alerts,
      unreadCount: alerts.filter((a) => !a.read).length,
    };
  }),
  
  markAllAsRead: () => set((state) => ({
    alerts: state.alerts.map((a) => ({ ...a, read: true })),
    unreadCount: 0,
  })),
  
  setFilter: (filter) => set({ filter }),
  
  getFilteredAlerts: () => {
    const { alerts, filter } = get();
    if (filter === 'ALL') return alerts;
    return alerts.filter((a) => a.type === filter);
  },
}));
