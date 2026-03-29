// UI state slice - views, modals, filters, theme, settings

const ACCENT_COLORS = {
  blue: '#3b82f6',
  purple: '#a855f7',
  indigo: '#6366f1',
  cyan: '#06b6d4',
  green: '#22c55e',
  orange: '#f97316',
  pink: '#ec4899',
}

export { ACCENT_COLORS }

export const createUiSlice = (set, get) => ({
  // Language
  language: 'is',
  setLanguage: (lang) => set({ language: lang }),

  // Filters
  filters: {
    project: null, priority: null, showCompleted: false, search: '', showBlocked: true,
  },
  setFilter: (key, value) => set((state) => ({
    filters: { ...state.filters, [key]: value }
  })),
  clearFilters: () => set({
    filters: { project: null, priority: null, showCompleted: false, search: '', showBlocked: true }
  }),

  // View state
  activeView: 'dashboard',
  setActiveView: (view) => set({ activeView: view }),
  selectedProject: null,
  setSelectedProject: (id) => set({ selectedProject: id }),

  // Modals
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  quickAddOpen: false,
  setQuickAddOpen: (open) => set({ quickAddOpen: open }),
  quickIdeaMode: false,
  setQuickIdeaMode: (mode) => set({ quickIdeaMode: mode }),
  quickCaptureExpanded: false,
  setQuickCaptureExpanded: (expanded) => set({ quickCaptureExpanded: expanded }),
  settingsOpen: false,
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  addProjectOpen: false,
  addProjectDefaultStatus: null,
  setAddProjectOpen: (open) => set({ addProjectOpen: open }),
  setAddProjectDefaultStatus: (status) => set({ addProjectDefaultStatus: status }),
  keyboardShortcutsOpen: false,
  setKeyboardShortcutsOpen: (open) => set({ keyboardShortcutsOpen: open }),
  aboutOpen: false,
  setAboutOpen: (open) => set({ aboutOpen: open }),
  whatsNewOpen: false,
  setWhatsNewOpen: (open) => set({ whatsNewOpen: open }),
  recurringOpen: false,
  setRecurringOpen: (open) => set({ recurringOpen: open }),
  templatesOpen: false,
  setTemplatesOpen: (open) => set({ templatesOpen: open }),
  notificationsPanelOpen: false,
  setNotificationsPanelOpen: (open) => set({ notificationsPanelOpen: open }),
  timeTrackerOpen: false,
  setTimeTrackerOpen: (open) => set({ timeTrackerOpen: open }),
  roadmapViewOpen: false,
  setRoadmapViewOpen: (open) => set({ roadmapViewOpen: open }),
  roadmapZoom: 'month',
  setRoadmapZoom: (zoom) => set({ roadmapZoom: zoom }),

  // Onboarding
  onboardingComplete: false,
  onboardingOpen: false,
  setOnboardingComplete: (complete) => set({ onboardingComplete: complete }),
  setOnboardingOpen: (open) => set({ onboardingOpen: open }),
  shouldShowOnboarding: () => !get().onboardingComplete,
  lastSeenVersion: null,
  markWhatsNewSeen: (version) => set({ lastSeenVersion: version }),
  shouldShowWhatsNew: () => get().lastSeenVersion !== get().appVersion,

  // Theme
  theme: 'dark',
  setTheme: (theme) => set({ theme }),
  accentColor: 'indigo',
  setAccentColor: (color) => set({ accentColor: color }),
  getAccentColorValue: () => ACCENT_COLORS[get().accentColor] || ACCENT_COLORS.indigo,

  // Notifications toggle
  notificationsEnabled: true,
  setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
  habitRemindersEnabled: true,
  setHabitRemindersEnabled: (enabled) => set({ habitRemindersEnabled: enabled }),
  taskRemindersEnabled: true,
  setTaskRemindersEnabled: (enabled) => set({ taskRemindersEnabled: enabled }),
  lastNotificationCheck: null,
  setLastNotificationCheck: (time) => set({ lastNotificationCheck: time }),

  // Keyboard shortcuts
  shortcuts: {
    quickAdd: 'Ctrl+K', commandPalette: 'Ctrl+P', settings: 'Ctrl+,',
    help: '?', dashboard: 'G D', ideas: 'G I', habits: 'G H',
    timeTracker: 'Ctrl+T', roadmap: 'G R',
  },

  // Daily Goals
  dailyGoals: { tasks: 5, habits: 4, focusMinutes: 90, pomodoroSessions: 4 },
  setDailyGoals: (goals) => set((state) => ({
    dailyGoals: { ...state.dailyGoals, ...goals }
  })),
})
