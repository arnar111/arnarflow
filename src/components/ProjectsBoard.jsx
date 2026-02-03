import React, { useMemo, useState } from 'react'
import useStore from '../store/useStore'
import { useTranslation } from '../i18n/useTranslation'
import DynamicIcon from './Icons'
import { FolderKanban, MoreVertical, Plus, Trash2 } from 'lucide-react'

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
  const { language } = useTranslation()
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

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
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
                ? 'Öll verkefni á einum stað. Smelltu á spjald til að opna kanban verkefnaborðið.'
                : 'All projects in one place. Click a card to open the project kanban.'}
            </p>
          </div>

          <button
            onClick={() => setAddProjectOpen(true)}
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
              onClick={() => setAddProjectOpen(true)}
              className="mt-4 px-4 py-2 rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-all inline-flex items-center gap-2"
            >
              <Plus size={16} />
              {language === 'is' ? 'Búa til fyrsta verkefnið' : 'Create your first project'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
            {projects.map((p) => {
              const s = statsByProject.get(p.id) || { open: 0, total: 0, completed: 0, progress: 0, overdue: 0 }
              return (
                <button
                  key={p.id}
                  onClick={() => openProject(p.id)}
                  className="text-left bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-4 hover:bg-[var(--bg-hover)] transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${p.color}20` }}
                      >
                        <DynamicIcon name={p.icon} size={18} style={{ color: p.color }} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[var(--text-primary)] truncate">{p.name}</span>
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

                    <ProjectMenu
                      project={p}
                      onOpen={() => openProject(p.id)}
                      onQuickTask={() => {
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

                  {/* Stats */}
                  <div className="mt-4 flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span>
                      {language === 'is'
                        ? `${s.open} ólokið · ${s.total} alls`
                        : `${s.open} open · ${s.total} total`}
                    </span>
                    <span className="font-mono">{Math.round(s.progress)}%</span>
                  </div>

                  <div className="mt-2 h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${s.progress}%`, backgroundColor: s.progress === 100 ? '#22c55e' : p.color }}
                    />
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
