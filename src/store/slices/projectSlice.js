// Project management slice

const PROJECTS = [
  { id: 'eignamat', name: 'Eignamat', icon: 'Home', color: '#10b981', description: 'AI Property Valuation SaaS', status: 'active' },
  { id: 'takkarena', name: 'Takk Arena', icon: 'Trophy', color: '#f59e0b', description: 'Gamified Sales Tracking', status: 'active' },
  { id: 'betrithu', name: 'Betri Þú', icon: 'Headphones', color: '#a855f7', description: 'Hypnosis Recordings Store', status: 'active' },
  { id: 'kosningagatt', name: 'Kosningagátt', icon: 'Vote', color: '#ef4444', description: 'SMS Campaign Tool', status: 'done' },
  { id: 'arnar', name: 'Portfolio', icon: 'Globe', color: '#06b6d4', description: 'Personal Website', status: 'on_hold' },
]

export { PROJECTS }

export const createProjectSlice = (set, get) => ({
  projects: PROJECTS,

  addProject: (project) => set((state) => ({
    projects: [...state.projects, { id: Date.now().toString(), ...project }]
  })),

  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map(p => p.id === id ? { ...p, ...updates } : p)
  })),

  deleteProject: (id) => set((state) => ({
    projects: state.projects.filter(p => p.id !== id),
    tasks: state.tasks.filter(t => t.projectId !== id)
  })),
})
