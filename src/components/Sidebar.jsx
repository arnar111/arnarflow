import React from 'react'
import useStore from '../store/useStore'
import DynamicIcon from './Icons'
import { 
  LayoutDashboard, 
  Lightbulb, 
  Target, 
  Plus,
  Zap,
  Command,
  Timer,
  Square,
  Settings
} from 'lucide-react'

function Sidebar() {
  const { 
    projects, 
    activeView, 
    setActiveView, 
    selectedProject,
    setSelectedProject,
    setQuickAddOpen,
    setCommandPaletteOpen,
    focusProject,
    focusElapsed,
    endFocus,
    tasks,
    settingsOpen,
    setSettingsOpen
  } = useStore()

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', shortcut: 'G D' },
    { id: 'ideas', icon: Lightbulb, label: 'Ideas', shortcut: 'G I' },
    { id: 'habits', icon: Target, label: 'Habits', shortcut: 'G H' },
  ]

  const getProjectTaskCount = (projectId) => {
    return tasks.filter(t => t.projectId === projectId && !t.completed).length
  }

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const focusedProject = focusProject ? projects.find(p => p.id === focusProject) : null

  return (
    <aside className="w-60 bg-dark-900 border-r border-dark-600/50 flex flex-col">
      {/* Header */}
      <div className="p-4">
        <h1 className="text-lg font-semibold flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-cyan-500 flex items-center justify-center shadow-glow">
            <Zap size={14} className="text-white" />
          </div>
          <span className="tracking-tight">ArnarFlow</span>
        </h1>
      </div>

      {/* Quick Actions */}
      <div className="px-3 pb-3 space-y-1.5">
        <button
          onClick={() => setQuickAddOpen(true)}
          className="w-full flex items-center justify-between px-3 py-2 bg-accent/10 hover:bg-accent/20 border border-accent/20 rounded-lg transition-all text-accent text-sm font-medium"
        >
          <span className="flex items-center gap-2">
            <Plus size={16} />
            New Task
          </span>
          <kbd className="kbd text-accent/60">⌘K</kbd>
        </button>
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-3 py-2 hover:bg-dark-700 rounded-lg transition-colors text-zinc-500 text-sm"
        >
          <span className="flex items-center gap-2">
            <Command size={14} />
            Commands
          </span>
          <kbd className="kbd">⌘P</kbd>
        </button>
      </div>

      {/* Focus Timer (if active) */}
      {focusedProject && (
        <div className="mx-3 mb-3 p-3 rounded-lg border animate-fade-in"
          style={{ 
            backgroundColor: `${focusedProject.color}10`,
            borderColor: `${focusedProject.color}30`
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Focusing</span>
            <button 
              onClick={endFocus}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              title="End focus session"
            >
              <Square size={12} className="text-zinc-500" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <DynamicIcon name={focusedProject.icon} size={16} style={{ color: focusedProject.color }} />
            <span className="text-sm font-medium truncate" style={{ color: focusedProject.color }}>
              {focusedProject.name}
            </span>
          </div>
          <div className="font-mono text-2xl font-semibold mt-1 animate-pulse-subtle" style={{ color: focusedProject.color }}>
            {formatTime(focusElapsed)}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => {
              setActiveView(item.id)
              setSelectedProject(null)
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-sm ${
              activeView === item.id && !selectedProject
                ? 'bg-dark-700 text-white font-medium'
                : 'text-zinc-500 hover:bg-dark-800 hover:text-zinc-300'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <item.icon size={16} />
              {item.label}
            </span>
          </button>
        ))}

        {/* Projects Section */}
        <div className="pt-4 pb-2">
          <h3 className="text-2xs font-semibold text-zinc-600 uppercase tracking-wider px-3 mb-2">
            Projects
          </h3>
          <div className="space-y-0.5 stagger-children">
            {projects.map(project => (
              <button
                key={project.id}
                onClick={() => {
                  setActiveView('project')
                  setSelectedProject(project.id)
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-sm ${
                  selectedProject === project.id
                    ? 'bg-dark-700 text-white font-medium'
                    : 'text-zinc-500 hover:bg-dark-800 hover:text-zinc-300'
                }`}
                style={{
                  borderLeft: selectedProject === project.id 
                    ? `2px solid ${project.color}` 
                    : '2px solid transparent',
                }}
              >
                <DynamicIcon 
                  name={project.icon} 
                  size={15} 
                  style={{ color: selectedProject === project.id ? project.color : undefined }} 
                />
                <span className="flex-1 text-left truncate">{project.name}</span>
                {getProjectTaskCount(project.id) > 0 && (
                  <span 
                    className="text-2xs font-mono px-1.5 py-0.5 rounded"
                    style={{ 
                      backgroundColor: `${project.color}20`, 
                      color: project.color 
                    }}
                  >
                    {getProjectTaskCount(project.id)}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-dark-600/50">
        <button
          onClick={() => setSettingsOpen(true)}
          className="w-full flex items-center justify-between px-2 py-1.5 text-xs text-zinc-600 hover:text-zinc-400 hover:bg-dark-800 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-2">
            <Timer size={12} />
            <span>v1.3.0</span>
          </div>
          <Settings size={12} />
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
