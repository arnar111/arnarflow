// Time tracking slice - sessions, stats, pomodoro

export const createTimeSlice = (set, get) => ({
  // Active time tracking session
  activeTimeSession: null,
  timeSessions: [],

  startTimeTracking: (taskId, projectId, description = '') => set({
    activeTimeSession: { taskId, projectId, startTime: Date.now(), description }
  }),

  stopTimeTracking: () => {
    const state = get()
    if (!state.activeTimeSession) return
    const { taskId, projectId, startTime, description } = state.activeTimeSession
    const endTime = Date.now()
    const duration = Math.floor((endTime - startTime) / 1000)
    if (duration < 10) {
      set({ activeTimeSession: null })
      return
    }
    const session = {
      id: Date.now().toString(),
      taskId, projectId, startTime, endTime, duration, description,
      billable: false,
      createdAt: new Date().toISOString()
    }
    if (taskId) {
      const minutes = Math.floor(duration / 60)
      if (minutes > 0) get().addTimeToTask(taskId, minutes)
    }
    set((state) => ({
      activeTimeSession: null,
      timeSessions: [...state.timeSessions, session]
    }))
  },

  updateActiveSessionDescription: (description) => set((state) => ({
    activeTimeSession: state.activeTimeSession
      ? { ...state.activeTimeSession, description }
      : null
  })),

  toggleSessionBillable: (sessionId) => set((state) => ({
    timeSessions: state.timeSessions.map(s =>
      s.id === sessionId ? { ...s, billable: !s.billable } : s
    )
  })),

  deleteTimeSession: (sessionId) => set((state) => ({
    timeSessions: state.timeSessions.filter(s => s.id !== sessionId)
  })),

  getTimeStats: () => {
    const state = get()
    const sessions = state.timeSessions
    const today = new Date().toISOString().split('T')[0]
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const todaySessions = sessions.filter(s => new Date(s.startTime).toISOString().split('T')[0] === today)
    const weekSessions = sessions.filter(s => new Date(s.startTime).toISOString().split('T')[0] >= weekAgo)
    const totalSeconds = sessions.reduce((sum, s) => sum + s.duration, 0)
    const todaySeconds = todaySessions.reduce((sum, s) => sum + s.duration, 0)
    const weekSeconds = weekSessions.reduce((sum, s) => sum + s.duration, 0)
    const billableSeconds = sessions.filter(s => s.billable).reduce((sum, s) => sum + s.duration, 0)
    const byProject = {}
    sessions.forEach(s => {
      if (!byProject[s.projectId]) byProject[s.projectId] = 0
      byProject[s.projectId] += s.duration
    })
    return {
      totalSessions: sessions.length, totalSeconds,
      totalHours: Math.round(totalSeconds / 3600 * 10) / 10,
      todaySeconds, todayHours: Math.round(todaySeconds / 3600 * 10) / 10,
      weekSeconds, weekHours: Math.round(weekSeconds / 3600 * 10) / 10,
      billableSeconds, billableHours: Math.round(billableSeconds / 3600 * 10) / 10,
      byProject
    }
  },

  getWeeklyTimeReport: () => {
    const state = get()
    const sessions = state.timeSessions
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      const daySessions = sessions.filter(s =>
        new Date(s.startTime).toISOString().split('T')[0] === dateStr
      )
      const totalSeconds = daySessions.reduce((sum, s) => sum + s.duration, 0)
      days.push({
        date: dateStr,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        sessions: daySessions.length,
        seconds: totalSeconds,
        hours: Math.round(totalSeconds / 3600 * 10) / 10
      })
    }
    return days
  },

  // Focus Queue (ADHD-friendly task queue)
  focusQueueIds: [],
  setFocusQueueIds: (ids) => set({ focusQueueIds: ids }),
  focusQueueEstimates: {},
  setFocusQueueEstimate: (taskId, minutes) => set((state) => ({
    focusQueueEstimates: { ...state.focusQueueEstimates, [taskId]: minutes }
  })),

  // Focus Timer
  focusProject: null,
  focusTask: null,
  focusStartTime: null,
  focusElapsed: 0,
  setFocusProject: (projectId) => set({
    focusProject: projectId,
    focusStartTime: projectId ? Date.now() : null,
    focusElapsed: 0
  }),
  setFocusTask: (taskId) => set({ focusTask: taskId }),
  updateFocusElapsed: () => set((state) => {
    if (!state.focusStartTime) return {}
    return { focusElapsed: Math.floor((Date.now() - state.focusStartTime) / 1000) }
  }),
  endFocus: () => {
    const state = get()
    if (state.focusTask && state.focusElapsed > 60) {
      const minutes = Math.floor(state.focusElapsed / 60)
      get().addTimeToTask(state.focusTask, minutes)
    }
    set({ focusProject: null, focusTask: null, focusStartTime: null, focusElapsed: 0 })
  },

  // Pomodoro
  pomodoroOpen: false,
  setPomodoroOpen: (open) => set({ pomodoroOpen: open }),
  pomodoroSettings: {
    preset: 'pomodoro', customWork: 25, customBreak: 5, customLongBreak: 15,
    sessionsBeforeLong: 4, soundEnabled: true, autoStartBreaks: false, autoStartPomodoros: false,
  },
  setPomodoroSettings: (settings) => set((state) => ({
    pomodoroSettings: { ...state.pomodoroSettings, ...settings }
  })),
  pomodoroSessions: [],
  addPomodoroSession: (session) => set((state) => ({
    pomodoroSessions: [...state.pomodoroSessions, { id: Date.now().toString(), ...session }]
  })),
  getPomodoroStats: () => {
    const sessions = get().pomodoroSessions
    const today = new Date().toISOString().split('T')[0]
    const todaySessions = sessions.filter(s => s.completedAt?.startsWith(today))
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0)
    const todayMinutes = todaySessions.reduce((sum, s) => sum + (s.duration || 0), 0)
    return {
      totalSessions: sessions.length, todaySessions: todaySessions.length,
      totalMinutes, todayMinutes, totalHours: Math.round(totalMinutes / 60 * 10) / 10,
    }
  },
})
