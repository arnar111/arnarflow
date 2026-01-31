import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const APP_VERSION = '1.9.0'

const PROJECTS = [
  { id: 'eignamat', name: 'Eignamat', icon: 'Home', color: '#10b981', description: 'AI Property Valuation SaaS' },
  { id: 'takkarena', name: 'Takk Arena', icon: 'Trophy', color: '#f59e0b', description: 'Gamified Sales Tracking' },
  { id: 'betrithu', name: 'Betri Þú', icon: 'Headphones', color: '#a855f7', description: 'Hypnosis Recordings Store' },
  { id: 'kosningagatt', name: 'Kosningagátt', icon: 'Vote', color: '#ef4444', description: 'SMS Campaign Tool' },
  { id: 'arnar', name: 'Portfolio', icon: 'Globe', color: '#06b6d4', description: 'Personal Website' },
]

const HABITS = [
  { id: 'exercise', name: 'Exercise', icon: 'Dumbbell', target: 'Move for 15 min (gentle on back)' },
  { id: 'clean', name: 'Clean', icon: 'Sparkles', target: 'Tidy one area' },
  { id: 'cook', name: 'Cook', icon: 'ChefHat', target: 'Make a healthy meal' },
  { id: 'cocopuffs', name: 'Coco Puffs', icon: 'Cat', target: 'Quality time with kitty' },
]

const ACCENT_COLORS = {
  blue: '#3b82f6',
  purple: '#a855f7',
  cyan: '#06b6d4',
  green: '#22c55e',
  orange: '#f97316',
  pink: '#ec4899',
}

const useStore = create(
  persist(
    (set, get) => ({
      // App version
      appVersion: APP_VERSION,
      
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

      // Ideas Inbox
      ideas: [],
      addIdea: (idea) => set((state) => ({
        ideas: [...state.ideas, {
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          status: 'inbox',
          ...idea
        }]
      })),
      updateIdea: (id, updates) => set((state) => ({
        ideas: state.ideas.map(i => i.id === id ? { ...i, ...updates } : i)
      })),
      deleteIdea: (id) => set((state) => ({
        ideas: state.ideas.filter(i => i.id !== id)
      })),

      // Habits
      habits: HABITS,
      habitLogs: {},
      toggleHabit: (habitId, date) => set((state) => {
        const key = `${habitId}-${date}`
        const newLogs = { ...state.habitLogs }
        newLogs[key] = !newLogs[key]
        return { habitLogs: newLogs }
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
    }),
    {
      name: 'arnarflow-storage',
    }
  )
)

export { APP_VERSION, ACCENT_COLORS }
export default useStore
