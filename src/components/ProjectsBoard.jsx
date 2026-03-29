import React, { useMemo, useState, useEffect } from 'react'
import useStore from '../store/useStore'
import { useTranslation } from '../i18n/useTranslation'
import DynamicIcon from './Icons'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  FolderKanban,
  MoreVertical,
  Plus,
  Trash2,
  GripVertical,
  LayoutGrid,
  List,
  AlertTriangle,
} from 'lucide-react'

function ProjectMenu({ project, onOpen, onQuickTask, onDelete, onRename, onEditAppearance }) {
  const { language } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
        title={language === 'is' ? 'Aðgerðir' : 'Actions'}
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-10 z-50 w-56 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--bg-hover)]"
            onClick={() => {
              setOpen(false)
              onOpen()
            }}
          >
            {language === 'is' ? 'Opna verkefni' : 'Open project'}
          </button>
          <button
            className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--bg-hover)]"
            onClick={() => {
              setOpen(false)
              onQuickTask()
            }}
          >
            {language === 'is' ? 'Nýtt task (quick add)' : 'New task (quick add)'}
          </button>

          <button
            className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--bg-hover)]"
            onClick={() => {
              setOpen(false)
              const newName = window.prompt(language === 'is' ? 'Nýtt nafn verkefnis:' : 'New project name:', project.name)
              if (newName && newName.trim()) onRename(newName.trim())
            }}
          >
            {language === 'is' ? 'Endurnefna' : 'Rename'}
          </button>

          <button
            className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--bg-hover)]"
            onClick={() => {
              setOpen(false)
              const newColor = window.prompt(language === 'is' ? 'Litur (t.d. #ff0000):' : 'Color (e.g. #ff0000):', project.color)
              const newIcon = window.prompt(language === 'is' ? 'Tákn nafn (t.d. Home):' : 'Icon name (e.g. Home):', project.icon)
              onEditAppearance({ color: newColor || project.color, icon: newIcon || project.icon })
            }}
          >
            {language === 'is' ? 'Breyta lit/tákni' : 'Change color/icon'}
          </button>

          <div className="h-px bg-[var(--border)]" />
          <button
            className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
            onClick={() => {
              setOpen(false)
              onDelete()
            }}
          >
            <Trash2 size={14} />
            {language === 'is' ? 'Eyða verkefni' : 'Delete project'}
          </button>
        </div>
      )}
    </div>
  )
}

function StatusPill({ status, language }) {
  const map = {
    ideas: language === 'is' ? 'Hugmyndir' : 'Ideas',
    active: language === 'is' ? 'Í vinnslu' : 'Active',
    done: language === 'is' ? 'Búið' : 'Done',
    on_hold: language === 'is' ? 'Í bið' : 'On hold',
    cancelled: language === 'is' ? 'Hætt við' : 'Cancelled',
  }
  return (
    <span className="text-xs px-2 py-1 rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
      {map[status] || status}
    </span>
  )
}

function buildNextProjects({ projects, columns, activeId, overId }) {
  const colKeys = columns.map((c) => c.key)
  const byId = new Map(projects.map((p) => [p.id, p]))

  const active = byId.get(activeId)
  if (!active) return projects

  // Build ordered ids per status (respecting current projects array ordering)
  const idsByStatus = {}
  for (const key of colKeys) idsByStatus[key] = []
  const otherIds = []

  for (const p of projects) {
    if (!p) continue
    if (colKeys.includes(p.status)) idsByStatus[p.status].push(p.id)
    else otherIds.push(p.id)
  }

  // remove active from its current status bucket
  if (idsByStatus[active.status]) {
    idsByStatus[active.status] = idsByStatus[active.status].filter((id) => id !== activeId)
  }

  let targetStatus = active.status
  let insertIndex = null

  if (typeof overId === 'string' && overId.startsWith('column-')) {
    targetStatus = overId.replace('column-', '')
    insertIndex = (idsByStatus[targetStatus] || []).length
  } else {
    const over = byId.get(overId)
    if (over) {
      targetStatus = over.status
      insertIndex = (idsByStatus[targetStatus] || []).indexOf(over.id)
      if (insertIndex < 0) insertIndex = (idsByStatus[targetStatus] || []).length
    } else {
      // no valid target
      return projects
    }
  }

  // Insert active id into target status
  const nextIds = [...(idsByStatus[targetStatus] || [])]
  const safeIndex = Math.max(0, Math.min(nextIds.length, Number(insertIndex)))
  nextIds.splice(safeIndex, 0, activeId)
  idsByStatus[targetStatus] = nextIds

  // Rebuild flattened list
  const flattenedIds = []
  for (const key of colKeys) {
    flattenedIds.push(...(idsByStatus[key] || []))
  }
  flattenedIds.push(...otherIds.filter((id) => id !== activeId))

  const nextProjects = flattenedIds.map((id) => {
    const p = byId.get(id)
    if (!p) return null
    if (id === activeId) return { ...p, status: targetStatus }
    return p
  }).filter(Boolean)

  return nextProjects
}

function SortableProjectCard({ project, stats, language, onOpenProject }) {
  const deleteProject = useStore((s) => s.deleteProject)

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id, data: { type: 'project' } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: `${project.color}10`,
        borderColor: `${project.color}30`,
      }}
      onClick={() => onOpenProject(project.id)}
      role="listitem"
      tabIndex={0}
      className="project-card cursor-pointer border rounded-xl p-3 transition-shadow hover:shadow-md flex flex-col focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
      aria-label={project.name}
      data-project-id={project.id}
      {...attributes}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${project.color}20` }}
          >
            <DynamicIcon name={project.icon} size={16} style={{ color: project.color }} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-[var(--text-primary)] truncate">{project.name}</span>
              {stats.overdue > 0 && (
                <span className="text-[10px] font-medium text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                  {language === 'is' ? `Seinkað: ${stats.overdue}` : `Overdue: ${stats.overdue}`}
                </span>
              )}
            </div>
            {project.description && (
              <div className="text-xs text-[var(--text-muted)] mt-1 truncate">{project.description}</div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            ref={setActivatorNodeRef}
            {...listeners}
            className="p-2 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all cursor-grab active:cursor-grabbing"
            title={language === 'is' ? 'Drag' : 'Drag'}
            aria-label={language === 'is' ? 'Draga' : 'Drag'}
          >
            <GripVertical size={16} />
          </button>

          <ProjectMenu
            project={project}
            onOpen={() => onOpenProject(project.id)}
            onQuickTask={() => {
              const { setSelectedProject, setActiveView, setQuickIdeaMode, setQuickAddOpen } = useStore.getState()
              setSelectedProject(project.id)
              setActiveView('project')
              setQuickIdeaMode(false)
              setQuickAddOpen(true)
            }}
            onDelete={() => {
              const ok = window.confirm(
                language === 'is'
                  ? `Eyða verkefni "${project.name}"? Þetta eyðir líka öllum tasks í því verkefni.`
                  : `Delete project "${project.name}"? This also deletes its tasks.`
              )
              if (ok) deleteProject(project.id)
            }}
            onRename={(newName) => {
              const { updateProject } = useStore.getState()
              updateProject(project.id, { name: newName })
            }}
            onEditAppearance={({ color, icon }) => {
              const { updateProject } = useStore.getState()
              updateProject(project.id, { color, icon })
            }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span>{language === 'is' ? `${stats.open} ólokið · ${stats.total} alls` : `${stats.open} open · ${stats.total} total`}</span>
        <span className="font-mono">{Math.round(stats.progress)}%</span>
      </div>

      <div className="mt-2 h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${stats.progress}%`, backgroundColor: stats.progress === 100 ? '#22c55e' : project.color }}
        />
      </div>
    </div>
  )
}

function ProjectCardOverlay({ project, stats, language }) {
  if (!project) return null
  return (
    <div
      className="border rounded-xl p-3 shadow-2xl"
      style={{ backgroundColor: `${project.color}16`, borderColor: `${project.color}40`, width: 280 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${project.color}20` }}>
            <DynamicIcon name={project.icon} size={16} style={{ color: project.color }} />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-[var(--text-primary)] truncate">{project.name}</div>
            {project.description && (
              <div className="text-xs text-[var(--text-muted)] mt-1 truncate">{project.description}</div>
            )}
          </div>
        </div>
        <div className="text-xs font-mono text-[var(--text-muted)]">{Math.round(stats?.progress || 0)}%</div>
      </div>
    </div>
  )
}

export default function ProjectsBoard() {
  const { t, language } = useTranslation()
  const projects = useStore((s) => s.projects)
  const tasks = useStore((s) => s.tasks)
  const setProjectsOrder = useStore((s) => s.setProjectsOrder)
  const setActiveView = useStore((s) => s.setActiveView)
  const setSelectedProject = useStore((s) => s.setSelectedProject)
  const setAddProjectOpen = useStore((s) => s.setAddProjectOpen)

  const statsByProject = useMemo(() => {
    const map = new Map()
    for (const p of projects) {
      const projectTasks = tasks.filter((t) => t.projectId === p.id)
      const open = projectTasks.filter((t) => !t.completed).length
      const total = projectTasks.length
      const completed = total - open
      const progress = total > 0 ? (completed / total) * 100 : 0
      const overdue = projectTasks.filter((t) => {
        if (t.completed || !t.dueDate) return false
        const dueDate = new Date(t.dueDate)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return dueDate < today
      }).length
      map.set(p.id, { open, total, completed, progress, overdue })
    }
    return map
  }, [projects, tasks])

  const openProject = (projectId) => {
    setActiveView('project')
    setSelectedProject(projectId)
  }

  // Kanban columns
  const columns = useMemo(
    () => [
      { key: 'ideas', title: language === 'is' ? 'Hugmyndir' : 'Ideas' },
      { key: 'active', title: language === 'is' ? 'Í vinnslu' : 'Active' },
      { key: 'done', title: language === 'is' ? 'Búið' : 'Done' },
      { key: 'on_hold', title: language === 'is' ? 'Í bið' : 'On hold' },
      { key: 'cancelled', title: language === 'is' ? 'Hætt við' : 'Cancelled' },
    ],
    [language]
  )

  const [viewMode, setViewMode] = useState('board') // 'board' | 'list'

  // dnd-kit
  const [activeId, setActiveId] = useState(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const activeProject = activeId ? projects.find((p) => p.id === activeId) : null
  const activeStats = activeProject ? statsByProject.get(activeProject.id) : null

  // Keyboard / focus state for this board
  const [focusedProjectId, setFocusedProjectId] = useState(null)

  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName
      const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag)
      if (isTyping) return

      // N = new project (default to ideas)
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        const { setAddProjectDefaultStatus } = useStore.getState()
        setAddProjectDefaultStatus('ideas')
        setAddProjectOpen(true)
        return
      }

      // Enter = open focused project
      if (e.key === 'Enter') {
        if (focusedProjectId) {
          openProject(focusedProjectId)
        }
        return
      }

      // Arrow navigation: move focused project between columns
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        if (!focusedProjectId) return
        const colKeys = columns.map((c) => c.key)
        const project = projects.find((p) => p.id === focusedProjectId)
        if (!project) return
        const curIndex = colKeys.indexOf(project.status)
        if (curIndex === -1) return
        const nextIndex =
          e.key === 'ArrowLeft' ? Math.max(0, curIndex - 1) : Math.min(colKeys.length - 1, curIndex + 1)
        const { updateProject } = useStore.getState()
        updateProject(project.id, { status: colKeys[nextIndex] })
        return
      }

      // ? = show shortcuts overlay
      if (e.key === '?') {
        const { setKeyboardShortcutsOpen } = useStore.getState()
        setKeyboardShortcutsOpen(true)
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [focusedProjectId, setAddProjectOpen, columns, projects])

  const activeCount = projects.filter((p) => p.status === 'active').length
  const WIP_LIMIT = 5

  const handleDragStart = (event) => {
    setActiveId(event.active?.id || null)
  }

  const handleDragEnd = (event) => {
    const aId = event.active?.id
    const oId = event.over?.id

    setActiveId(null)

    if (!aId || !oId) return
    if (aId === oId) return

    const next = buildNextProjects({ projects, columns, activeId: aId, overId: oId })

    // If we dropped over another project in same status, ensure exact relative order with arrayMove inside that bucket.
    // (buildNextProjects already handles "insert before" logic; this is just a safety for stable results.)
    setProjectsOrder?.(next)

    // Also update status if moved across columns (for any other views depending on status)
    const activeP = projects.find((p) => p.id === aId)
    const nextP = next.find((p) => p.id === aId)
    if (activeP && nextP && activeP.status !== nextP.status) {
      const { updateProject } = useStore.getState()
      updateProject(aId, { status: nextP.status })
    }
  }

  const handleDragCancel = () => setActiveId(null)

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--text-primary)] flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center">
                <FolderKanban size={20} className="text-[var(--accent)]" />
              </span>
              {language === 'is' ? 'Verkefni' : 'Projects'}
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-2">
              {language === 'is'
                ? 'Öll verkefni á einum stað. Dragðu spjöld á milli dálka til að breyta stöðu.'
                : 'All projects in one place. Drag cards between columns to change status.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 p-1 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
              <button
                onClick={() => setViewMode('board')}
                className={`px-2.5 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                  viewMode === 'board'
                    ? 'bg-[var(--bg-hover)] text-[var(--text-primary)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
                title={language === 'is' ? 'Borð' : 'Board'}
              >
                <LayoutGrid size={16} />
                {language === 'is' ? 'Borð' : 'Board'}
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-2.5 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                  viewMode === 'list'
                    ? 'bg-[var(--bg-hover)] text-[var(--text-primary)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
                title={language === 'is' ? 'Listi' : 'List'}
              >
                <List size={16} />
                {language === 'is' ? 'Listi' : 'List'}
              </button>
            </div>

            <button
              onClick={() => {
                const { setAddProjectDefaultStatus } = useStore.getState()
                setAddProjectDefaultStatus('ideas')
                setAddProjectOpen(true)
              }}
              className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-all flex items-center gap-2"
            >
              <Plus size={16} />
              {language === 'is' ? 'Nýtt verkefni' : 'New project'}
            </button>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="mt-10 p-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] text-center">
            <p className="text-[var(--text-secondary)]">{language === 'is' ? 'Engin verkefni ennþá.' : 'No projects yet.'}</p>
            <button
              onClick={() => {
                const { setAddProjectDefaultStatus } = useStore.getState()
                setAddProjectDefaultStatus('ideas')
                setAddProjectOpen(true)
              }}
              className="mt-4 px-4 py-2 rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-all inline-flex items-center gap-2"
            >
              <Plus size={16} />
              {language === 'is' ? 'Nýtt verkefni' : 'New project'}
            </button>
          </div>
        ) : viewMode === 'list' ? (
          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden">
            <div className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-[var(--border)] text-xs text-[var(--text-muted)]">
              <div className="col-span-5">{language === 'is' ? 'Verkefni' : 'Project'}</div>
              <div className="col-span-2">{language === 'is' ? 'Staða' : 'Status'}</div>
              <div className="col-span-2">{language === 'is' ? 'Tasks' : 'Tasks'}</div>
              <div className="col-span-2">{language === 'is' ? 'Framvinda' : 'Progress'}</div>
              <div className="col-span-1" />
            </div>

            <div className="divide-y divide-[var(--border)]">
              {projects.map((p) => {
                const s = statsByProject.get(p.id) || { open: 0, total: 0, completed: 0, progress: 0, overdue: 0 }
                return (
                  <div
                    key={p.id}
                    className="grid grid-cols-12 gap-3 px-4 py-3 hover:bg-[var(--bg-hover)] cursor-pointer"
                    onClick={() => openProject(p.id)}
                  >
                    <div className="col-span-5 flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${p.color}20` }}>
                        <DynamicIcon name={p.icon} size={16} style={{ color: p.color }} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-[var(--text-primary)] truncate">{p.name}</div>
                        {p.description && <div className="text-xs text-[var(--text-muted)] truncate">{p.description}</div>}
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <StatusPill status={p.status} language={language} />
                    </div>
                    <div className="col-span-2 flex items-center text-sm text-[var(--text-secondary)]">
                      {language === 'is' ? `${s.open} ólokið / ${s.total}` : `${s.open} open / ${s.total}`}
                    </div>
                    <div className="col-span-2 flex items-center gap-3">
                      <div className="flex-1 h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${s.progress}%`, backgroundColor: s.progress === 100 ? '#22c55e' : p.color }}
                        />
                      </div>
                      <div className="text-xs font-mono text-[var(--text-muted)] w-10 text-right">{Math.round(s.progress)}%</div>
                    </div>
                    <div className="col-span-1 flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                      <ProjectMenu
                        project={p}
                        onOpen={() => openProject(p.id)}
                        onQuickTask={() => {
                          const { setSelectedProject, setActiveView, setQuickIdeaMode, setQuickAddOpen } = useStore.getState()
                          setSelectedProject(p.id)
                          setActiveView('project')
                          setQuickIdeaMode(false)
                          setQuickAddOpen(true)
                        }}
                        onDelete={() => {
                          const ok = window.confirm(
                            language === 'is'
                              ? `Eyða verkefni "${p.name}"? Þetta eyðir líka öllum tasks í því verkefni.`
                              : `Delete project "${p.name}"? This also deletes its tasks.`
                          )
                          if (ok) useStore.getState().deleteProject(p.id)
                        }}
                        onRename={(newName) => useStore.getState().updateProject(p.id, { name: newName })}
                        onEditAppearance={({ color, icon }) => useStore.getState().updateProject(p.id, { color, icon })}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div className="mt-6 flex gap-4 overflow-x-auto pb-4">
              {columns.map((col) => {
                const colProjects = projects.filter((p) => p.status === col.key)
                const colIds = colProjects.map((p) => p.id)
                const isActiveCol = col.key === 'active'
                const showWip = isActiveCol && activeCount > WIP_LIMIT

                return (
                  <div
                    key={col.key}
                    id={`column-${col.key}`}
                    className="min-w-[260px] bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border)] p-3 flex-shrink-0"
                    role="region"
                    aria-label={col.title}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-[var(--text-primary)]">{col.title}</h3>
                      <span className="text-xs text-[var(--text-muted)]">{colProjects.length}</span>
                    </div>

                    {showWip && (
                      <div className="mb-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-200 px-3 py-2 text-xs flex items-center gap-2">
                        <AlertTriangle size={14} />
                        {language === 'is'
                          ? `WIP viðvörun: ${colProjects.length}/${WIP_LIMIT} í "Í vinnslu"`
                          : `WIP warning: ${colProjects.length}/${WIP_LIMIT} in "Active"`}
                      </div>
                    )}

                    <SortableContext items={colIds} strategy={verticalListSortingStrategy}>
                      <div
                        className="space-y-3"
                        role="list"
                        data-droppable
                        // droppable id lives on the wrapper via DndContext over.id
                      >
                        {/* droppable target */}
                        <ColumnDroppable id={`column-${col.key}`}>
                          {colProjects.map((p) => {
                            const s = statsByProject.get(p.id) || { open: 0, total: 0, completed: 0, progress: 0, overdue: 0 }
                            return (
                              <div key={p.id} onFocus={() => setFocusedProjectId(p.id)}>
                                <SortableProjectCard
                                  project={p}
                                  stats={s}
                                  language={language}
                                  onOpenProject={openProject}
                                />
                              </div>
                            )
                          })}

                          {colProjects.length === 0 && (
                            <div className="p-4 rounded-lg border border-dashed border-[var(--border)] text-center text-[var(--text-muted)]">
                              <p className="mb-2">
                                {language === 'is' ? 'Engin verkefni í þessum dálk.' : 'No projects in this column.'}
                              </p>
                              <button
                                onClick={() => {
                                  const { setAddProjectDefaultStatus } = useStore.getState()
                                  setAddProjectDefaultStatus(col.key)
                                  setAddProjectOpen(true)
                                }}
                                className="mt-2 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-sm hover:opacity-90 transition-all"
                              >
                                {language === 'is' ? 'Nýtt verkefni' : 'New project'}
                              </button>
                            </div>
                          )}
                        </ColumnDroppable>
                      </div>
                    </SortableContext>

                    <div className="mt-3 text-center text-xs text-[var(--text-muted)]">{t('projectView.dropHere')}</div>
                  </div>
                )
              })}
            </div>

            <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
              <ProjectCardOverlay project={activeProject} stats={activeStats} language={language} />
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  )
}

function ColumnDroppable({ id, children }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[40px] rounded-xl transition-colors ${isOver ? 'bg-[var(--bg-hover)]/60' : ''}`}
    >
      {children}
    </div>
  )
}
