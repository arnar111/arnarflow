// Calendar sync slice

export const createCalendarSlice = (set, get) => ({
  calendarSyncEnabled: false,
  googleCalendarConnected: false,
  appleCalendarEnabled: false,
  calendarEvents: [],
  lastCalendarSync: null,

  setCalendarSyncEnabled: (enabled) => set({ calendarSyncEnabled: enabled }),
  setGoogleCalendarConnected: (connected) => set({ googleCalendarConnected: connected }),
  setAppleCalendarEnabled: (enabled) => set({ appleCalendarEnabled: enabled }),
  setCalendarEvents: (events) => set({ calendarEvents: events, lastCalendarSync: new Date().toISOString() }),
  addCalendarEvent: (event) => set((state) => ({ calendarEvents: [...state.calendarEvents, event] })),

  // Notes / Journal
  notes: {},
  addNote: (date, content) => set((state) => ({
    notes: { ...state.notes, [date]: { content, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } }
  })),
  updateNote: (date, content) => set((state) => ({
    notes: { ...state.notes, [date]: { ...state.notes[date], content, updatedAt: new Date().toISOString() } }
  })),
  deleteNote: (date) => set((state) => {
    const newNotes = { ...state.notes }
    delete newNotes[date]
    return { notes: newNotes }
  }),

  // Dashboard layout
  dashboardLayout: [
    { id: 'quick-stats', x: 0, y: 0, w: 6, h: 1 },
    { id: 'today-tasks', x: 6, y: 0, w: 3, h: 2 },
    { id: 'focus-timer', x: 9, y: 0, w: 3, h: 2 },
    { id: 'activity-chart', x: 0, y: 1, w: 6, h: 2 },
    { id: 'habits-mini', x: 0, y: 3, w: 3, h: 1 },
    { id: 'streak-card', x: 3, y: 3, w: 3, h: 1 },
    { id: 'projects', x: 6, y: 2, w: 6, h: 2 },
  ],
  updateDashboardLayout: (layout) => set({ dashboardLayout: layout }),
  resetDashboardLayout: () => set({
    dashboardLayout: [
      { id: 'quick-stats', x: 0, y: 0, w: 6, h: 1 },
      { id: 'today-tasks', x: 6, y: 0, w: 3, h: 2 },
      { id: 'focus-timer', x: 9, y: 0, w: 3, h: 2 },
      { id: 'activity-chart', x: 0, y: 1, w: 6, h: 2 },
      { id: 'habits-mini', x: 0, y: 3, w: 3, h: 1 },
      { id: 'streak-card', x: 3, y: 3, w: 3, h: 1 },
      { id: 'projects', x: 6, y: 2, w: 6, h: 2 },
    ]
  }),
})
