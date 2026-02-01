import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const APP_VERSION = '4.4.0'

const PROJECTS = [
  { id: 'eignamat', name: 'Eignamat', icon: 'Home', color: '#10b981', description: 'AI Property Valuation SaaS' },
  { id: 'takkarena', name: 'Takk Arena', icon: 'Trophy', color: '#f59e0b', description: 'Gamified Sales Tracking' },
  { id: 'betrithu', name: 'Betri Þú', icon: 'Headphones', color: '#a855f7', description: 'Hypnosis Recordings Store' },
  { id: 'kosningagatt', name: 'Kosningagátt', icon: 'Vote', color: '#ef4444', description: 'SMS Campaign Tool' },
  { id: 'arnar', name: 'Portfolio', icon: 'Globe', color: '#06b6d4', description: 'Personal Website' },
]

const HABITS = [
  { id: 'exercise', name: 'Exercise', nameIs: 'Hreyfing', icon: 'Dumbbell', target: 'Move for 15 min (gentle on back)', targetIs: 'Hreyfa sig í 15 mín (varlega á bakið)' },
  { id: 'clean', name: 'Clean', nameIs: 'Þrifa', icon: 'Sparkles', target: 'Tidy one area', targetIs: 'Þrífa eitt svæði' },
  { id: 'cook', name: 'Cook', nameIs: 'Elda', icon: 'ChefHat', target: 'Make a healthy meal', targetIs: 'Elda hollt mat' },
  { id: 'cocopuffs', name: 'Coco Puffs', nameIs: 'Coco Puffs', icon: 'Cat', target: 'Quality time with kitty', targetIs: 'Gæðatími með kettinum' },
]

const ACCENT_COLORS = {
  blue: '#3b82f6',
  purple: '#a855f7',
  cyan: '#06b6d4',
  green: '#22c55e',
  orange: '#f97316',
  pink: '#ec4899',
}

// Idea categories/tags
const IDEA_CATEGORIES = [
  { id: 'product', name: 'Product', nameIs: 'Vara', color: '#3b82f6' },
  { id: 'marketing', name: 'Marketing', nameIs: 'Markaðssetning', color: '#22c55e' },
  { id: 'tech', name: 'Tech', nameIs: 'Tækni', color: '#a855f7' },
  { id: 'content', name: 'Content', nameIs: 'Efni', color: '#f59e0b' },
  { id: 'personal', name: 'Personal', nameIs: 'Persónulegt', color: '#ec4899' },
]

// v3.0.0 - Task Tags
const DEFAULT_TAGS = [
  { id: 'urgent', name: 'Urgent', nameIs: 'Brýnt', color: 'red' },
  { id: 'bug', name: 'Bug', nameIs: 'Villa', color: 'orange' },
  { id: 'feature', name: 'Feature', nameIs: 'Eiginleiki', color: 'blue' },
  { id: 'design', name: 'Design', nameIs: 'Hönnun', color: 'purple' },
  { id: 'research', name: 'Research', nameIs: 'Rannsókn', color: 'cyan' },
  { id: 'content', name: 'Content', nameIs: 'Efni', color: 'amber' },
  { id: 'meeting', name: 'Meeting', nameIs: 'Fundur', color: 'green' },
  { id: 'blocked', name: 'Blocked', nameIs: 'Blokkað', color: 'slate' },
]

const useStore = create(
  persist(
    (set, get) => ({
      // App version
      appVersion: APP_VERSION,
      
      // Language - default to Icelandic
      language: 'is',
      setLanguage: (lang) => set({ language: lang }),
      
      // Projects
      projects: PROJECTS,
      addProject: (project) => set((state) => ({
        projects: [...state.projects, {
          id: Date.now().toString(),
          ...project
        }]
      })),
      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map(p => p.id === id ? { ...p, ...updates } : p)
      })),
      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter(p => p.id !== id),
        tasks: state.tasks.filter(t => t.projectId !== id)
      })),
      
      // Tasks - enhanced with due dates
      tasks: [],
      
      // Seed initial tasks from project analysis
      seedProjectTasks: () => {
        const state = get()
        if (state.tasks.length > 0) return // Don't seed if already has tasks
        
        const initialTasks = [
          // Eignamat tasks
          { id: '1', projectId: 'eignamat', title: 'Add renovation detection features to vision prompt', priority: 'high', createdAt: new Date().toISOString() },
          { id: '2', projectId: 'eignamat', title: 'Add positive features: recent_renovation, modern_kitchen, modern_bathroom', priority: 'high', createdAt: new Date().toISOString() },
          { id: '3', projectId: 'eignamat', title: 'Implement dynamic positive cap based on building age', priority: 'medium', createdAt: new Date().toISOString() },
          { id: '4', projectId: 'eignamat', title: 'Add location premium enhancement for postcodes 101, 107', priority: 'low', createdAt: new Date().toISOString() },
          { id: '5', projectId: 'eignamat', title: 'Re-test valuation accuracy with Hlíðargerði 17 and Mjóahlíð 12', priority: 'medium', createdAt: new Date().toISOString() },
          { id: '6', projectId: 'eignamat', title: 'Add user authentication system', priority: 'high', createdAt: new Date().toISOString() },
          { id: '7', projectId: 'eignamat', title: 'Build pricing/subscription page', priority: 'medium', createdAt: new Date().toISOString() },
          
          // Takk Arena tasks
          { id: '8', projectId: 'takkarena', title: 'Add push notifications for battle challenges', priority: 'medium', createdAt: new Date().toISOString() },
          { id: '9', projectId: 'takkarena', title: 'Implement team competitions (not just 1v1)', priority: 'medium', createdAt: new Date().toISOString() },
          { id: '10', projectId: 'takkarena', title: 'Add achievement badges system', priority: 'low', createdAt: new Date().toISOString() },
          { id: '11', projectId: 'takkarena', title: 'Improve AI Coach prompts for better advice', priority: 'low', createdAt: new Date().toISOString() },
          { id: '12', projectId: 'takkarena', title: 'Add offline mode support for PWA', priority: 'medium', createdAt: new Date().toISOString() },
          
          // Betri Þú tasks  
          { id: '13', projectId: 'betrithu', title: 'Build frontend storefront UI', priority: 'high', createdAt: new Date().toISOString() },
          { id: '14', projectId: 'betrithu', title: 'Integrate Swipe payment gateway', priority: 'high', createdAt: new Date().toISOString() },
          { id: '15', projectId: 'betrithu', title: 'Create audio player component with progress tracking', priority: 'high', createdAt: new Date().toISOString() },
          { id: '16', projectId: 'betrithu', title: 'Add user library/purchased recordings page', priority: 'medium', createdAt: new Date().toISOString() },
          { id: '17', projectId: 'betrithu', title: 'Record more hypnosis sessions (content)', priority: 'medium', createdAt: new Date().toISOString() },
          { id: '18', projectId: 'betrithu', title: 'Set up Swipe webhook for payment confirmations', priority: 'high', createdAt: new Date().toISOString() },
          
          // Kosningagátt tasks
          { id: '19', projectId: 'kosningagatt', title: 'Archive project - election is over', priority: 'low', createdAt: new Date().toISOString() },
          { id: '20', projectId: 'kosningagatt', title: 'Document learnings for future campaigns', priority: 'low', createdAt: new Date().toISOString() },
          
          // Portfolio tasks
          { id: '21', projectId: 'arnar', title: 'Add ArnarFlow to projects section', priority: 'medium', createdAt: new Date().toISOString() },
          { id: '22', projectId: 'arnar', title: 'Update project screenshots', priority: 'low', createdAt: new Date().toISOString() },
          { id: '23', projectId: 'arnar', title: 'Add blog section for dev journey', priority: 'low', createdAt: new Date().toISOString() },
          { id: '24', projectId: 'arnar', title: 'Improve mobile responsiveness', priority: 'medium', createdAt: new Date().toISOString() },
        ]
        
        set({ tasks: initialTasks.map(t => ({ ...t, completed: false, timeSpent: 0 })) })
      },
      addTask: (task) => set((state) => ({
        tasks: [...state.tasks, {
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          completed: false,
          dueDate: null,
          timeSpent: 0, // in minutes
          ...task
        }]
      })),
      toggleTask: (id) => set((state) => ({
        tasks: state.tasks.map(t => 
          t.id === id ? { 
            ...t, 
            completed: !t.completed, 
            completedAt: !t.completed ? new Date().toISOString() : null 
          } : t
        )
      })),
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter(t => t.id !== id)
      })),
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
      })),
      addTimeToTask: (id, minutes) => set((state) => ({
        tasks: state.tasks.map(t => 
          t.id === id ? { ...t, timeSpent: (t.timeSpent || 0) + minutes } : t
        )
      })),

      // v4.1.0 - Task Subtasks/Checklist
      addSubtask: (taskId, subtask) => set((state) => ({
        tasks: state.tasks.map(t => 
          t.id === taskId 
            ? { 
                ...t, 
                subtasks: [...(t.subtasks || []), { 
                  id: Date.now().toString(), 
                  title: subtask,
                  completed: false,
                  createdAt: new Date().toISOString()
                }] 
              }
            : t
        )
      })),
      toggleSubtask: (taskId, subtaskId) => set((state) => ({
        tasks: state.tasks.map(t => 
          t.id === taskId 
            ? { 
                ...t, 
                subtasks: (t.subtasks || []).map(s => 
                  s.id === subtaskId ? { ...s, completed: !s.completed } : s
                )
              }
            : t
        )
      })),
      deleteSubtask: (taskId, subtaskId) => set((state) => ({
        tasks: state.tasks.map(t => 
          t.id === taskId 
            ? { ...t, subtasks: (t.subtasks || []).filter(s => s.id !== subtaskId) }
            : t
        )
      })),
      reorderSubtasks: (taskId, subtaskIds) => set((state) => ({
        tasks: state.tasks.map(t => 
          t.id === taskId 
            ? { 
                ...t, 
                subtasks: subtaskIds.map(id => (t.subtasks || []).find(s => s.id === id)).filter(Boolean)
              }
            : t
        )
      })),

      // v3.0.0 - Task Tags
      tags: DEFAULT_TAGS,
      addTag: (tag) => set((state) => ({
        tags: [...state.tags, { id: Date.now().toString(), ...tag }]
      })),
      updateTag: (id, updates) => set((state) => ({
        tags: state.tags.map(t => t.id === id ? { ...t, ...updates } : t)
      })),
      deleteTag: (id) => set((state) => ({
        tags: state.tags.filter(t => t.id !== id)
      })),
      addTagToTask: (taskId, tagId) => set((state) => ({
        tasks: state.tasks.map(t => 
          t.id === taskId 
            ? { ...t, tags: [...(t.tags || []), tagId].filter((v, i, a) => a.indexOf(v) === i) }
            : t
        )
      })),
      removeTagFromTask: (taskId, tagId) => set((state) => ({
        tasks: state.tasks.map(t => 
          t.id === taskId 
            ? { ...t, tags: (t.tags || []).filter(id => id !== tagId) }
            : t
        )
      })),

      // Ideas Inbox - enhanced with categories and tags
      ideas: [],
      ideaCategories: IDEA_CATEGORIES,
      addIdea: (idea) => set((state) => ({
        ideas: [...state.ideas, {
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          status: 'inbox',
          tags: [],
          category: null,
          projectId: null,
          ...idea
        }]
      })),
      updateIdea: (id, updates) => set((state) => ({
        ideas: state.ideas.map(i => i.id === id ? { ...i, ...updates } : i)
      })),
      deleteIdea: (id) => set((state) => ({
        ideas: state.ideas.filter(i => i.id !== id)
      })),
      addTagToIdea: (id, tag) => set((state) => ({
        ideas: state.ideas.map(i => 
          i.id === id 
            ? { ...i, tags: [...new Set([...(i.tags || []), tag])] }
            : i
        )
      })),
      removeTagFromIdea: (id, tag) => set((state) => ({
        ideas: state.ideas.map(i => 
          i.id === id 
            ? { ...i, tags: (i.tags || []).filter(t => t !== tag) }
            : i
        )
      })),

      // Habits - enhanced with streak tracking
      habits: HABITS,
      habitLogs: {},
      habitStreaks: {}, // { habitId: { current: number, longest: number } }
      toggleHabit: (habitId, date) => set((state) => {
        const key = `${habitId}-${date}`
        const newLogs = { ...state.habitLogs }
        const wasCompleted = newLogs[key]
        newLogs[key] = !wasCompleted
        
        // Recalculate streak for this habit
        const newStreaks = { ...state.habitStreaks }
        const streak = calculateStreak(habitId, newLogs)
        newStreaks[habitId] = streak
        
        return { habitLogs: newLogs, habitStreaks: newStreaks }
      }),
      getHabitStreak: (habitId) => {
        const state = get()
        return state.habitStreaks[habitId] || { current: 0, longest: 0 }
      },
      recalculateAllStreaks: () => set((state) => {
        const newStreaks = {}
        state.habits.forEach(habit => {
          newStreaks[habit.id] = calculateStreak(habit.id, state.habitLogs)
        })
        return { habitStreaks: newStreaks }
      }),

      // Recurring Tasks
      recurringTasks: [],
      addRecurringTask: (task) => set((state) => ({
        recurringTasks: [...state.recurringTasks, {
          id: Date.now().toString(),
          ...task
        }]
      })),
      updateRecurringTask: (id, updates) => set((state) => ({
        recurringTasks: state.recurringTasks.map(t => 
          t.id === id ? { ...t, ...updates } : t
        )
      })),
      deleteRecurringTask: (id) => set((state) => ({
        recurringTasks: state.recurringTasks.filter(t => t.id !== id)
      })),
      toggleRecurringTask: (id) => set((state) => ({
        recurringTasks: state.recurringTasks.map(t =>
          t.id === id ? { ...t, enabled: !t.enabled } : t
        )
      })),

      // Notes / Journal
      notes: {},
      addNote: (date, content) => set((state) => ({
        notes: {
          ...state.notes,
          [date]: {
            content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        }
      })),
      updateNote: (date, content) => set((state) => ({
        notes: {
          ...state.notes,
          [date]: {
            ...state.notes[date],
            content,
            updatedAt: new Date().toISOString(),
          }
        }
      })),
      deleteNote: (date) => set((state) => {
        const newNotes = { ...state.notes }
        delete newNotes[date]
        return { notes: newNotes }
      }),

      // Focus Timer - enhanced
      focusProject: null,
      focusTask: null,
      focusStartTime: null,
      focusElapsed: 0, // seconds
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
          // Add time spent to task (convert to minutes)
          const minutes = Math.floor(state.focusElapsed / 60)
          get().addTimeToTask(state.focusTask, minutes)
        }
        set({ 
          focusProject: null, 
          focusTask: null, 
          focusStartTime: null, 
          focusElapsed: 0 
        })
      },

      // Filters
      filters: {
        project: null,
        priority: null,
        showCompleted: false,
        search: '',
      },
      setFilter: (key, value) => set((state) => ({
        filters: { ...state.filters, [key]: value }
      })),
      clearFilters: () => set({
        filters: { project: null, priority: null, showCompleted: false, search: '' }
      }),

      // View state
      activeView: 'dashboard',
      setActiveView: (view) => set({ activeView: view }),
      selectedProject: null,
      setSelectedProject: (id) => set({ selectedProject: id }),

      // Command palette
      commandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

      // Quick add modal
      quickAddOpen: false,
      setQuickAddOpen: (open) => set({ quickAddOpen: open }),
      
      // Quick idea capture mode
      quickIdeaMode: false,
      setQuickIdeaMode: (mode) => set({ quickIdeaMode: mode }),

      // v3.0.0 - Quick Capture Bar
      quickCaptureExpanded: false,
      setQuickCaptureExpanded: (expanded) => set({ quickCaptureExpanded: expanded }),

      // Settings modal
      settingsOpen: false,
      setSettingsOpen: (open) => set({ settingsOpen: open }),

      // Add Project modal
      addProjectOpen: false,
      setAddProjectOpen: (open) => set({ addProjectOpen: open }),

      // Keyboard shortcuts modal
      keyboardShortcutsOpen: false,
      setKeyboardShortcutsOpen: (open) => set({ keyboardShortcutsOpen: open }),

      // About modal
      aboutOpen: false,
      setAboutOpen: (open) => set({ aboutOpen: open }),

      // What's New modal
      whatsNewOpen: false,
      setWhatsNewOpen: (open) => set({ whatsNewOpen: open }),
      
      // Recurring Tasks Modal
      recurringOpen: false,
      setRecurringOpen: (open) => set({ recurringOpen: open }),
      
      // Onboarding
      onboardingComplete: false,
      onboardingOpen: false,
      setOnboardingComplete: (complete) => set({ onboardingComplete: complete }),
      setOnboardingOpen: (open) => set({ onboardingOpen: open }),
      shouldShowOnboarding: () => !get().onboardingComplete,
      lastSeenVersion: null,
      markWhatsNewSeen: (version) => set({ lastSeenVersion: version }),
      shouldShowWhatsNew: () => {
        const state = get()
        return state.lastSeenVersion !== APP_VERSION
      },

      // Theme settings
      theme: 'dark', // 'dark' | 'light' | 'system'
      setTheme: (theme) => set({ theme }),
      
      // Accent color
      accentColor: 'blue',
      setAccentColor: (color) => set({ accentColor: color }),
      getAccentColorValue: () => ACCENT_COLORS[get().accentColor] || ACCENT_COLORS.blue,

      // Notifications
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
        quickAdd: 'Ctrl+K',
        commandPalette: 'Ctrl+P',
        settings: 'Ctrl+,',
        help: '?',
        dashboard: 'G D',
        ideas: 'G I',
        habits: 'G H',
      },

      // v3.0.0 - Daily Goals
      dailyGoals: {
        tasks: 5,
        habits: 4,
        focusMinutes: 90,
        pomodoroSessions: 4,
      },
      setDailyGoals: (goals) => set((state) => ({
        dailyGoals: { ...state.dailyGoals, ...goals }
      })),

      // v3.0.0 - Pomodoro Timer
      pomodoroOpen: false,
      setPomodoroOpen: (open) => set({ pomodoroOpen: open }),
      pomodoroSettings: {
        preset: 'pomodoro',
        customWork: 25,
        customBreak: 5,
        customLongBreak: 15,
        sessionsBeforeLong: 4,
        soundEnabled: true,
        autoStartBreaks: false,
        autoStartPomodoros: false,
      },
      setPomodoroSettings: (settings) => set((state) => ({
        pomodoroSettings: { ...state.pomodoroSettings, ...settings }
      })),
      pomodoroSessions: [],
      addPomodoroSession: (session) => set((state) => ({
        pomodoroSessions: [...state.pomodoroSessions, {
          id: Date.now().toString(),
          ...session
        }]
      })),
      getPomodoroStats: () => {
        const sessions = get().pomodoroSessions
        const today = new Date().toISOString().split('T')[0]
        const todaySessions = sessions.filter(s => s.completedAt?.startsWith(today))
        const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0)
        const todayMinutes = todaySessions.reduce((sum, s) => sum + (s.duration || 0), 0)
        return {
          totalSessions: sessions.length,
          todaySessions: todaySessions.length,
          totalMinutes,
          todayMinutes,
          totalHours: Math.round(totalMinutes / 60 * 10) / 10,
        }
      },
    }),
    {
      name: 'arnarflow-storage',
    }
  )
)

// Helper function to calculate streak
function calculateStreak(habitId, habitLogs) {
  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0
  
  // Get all dates with logs for this habit
  const dates = Object.keys(habitLogs)
    .filter(key => key.startsWith(`${habitId}-`) && habitLogs[key])
    .map(key => key.replace(`${habitId}-`, ''))
    .sort()
    .reverse()
  
  // Calculate current streak (consecutive days from today)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today)
    checkDate.setDate(checkDate.getDate() - i)
    const dateStr = checkDate.toISOString().split('T')[0]
    
    if (habitLogs[`${habitId}-${dateStr}`]) {
      currentStreak++
    } else {
      break
    }
  }
  
  // Calculate longest streak
  for (const dateStr of dates) {
    const prevDate = new Date(dateStr)
    prevDate.setDate(prevDate.getDate() - 1)
    const prevDateStr = prevDate.toISOString().split('T')[0]
    
    if (habitLogs[`${habitId}-${prevDateStr}`]) {
      tempStreak++
    } else {
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak
      }
      tempStreak = 1
    }
  }
  
  // Final check for longest
  if (tempStreak > longestStreak) {
    longestStreak = tempStreak
  }
  
  // Current streak should count in longest
  if (currentStreak > longestStreak) {
    longestStreak = currentStreak
  }
  
  return { current: currentStreak, longest: longestStreak }
}

export { APP_VERSION, ACCENT_COLORS, IDEA_CATEGORIES, DEFAULT_TAGS }
export default useStore
