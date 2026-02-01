import React, { useState, useEffect, useRef, useMemo } from 'react'
import useStore from '../store/useStore'
import { useTranslation } from '../i18n/useTranslation'
import DynamicIcon from './Icons'
import { 
  Search, 
  LayoutDashboard, 
  Lightbulb, 
  Target, 
  Plus,
  Settings,
  Keyboard,
  Info,
  CheckSquare,
  Circle,
  Zap,
  FileText,
  ArrowRight,
  Clock,
  RefreshCw,
  Calendar
} from 'lucide-react'

function CommandPalette() {
  const { t, language } = useTranslation()
  const { 
    setCommandPaletteOpen, 
    setActiveView, 
    setSelectedProject,
    setQuickAddOpen,
    setSettingsOpen,
    setKeyboardShortcutsOpen,
    setAboutOpen,
    setFocusProject,
    setFocusTask,
    projects,
    tasks,
    ideas,
    toggleTask,
    addIdea
  } = useStore()
  
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [category, setCategory] = useState('all') // all, commands, tasks, ideas
  const [ideaCaptureMode, setIdeaCaptureMode] = useState(false)
  const inputRef = useRef(null)

  // Base commands
  const commands = useMemo(() => [
    { 
      id: 'new-task', 
      type: 'command',
      icon: Plus, 
      label: t('commandPalette.newTask'), 
      shortcut: '⌘K', 
      action: () => { setCommandPaletteOpen(false); setQuickAddOpen(true) } 
    },
    { 
      id: 'capture-idea', 
      type: 'command',
      icon: Zap, 
      label: t('commandPalette.captureIdea'), 
      shortcut: '⌘I', 
      action: () => setIdeaCaptureMode(true)
    },
    { 
      id: 'dashboard', 
      type: 'command',
      icon: LayoutDashboard, 
      label: `${t('commandPalette.goTo')} ${t('nav.dashboard')}`, 
      shortcut: 'G D', 
      action: () => { setActiveView('dashboard'); setSelectedProject(null) } 
    },
    { 
      id: 'ideas', 
      type: 'command',
      icon: Lightbulb, 
      label: `${t('commandPalette.goTo')} ${t('nav.ideas')}`, 
      shortcut: 'G I', 
      action: () => { setActiveView('ideas'); setSelectedProject(null) } 
    },
    { 
      id: 'habits', 
      type: 'command',
      icon: Target, 
      label: `${t('commandPalette.goTo')} ${t('nav.habits')}`, 
      shortcut: 'G H', 
      action: () => { setActiveView('habits'); setSelectedProject(null) } 
    },
    { 
      id: 'calendar', 
      type: 'command',
      icon: Calendar, 
      label: `${t('commandPalette.goTo')} ${t('nav.calendar')}`, 
      shortcut: 'G C', 
      action: () => { setActiveView('calendar'); setSelectedProject(null) } 
    },
    ...projects.map(p => ({
      id: `project-${p.id}`,
      type: 'command',
      icon: () => <DynamicIcon name={p.icon} size={16} style={{ color: p.color }} />,
      label: `${t('commandPalette.goTo')} ${p.name}`,
      subtitle: p.description,
      action: () => { setActiveView('project'); setSelectedProject(p.id) }
    })),
    { 
      id: 'settings', 
      type: 'command',
      icon: Settings, 
      label: t('commandPalette.openSettings'), 
      shortcut: '⌘,', 
      action: () => { setCommandPaletteOpen(false); setSettingsOpen(true) } 
    },
    { 
      id: 'shortcuts', 
      type: 'command',
      icon: Keyboard, 
      label: t('settings.keyboardShortcuts'), 
      shortcut: '?', 
      action: () => { setCommandPaletteOpen(false); setKeyboardShortcutsOpen(true) } 
    },
    { 
      id: 'about', 
      type: 'command',
      icon: Info, 
      label: t('settings.about'), 
      action: () => { setCommandPaletteOpen(false); setAboutOpen(true) } 
    },
    {
      id: 'check-updates',
      type: 'command',
      icon: RefreshCw,
      label: t('settings.checkUpdates'),
      action: () => { 
        setCommandPaletteOpen(false)
        setSettingsOpen(true)
        if (window.electronAPI?.checkForUpdates) {
          window.electronAPI.checkForUpdates()
        }
      }
    }
  ], [t, projects])

  // Task items
  const taskItems = useMemo(() => {
    return tasks.filter(t => !t.completed).slice(0, 20).map(task => {
      const project = projects.find(p => p.id === task.projectId)
      return {
        id: `task-${task.id}`,
        type: 'task',
        icon: task.completed ? CheckSquare : Circle,
        label: task.title,
        subtitle: project?.name || (language === 'is' ? 'Ekkert verkefni' : 'No project'),
        color: project?.color,
        action: () => {
          toggleTask(task.id)
          setCommandPaletteOpen(false)
        },
        secondaryAction: () => {
          if (task.projectId) {
            setFocusProject(task.projectId)
            setFocusTask(task.id)
          }
          setCommandPaletteOpen(false)
        }
      }
    })
  }, [tasks, projects, language])

  // Idea items
  const ideaItems = useMemo(() => {
    return ideas.filter(i => i.status === 'inbox').slice(0, 10).map(idea => ({
      id: `idea-${idea.id}`,
      type: 'idea',
      icon: Zap,
      label: idea.title,
      subtitle: idea.type || (language === 'is' ? 'Hugmynd' : 'Idea'),
      action: () => {
        setActiveView('ideas')
        setCommandPaletteOpen(false)
      }
    }))
  }, [ideas, language])

  // Combined & filtered results
  const allItems = useMemo(() => {
    let items = []
    
    if (category === 'all' || category === 'commands') {
      items = [...items, ...commands]
    }
    if (category === 'all' || category === 'tasks') {
      items = [...items, ...taskItems]
    }
    if (category === 'all' || category === 'ideas') {
      items = [...items, ...ideaItems]
    }
    
    if (!query) return items.slice(0, 15)
    
    const lowerQuery = query.toLowerCase()
    return items.filter(item => 
      item.label.toLowerCase().includes(lowerQuery) ||
      item.subtitle?.toLowerCase().includes(lowerQuery)
    ).slice(0, 15)
  }, [commands, taskItems, ideaItems, query, category])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query, category])

  const handleKeyDown = (e) => {
    // If in idea capture mode, handle differently
    if (ideaCaptureMode) {
      if (e.key === 'Escape') {
        setIdeaCaptureMode(false)
        setQuery('')
      } else if (e.key === 'Enter' && query.trim()) {
        addIdea({
          title: query.trim(),
          type: 'other'
        })
        setQuery('')
        setIdeaCaptureMode(false)
        setCommandPaletteOpen(false)
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, allItems.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && allItems[selectedIndex]) {
      e.preventDefault()
      allItems[selectedIndex].action()
      setCommandPaletteOpen(false)
    } else if (e.key === 'Tab') {
      e.preventDefault()
      // Cycle through categories
      const categories = ['all', 'commands', 'tasks', 'ideas']
      const currentIndex = categories.indexOf(category)
      setCategory(categories[(currentIndex + 1) % categories.length])
    } else if (e.key === 'Escape') {
      setCommandPaletteOpen(false)
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setCommandPaletteOpen(false)
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'task': return <Circle size={12} className="text-blue-400" />
      case 'idea': return <Zap size={12} className="text-amber-400" />
      default: return <ArrowRight size={12} className="text-zinc-500" />
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 z-50 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-2xl bg-dark-900 rounded-2xl border border-dark-500 shadow-2xl shadow-black/50 overflow-hidden animate-fade-in-scale">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-dark-600">
          {ideaCaptureMode ? (
            <Zap size={20} className="text-amber-400" />
          ) : (
            <Search size={20} className="text-zinc-500" />
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={ideaCaptureMode 
              ? (language === 'is' ? 'Skráðu hugmynd...' : 'Type your idea...')
              : t('commandPalette.placeholder')
            }
            className="flex-1 bg-transparent text-lg outline-none placeholder:text-zinc-600"
          />
          {ideaCaptureMode ? (
            <button
              onClick={() => {
                if (query.trim()) {
                  addIdea({ title: query.trim(), type: 'other' })
                  setQuery('')
                  setIdeaCaptureMode(false)
                  setCommandPaletteOpen(false)
                }
              }}
              disabled={!query.trim()}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {language === 'is' ? 'Fanga' : 'Capture'}
            </button>
          ) : (
            <kbd className="kbd">Esc</kbd>
          )}
        </div>

        {/* Idea Capture Mode Info */}
        {ideaCaptureMode && (
          <div className="px-5 py-3 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2 animate-fade-in">
            <Zap size={14} className="text-amber-400" />
            <span className="text-sm text-amber-300">
              {language === 'is' ? 'Hugmyndafanga virkur - sláðu inn og ýttu á Enter' : 'Idea capture mode - type and press Enter'}
            </span>
            <button
              onClick={() => setIdeaCaptureMode(false)}
              className="ml-auto text-amber-400 hover:text-amber-300 text-sm"
            >
              {language === 'is' ? 'Hætta við' : 'Cancel'}
            </button>
          </div>
        )}

        {/* Category Tabs */}
        {!ideaCaptureMode && (
          <div className="flex gap-1 px-4 py-2 border-b border-dark-600/50 bg-dark-800/30">
            {[
              { id: 'all', label: t('commandPalette.all'), icon: Search },
              { id: 'commands', label: t('commandPalette.commands'), icon: ArrowRight },
              { id: 'tasks', label: t('commandPalette.tasks'), icon: CheckSquare },
              { id: 'ideas', label: t('commandPalette.ideas'), icon: Lightbulb },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  category === cat.id 
                    ? 'bg-accent/20 text-accent' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-dark-700'
                }`}
              >
                <cat.icon size={12} />
                {cat.label}
              </button>
            ))}
            <span className="ml-auto text-2xs text-zinc-600 flex items-center gap-1">
              <kbd className="kbd text-2xs">Tab</kbd> {language === 'is' ? 'skipta' : 'switch'}
            </span>
          </div>
        )}

        {/* Results */}
        {!ideaCaptureMode && (
          <div className="max-h-96 overflow-y-auto py-2">
            {allItems.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <Search size={32} className="mx-auto text-zinc-700 mb-3" />
                <p className="text-zinc-500">{t('commandPalette.noResults')}</p>
                <p className="text-xs text-zinc-600 mt-1">{t('commandPalette.tryDifferent')}</p>
              </div>
            ) : (
              <ul>
                {allItems.map((item, index) => {
                  const Icon = item.icon
                  const isSelected = index === selectedIndex
                  
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          item.action()
                          setCommandPaletteOpen(false)
                        }}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-all ${
                          isSelected 
                            ? 'bg-dark-700' 
                            : 'hover:bg-dark-800'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-dark-600' : 'bg-dark-800'
                        }`}>
                          {typeof Icon === 'function' ? <Icon /> : <Icon size={16} style={{ color: item.color }} />}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                            {item.label}
                          </p>
                          {item.subtitle && (
                            <p className="text-2xs text-zinc-500 truncate">{item.subtitle}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {getTypeIcon(item.type)}
                          {item.shortcut && (
                            <kbd className="kbd">{item.shortcut}</kbd>
                          )}
                          {item.type === 'task' && item.secondaryAction && isSelected && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                item.secondaryAction()
                              }}
                              className="p-1 hover:bg-accent/20 rounded text-accent text-2xs"
                              title={language === 'is' ? 'Einbeita sér að verkefni' : 'Focus on task'}
                            >
                              <Clock size={12} />
                            </button>
                          )}
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-4 px-5 py-3 border-t border-dark-600 text-2xs text-zinc-600 bg-dark-800/30">
          <span className="flex items-center gap-1">
            <kbd className="kbd text-2xs">↑↓</kbd> {t('commandPalette.navigate')}
          </span>
          <span className="flex items-center gap-1">
            <kbd className="kbd text-2xs">↵</kbd> {t('commandPalette.select')}
          </span>
          {!ideaCaptureMode && (
            <span className="flex items-center gap-1">
              <kbd className="kbd text-2xs">Tab</kbd> {t('commandPalette.category')}
            </span>
          )}
          <span className="flex-1" />
          {!ideaCaptureMode && (
            <span className="text-zinc-500">
              {allItems.length} {allItems.length === 1 ? t('commandPalette.result') : t('commandPalette.results')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default CommandPalette
