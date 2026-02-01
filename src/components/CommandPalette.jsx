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
  Calendar,
  GitBranch,
  BarChart3,
  History,
  Sparkles,
  Tag,
  Flag
} from 'lucide-react'

// Simple fuzzy match that returns match indices
function fuzzyMatch(text, query) {
  const textLower = text.toLowerCase()
  const queryLower = query.toLowerCase()
  
  let queryIndex = 0
  const matchIndices = []
  
  for (let i = 0; i < text.length && queryIndex < query.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      matchIndices.push(i)
      queryIndex++
    }
  }
  
  // All query chars found?
  if (queryIndex !== query.length) return null
  
  // Score: prefer consecutive matches and matches at word starts
  let score = matchIndices.length * 10
  for (let i = 1; i < matchIndices.length; i++) {
    if (matchIndices[i] === matchIndices[i-1] + 1) score += 5 // consecutive
  }
  if (matchIndices[0] === 0) score += 15 // starts with query
  
  return { matchIndices, score }
}

// Highlight matched characters
function HighlightedText({ text, matchIndices }) {
  if (!matchIndices || matchIndices.length === 0) {
    return <span>{text}</span>
  }
  
  const parts = []
  let lastIndex = 0
  
  matchIndices.forEach((index, i) => {
    if (index > lastIndex) {
      parts.push(<span key={`pre-${i}`}>{text.slice(lastIndex, index)}</span>)
    }
    parts.push(
      <span key={`match-${i}`} className="text-accent font-semibold">
        {text[index]}
      </span>
    )
    lastIndex = index + 1
  })
  
  if (lastIndex < text.length) {
    parts.push(<span key="post">{text.slice(lastIndex)}</span>)
  }
  
  return <>{parts}</>
}

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
    addIdea,
    setQuickIdeaMode
  } = useStore()
  
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [category, setCategory] = useState('all')
  const [ideaCaptureMode, setIdeaCaptureMode] = useState(false)
  const [recentlyUsed, setRecentlyUsed] = useState([])
  const inputRef = useRef(null)
  const listRef = useRef(null)

  // Load recent from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('arnarflow-recent-commands')
    if (stored) {
      try {
        setRecentlyUsed(JSON.parse(stored))
      } catch (e) {}
    }
  }, [])

  // Track command usage
  const trackUsage = (commandId) => {
    const updated = [commandId, ...recentlyUsed.filter(id => id !== commandId)].slice(0, 5)
    setRecentlyUsed(updated)
    localStorage.setItem('arnarflow-recent-commands', JSON.stringify(updated))
  }

  // Priority colors for tasks
  const getPriorityInfo = (priority) => {
    const info = {
      urgent: { color: '#ef4444', label: 'Urgent' },
      high: { color: '#f97316', label: 'High' },
      medium: { color: '#eab308', label: 'Medium' },
      low: { color: '#22c55e', label: 'Low' }
    }
    return info[priority] || info.medium
  }

  // Base commands
  const commands = useMemo(() => [
    { 
      id: 'new-task', 
      type: 'command',
      icon: Plus, 
      label: t('commandPalette.newTask'), 
      shortcut: '⌘K', 
      keywords: 'create add task verkefni',
      action: () => { setCommandPaletteOpen(false); setQuickAddOpen(true) } 
    },
    { 
      id: 'capture-idea', 
      type: 'command',
      icon: Zap, 
      label: t('commandPalette.captureIdea'),
      keywords: 'idea hugmynd capture quick',
      shortcut: '⌘I', 
      action: () => setIdeaCaptureMode(true)
    },
    { 
      id: 'dashboard', 
      type: 'command',
      icon: LayoutDashboard, 
      label: `${t('commandPalette.goTo')} ${t('nav.dashboard')}`, 
      shortcut: 'G D',
      keywords: 'home overview yfirlit',
      action: () => { setActiveView('dashboard'); setSelectedProject(null) } 
    },
    { 
      id: 'ideas', 
      type: 'command',
      icon: Lightbulb, 
      label: `${t('commandPalette.goTo')} ${t('nav.ideas')}`, 
      shortcut: 'G I',
      keywords: 'inbox hugmyndir brainstorm',
      action: () => { setActiveView('ideas'); setSelectedProject(null) } 
    },
    { 
      id: 'habits', 
      type: 'command',
      icon: Target, 
      label: `${t('commandPalette.goTo')} ${t('nav.habits')}`, 
      shortcut: 'G H',
      keywords: 'venjur routine daily',
      action: () => { setActiveView('habits'); setSelectedProject(null) } 
    },
    { 
      id: 'calendar', 
      type: 'command',
      icon: Calendar, 
      label: `${t('commandPalette.goTo')} ${t('nav.calendar')}`, 
      shortcut: 'G C',
      keywords: 'dagatal schedule events',
      action: () => { setActiveView('calendar'); setSelectedProject(null) } 
    },
    { 
      id: 'roadmap', 
      type: 'command',
      icon: GitBranch, 
      label: `${t('commandPalette.goTo')} ${language === 'is' ? 'Tímalína' : 'Roadmap'}`, 
      shortcut: 'G R',
      keywords: 'timeline gantt planning',
      action: () => { setActiveView('roadmap'); setSelectedProject(null) } 
    },
    { 
      id: 'focus', 
      type: 'command',
      icon: Clock, 
      label: `${t('commandPalette.goTo')} ${language === 'is' ? 'Einbeiting' : 'Focus'}`, 
      shortcut: 'G F',
      keywords: 'pomodoro timer work',
      action: () => { setActiveView('focus'); setSelectedProject(null) } 
    },
    { 
      id: 'notes', 
      type: 'command',
      icon: FileText, 
      label: `${t('commandPalette.goTo')} ${language === 'is' ? 'Glósur' : 'Notes'}`, 
      shortcut: 'G N',
      keywords: 'writing documents',
      action: () => { setActiveView('notes'); setSelectedProject(null) } 
    },
    { 
      id: 'stats', 
      type: 'command',
      icon: BarChart3, 
      label: `${t('commandPalette.goTo')} ${language === 'is' ? 'Tölfræði' : 'Stats'}`, 
      shortcut: 'G S',
      keywords: 'analytics statistics data',
      action: () => { setActiveView('stats'); setSelectedProject(null) } 
    },
    ...projects.map(p => ({
      id: `project-${p.id}`,
      type: 'command',
      icon: () => <DynamicIcon name={p.icon} size={16} style={{ color: p.color }} />,
      label: `${t('commandPalette.goTo')} ${p.name}`,
      subtitle: p.description,
      keywords: p.name.toLowerCase(),
      action: () => { setActiveView('project'); setSelectedProject(p.id) }
    })),
    { 
      id: 'settings', 
      type: 'command',
      icon: Settings, 
      label: t('commandPalette.openSettings'), 
      shortcut: '⌘,',
      keywords: 'preferences stillingar options',
      action: () => { setCommandPaletteOpen(false); setSettingsOpen(true) } 
    },
    { 
      id: 'shortcuts', 
      type: 'command',
      icon: Keyboard, 
      label: t('settings.keyboardShortcuts'),
      keywords: 'keys hotkeys flýtilyklar',
      shortcut: '?', 
      action: () => { setCommandPaletteOpen(false); setKeyboardShortcutsOpen(true) } 
    },
    { 
      id: 'about', 
      type: 'command',
      icon: Info, 
      label: t('settings.about'),
      keywords: 'version info um',
      action: () => { setCommandPaletteOpen(false); setAboutOpen(true) } 
    },
  ], [t, projects, language])

  // Task items with better info
  const taskItems = useMemo(() => {
    return tasks.filter(t => !t.completed).slice(0, 30).map(task => {
      const project = projects.find(p => p.id === task.projectId)
      const priorityInfo = getPriorityInfo(task.priority)
      return {
        id: `task-${task.id}`,
        type: 'task',
        icon: Circle,
        label: task.title,
        subtitle: project?.name || (language === 'is' ? 'Ekkert verkefni' : 'No project'),
        color: project?.color,
        priority: task.priority,
        priorityColor: priorityInfo.color,
        keywords: `${task.title} ${project?.name || ''} ${task.description || ''}`.toLowerCase(),
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
    return ideas.filter(i => i.status === 'inbox').slice(0, 15).map(idea => ({
      id: `idea-${idea.id}`,
      type: 'idea',
      icon: Zap,
      label: idea.title,
      subtitle: idea.type || (language === 'is' ? 'Hugmynd' : 'Idea'),
      keywords: `${idea.title} ${idea.type || ''}`.toLowerCase(),
      action: () => {
        setActiveView('ideas')
        setCommandPaletteOpen(false)
      }
    }))
  }, [ideas, language])

  // Combined & filtered results with fuzzy search
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
    
    if (!query) {
      // Show recent items first when no query
      const recentItems = recentlyUsed
        .map(id => items.find(item => item.id === id))
        .filter(Boolean)
      
      const otherItems = items.filter(item => !recentlyUsed.includes(item.id))
      
      return [...recentItems, ...otherItems].slice(0, 15)
    }
    
    // Fuzzy search with scoring
    const scored = items
      .map(item => {
        const labelMatch = fuzzyMatch(item.label, query)
        const keywordsMatch = item.keywords ? fuzzyMatch(item.keywords, query) : null
        const subtitleMatch = item.subtitle ? fuzzyMatch(item.subtitle, query) : null
        
        const bestMatch = [labelMatch, keywordsMatch, subtitleMatch]
          .filter(Boolean)
          .sort((a, b) => b.score - a.score)[0]
        
        if (!bestMatch) return null
        
        return {
          ...item,
          matchIndices: labelMatch?.matchIndices || [],
          score: bestMatch.score
        }
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
    
    return scored.slice(0, 15)
  }, [commands, taskItems, ideaItems, query, category, recentlyUsed])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query, category])

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && allItems.length > 0) {
      const selectedEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`)
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }
  }, [selectedIndex])

  const handleKeyDown = (e) => {
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
      const item = allItems[selectedIndex]
      trackUsage(item.id)
      item.action()
      setCommandPaletteOpen(false)
    } else if (e.key === 'Tab') {
      e.preventDefault()
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

  const handleItemClick = (item) => {
    trackUsage(item.id)
    item.action()
    setCommandPaletteOpen(false)
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'task': return <Circle size={12} className="text-blue-400" />
      case 'idea': return <Zap size={12} className="text-amber-400" />
      default: return <ArrowRight size={12} className="text-zinc-500" />
    }
  }

  const categories = [
    { id: 'all', label: t('commandPalette.all'), icon: Search },
    { id: 'commands', label: t('commandPalette.commands'), icon: ArrowRight },
    { id: 'tasks', label: t('commandPalette.tasks'), icon: CheckSquare },
    { id: 'ideas', label: t('commandPalette.ideas'), icon: Lightbulb },
  ]

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-16 z-50 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-2xl bg-dark-900 rounded-2xl border border-dark-500 shadow-2xl shadow-black/50 overflow-hidden animate-fade-in-scale">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-dark-600">
          {ideaCaptureMode ? (
            <Zap size={20} className="text-amber-400 animate-pulse" />
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
            autoComplete="off"
            spellCheck="false"
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
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
            <Sparkles size={14} className="text-amber-400" />
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
            {categories.map(cat => (
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
          <div ref={listRef} className="max-h-96 overflow-y-auto py-2">
            {allItems.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <Search size={32} className="mx-auto text-zinc-700 mb-3" />
                <p className="text-zinc-500">{t('commandPalette.noResults')}</p>
                <p className="text-xs text-zinc-600 mt-1">{t('commandPalette.tryDifferent')}</p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button
                    onClick={() => { setCommandPaletteOpen(false); setQuickAddOpen(true) }}
                    className="px-3 py-1.5 bg-accent/20 hover:bg-accent/30 text-accent text-sm rounded-lg transition-colors"
                  >
                    + {language === 'is' ? 'Nýtt verkefni' : 'New task'}
                  </button>
                  <button
                    onClick={() => setIdeaCaptureMode(true)}
                    className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-sm rounded-lg transition-colors"
                  >
                    ⚡ {language === 'is' ? 'Fanga hugmynd' : 'Capture idea'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Recent header when showing recent items */}
                {!query && recentlyUsed.length > 0 && (
                  <div className="px-5 py-1.5 flex items-center gap-2 text-2xs text-zinc-600 uppercase tracking-wider">
                    <History size={10} />
                    {language === 'is' ? 'Nýlega notað' : 'Recent'}
                  </div>
                )}
                
                <ul>
                  {allItems.map((item, index) => {
                    const Icon = item.icon
                    const isSelected = index === selectedIndex
                    const isRecent = !query && recentlyUsed.includes(item.id) && index < recentlyUsed.length
                    
                    return (
                      <li key={item.id} data-index={index}>
                        <button
                          onClick={() => handleItemClick(item)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-all ${
                            isSelected 
                              ? 'bg-dark-700' 
                              : 'hover:bg-dark-800'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                            isSelected ? 'bg-dark-600 scale-110' : 'bg-dark-800'
                          }`}>
                            {typeof Icon === 'function' ? <Icon /> : <Icon size={16} style={{ color: item.color }} />}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm truncate ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                              {item.matchIndices ? (
                                <HighlightedText text={item.label} matchIndices={item.matchIndices} />
                              ) : (
                                item.label
                              )}
                            </p>
                            {item.subtitle && (
                              <p className="text-2xs text-zinc-500 truncate">{item.subtitle}</p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {/* Priority indicator for tasks */}
                            {item.type === 'task' && item.priority && item.priority !== 'medium' && (
                              <Flag size={12} style={{ color: item.priorityColor }} />
                            )}
                            
                            {/* Recent indicator */}
                            {isRecent && (
                              <History size={12} className="text-zinc-600" />
                            )}
                            
                            {getTypeIcon(item.type)}
                            
                            {item.shortcut && (
                              <kbd className="kbd">{item.shortcut}</kbd>
                            )}
                            
                            {/* Focus button for tasks */}
                            {item.type === 'task' && item.secondaryAction && isSelected && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  trackUsage(item.id)
                                  item.secondaryAction()
                                }}
                                className="p-1.5 hover:bg-accent/20 rounded text-accent"
                                title={language === 'is' ? 'Einbeita sér að verkefni' : 'Focus on task'}
                              >
                                <Clock size={14} />
                              </button>
                            )}
                          </div>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </>
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
