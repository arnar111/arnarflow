// Ideas inbox slice

const IDEA_CATEGORIES = [
  { id: 'product', name: 'Product', nameIs: 'Vara', color: '#3b82f6' },
  { id: 'marketing', name: 'Marketing', nameIs: 'Markaðssetning', color: '#22c55e' },
  { id: 'tech', name: 'Tech', nameIs: 'Tækni', color: '#a855f7' },
  { id: 'content', name: 'Content', nameIs: 'Efni', color: '#f59e0b' },
  { id: 'personal', name: 'Personal', nameIs: 'Persónulegt', color: '#ec4899' },
]

export { IDEA_CATEGORIES }

export const createIdeaSlice = (set, get) => ({
  ideas: [],
  ideaCategories: IDEA_CATEGORIES,

  addIdea: (idea) => set((state) => ({
    ideas: [...state.ideas, {
      id: Date.now().toString(), createdAt: new Date().toISOString(),
      status: 'inbox', tags: [], category: null, projectId: null, ...idea
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
      i.id === id ? { ...i, tags: [...new Set([...(i.tags || []), tag])] } : i
    )
  })),

  removeTagFromIdea: (id, tag) => set((state) => ({
    ideas: state.ideas.map(i =>
      i.id === id ? { ...i, tags: (i.tags || []).filter(t => t !== tag) } : i
    )
  })),
})
