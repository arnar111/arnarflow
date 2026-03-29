// Notifications slice

export const createNotificationSlice = (set, get) => ({
  notifications: [],
  unreadNotificationCount: 0,

  notificationPreferences: {
    dueSoon: true, overdue: true, streakAtRisk: true,
    dailyBriefing: false, quietHoursStart: 23, quietHoursEnd: 8,
  },

  addNotification: (notification) => set((state) => ({
    notifications: [
      { id: Date.now().toString(), createdAt: new Date().toISOString(), read: false, ...notification },
      ...state.notifications
    ].slice(0, 100),
    unreadNotificationCount: state.unreadNotificationCount + 1
  })),

  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n),
    unreadNotificationCount: Math.max(0, state.unreadNotificationCount - 1)
  })),

  markAllNotificationsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true })),
    unreadNotificationCount: 0
  })),

  deleteNotification: (id) => set((state) => {
    const notification = state.notifications.find(n => n.id === id)
    return {
      notifications: state.notifications.filter(n => n.id !== id),
      unreadNotificationCount: notification && !notification.read
        ? Math.max(0, state.unreadNotificationCount - 1)
        : state.unreadNotificationCount
    }
  }),

  clearAllNotifications: () => set({ notifications: [], unreadNotificationCount: 0 }),

  setNotificationPreference: (key, value) => set((state) => ({
    notificationPreferences: { ...state.notificationPreferences, [key]: value }
  })),

  isQuietHours: () => {
    const state = get()
    const { quietHoursStart, quietHoursEnd } = state.notificationPreferences
    const hour = new Date().getHours()
    if (quietHoursStart > quietHoursEnd) {
      return hour >= quietHoursStart || hour < quietHoursEnd
    }
    return hour >= quietHoursStart && hour < quietHoursEnd
  },
})
