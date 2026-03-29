import { create } from 'zustand'
import { persist } from 'zustand/middleware'

<<<<<<< HEAD
import {
  createTaskSlice,
  createProjectSlice,
  createHabitSlice,
  createTimeSlice,
  createUiSlice,
  createNotificationSlice,
  createIdeaSlice,
  createBudgetSlice,
  createCalendarSlice,
  PROJECTS,
} from './slices'
=======
const APP_VERSION = '5.8.0'
>>>>>>> blaer/focus-mode-view

const APP_VERSION = '7.0.0'

const useStore = create(
  persist(
    (set, get) => ({
      appVersion: APP_VERSION,
      ...createTaskSlice(set, get),
      ...createProjectSlice(set, get),
      ...createHabitSlice(set, get),
      ...createTimeSlice(set, get),
      ...createUiSlice(set, get),
      ...createNotificationSlice(set, get),
      ...createIdeaSlice(set, get),
      ...createBudgetSlice(set, get),
      ...createCalendarSlice(set, get),
    }),
    {
      name: 'arnarflow-storage',
      version: 7,
      migrate: (persistedState, version) => {
        const state = persistedState || {}
        const projects = Array.isArray(state.projects) ? state.projects : PROJECTS

        const statusById = {
          eignamat: 'active',
          takkarena: 'active',
          betrithu: 'active',
          kosningagatt: 'done',
          arnar: 'on_hold',
        }

        const migratedProjects = projects.map((p) => {
          if (!p) return p
          return { ...p, status: p.status || statusById[p.id] || 'ideas' }
        })

        const addBusinessDays = (date, days) => {
          const d = new Date(date)
          let remaining = Number(days || 0)
          while (remaining > 0) {
            d.setDate(d.getDate() + 1)
            const day = d.getDay()
            if (day !== 0 && day !== 6) remaining--
          }
          d.setHours(12, 0, 0, 0)
          return d
        }

        const toISODate = (d) => {
          const y = d.getFullYear()
          const m = String(d.getMonth() + 1).padStart(2, '0')
          const day = String(d.getDate()).padStart(2, '0')
          return `${y}-${m}-${day}`
        }

        const tasks = Array.isArray(state.tasks) ? state.tasks : []
        const durationByPriority = (p) => (p === 'high' ? 3 : p === 'medium' ? 7 : 14)
        const priorityRank = (p) => (p === 'high' ? 0 : p === 'medium' ? 1 : 2)

        const projectDelayDays = (status) => {
          if (status === 'active') return 1
          if (status === 'ideas') return 3
          if (status === 'on_hold') return 10
          return 2
        }

        const now = new Date()
        now.setHours(12, 0, 0, 0)
        const taskById = new Map(tasks.filter(Boolean).map(t => [t.id, t]))
        const tasksByProject = new Map()

        for (const t of tasks) {
          if (!t || t.dueDate) continue
          const pid = t.projectId || 'unknown'
          if (!tasksByProject.has(pid)) tasksByProject.set(pid, [])
          tasksByProject.get(pid).push(t)
        }

        for (const bucket of tasksByProject.values()) {
          bucket.sort((a, b) => {
            const pr = priorityRank(a.priority) - priorityRank(b.priority)
            if (pr !== 0) return pr
            return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
          })
        }

        const statusByProjectId = new Map(migratedProjects.filter(Boolean).map(p => [p.id, p.status]))

        const plannedTasks = tasks.map((t) => {
          if (!t || t.dueDate) return t
          const projectStatus = statusByProjectId.get(t.projectId) || 'ideas'
          let start = addBusinessDays(now, projectDelayDays(projectStatus))

          const bucket = tasksByProject.get(t.projectId) || []
          const latestPlannedDue = bucket
            .filter(x => x && x.dueDate)
            .map(x => new Date(x.dueDate))
            .sort((a, b) => b - a)[0]
          if (latestPlannedDue) start = addBusinessDays(latestPlannedDue, 1)

          const blockers = Array.isArray(t.blockedBy) ? t.blockedBy : []
          let depDue = null
          for (const bid of blockers) {
            const blocker = taskById.get(bid)
            const blockerDue = blocker?.dueDate
            if (!blockerDue) continue
            const bd = new Date(blockerDue)
            if (bd && (!depDue || bd > depDue)) depDue = bd
          }
          if (depDue) start = addBusinessDays(depDue, 1)

          const duration = durationByPriority(t.priority)
          const due = addBusinessDays(start, duration)
          const updated = { ...t, startDate: t.startDate || toISODate(start), dueDate: toISODate(due) }
          taskById.set(updated.id, updated)

          const b = tasksByProject.get(updated.projectId)
          if (b) {
            const idx = b.findIndex(x => x && x.id === updated.id)
            if (idx >= 0) b[idx] = updated
          }

          return updated
        })

        const filledTasks = plannedTasks.map((t) => {
          if (!t || t.dueDate) return t
          const projectStatus = statusByProjectId.get(t.projectId) || 'ideas'
          const start = addBusinessDays(now, projectDelayDays(projectStatus))
          const due = addBusinessDays(start, durationByPriority(t.priority))
          return { ...t, startDate: t.startDate || toISODate(start), dueDate: toISODate(due) }
        })

        return { ...state, appVersion: APP_VERSION, projects: migratedProjects, tasks: filledTasks }
      },
    }
  )
)

export { APP_VERSION }
export { ACCENT_COLORS, IDEA_CATEGORIES, DEFAULT_TAGS } from './slices'
export default useStore
