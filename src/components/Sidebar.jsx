import React from 'react'
import useStore, { APP_VERSION } from '../store/useStore'
import { useTranslation } from '../i18n/useTranslation'
import DynamicIcon from './Icons'
import { TimeTrackerWidget } from './TimeTracker'
import { 
  LayoutDashboard, 
  Lightbulb, 
  Target, 
  Settings,
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
  PiggyBank,
} from 'lucide-react'

function Sidebar({ onOpenCalendarSync }) {
  const { t, language } = useTranslation()
  const { 
    activeView, 
    setActiveView, 
    selectedProject, 
    setSelectedProject,
    tasks,
    ideas,
    habits,
    habitLogs,
    setSettingsOpen,
    setRecurringOpen,
    setTimeTrackerOpen,
    setNotificationsPanelOpen,
    setKeyboardShortcutsOpen,
    unreadNotificationCount,
  } = useStore()

  const today = new Date().toISOString().split('T')[0]
  const inboxIdeas = ideas.filter(i => i.status === 'inbox').length
  const habitsDoneToday = habits.filter(h => habitLogs[`${h.id}-${today}`]).length

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { id: 'projects', icon: FolderKanban, label: language === 'is' ? 'Verkefni' : 'Projects', badge: 'new' },
    { id: 'calendar', icon: Calendar, label: t('nav.calendar') },
    { id: 'roadmap', icon: GitBranch, label: language === 'is' ? 'Tímalína' : 'Roadmap', badge: 'new' },
    { id: 'ideas', icon: Lightbulb, label: t('nav.ideas'), count: inboxIdeas > 0 ? inboxIdeas : null, countColor: 'amber' },
    { id: 'habits', icon: Target, label: t('nav.habits'), count: habits.length > 0 ? `${habitsDoneToday}/${habits.length}` : null, countColor: habitsDoneToday === habits.length ? 'green' : 'purple' },
    { id: 'focus', icon: Clock, label: language === 'is' ? 'Einbeiting' : 'Focus' },
    { id: 'notes', icon: FileText, label: language === 'is' ? 'Glósur' : 'Notes' },
    { id: 'stats', icon: BarChart3, label: language === 'is' ? 'Tölfræði' : 'Stats' },
    { id: 'budget', icon: PiggyBank, label: language === 'is' ? 'Sparnaður' : 'Budget Saver', badge: 'new' },
  ]

// project stats moved to Projects Board

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

      {/* Spacer */}
      <div className="flex-1 overflow-y-auto" />

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
