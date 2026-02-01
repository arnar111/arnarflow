import React from 'react'
import useStore, { APP_VERSION } from '../store/useStore'
import { useTranslation } from '../i18n/useTranslation'
import DynamicIcon from './Icons'
import { TimeTrackerWidget } from './TimeTracker'
import { NotificationBell } from './NotificationSystem'
import { 
  LayoutDashboard, 
  Lightbulb, 
  Target, 
  Plus, 
  Settings,
  ChevronRight,
  Calendar,
  Sparkles,
  Clock,
  BarChart3,
  FileText,
  Repeat,
  GitBranch,
  Timer,
  Bell,
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
    setSettingsOpen,
    setAddProjectOpen,
    setRecurringOpen,
    setTimeTrackerOpen,
    setNotificationsPanelOpen,
    unreadNotificationCount,
    activeTimeSession
  } = useStore()

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { id: 'calendar', icon: Calendar, label: t('nav.calendar') },
    { id: 'roadmap', icon: GitBranch, label: language === 'is' ? 'Tímalína' : 'Roadmap', badge: 'new' },
    { id: 'ideas', icon: Lightbulb, label: t('nav.ideas') },
    { id: 'habits', icon: Target, label: t('nav.habits') },
    { id: 'focus', icon: Clock, label: language === 'is' ? 'Einbeiting' : 'Focus' },
    { id: 'notes', icon: FileText, label: language === 'is' ? 'Glósur' : 'Notes' },
    { id: 'stats', icon: BarChart3, label: language === 'is' ? 'Tölfræði' : 'Stats' },
  ]

  const getProjectTaskCount = (projectId) => {
    return tasks.filter(t => t.projectId === projectId && !t.completed).length
  }

  const getBlockedTaskCount = (projectId) => {
    return tasks.filter(t => 
      t.projectId === projectId && 
      !t.completed && 
      t.blockedBy && 
      t.blockedBy.length > 0 &&
      t.blockedBy.some(bid => {
        const blockingTask = tasks.find(bt => bt.id === bid)
        return blockingTask && !blockingTask.completed
      })
    ).length
  }

  return (
    <aside className="w-56 bg-[var(--bg-secondary)] border-r border-[var(--border)] flex flex-col overflow-hidden sidebar-desktop">
      {/* Time Tracker Widget (v5.0.0) */}
      <div className="p-3 border-b border-[var(--border)]">
        <TimeTrackerWidget />
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1">
        {navItems.map(item => {
          const isActive = activeView === item.id && !selectedProject
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id)
                setSelectedProject(null)
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                isActive
                  ? 'bg-[var(--accent-muted)] text-[var(--accent)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
              }`}
            >
              <item.icon size={18} className={isActive ? 'text-[var(--accent)]' : ''} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-2xs bg-[var(--accent)]/20 text-[var(--accent)] rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 border-t border-[var(--border)] my-2" />

      {/* Projects */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
            {t('nav.projects')}
          </span>
          <button
            onClick={() => setAddProjectOpen(true)}
            className="p-1 hover:bg-[var(--bg-hover)] rounded-md transition-colors"
            title={t('projects.addNew')}
          >
            <Plus size={14} className="text-[var(--text-muted)]" />
          </button>
        </div>
        
        <ul className="space-y-0.5">
          {projects.map(project => {
            const isActive = activeView === 'project' && selectedProject === project.id
            const taskCount = getProjectTaskCount(project.id)
            const blockedCount = getBlockedTaskCount(project.id)
            
            return (
              <li key={project.id}>
                <button
                  onClick={() => {
                    setActiveView('project')
                    setSelectedProject(project.id)
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all group ${
                    isActive
                      ? 'bg-[var(--bg-tertiary)]'
                      : 'hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  <div 
                    className="w-6 h-6 rounded-md flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${project.color}20` }}
                  >
                    <DynamicIcon name={project.icon} size={14} style={{ color: project.color }} />
                  </div>
                  <span className={`flex-1 text-left truncate ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                    {project.name}
                  </span>
                  <div className="flex items-center gap-1">
                    {blockedCount > 0 && (
                      <span className="text-[10px] font-mono text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded" title={language === 'is' ? 'Blokkuð verkefni' : 'Blocked tasks'}>
                        🔒{blockedCount}
                      </span>
                    )}
                    {taskCount > 0 && (
                      <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--bg-tertiary)] px-1.5 py-0.5 rounded">
                        {taskCount}
                      </span>
                    )}
                  </div>
                  <ChevronRight 
                    size={14} 
                    className={`text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity ${
                      isActive ? 'opacity-100' : ''
                    }`} 
                  />
                </button>
              </li>
            )
          })}
        </ul>
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
              <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-medium bg-[var(--error)] text-white rounded-full flex items-center justify-center">
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
      <div className="px-4 py-2 text-center">
        <span className="text-2xs text-[var(--text-muted)] font-mono">
          v{APP_VERSION}
        </span>
      </div>
    </aside>
  )
}

export default Sidebar
