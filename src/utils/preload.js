// Preload map: view ID → dynamic import function
// Used by Sidebar to prefetch view chunks on hover
const viewPreloaders = {
  projects: () => import('../components/ProjectsBoard'),
  calendar: () => import('../components/CalendarView'),
  roadmap: () => import('../components/RoadmapView'),
  ideas: () => import('../components/IdeasInbox'),
  habits: () => import('../components/HabitsView'),
  focus: () => import('../components/FocusHistory'),
  notes: () => import('../components/NotesView'),
  stats: () => import('../components/StatsView'),
  budget: () => import('../components/BudgetSaver'),
}

// Track what's already been preloaded to avoid duplicate fetches
const preloaded = new Set()

export function preloadView(viewId) {
  if (preloaded.has(viewId) || !viewPreloaders[viewId]) return
  preloaded.add(viewId)
  viewPreloaders[viewId]()
}
