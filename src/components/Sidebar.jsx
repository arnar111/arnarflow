import React, { useState } from 'react'
import useStore, { APP_VERSION } from '../store/useStore'
import { useTranslation } from '../i18n/useTranslation'
import DynamicIcon from './Icons'
import { TimeTrackerWidget } from './TimeTracker'
import { 
  LayoutDashboard, 
  Lightbulb, 
  Target, 
  Plus, 
  Settings,
  ChevronRight,
  ChevronDown,
  Calendar,
  Clock,
  BarChart3,
  FileText,
  Repeat,
  GitBranch,
  Timer,
  Bell,
  Keyboard,
  FolderKanban,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'

function Sidebar({ onOpenCalendarSync }) {
  const { t, language } = useTranslation()
  const { 
    activeView, 
    setActiveView, 
    selectedProject, 
    setSelectedProject,
    projects,
    tasks,
    ideas,
    habits,
    habitLogs,
    setSettingsOpen,
    setAddProjectOpen,
    setRecurringOpen,
    setTimeTrackerOpen,
    setNotificationsPanelOpen,
    setKeyboardShortcutsOpen,
    unreadNotificationCount,
  } = useStore()

  const [projectsExpanded, setProjectsExpanded] = useState(true)

  const today = new Date().toISOString().split('T')[0]
  const inboxIdeas = ideas.filter(i => i.status === 'inbox').length
  const habitsDoneToday = habits.filter(h => habitLogs[`${h.id}-${today}`]).length

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { id: 'calendar', icon: Calendar, label: t('nav.calendar') },
    { id: 'roadmap', icon: GitBranch, label: language === 'is' ? 'Tímalína' : 'Roadmap', badge: 'new' },
    { id: 'ideas', icon: Lightbulb, label: t('nav.ideas'), count: inboxIdeas > 0 ? inboxIdeas : null, countColor: 'amber' },
    { id: 'habits', icon: Target, label: t('nav.habits'), count: habits.length > 0 ? `${habitsDoneToday}/${habits.length}` : null, countColor: habitsDoneToday === habits.length ? 'green' : 'purple' },
    { id: 'focus', icon: Clock, label: language === 'is' ? 'Einbeiting' : 'Focus' },
    { id: 'notes', icon: FileText, label: language === 'is' ? 'Glósur' : 'Notes' },
    { id: 'stats', icon: BarChart3, label: language === 'is' ? 'Tölfræði' : 'Stats' },
  ]

  const getProjectStats = (projectId) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId)
    const open = projectTasks.filter(t => !t.completed).length
    const total = projectTasks.length
    const completed = total - open
    const progress = total > 0 ? (completed / total) * 100 : 0
    const blocked = projectTasks.filter(t => 
      !t.completed && 
      t.blockedBy && 
      t.blockedBy.length > 0 &&
      t.blockedBy.some(bid => {
        const blockingTask = tasks.find(bt => bt.id === bid)
        return blockingTask && !blockingTask.completed
      })
    ).length
    const overdue = projectTasks.filter(t => {
      if (t.completed || !t.dueDate) return false
      const dueDate = new Date(t.dueDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return dueDate < today
    }).length
    
    return { open, total, completed, progress, blocked, overdue }
  }

  const countColor = {
    amber: 'bg-amber-500/15 text-amber-400',
    purple: 'bg-purple-500/15 text-purple-400',
    green: 'bg-green-500/15 text-green-400',
    blue: 'bg-blue-500/15 text-blue-400',
  }

  return (
    <aside className="w-56 bg-[var(--bg-secondary)] border-r border-[var(--border)] flex flex-col overflow-hidden sidebar-desktop">
      {/* Time Tracker Widget */}
      <div className="p-3 border-b border-[var(--border)]">
        <TimeTrackerWidget />
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-0.5">
        {navItems.map(item => {
          const isActive = activeView === item.id && !selectedProject
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id)
                setSelectedProject(null)
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group ${
                isActive
                  ? 'bg-[var(--accent-muted)] text-[var(--accent)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
              }`}
            >
              <item.icon size={18} className={`transition-transform group-hover:scale-110 ${isActive ? 'text-[var(--accent)]' : ''}`} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-2xs bg-[var(--accent)]/20 text-[var(--accent)] rounded-full animate-pulse">
                  {item.badge}
                </span>
              )}
              {item.count && (
                <span className={`px-1.5 py-0.5 text-2xs rounded-full font-medium ${countColor[item.countColor] || countColor.blue}`}>
                  {item.count}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 border-t border-[var(--border)] my-2" />

      {/* Projects Section */}
      <div className="flex-1 overflow-y-auto">
        {/* Projects Header */}
        <button
          onClick={() => setProjectsExpanded(!projectsExpanded)}
          className="w-full flex items-center justify-between px-4 py-2 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider hover:text-[var(--text-secondary)] transition-colors"
        >
          <div className="flex items-center gap-2">
            <FolderKanban size={12} />
            <span>{t('nav.projects')}</span>
            <span className="text-[var(--text-disabled)] font-mono normal-case">({projects.length})</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); setAddProjectOpen(true) }}
              className="p-1 hover:bg-[var(--bg-hover)] rounded-md transition-colors"
              title={t('projects.addNew')}
            >
              <Plus size={12} />
            </button>
            {projectsExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </div>
        </button>
        
        {/* Projects List */}
        {projectsExpanded && (
          <ul className="px-3 pb-3 space-y-0.5">
            {projects.map(project => {
              const isActive = activeView === 'project' && selectedProject === project.id
              const stats = getProjectStats(project.id)
              
              return (
                <li key={project.id}>
                  <button
                    onClick={() => {
                      setActiveView('project')
                      setSelectedProject(project.id)
                    }}
                    className={`w-full px-3 py-2.5 rounded-lg text-sm transition-all group ${
                      isActive
                        ? 'bg-[var(--bg-tertiary)]'
                        : 'hover:bg-[var(--bg-hover)]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div 
                        className="w-6 h-6 rounded-md flex items-center justify-center transition-transform group-hover:scale-110 flex-shrink-0"
                        style={{ backgroundColor: `${project.color}20` }}
                      >
                        <DynamicIcon name={project.icon} size={14} style={{ color: project.color }} />
                      </div>
                      <span className={`flex-1 text-left truncate ${isActive ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)]'}`}>
                        {project.name}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {stats.overdue > 0 && (
                          <span 
                            className="flex items-center gap-0.5 text-[10px] font-medium text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded" 
                            title={language === 'is' ? 'Seinkuð verkefni' : 'Overdue tasks'}
                          >
                            <AlertTriangle size={10} />
                            {stats.overdue}
                          </span>
                        )}
                        {stats.open > 0 && (
                          <span className="text-[11px] font-mono text-[var(--text-muted)] bg-[var(--bg-tertiary)] px-1.5 py-0.5 rounded">
                            {stats.open}
                          </span>
                        )}
                        {stats.total > 0 && stats.open === 0 && (
                          <CheckCircle2 size={14} className="text-green-400" />
                        )}
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    {stats.total > 0 && (
                      <div className="mt-2 h-1 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${stats.progress}%`, 
                            backgroundColor: stats.progress === 100 ? '#22c55e' : project.color 
                          }}
                        />
                      </div>
                    )}
                  </button>
                </li>
              )
            })}
            
            {/* Add Project Button */}
            <li>
              <button
                onClick={() => setAddProjectOpen(true)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-all border border-dashed border-[var(--border)] hover:border-[var(--accent)]/30"
              >
                <Plus size={14} />
                <span>{language === 'is' ? 'Nýtt verkefni' : 'New project'}</span>
              </button>
            </li>
          </ul>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-[var(--border)] space-y-1">
        {/* Quick Actions Row */}
        <div className="flex items-center gap-1 mb-2">
          <button
            onClick={() => setTimeTrackerOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-all"
            title={language === 'is' ? 'Tímamælir' : 'Time Tracker'}
          >
            <Timer size={16} />
          </button>
          <button
            onClick={() => setNotificationsPanelOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-all relative"
            title={language === 'is' ? 'Tilkynningar' : 'Notifications'}
          >
            <Bell size={16} />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-0.5 right-1/4 w-4 h-4 text-[10px] font-medium bg-[var(--error)] text-white rounded-full flex items-center justify-center animate-pulse">
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </span>
            )}
          </button>
          <button
            onClick={onOpenCalendarSync}
            className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-all"
            title={language === 'is' ? 'Dagatal' : 'Calendar Sync'}
          >
            <Calendar size={16} />
          </button>
          <button
            onClick={() => setKeyboardShortcutsOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-all"
            title={language === 'is' ? 'Flýtilyklar' : 'Keyboard Shortcuts'}
          >
            <Keyboard size={16} />
          </button>
        </div>

        <button
          onClick={() => setRecurringOpen(true)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-all"
        >
          <Repeat size={18} />
          <span className="flex-1 text-left">{language === 'is' ? 'Endurtekin' : 'Recurring'}</span>
        </button>
        <button
          onClick={() => setSettingsOpen(true)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-all"
        >
          <Settings size={18} />
          <span className="flex-1 text-left">{t('settings.title')}</span>
          <kbd className="kbd text-2xs">⌘,</kbd>
        </button>
      </div>

      {/* Version */}
      <div className="px-4 py-2 text-center border-t border-[var(--border)]">
        <span className="text-2xs text-[var(--text-muted)] font-mono">
          ArnarFlow v{APP_VERSION}
        </span>
      </div>
    </aside>
  )
}

export default Sidebar
