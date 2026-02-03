import React, { useMemo, useState, useEffect, useRef } from 'react'
import useStore from '../store/useStore'
import { useTranslation } from '../i18n/useTranslation'
import DynamicIcon from './Icons'
import { FolderKanban, MoreVertical, Plus, Trash2, GripVertical } from 'lucide-react'

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

export default function ProjectsBoard() {
  const { t, language } = useTranslation()
  const {
    projects,
    tasks,
    setActiveView,
    setSelectedProject,
    setAddProjectOpen,
    setQuickAddOpen,
    setQuickIdeaMode,
    deleteProject,
  } = useStore()

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
  const columns = [
    { key: 'ideas', title: language === 'is' ? 'Hugmyndir' : 'Ideas' },
    { key: 'active', title: language === 'is' ? 'Í vinnslu' : 'Active' },
    { key: 'done', title: language === 'is' ? 'Búið' : 'Done' },
    { key: 'on_hold', title: language === 'is' ? 'Í bið' : 'On hold' },
    { key: 'cancelled', title: language === 'is' ? 'Hætt við' : 'Cancelled' },
  ]

  const dragPreviewRef = useRef()

  const onDragStart = (e, projectId) => {
    // attach id
    e.dataTransfer.setData('text/plain', projectId)
    e.dataTransfer.effectAllowed = 'move'

    // Create nicer drag preview: clone the card node
    try {
      const handleEl = e.currentTarget
      const card = handleEl.closest('.project-card')
      if (card) {
        const clone = card.cloneNode(true)
        clone.style.boxShadow = '0 8px 30px rgba(0,0,0,0.3)'
        clone.style.transform = 'scale(0.98)'
        clone.style.opacity = '0.95'
        clone.style.position = 'absolute'
        clone.style.top = '-9999px'
        clone.style.left = '-9999px'
        clone.style.pointerEvents = 'none'
        document.body.appendChild(clone)
        // store ref to remove later
        dragPreviewRef.current = clone
        // set drag image with offset
        e.dataTransfer.setDragImage(clone, clone.offsetWidth / 2, 20)

        // Clean up after short delay (some browsers need it to stay until dragend)
        setTimeout(() => {
          if (dragPreviewRef.current) {
            document.body.removeChild(dragPreviewRef.current)
            dragPreviewRef.current = null
          }
        }, 0)
      }
    } catch (err) {
      // ignore
    }
  }

  const onDrop = (e, columnKey) => {
    e.preventDefault()
    const projectId = e.dataTransfer.getData('text/plain')
    if (!projectId) return
    const { updateProject } = useStore.getState()
    updateProject(projectId, { status: columnKey })
  }

  const onDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

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
        const colKeys = columns.map(c => c.key)
        const project = projects.find(p => p.id === focusedProjectId)
        if (!project) return
        const curIndex = colKeys.indexOf(project.status)
        if (curIndex === -1) return
        const nextIndex = e.key === 'ArrowLeft' ? Math.max(0, curIndex - 1) : Math.min(colKeys.length - 1, curIndex + 1)
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

        {projects.length === 0 ? (
          <div className="mt-10 p-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] text-center">
            <p className="text-[var(--text-secondary)]">
              {language === 'is' ? 'Engin verkefni ennþá.' : 'No projects yet.'}
            </p>
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
        ) : (
          <div className="mt-6 flex gap-4 overflow-x-auto pb-4">
            {columns.map((col) => (
              <div
                key={col.key}
                className="min-w-[260px] bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border)] p-3 flex-shrink-0"
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, col.key)}
                role="region"
                aria-label={col.title}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">{col.title}</h3>
                  <span className="text-xs text-[var(--text-muted)]">{projects.filter(p => p.status === col.key).length}</span>
                </div>

                <div className="space-y-3" role="list">
                  {projects.filter(p => p.status === col.key).map((p, idx, arr) => {
                    const s = statsByProject.get(p.id) || { open: 0, total: 0, completed: 0, progress: 0, overdue: 0 }
                    return (
                      <div
                        key={p.id}
                        onClick={() => openProject(p.id)}
                        tabIndex={0}
                        onFocus={() => setFocusedProjectId(p.id)}
                        role="listitem"
                        className="project-card cursor-pointer border rounded-xl p-3 transition-shadow hover:shadow-md flex flex-col focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                        style={{ backgroundColor: `${p.color}10`, borderColor: `${p.color}30` }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: `${p.color}20` }}
                            >
                              <DynamicIcon name={p.icon} size={16} style={{ color: p.color }} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-[var(--text-primary)] truncate">{p.name}</span>
                                {s.overdue > 0 && (
                                  <span className="text-[10px] font-medium text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                                    {language === 'is' ? `Seinkað: ${s.overdue}` : `Overdue: ${s.overdue}`}
                                  </span>
                                )}
                              </div>
                              {p.description && (
                                <div className="text-xs text-[var(--text-muted)] mt-1 truncate">{p.description}</div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              draggable
                              onDragStart={(e) => onDragStart(e, p.id)}
                              className="p-2 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all cursor-grab"
                              title={language === 'is' ? 'Drag' : 'Drag'}
                              aria-label="drag"
                            >
                              <GripVertical size={16} />
                            </button>

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
                                if (ok) deleteProject(p.id)
                              }}
                              onRename={(newName) => {
                                const { updateProject } = useStore.getState()
                                updateProject(p.id, { name: newName })
                              }}
                              onEditAppearance={({ color, icon }) => {
                                const { updateProject } = useStore.getState()
                                updateProject(p.id, { color, icon })
                              }}
                            />
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-muted)]">
                          <span>{language === 'is' ? `${s.open} ólokið · ${s.total} alls` : `${s.open} open · ${s.total} total`}</span>
                          <span className="font-mono">{Math.round(s.progress)}%</span>
                        </div>

                        <div className="mt-2 h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${s.progress}%`, backgroundColor: s.progress === 100 ? '#22c55e' : p.color }}
                          />
                        </div>
                      </div>
                    )
                  })}

                  {projects.filter(p => p.status === col.key).length === 0 && (
                    <div className="p-4 rounded-lg border border-dashed border-[var(--border)] text-center text-[var(--text-muted)]">
                      <p className="mb-2">{language === 'is' ? 'Engin verkefni í þessum dálk.' : 'No projects in this column.'}</p>
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
                </div>

                <div className="mt-3 text-center text-xs text-[var(--text-muted)]">{t('projectView.dropHere')}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
