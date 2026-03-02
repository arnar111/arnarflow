// Task management slice - tasks, tags, subtasks, dependencies

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

export { DEFAULT_TAGS }

export const createTaskSlice = (set, get) => ({
  // Tasks - enhanced with due dates and dependencies (v5.0.0)
  tasks: [],

  // Seed initial tasks from project analysis
  seedProjectTasks: () => {
    const state = get()
    if (state.tasks.length > 0) return

    const initialTasks = [
      // Eignamat tasks
      { id: '1', projectId: 'eignamat', title: 'Add renovation detection features to vision prompt', priority: 'high', createdAt: new Date().toISOString() },
      { id: '2', projectId: 'eignamat', title: 'Add positive features: recent_renovation, modern_kitchen, modern_bathroom', priority: 'high', createdAt: new Date().toISOString() },
      { id: '3', projectId: 'eignamat', title: 'Implement dynamic positive cap based on building age', priority: 'medium', createdAt: new Date().toISOString(), blockedBy: ['2'] },
      { id: '4', projectId: 'eignamat', title: 'Add location premium enhancement for postcodes 101, 107', priority: 'low', createdAt: new Date().toISOString() },
      { id: '5', projectId: 'eignamat', title: 'Re-test valuation accuracy with Hlíðargerði 17 and Mjóahlíð 12', priority: 'medium', createdAt: new Date().toISOString(), blockedBy: ['3'] },
      { id: '6', projectId: 'eignamat', title: 'Add user authentication system', priority: 'high', createdAt: new Date().toISOString() },
      { id: '7', projectId: 'eignamat', title: 'Build pricing/subscription page', priority: 'medium', createdAt: new Date().toISOString(), blockedBy: ['6'] },
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
      { id: '16', projectId: 'betrithu', title: 'Add user library/purchased recordings page', priority: 'medium', createdAt: new Date().toISOString(), blockedBy: ['14'] },
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

    set({ tasks: initialTasks.map(t => ({ ...t, completed: false, timeSpent: 0, blockedBy: t.blockedBy || [] })) })
  },

  addTask: (task) => set((state) => ({
    tasks: [...state.tasks, {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      completed: false,
      dueDate: null,
      timeSpent: 0,
      blockedBy: [],
      aiPriority: null,
      aiReason: null,
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
    tasks: state.tasks.filter(t => t.id !== id).map(t => ({
      ...t,
      blockedBy: (t.blockedBy || []).filter(bid => bid !== id)
    }))
  })),

  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
  })),

  addTimeToTask: (id, minutes) => set((state) => ({
    tasks: state.tasks.map(t =>
      t.id === id ? { ...t, timeSpent: (t.timeSpent || 0) + minutes } : t
    )
  })),

  // Task Dependencies
  addDependency: (taskId, blockedByTaskId) => set((state) => ({
    tasks: state.tasks.map(t =>
      t.id === taskId
        ? { ...t, blockedBy: [...new Set([...(t.blockedBy || []), blockedByTaskId])] }
        : t
    )
  })),

  removeDependency: (taskId, blockedByTaskId) => set((state) => ({
    tasks: state.tasks.map(t =>
      t.id === taskId
        ? { ...t, blockedBy: (t.blockedBy || []).filter(id => id !== blockedByTaskId) }
        : t
    )
  })),

  getBlockingTasks: (taskId) => {
    const state = get()
    const task = state.tasks.find(t => t.id === taskId)
    if (!task || !task.blockedBy || task.blockedBy.length === 0) return []
    return state.tasks.filter(t => task.blockedBy.includes(t.id))
  },

  getBlockedTasks: (taskId) => {
    const state = get()
    return state.tasks.filter(t => (t.blockedBy || []).includes(taskId))
  },

  isTaskBlocked: (taskId) => {
    const state = get()
    const task = state.tasks.find(t => t.id === taskId)
    if (!task || !task.blockedBy || task.blockedBy.length === 0) return false
    return task.blockedBy.some(bid => {
      const blockingTask = state.tasks.find(t => t.id === bid)
      return blockingTask && !blockingTask.completed
    })
  },

  // Subtasks
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

  // Tags
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

  // Recurring Tasks
  recurringTasks: [],
  addRecurringTask: (task) => set((state) => ({
    recurringTasks: [...state.recurringTasks, { id: Date.now().toString(), ...task }]
  })),
  updateRecurringTask: (id, updates) => set((state) => ({
    recurringTasks: state.recurringTasks.map(t => t.id === id ? { ...t, ...updates } : t)
  })),
  deleteRecurringTask: (id) => set((state) => ({
    recurringTasks: state.recurringTasks.filter(t => t.id !== id)
  })),
  toggleRecurringTask: (id) => set((state) => ({
    recurringTasks: state.recurringTasks.map(t =>
      t.id === id ? { ...t, enabled: !t.enabled } : t
    )
  })),

  // AI Smart Prioritization
  aiPrioritizationEnabled: true,
  lastAiPrioritization: null,
  aiSuggestions: [],
  setAiPrioritizationEnabled: (enabled) => set({ aiPrioritizationEnabled: enabled }),
  setAiSuggestions: (suggestions) => set({
    aiSuggestions: suggestions,
    lastAiPrioritization: new Date().toISOString()
  }),
  applyAiSuggestion: (taskId) => set((state) => {
    const suggestion = state.aiSuggestions.find(s => s.taskId === taskId)
    if (!suggestion) return {}
    return {
      tasks: state.tasks.map(t =>
        t.id === taskId
          ? { ...t, priority: suggestion.suggestedPriority, aiPriority: suggestion.suggestedPriority, aiReason: suggestion.reason }
          : t
      ),
      aiSuggestions: state.aiSuggestions.filter(s => s.taskId !== taskId)
    }
  }),
  dismissAiSuggestion: (taskId) => set((state) => ({
    aiSuggestions: state.aiSuggestions.filter(s => s.taskId !== taskId)
  })),

  // Today View (ADHD focus)
  todayTaskIds: [],
  setTodayTaskIds: (ids) => set({ todayTaskIds: ids }),

  // Task Detail Panel
  selectedTaskId: null,
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),
})
