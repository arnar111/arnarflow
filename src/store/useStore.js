import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

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

const useStore = create(
  persist(
    (set, get) => ({
      // Projects
      projects: PROJECTS,
      
      // Tasks - enhanced with due dates
      tasks: [],
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

      // Keyboard shortcuts
      shortcuts: {
        quickAdd: 'Ctrl+K',
        commandPalette: 'Ctrl+P',
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

export default useStore
