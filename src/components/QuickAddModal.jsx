import React, { useState, useRef, useEffect, useCallback } from 'react'
import useStore from '../store/useStore'
import { useTranslation } from '../i18n/useTranslation'
import DynamicIcon from './Icons'
import TagBadge from './TagBadge'
import { format, addDays, addWeeks, nextMonday, nextFriday } from 'date-fns'
import { 
  X, 
  Plus, 
  Lightbulb, 
  CheckSquare,
  Smartphone,
  Sparkles,
  DollarSign,
  FileText,
  Calendar,
  Clock,
  Flag,
  ChevronDown,
  ChevronUp,
  Tag,
  AlignLeft,
  Folder,
  Zap,
  Hash
} from 'lucide-react'

const IDEA_TYPES = [
  { id: 'app', icon: Smartphone, label: 'App', labelIs: 'Forrit' },
  { id: 'feature', icon: Sparkles, label: 'Feature', labelIs: 'Eiginleiki' },
  { id: 'saas', icon: DollarSign, label: 'SaaS', labelIs: 'SaaS' },
  { id: 'content', icon: FileText, label: 'Content', labelIs: 'Efni' },
  { id: 'other', icon: Lightbulb, label: 'Other', labelIs: 'Annað' },
]

const PRIORITIES = [
  { id: 'urgent', label: 'Urgent', labelIs: 'Áríðandi', color: '#ef4444', key: '1' },
  { id: 'high', label: 'High', labelIs: 'Hár', color: '#f97316', key: '2' },
  { id: 'medium', label: 'Medium', labelIs: 'Meðal', color: '#eab308', key: '3' },
  { id: 'low', label: 'Low', labelIs: 'Lágur', color: '#22c55e', key: '4' },
]

// Quick date options
const getQuickDates = (t, language) => [
  { label: t('time.today'), labelShort: language === 'is' ? 'Í dag' : 'Today', value: format(new Date(), 'yyyy-MM-dd'), key: 't' },
  { label: t('time.tomorrow'), labelShort: language === 'is' ? 'Á morgun' : 'Tmrw', value: format(addDays(new Date(), 1), 'yyyy-MM-dd'), key: 'o' },
  { label: language === 'is' ? 'Mánudagur' : 'Monday', labelShort: language === 'is' ? 'Mán' : 'Mon', value: format(nextMonday(new Date()), 'yyyy-MM-dd'), key: 'm' },
  { label: language === 'is' ? 'Föstudagur' : 'Friday', labelShort: language === 'is' ? 'Fös' : 'Fri', value: format(nextFriday(new Date()), 'yyyy-MM-dd'), key: 'f' },
  { label: language === 'is' ? 'Eftir viku' : 'Next Week', labelShort: language === 'is' ? '+1v' : '+1w', value: format(addWeeks(new Date(), 1), 'yyyy-MM-dd'), key: 'w' },
]

function QuickAddModal() {
  const { t, language } = useTranslation()
  const { 
    setQuickAddOpen, 
    addTask, 
    addIdea, 
    projects,
    tags,
    quickIdeaMode,
    setQuickIdeaMode
  } = useStore()

  const QUICK_DATES = getQuickDates(t, language)
  
  const [mode, setMode] = useState(quickIdeaMode ? 'idea' : 'task')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [showDescription, setShowDescription] = useState(false)
  const [projectId, setProjectId] = useState(projects[0]?.id || '')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState(null)
  const [customDate, setCustomDate] = useState('')
  const [estimate, setEstimate] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [showTagPicker, setShowTagPicker] = useState(false)
  const [ideaType, setIdeaType] = useState('app')
  
  // Dropdown states
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false)
  const [showDateDropdown, setShowDateDropdown] = useState(false)
  
  const inputRef = useRef(null)
  const descriptionRef = useRef(null)
  const projectDropdownRef = useRef(null)
  const priorityDropdownRef = useRef(null)
  const dateDropdownRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
    return () => setQuickIdeaMode(false)
  }, [])

  useEffect(() => {
    if (quickIdeaMode) setMode('idea')
  }, [quickIdeaMode])

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(e.target)) {
        setShowProjectDropdown(false)
      }
      if (priorityDropdownRef.current && !priorityDropdownRef.current.contains(e.target)) {
        setShowPriorityDropdown(false)
      }
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(e.target)) {
        setShowDateDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = useCallback((e) => {
    e?.preventDefault()
    if (!title.trim()) return

    if (mode === 'task') {
      addTask({
        title: title.trim(),
        description: description.trim() || null,
        projectId,
        priority,
        dueDate: dueDate || (customDate || null),
        estimate: estimate ? parseInt(estimate) : null,
        tags: selectedTags
      })
    } else {
      addIdea({
        title: title.trim(),
        type: ideaType
      })
    }

    setTitle('')
    setDescription('')
    setSelectedTags([])
    setQuickAddOpen(false)
  }, [title, description, mode, projectId, priority, dueDate, customDate, estimate, selectedTags, ideaType])

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setQuickAddOpen(false)
    }
  }

  const handleKeyDown = useCallback((e) => {
    // Submit on Enter (without shift)
    if (e.key === 'Enter' && !e.shiftKey && !showDescription) {
      e.preventDefault()
      handleSubmit(e)
      return
    }
    
    // Ctrl+Enter to submit from anywhere
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmit(e)
      return
    }

    // Tab to switch mode
    if (e.key === 'Tab' && !e.shiftKey && !showProjectDropdown && !showPriorityDropdown && !showDateDropdown && !showTagPicker) {
      e.preventDefault()
      setMode(mode === 'task' ? 'idea' : 'task')
      return
    }

    // Only handle shortcuts when input is focused
    if (document.activeElement !== inputRef.current) return

    // Alt + number for priority (1-4)
    if (e.altKey && ['1', '2', '3', '4'].includes(e.key)) {
      e.preventDefault()
      const priorityMap = { '1': 'urgent', '2': 'high', '3': 'medium', '4': 'low' }
      setPriority(priorityMap[e.key])
      return
    }

    // Alt + letter for quick dates
    if (e.altKey) {
      const quickDate = QUICK_DATES.find(d => d.key === e.key.toLowerCase())
      if (quickDate) {
        e.preventDefault()
        setDueDate(dueDate === quickDate.value ? null : quickDate.value)
        return
      }
    }

    // Alt + D for description toggle
    if (e.altKey && e.key.toLowerCase() === 'd') {
      e.preventDefault()
      setShowDescription(!showDescription)
      setTimeout(() => descriptionRef.current?.focus(), 50)
      return
    }

    // Alt + P for project dropdown
    if (e.altKey && e.key.toLowerCase() === 'p') {
      e.preventDefault()
      setShowProjectDropdown(true)
      return
    }

    // Alt + G for tags
    if (e.altKey && e.key.toLowerCase() === 'g') {
      e.preventDefault()
      setShowTagPicker(!showTagPicker)
      return
    }

    // Arrow keys for project when dropdown is open
    if (showProjectDropdown && ['ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault()
      const currentIdx = projects.findIndex(p => p.id === projectId)
      if (e.key === 'ArrowUp') {
        setProjectId(projects[(currentIdx - 1 + projects.length) % projects.length].id)
      } else {
        setProjectId(projects[(currentIdx + 1) % projects.length].id)
      }
    }
  }, [mode, handleSubmit, showDescription, showProjectDropdown, showPriorityDropdown, showDateDropdown, showTagPicker, dueDate, projectId, projects, QUICK_DATES])

  const toggleTag = (tagId) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    )
  }

  const selectedProject = projects.find(p => p.id === projectId)
  const selectedPriority = PRIORITIES.find(p => p.id === priority)

  const getPriorityLabel = (p) => language === 'is' ? p.labelIs : p.label

  const formatDateLabel = () => {
    if (dueDate) {
      const qd = QUICK_DATES.find(d => d.value === dueDate)
      if (qd) return qd.labelShort
      return format(new Date(dueDate), 'MMM d')
    }
    if (customDate) return format(new Date(customDate), 'MMM d')
    return language === 'is' ? 'Dagsetning' : 'Due date'
  }

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20 z-50 animate-fade-in"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <div className="w-full max-w-xl bg-dark-900 rounded-2xl border border-dark-500 shadow-2xl shadow-black/50 overflow-hidden animate-fade-in-scale">
        {/* Header with mode toggle */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-dark-600">
          <div className="flex gap-1 bg-dark-800 p-1 rounded-lg">
            <button
              onClick={() => setMode('task')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                mode === 'task' 
                  ? 'bg-accent text-white shadow-sm' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <CheckSquare size={14} />
              {t('tasks.title')}
            </button>
            <button
              onClick={() => setMode('idea')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                mode === 'idea' 
                  ? 'bg-amber-500 text-white shadow-sm' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Lightbulb size={14} />
              {language === 'is' ? 'Hugmynd' : 'Idea'}
            </button>
          </div>
          <button
            onClick={() => setQuickAddOpen(false)}
            className="p-2 text-zinc-500 hover:text-white hover:bg-dark-700 rounded-lg transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4">
          {/* Main Title Input */}
          <div className="relative mb-3">
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={mode === 'task' 
                ? (language === 'is' ? 'Hvað þarf að gera?' : 'What needs to be done?')
                : (language === 'is' ? 'Fanga hugmynd...' : 'Capture your idea...')
              }
              className="w-full bg-transparent text-lg font-medium outline-none placeholder:text-zinc-600"
              autoFocus
            />
          </div>

          {mode === 'task' ? (
            <>
              {/* Description toggle & input */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowDescription(!showDescription)
                    setTimeout(() => descriptionRef.current?.focus(), 50)
                  }}
                  className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-2"
                >
                  <AlignLeft size={12} />
                  {showDescription ? (language === 'is' ? 'Fela lýsingu' : 'Hide description') : (language === 'is' ? 'Bæta við lýsingu' : 'Add description')}
                  {showDescription ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
                {showDescription && (
                  <textarea
                    ref={descriptionRef}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={language === 'is' ? 'Bættu við nánari upplýsingum...' : 'Add more details...'}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent resize-none transition-colors"
                    rows={3}
                  />
                )}
              </div>

              {/* Quick Properties Row */}
              <div className="flex flex-wrap gap-2 mb-4">
                {/* Project Selector Dropdown */}
                <div ref={projectDropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-dark-700 hover:bg-dark-600 rounded-lg text-sm transition-colors border border-transparent hover:border-dark-500"
                    style={{ color: selectedProject?.color }}
                  >
                    <DynamicIcon name={selectedProject?.icon} size={12} />
                    <span className="max-w-[100px] truncate">{selectedProject?.name}</span>
                    <ChevronDown size={12} className="text-zinc-500" />
                  </button>
                  {showProjectDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-dark-800 border border-dark-500 rounded-lg shadow-xl py-1 z-10 min-w-[180px]">
                      {projects.map((project) => (
                        <button
                          key={project.id}
                          type="button"
                          onClick={() => {
                            setProjectId(project.id)
                            setShowProjectDropdown(false)
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-dark-700 transition-colors ${
                            projectId === project.id ? 'bg-dark-700' : ''
                          }`}
                        >
                          <DynamicIcon name={project.icon} size={14} style={{ color: project.color }} />
                          <span style={{ color: project.color }}>{project.name}</span>
                          {projectId === project.id && <span className="ml-auto text-accent">✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Priority Selector Dropdown */}
                <div ref={priorityDropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-dark-700 hover:bg-dark-600 rounded-lg text-sm transition-colors border border-transparent hover:border-dark-500"
                  >
                    <Flag size={12} style={{ color: selectedPriority?.color }} />
                    <span style={{ color: selectedPriority?.color }}>{getPriorityLabel(selectedPriority)}</span>
                    <ChevronDown size={12} className="text-zinc-500" />
                  </button>
                  {showPriorityDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-dark-800 border border-dark-500 rounded-lg shadow-xl py-1 z-10 min-w-[140px]">
                      {PRIORITIES.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setPriority(p.id)
                            setShowPriorityDropdown(false)
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-dark-700 transition-colors ${
                            priority === p.id ? 'bg-dark-700' : ''
                          }`}
                        >
                          <Flag size={14} style={{ color: p.color }} />
                          <span style={{ color: p.color }}>{getPriorityLabel(p)}</span>
                          <span className="ml-auto text-2xs text-zinc-500">Alt+{p.key}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Due Date Dropdown */}
                <div ref={dateDropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setShowDateDropdown(!showDateDropdown)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-colors border border-transparent hover:border-dark-500 ${
                      dueDate ? 'bg-accent/20 text-accent' : 'bg-dark-700 text-zinc-400 hover:bg-dark-600'
                    }`}
                  >
                    <Calendar size={12} />
                    <span>{formatDateLabel()}</span>
                    <ChevronDown size={12} className="opacity-60" />
                  </button>
                  {showDateDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-dark-800 border border-dark-500 rounded-lg shadow-xl py-1 z-10 min-w-[180px]">
                      {QUICK_DATES.map((qd) => (
                        <button
                          key={qd.value}
                          type="button"
                          onClick={() => {
                            setDueDate(dueDate === qd.value ? null : qd.value)
                            setCustomDate('')
                            setShowDateDropdown(false)
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-dark-700 transition-colors ${
                            dueDate === qd.value ? 'bg-accent/20 text-accent' : 'text-zinc-300'
                          }`}
                        >
                          <Calendar size={14} className="opacity-60" />
                          <span>{qd.label}</span>
                          <span className="ml-auto text-2xs text-zinc-500">Alt+{qd.key.toUpperCase()}</span>
                        </button>
                      ))}
                      <div className="border-t border-dark-600 mt-1 pt-1 px-2 pb-2">
                        <input
                          type="date"
                          value={customDate}
                          onChange={(e) => {
                            setCustomDate(e.target.value)
                            setDueDate(null)
                          }}
                          className="w-full bg-dark-700 border border-dark-500 rounded px-2 py-1.5 text-sm outline-none focus:border-accent"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Time Estimate */}
                <div className="flex items-center gap-1 px-2.5 py-1.5 bg-dark-700 hover:bg-dark-600 rounded-lg border border-transparent hover:border-dark-500 transition-colors">
                  <Clock size={12} className="text-zinc-500" />
                  <input
                    type="number"
                    value={estimate}
                    onChange={(e) => setEstimate(e.target.value)}
                    placeholder={language === 'is' ? 'mín' : 'min'}
                    className="w-10 bg-transparent text-sm outline-none text-center placeholder:text-zinc-600"
                    min="0"
                    max="999"
                  />
                </div>

                {/* Tags Button */}
                <button
                  type="button"
                  onClick={() => setShowTagPicker(!showTagPicker)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-colors border border-transparent hover:border-dark-500 ${
                    selectedTags.length > 0 ? 'bg-accent/20 text-accent' : 'bg-dark-700 text-zinc-400 hover:bg-dark-600'
                  }`}
                >
                  <Tag size={12} />
                  {selectedTags.length > 0 ? `${selectedTags.length}` : (language === 'is' ? 'Merki' : 'Tags')}
                </button>
              </div>

              {/* Tags Picker */}
              {showTagPicker && (
                <div className="mb-4 p-3 bg-dark-800 rounded-lg border border-dark-600">
                  <div className="text-xs text-zinc-500 mb-2">{language === 'is' ? 'Velja merki' : 'Select tags'}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`transition-all ${selectedTags.includes(tag.id) ? 'ring-2 ring-white/30' : 'opacity-70 hover:opacity-100'}`}
                      >
                        <TagBadge tag={tag} size="sm" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Tags Display */}
              {selectedTags.length > 0 && !showTagPicker && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {selectedTags.map((tagId) => {
                    const tag = tags.find(t => t.id === tagId)
                    if (!tag) return null
                    return (
                      <button
                        key={tagId}
                        type="button"
                        onClick={() => toggleTag(tagId)}
                        className="flex items-center gap-1 group"
                      >
                        <TagBadge tag={tag} size="sm" />
                        <X size={12} className="text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    )
                  })}
                </div>
              )}
            </>
          ) : (
            /* Idea Type Selector */
            <div className="mb-4">
              <div className="text-xs text-zinc-500 mb-2">{language === 'is' ? 'Tegund hugmyndar' : 'Idea type'}</div>
              <div className="flex gap-1.5 flex-wrap">
                {IDEA_TYPES.map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setIdeaType(type.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all ${
                      ideaType === type.id
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-dark-700 text-zinc-400 hover:bg-dark-600 hover:text-zinc-200'
                    }`}
                  >
                    <type.icon size={14} />
                    {language === 'is' ? type.labelIs : type.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!title.trim()}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
              mode === 'task'
                ? 'bg-accent hover:bg-accent-light active:scale-[0.99]'
                : 'bg-amber-500 hover:bg-amber-400 active:scale-[0.99]'
            }`}
          >
            <Plus size={18} />
            {mode === 'task' 
              ? (language === 'is' ? 'Bæta við verkefni' : 'Add Task')
              : (language === 'is' ? 'Fanga hugmynd' : 'Capture Idea')
            }
          </button>
        </form>

        {/* Keyboard Shortcuts Footer */}
        <div className="px-4 pb-3 pt-1 border-t border-dark-700 flex items-center justify-center gap-4 text-2xs text-zinc-600">
          <span className="flex items-center gap-1"><kbd className="kbd">↵</kbd> {language === 'is' ? 'Vista' : 'Save'}</span>
          <span className="flex items-center gap-1"><kbd className="kbd">Esc</kbd> {language === 'is' ? 'Loka' : 'Close'}</span>
          <span className="flex items-center gap-1"><kbd className="kbd">Tab</kbd> {language === 'is' ? 'Skipta' : 'Switch'}</span>
          <span className="flex items-center gap-1"><kbd className="kbd">Alt</kbd>+<kbd className="kbd">1-4</kbd> {language === 'is' ? 'Forgangur' : 'Priority'}</span>
        </div>
      </div>
    </div>
  )
}

export default QuickAddModal
