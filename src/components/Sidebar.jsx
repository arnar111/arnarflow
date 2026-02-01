import React from 'react'
import useStore from '../store/useStore'
import { useTranslation } from '../i18n/useTranslation'
import DynamicIcon from './Icons'
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
  Repeat
} from 'lucide-react'

function Sidebar() {
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
    setRecurringOpen
  } = useStore()

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { id: 'calendar', icon: Calendar, label: t('nav.calendar') },
    { id: 'ideas', icon: Lightbulb, label: t('nav.ideas') },
    { id: 'habits', icon: Target, label: t('nav.habits') },
    { id: 'focus', icon: Clock, label: language === 'is' ? 'Einbeiting' : 'Focus' },
    { id: 'notes', icon: FileText, label: language === 'is' ? 'Glósur' : 'Notes', badge: 'new' },
    { id: 'stats', icon: BarChart3, label: language === 'is' ? 'Tölfræði' : 'Stats' },
  ]

  const getProjectTaskCount = (projectId) => {
    return tasks.filter(t => t.projectId === projectId && !t.completed).length
  }

  return (
    <aside className="w-56 bg-dark-900/50 border-r border-dark-600/50 flex flex-col overflow-hidden">
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
                  ? 'bg-accent/10 text-accent'
                  : 'text-zinc-400 hover:bg-dark-800 hover:text-zinc-200'
              }`}
            >
              <item.icon size={18} className={isActive ? 'text-accent' : ''} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-2xs bg-accent/20 text-accent rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 border-t border-dark-600/50 my-2" />

      {/* Projects */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
            {t('nav.projects')}
          </span>
          <button
            onClick={() => setAddProjectOpen(true)}
            className="p-1 hover:bg-dark-700 rounded-md transition-colors"
            title={t('projects.addNew')}
          >
            <Plus size={14} className="text-zinc-500" />
          </button>
        </div>
        
        <ul className="space-y-0.5">
          {projects.map(project => {
            const isActive = activeView === 'project' && selectedProject === project.id
            const taskCount = getProjectTaskCount(project.id)
            
            return (
              <li key={project.id}>
                <button
                  onClick={() => {
                    setActiveView('project')
                    setSelectedProject(project.id)
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all group ${
                    isActive
                      ? 'bg-dark-700/50'
                      : 'hover:bg-dark-800'
                  }`}
                >
                  <div 
                    className="w-6 h-6 rounded-md flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${project.color}20` }}
                  >
                    <DynamicIcon name={project.icon} size={14} style={{ color: project.color }} />
                  </div>
                  <span className={`flex-1 text-left truncate ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                    {project.name}
                  </span>
                  {taskCount > 0 && (
                    <span className="text-xs font-mono text-zinc-500 bg-dark-700 px-1.5 py-0.5 rounded">
                      {taskCount}
                    </span>
                  )}
                  <ChevronRight 
                    size={14} 
                    className={`text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity ${
                      isActive ? 'opacity-100 text-zinc-400' : ''
                    }`} 
                  />
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-dark-600/50 space-y-1">
        <button
          onClick={() => setRecurringOpen(true)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:bg-dark-800 hover:text-zinc-200 transition-all"
        >
          <Repeat size={18} />
          <span className="flex-1 text-left">{language === 'is' ? 'Endurtekin' : 'Recurring'}</span>
        </button>
        <button
          onClick={() => setSettingsOpen(true)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:bg-dark-800 hover:text-zinc-200 transition-all"
        >
          <Settings size={18} />
          <span className="flex-1 text-left">{t('settings.title')}</span>
          <kbd className="kbd text-2xs">⌘,</kbd>
        </button>
      </div>

      {/* Version */}
      <div className="px-4 py-2 text-center">
        <span className="text-2xs text-zinc-600 font-mono">
          v{useStore.getState().appVersion}
        </span>
      </div>
    </aside>
  )
}

export default Sidebar
