import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Command } from 'cmdk'
import Fuse from 'fuse.js'
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
  Calendar,
  GitBranch,
  BarChart3,
  History,
  Sparkles,
  Flag,
  ChefHat,
  PiggyBank,
  Timer,
} from 'lucide-react'

function CommandPalette() {
  const { t, language } = useTranslation()

  const setCommandPaletteOpen = useStore((state) => state.setCommandPaletteOpen)
  const setActiveView = useStore((state) => state.setActiveView)
  const setSelectedProject = useStore((state) => state.setSelectedProject)
  const setQuickAddOpen = useStore((state) => state.setQuickAddOpen)
  const setSettingsOpen = useStore((state) => state.setSettingsOpen)
  const setKeyboardShortcutsOpen = useStore((state) => state.setKeyboardShortcutsOpen)
  const setAboutOpen = useStore((state) => state.setAboutOpen)
  const setFocusProject = useStore((state) => state.setFocusProject)
  const setFocusTask = useStore((state) => state.setFocusTask)

  const projects = useStore((state) => state.projects)
  const tasks = useStore((state) => state.tasks)
  const ideas = useStore((state) => state.ideas)
  const habits = useStore((state) => state.habits)
  const habitLogs = useStore((state) => state.habitLogs)
  const recipes = useStore((state) => state.recipes)
  const notes = useStore((state) => state.notes)
  const calendarEvents = useStore((state) => state.calendarEvents)

  const toggleTask = useStore((state) => state.toggleTask)
  const addIdea = useStore((state) => state.addIdea)
  const quickIdeaMode = useStore((state) => state.quickIdeaMode)
  const setQuickIdeaMode = useStore((state) => state.setQuickIdeaMode)

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [ideaCaptureMode, setIdeaCaptureMode] = useState(false)
  const [recentlyUsed, setRecentlyUsed] = useState([])

  const inputRef = useRef(null)

  // Load recent from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('arnarflow-recent-commands')
    if (stored) {
      try {
        setRecentlyUsed(JSON.parse(stored))
      } catch (e) {}
    }
  }, [])

  // Open directly into idea-capture when Ctrl/Cmd+I triggers palette
  useEffect(() => {
    if (quickIdeaMode) {
      setIdeaCaptureMode(true)
      setQuery('')
      setQuickIdeaMode(false)
    }
  }, [quickIdeaMode, setQuickIdeaMode])

  const trackUsage = (commandId) => {
    const updated = [commandId, ...recentlyUsed.filter((id) => id !== commandId)].slice(0, 6)
    setRecentlyUsed(updated)
    localStorage.setItem('arnarflow-recent-commands', JSON.stringify(updated))
  }

  const getPriorityInfo = (priority) => {
    const info = {
      urgent: { color: '#ef4444', label: language === 'is' ? 'Brýnt' : 'Urgent' },
      high: { color: '#f97316', label: language === 'is' ? 'Hátt' : 'High' },
      medium: { color: '#eab308', label: language === 'is' ? 'Mið' : 'Medium' },
      low: { color: '#22c55e', label: language === 'is' ? 'Lágt' : 'Low' },
    }
    return info[priority] || info.medium
  }

  const baseCommands = useMemo(
    () => [
      {
        id: 'new-task',
        type: 'command',
        group: 'commands',
        icon: Plus,
        label: t('commandPalette.newTask'),
        keywords: 'create add task verkefni',
        action: () => {
          setCommandPaletteOpen(false)
          setQuickAddOpen(true)
        },
      },
      {
        id: 'capture-idea',
        type: 'command',
        group: 'commands',
        icon: Zap,
        label: t('commandPalette.captureIdea'),
        keywords: 'idea hugmynd capture quick',
        action: () => setIdeaCaptureMode(true),
      },
      {
        id: 'start-focus',
        type: 'command',
        group: 'commands',
        icon: Timer,
        label: language === 'is' ? 'Starta focus' : 'Start focus',
        keywords: 'focus pomodoro timer einbeiting',
        action: () => {
          setCommandPaletteOpen(false)
          setActiveView('focus')
          setSelectedProject(null)
        },
      },
      {
        id: 'dashboard',
        type: 'nav',
        group: 'navigation',
        icon: LayoutDashboard,
        label: `${t('commandPalette.goTo')} ${t('nav.dashboard')}`,
        keywords: 'home overview yfirlit',
        action: () => {
          setActiveView('dashboard')
          setSelectedProject(null)
        },
      },
      {
        id: 'ideas',
        type: 'nav',
        group: 'navigation',
        icon: Lightbulb,
        label: `${t('commandPalette.goTo')} ${t('nav.ideas')}`,
        keywords: 'inbox hugmyndir brainstorm',
        action: () => {
          setActiveView('ideas')
          setSelectedProject(null)
        },
      },
      {
        id: 'habits',
        type: 'nav',
        group: 'navigation',
        icon: Target,
        label: `${t('commandPalette.goTo')} ${t('nav.habits')}`,
        keywords: 'venjur routine daily',
        action: () => {
          setActiveView('habits')
          setSelectedProject(null)
        },
      },
      {
        id: 'calendar',
        type: 'nav',
        group: 'navigation',
        icon: Calendar,
        label: `${t('commandPalette.goTo')} ${t('nav.calendar')}`,
        keywords: 'dagatal schedule events',
        action: () => {
          setActiveView('calendar')
          setSelectedProject(null)
        },
      },
      {
        id: 'roadmap',
        type: 'nav',
        group: 'navigation',
        icon: GitBranch,
        label: `${t('commandPalette.goTo')} ${language === 'is' ? 'Tímalína' : 'Roadmap'}`,
        keywords: 'timeline gantt planning',
        action: () => {
          setActiveView('roadmap')
          setSelectedProject(null)
        },
      },
      {
        id: 'focus',
        type: 'nav',
        group: 'navigation',
        icon: Clock,
        label: `${t('commandPalette.goTo')} ${language === 'is' ? 'Einbeiting' : 'Focus'}`,
        keywords: 'pomodoro timer work',
        action: () => {
          setActiveView('focus')
          setSelectedProject(null)
        },
      },
      {
        id: 'notes',
        type: 'nav',
        group: 'navigation',
        icon: FileText,
        label: `${t('commandPalette.goTo')} ${language === 'is' ? 'Glósur' : 'Notes'}`,
        keywords: 'writing documents journal',
        action: () => {
          setActiveView('notes')
          setSelectedProject(null)
        },
      },
      {
        id: 'stats',
        type: 'nav',
        group: 'navigation',
        icon: BarChart3,
        label: `${t('commandPalette.goTo')} ${language === 'is' ? 'Tölfræði' : 'Stats'}`,
        keywords: 'analytics statistics data',
        action: () => {
          setActiveView('stats')
          setSelectedProject(null)
        },
      },
      {
        id: 'recipes',
        type: 'nav',
        group: 'navigation',
        icon: ChefHat,
        label: `${t('commandPalette.goTo')} ${language === 'is' ? 'Uppskriftir' : 'Recipes'}`,
        keywords: 'recipes matreiðsla cooking',
        action: () => {
          setActiveView('recipes')
          setSelectedProject(null)
        },
      },
      {
        id: 'budget',
        type: 'nav',
        group: 'navigation',
        icon: PiggyBank,
        label: `${t('commandPalette.goTo')} ${language === 'is' ? 'Sparnaður' : 'Budget Saver'}`,
        keywords: 'budget sparnaður savings',
        action: () => {
          setActiveView('budget')
          setSelectedProject(null)
        },
      },
      {
        id: 'settings',
        type: 'command',
        group: 'settings',
        icon: Settings,
        label: t('commandPalette.openSettings'),
        keywords: 'preferences stillingar options',
        action: () => {
          setCommandPaletteOpen(false)
          setSettingsOpen(true)
        },
      },
      {
        id: 'shortcuts',
        type: 'command',
        group: 'settings',
        icon: Keyboard,
        label: t('settings.keyboardShortcuts'),
        keywords: 'keys hotkeys flýtilyklar',
        action: () => {
          setCommandPaletteOpen(false)
          setKeyboardShortcutsOpen(true)
        },
      },
      {
        id: 'about',
        type: 'command',
        group: 'settings',
        icon: Info,
        label: t('settings.about'),
        keywords: 'version info um',
        action: () => {
          setCommandPaletteOpen(false)
          setAboutOpen(true)
        },
      },
    ],
    [t, language, setCommandPaletteOpen, setQuickAddOpen, setActiveView, setSelectedProject, setSettingsOpen, setKeyboardShortcutsOpen, setAboutOpen]
  )

  const projectItems = useMemo(() => {
    return (projects || []).map((p) => ({
      id: `project-${p.id}`,
      type: 'project',
      group: 'projects',
      icon: () => <DynamicIcon name={p.icon} size={16} style={{ color: p.color }} />,
      label: `${t('commandPalette.goTo')} ${p.name}`,
      subtitle: p.description,
      keywords: `${p.name} ${p.description || ''}`.toLowerCase(),
      action: () => {
        setActiveView('project')
        setSelectedProject(p.id)
      },
      meta: { color: p.color },
    }))
  }, [projects, t, setActiveView, setSelectedProject])

  const taskItems = useMemo(() => {
    const open = (tasks || []).filter((x) => !x.completed)
    return open.slice(0, 60).map((task) => {
      const project = (projects || []).find((p) => p.id === task.projectId)
      const priorityInfo = getPriorityInfo(task.priority)
      return {
        id: `task-${task.id}`,
        type: 'task',
        group: 'tasks',
        icon: Circle,
        label: task.title,
        subtitle: project?.name || (language === 'is' ? 'Ekkert verkefni' : 'No project'),
        keywords: `${task.title} ${project?.name || ''} ${task.description || ''}`.toLowerCase(),
        meta: {
          priority: task.priority,
          priorityColor: priorityInfo.color,
          projectColor: project?.color,
          taskId: task.id,
          projectId: task.projectId,
        },
        action: () => {
          toggleTask(task.id)
        },
        secondaryAction: () => {
          if (task.projectId) {
            setFocusProject(task.projectId)
            setFocusTask(task.id)
          }
        },
      }
    })
  }, [tasks, projects, language, toggleTask, setFocusProject, setFocusTask])

  const ideaItems = useMemo(() => {
    return (ideas || [])
      .filter((i) => i.status === 'inbox')
      .slice(0, 40)
      .map((idea) => ({
        id: `idea-${idea.id}`,
        type: 'idea',
        group: 'ideas',
        icon: Zap,
        label: idea.title,
        subtitle: idea.type || (language === 'is' ? 'Hugmynd' : 'Idea'),
        keywords: `${idea.title} ${idea.type || ''}`.toLowerCase(),
        action: () => {
          setActiveView('ideas')
          setSelectedProject(null)
        },
      }))
  }, [ideas, language, setActiveView, setSelectedProject])

  const habitItems = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return (habits || []).map((h) => {
      const done = Boolean(habitLogs?.[`${h.id}-${today}`])
      return {
        id: `habit-${h.id}`,
        type: 'habit',
        group: 'habits',
        icon: Target,
        label: language === 'is' ? (h.nameIs || h.name) : (h.name || h.nameIs),
        subtitle: done ? (language === 'is' ? 'Lokið í dag' : 'Done today') : (language === 'is' ? 'Ólokið í dag' : 'Not done today'),
        keywords: `${h.name} ${h.nameIs} ${h.target || ''} ${h.targetIs || ''}`.toLowerCase(),
        action: () => {
          setActiveView('habits')
          setSelectedProject(null)
        },
      }
    })
  }, [habits, habitLogs, language, setActiveView, setSelectedProject])

  const recipeItems = useMemo(() => {
    return (recipes || []).slice(0, 80).map((r) => ({
      id: `recipe-${r.id}`,
      type: 'recipe',
      group: 'recipes',
      icon: ChefHat,
      label: r.name,
      subtitle: r.category || (language === 'is' ? 'Uppskrift' : 'Recipe'),
      keywords: `${r.name} ${r.category || ''} ${(r.tags || []).join(' ')}`.toLowerCase(),
      action: () => {
        setActiveView('recipes')
        setSelectedProject(null)
      },
    }))
  }, [recipes, language, setActiveView, setSelectedProject])

  const noteItems = useMemo(() => {
    const entries = Object.entries(notes || {})
    // Latest first
    entries.sort((a, b) => String(b[0]).localeCompare(String(a[0])))
    return entries.slice(0, 80).map(([date, note]) => {
      const content = String(note?.content || '')
      const firstLine = content.split('\n').find(Boolean) || ''
      const preview = firstLine.trim().slice(0, 60)
      return {
        id: `note-${date}`,
        type: 'note',
        group: 'notes',
        icon: FileText,
        label: language === 'is' ? `Glósa: ${date}` : `Note: ${date}`,
        subtitle: preview,
        keywords: `${date} ${content}`.toLowerCase(),
        action: () => {
          setActiveView('notes')
          setSelectedProject(null)
        },
      }
    })
  }, [notes, language, setActiveView, setSelectedProject])

  // Include calendar events in the search space (so "events" quick stat is discoverable)
  const eventItems = useMemo(() => {
    return (calendarEvents || []).slice(0, 80).map((e) => {
      const title = e?.title || e?.summary || e?.name || (language === 'is' ? 'Viðburður' : 'Event')
      const start = e?.start || e?.startTime || e?.startDate || ''
      const startDate = typeof start === 'string' ? start.slice(0, 10) : ''
      return {
        id: `event-${e?.id || `${title}-${startDate}`}`,
        type: 'event',
        group: 'events',
        icon: Calendar,
        label: title,
        subtitle: startDate,
        keywords: `${title} ${startDate}`.toLowerCase(),
        action: () => {
          setActiveView('calendar')
          setSelectedProject(null)
        },
      }
    })
  }, [calendarEvents, language, setActiveView, setSelectedProject])

  const allItems = useMemo(() => {
    const items = [
      ...baseCommands,
      ...projectItems,
      ...taskItems,
      ...ideaItems,
      ...habitItems,
      ...recipeItems,
      ...noteItems,
      ...eventItems,
    ]

    // category filter
    const filteredByCategory = (() => {
      if (category === 'all') return items
      if (category === 'commands') return items.filter((x) => x.group === 'commands' || x.group === 'navigation' || x.group === 'settings')
      return items.filter((x) => x.group === category)
    })()

    // no query: show recent first
    if (!query.trim()) {
      const recent = recentlyUsed.map((id) => filteredByCategory.find((x) => x.id === id)).filter(Boolean)
      const rest = filteredByCategory.filter((x) => !recentlyUsed.includes(x.id))
      return [...recent, ...rest].slice(0, 20)
    }

    // query: fuse search
    const fuse = new Fuse(filteredByCategory, {
      keys: ['label', 'subtitle', 'keywords'],
      threshold: 0.35,
      ignoreLocation: true,
      minMatchCharLength: 2,
    })

    return fuse.search(query.trim()).map((r) => r.item).slice(0, 20)
  }, [baseCommands, projectItems, taskItems, ideaItems, habitItems, recipeItems, noteItems, eventItems, category, query, recentlyUsed])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const categories = useMemo(
    () => [
      { id: 'all', label: t('commandPalette.all'), icon: Search },
      { id: 'commands', label: t('commandPalette.commands'), icon: ArrowRight },
      { id: 'tasks', label: t('commandPalette.tasks'), icon: CheckSquare },
      { id: 'projects', label: language === 'is' ? 'Verkefni' : 'Projects', icon: LayoutDashboard },
      { id: 'habits', label: t('nav.habits'), icon: Target },
      { id: 'recipes', label: language === 'is' ? 'Uppskriftir' : 'Recipes', icon: ChefHat },
      { id: 'notes', label: language === 'is' ? 'Glósur' : 'Notes', icon: FileText },
      { id: 'ideas', label: t('commandPalette.ideas'), icon: Lightbulb },
    ],
    [t, language]
  )

  const placeholder = ideaCaptureMode
    ? (language === 'is' ? 'Skráðu hugmynd...' : 'Type your idea...')
    : (language === 'is' ? 'Leita eða skipun...' : t('commandPalette.placeholder'))

  const closePalette = () => {
    setCommandPaletteOpen(false)
    setIdeaCaptureMode(false)
    setQuery('')
    setCategory('all')
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-16 z-50 animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closePalette()
      }}
    >
      <Command
        className="w-full max-w-2xl bg-dark-900 rounded-2xl border border-dark-500 shadow-2xl shadow-black/50 overflow-hidden animate-fade-in-scale"
        // we provide our own filtering (Fuse)
        shouldFilter={false}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault()
            closePalette()
            return
          }

          if (ideaCaptureMode && e.key === 'Enter') {
            e.preventDefault()
            if (!query.trim()) return
            addIdea({ title: query.trim(), type: 'other' })
            closePalette()
            return
          }

          if (!ideaCaptureMode && e.key === 'Tab') {
            e.preventDefault()
            const ids = categories.map((c) => c.id)
            const idx = ids.indexOf(category)
            setCategory(ids[(idx + 1) % ids.length])
          }
        }}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-dark-600">
          {ideaCaptureMode ? (
            <Zap size={20} className="text-amber-400 animate-pulse" />
          ) : (
            <Search size={20} className="text-zinc-500" />
          )}

          <Command.Input
            ref={inputRef}
            value={query}
            onValueChange={setQuery}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-lg outline-none placeholder:text-zinc-600"
            autoComplete="off"
            spellCheck={false}
          />

          {ideaCaptureMode ? (
            <button
              onClick={() => {
                if (!query.trim()) return
                addIdea({ title: query.trim(), type: 'other' })
                closePalette()
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
              {language === 'is'
                ? 'Hugmyndafanga virkur — sláðu inn og ýttu á Enter'
                : 'Idea capture mode — type and press Enter'}
            </span>
            <button
              onClick={() => {
                setIdeaCaptureMode(false)
                setQuery('')
              }}
              className="ml-auto text-amber-400 hover:text-amber-300 text-sm"
            >
              {language === 'is' ? 'Hætta við' : 'Cancel'}
            </button>
          </div>
        )}

        {/* Category Tabs */}
        {!ideaCaptureMode && (
          <div className="flex gap-1 px-4 py-2 border-b border-dark-600/50 bg-dark-800/30 flex-wrap">
            {categories.map((cat) => (
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

        <Command.List className="max-h-96 overflow-y-auto py-2">
          <Command.Empty>
            {!ideaCaptureMode && (
              <div className="px-4 py-12 text-center">
                <Search size={32} className="mx-auto text-zinc-700 mb-3" />
                <p className="text-zinc-500">{t('commandPalette.noResults')}</p>
                <p className="text-xs text-zinc-600 mt-1">{t('commandPalette.tryDifferent')}</p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button
                    onClick={() => {
                      closePalette()
                      setQuickAddOpen(true)
                    }}
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
            )}
          </Command.Empty>

          {/* Recent header */}
          {!ideaCaptureMode && !query.trim() && recentlyUsed.length > 0 && (
            <div className="px-5 py-1.5 flex items-center gap-2 text-2xs text-zinc-600 uppercase tracking-wider">
              <History size={10} />
              {language === 'is' ? 'Nýlega notað' : 'Recent'}
            </div>
          )}

          {allItems.map((item) => {
            const Icon = item.icon
            const isTask = item.type === 'task'

            return (
              <Command.Item
                key={item.id}
                value={`${item.label} ${item.subtitle || ''} ${item.keywords || ''}`}
                onSelect={() => {
                  // idea capture mode: Enter captures idea
                  if (ideaCaptureMode) {
                    if (!query.trim()) return
                    addIdea({ title: query.trim(), type: 'other' })
                    closePalette()
                    return
                  }

                  trackUsage(item.id)
                  item.action?.()
                  setCommandPaletteOpen(false)
                }}
                className="mx-2 rounded-xl"
              >
                {({ active }) => (
                  <div
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-all rounded-xl ${
                      active ? 'bg-dark-700' : 'hover:bg-dark-800'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                        active ? 'bg-dark-600 scale-110' : 'bg-dark-800'
                      }`}
                    >
                      {typeof Icon === 'function' ? <Icon /> : <Icon size={16} style={{ color: item.meta?.color }} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${active ? 'text-white' : 'text-zinc-300'}`}>{item.label}</p>
                      {item.subtitle && <p className="text-2xs text-zinc-500 truncate">{item.subtitle}</p>}
                    </div>

                    <div className="flex items-center gap-2">
                      {isTask && item.meta?.priority && item.meta?.priority !== 'medium' && (
                        <Flag size={12} style={{ color: item.meta?.priorityColor }} />
                      )}

                      {isTask && item.secondaryAction && (
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            trackUsage(item.id)
                            item.secondaryAction?.()
                            setCommandPaletteOpen(false)
                          }}
                          className={`p-1.5 rounded transition-colors ${active ? 'hover:bg-accent/20 text-accent' : 'text-zinc-600 hover:text-accent hover:bg-accent/10'}`}
                          title={language === 'is' ? 'Einbeita sér að verkefni' : 'Focus on task'}
                        >
                          <Clock size={14} />
                        </button>
                      )}

                      <ArrowRight size={12} className="text-zinc-600" />
                    </div>
                  </div>
                )}
              </Command.Item>
            )
          })}
        </Command.List>

        {/* Footer */}
        <div className="flex items-center gap-4 px-5 py-3 border-t border-dark-600 text-2xs text-zinc-600 bg-dark-800/30">
          <span className="flex items-center gap-1">
            <kbd className="kbd text-2xs">↑↓</kbd> {t('commandPalette.navigate')}
          </span>
          <span className="flex items-center gap-1">
            <kbd className="kbd text-2xs">↵</kbd> {t('commandPalette.select')}
          </span>
          <span className="flex items-center gap-1">
            <kbd className="kbd text-2xs">Tab</kbd> {t('commandPalette.category')}
          </span>
          <span className="flex-1" />
          {!ideaCaptureMode && (
            <span className="text-zinc-500">
              {allItems.length} {allItems.length === 1 ? t('commandPalette.result') : t('commandPalette.results')}
            </span>
          )}
        </div>
      </Command>

    </div>
  )
}

export default CommandPalette
