import React, { useState, useRef, useEffect } from 'react'
import useStore from '../store/useStore'
import { useTranslation } from '../i18n/useTranslation'
import DynamicIcon from './Icons'
import { format, addDays } from 'date-fns'
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
  Tag,
  ChevronDown,
  ChevronUp,
  AlignLeft,
  ListTodo,
  Check
} from 'lucide-react'

const IDEA_TYPES = [
  { id: 'app', icon: Smartphone, label: 'App', labelIs: 'Forrit' },
  { id: 'feature', icon: Sparkles, label: 'Feature', labelIs: 'Eiginleiki' },
  { id: 'saas', icon: DollarSign, label: 'SaaS', labelIs: 'SaaS' },
  { id: 'content', icon: FileText, label: 'Content', labelIs: 'Efni' },
  { id: 'other', icon: Lightbulb, label: 'Other', labelIs: 'Annað' },
]

const PRIORITIES = [
  { id: 'urgent', label: 'Urgent', labelIs: 'Áríðandi', color: '#ef4444', bgColor: 'bg-red-500/10', icon: '!!' },
  { id: 'high', label: 'High', labelIs: 'Hár', color: '#f97316', bgColor: 'bg-orange-500/10', icon: '!' },
  { id: 'medium', label: 'Medium', labelIs: 'Meðal', color: '#eab308', bgColor: 'bg-yellow-500/10', icon: '-' },
  { id: 'low', label: 'Low', labelIs: 'Lágur', color: '#22c55e', bgColor: 'bg-green-500/10', icon: '~' },
]

const TAG_COLORS = {
  red: '#ef4444',
  orange: '#f97316',
  amber: '#f59e0b',
  yellow: '#eab308',
  lime: '#84cc16',
  green: '#22c55e',
  emerald: '#10b981',
  teal: '#14b8a6',
  cyan: '#06b6d4',
  sky: '#0ea5e9',
  blue: '#3b82f6',
  indigo: '#6366f1',
  violet: '#8b5cf6',
  purple: '#a855f7',
  fuchsia: '#d946ef',
  pink: '#ec4899',
  rose: '#f43f5e',
  slate: '#64748b',
}

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

  const QUICK_DATES = [
    { label: t('time.today'), labelIs: 'Í dag', value: format(new Date(), 'yyyy-MM-dd') },
    { label: t('time.tomorrow'), labelIs: 'Á morgun', value: format(addDays(new Date(), 1), 'yyyy-MM-dd') },
    { label: language === 'is' ? 'Næsta viku' : 'Next Week', value: format(addDays(new Date(), 7), 'yyyy-MM-dd') },
  ]
  
  const [mode, setMode] = useState(quickIdeaMode ? 'idea' : 'task')
  const [text, setText] = useState('')
  const [description, setDescription] = useState('')
  const [projectId, setProjectId] = useState(projects[0]?.id || '')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState(null)
  const [customDate, setCustomDate] = useState('')
  const [estimate, setEstimate] = useState('')
  const [ideaType, setIdeaType] = useState('app')
  const [selectedTags, setSelectedTags] = useState([])
  const [subtasks, setSubtasks] = useState([])
  const [newSubtask, setNewSubtask] = useState('')
  
  // Expanded sections
  const [showDescription, setShowDescription] = useState(false)
  const [showMoreOptions, setShowMoreOptions] = useState(false)
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false)
  const [showTagsDropdown, setShowTagsDropdown] = useState(false)
  
  const inputRef = useRef(null)
  const projectDropdownRef = useRef(null)
  const priorityDropdownRef = useRef(null)
  const tagsDropdownRef = useRef(null)

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
      if (tagsDropdownRef.current && !tagsDropdownRef.current.contains(e.target)) {
        setShowTagsDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim()) return

    if (mode === 'task') {
      const finalDueDate = dueDate || (customDate ? customDate : null)
      addTask({
        title: text.trim(),
        description: description.trim() || null,
        projectId,
        priority,
        dueDate: finalDueDate,
        estimate: estimate ? parseInt(estimate) : null,
        tags: selectedTags,
        subtasks: subtasks.length > 0 ? subtasks.map(s => ({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          title: s,
          completed: false,
          createdAt: new Date().toISOString()
        })) : undefined
      })
    } else {
      addIdea({
        title: text.trim(),
        type: ideaType
      })
    }

    setText('')
    setDescription('')
    setQuickAddOpen(false)
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setQuickAddOpen(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !showDescription) {
      handleSubmit(e)
    }
    if (e.key === 'Tab' && !e.shiftKey && e.target === inputRef.current) {
      e.preventDefault()
      setMode(mode === 'task' ? 'idea' : 'task')
    }
    if (e.key === 'Escape') {
      setQuickAddOpen(false)
    }
  }

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, newSubtask.trim()])
      setNewSubtask('')
    }
  }

  const handleSubtaskKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSubtask()
    }
  }

  const removeSubtask = (index) => {
    setSubtasks(subtasks.filter((_, i) => i !== index))
  }

  const toggleTag = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId))
    } else {
      setSelectedTags([...selectedTags, tagId])
    }
  }

  const selectedProject = projects.find(p => p.id === projectId)
  const selectedPriority = PRIORITIES.find(p => p.id === priority)

  const getPriorityLabel = (p) => language === 'is' ? p.labelIs : p.label
  const getTagLabel = (tag) => language === 'is' ? (tag.nameIs || tag.name) : tag.name

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-16 z-50 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-xl bg-dark-900 rounded-2xl border border-dark-500 shadow-2xl shadow-black/50 overflow-hidden animate-fade-in-scale">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-dark-600">
          <div className="flex gap-1">
            <button
              onClick={() => setMode('task')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'task' 
                  ? 'bg-accent text-white' 
                  : 'text-zinc-400 hover:bg-dark-700 hover:text-white'
              }`}
            >
              <CheckSquare size={14} />
              {t('tasks.title')}
            </button>
            <button
              onClick={() => setMode('idea')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'idea' 
                  ? 'bg-amber-500 text-white' 
                  : 'text-zinc-400 hover:bg-dark-700 hover:text-white'
              }`}
            >
              <Lightbulb size={14} />
              {language === 'is' ? 'Hugmynd' : 'Idea'}
            </button>
          </div>
          <button
            onClick={() => setQuickAddOpen(false)}
            className="p-1.5 text-zinc-500 hover:text-white hover:bg-dark-700 rounded-lg transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4">
          {/* Main Input */}
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={mode === 'task' 
              ? (language === 'is' ? 'Hvað þarf að gera?' : 'What needs to be done?')
              : (language === 'is' ? 'Fanga hugmynd...' : 'Capture your idea...')
            }
            className="w-full bg-transparent text-lg font-medium outline-none placeholder:text-zinc-600 mb-3"
            autoFocus
          />

          {mode === 'task' ? (
            <>
              {/* Description Toggle & Input */}
              <div className="mb-3">
                <button
                  type="button"
                  onClick={() => setShowDescription(!showDescription)}
                  className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-2"
                >
                  <AlignLeft size={12} />
                  {showDescription 
                    ? (language === 'is' ? 'Fela lýsingu' : 'Hide description')
                    : (language === 'is' ? 'Bæta við lýsingu' : 'Add description')
                  }
                  {showDescription ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
                {showDescription && (
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={language === 'is' ? 'Bæta við nánari lýsingu...' : 'Add more details...'}
                    className="w-full bg-dark-700 rounded-lg px-3 py-2 text-sm outline-none placeholder:text-zinc-600 resize-none min-h-[60px] border border-dark-500 focus:border-accent transition-colors"
                    rows={2}
                  />
                )}
              </div>

              {/* Primary Options Row */}
              <div className="flex flex-wrap gap-2 mb-3">
                {/* Project Dropdown */}
                <div className="relative" ref={projectDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-dark-700 hover:bg-dark-600 rounded-lg text-sm transition-colors border border-transparent hover:border-dark-500"
                  >
                    <DynamicIcon name={selectedProject?.icon} size={12} style={{ color: selectedProject?.color }} />
                    <span style={{ color: selectedProject?.color }}>{selectedProject?.name}</span>
                    <ChevronDown size={12} className="text-zinc-500" />
                  </button>
                  {showProjectDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-dark-800 border border-dark-500 rounded-lg shadow-xl z-10 min-w-[180px] py-1 max-h-[200px] overflow-y-auto">
                      {projects.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => { setProjectId(p.id); setShowProjectDropdown(false) }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-dark-700 transition-colors ${
                            projectId === p.id ? 'bg-dark-700' : ''
                          }`}
                        >
                          <DynamicIcon name={p.icon} size={14} style={{ color: p.color }} />
                          <span style={{ color: p.color }}>{p.name}</span>
                          {projectId === p.id && <Check size={12} className="ml-auto text-accent" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Priority Dropdown */}
                <div className="relative" ref={priorityDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-colors border border-transparent hover:border-dark-500 ${selectedPriority?.bgColor} hover:opacity-90`}
                  >
                    <Flag size={12} style={{ color: selectedPriority?.color }} />
                    <span style={{ color: selectedPriority?.color }}>
                      {getPriorityLabel(selectedPriority)}
                    </span>
                    <ChevronDown size={12} className="text-zinc-500" />
                  </button>
                  {showPriorityDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-dark-800 border border-dark-500 rounded-lg shadow-xl z-10 min-w-[140px] py-1">
                      {PRIORITIES.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => { setPriority(p.id); setShowPriorityDropdown(false) }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-dark-700 transition-colors ${
                            priority === p.id ? 'bg-dark-700' : ''
                          }`}
                        >
                          <Flag size={12} style={{ color: p.color }} />
                          <span style={{ color: p.color }}>{getPriorityLabel(p)}</span>
                          {priority === p.id && <Check size={12} className="ml-auto text-accent" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tags Dropdown */}
                <div className="relative" ref={tagsDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowTagsDropdown(!showTagsDropdown)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 bg-dark-700 hover:bg-dark-600 rounded-lg text-sm transition-colors border border-transparent hover:border-dark-500 ${
                      selectedTags.length > 0 ? 'ring-1 ring-accent/30' : ''
                    }`}
                  >
                    <Tag size={12} className="text-zinc-400" />
                    <span className="text-zinc-400">
                      {selectedTags.length > 0 
                        ? `${selectedTags.length} ${language === 'is' ? 'merki' : 'tag'}${selectedTags.length > 1 ? 's' : ''}`
                        : (language === 'is' ? 'Merki' : 'Tags')
                      }
                    </span>
                    <ChevronDown size={12} className="text-zinc-500" />
                  </button>
                  {showTagsDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-dark-800 border border-dark-500 rounded-lg shadow-xl z-10 min-w-[160px] py-1 max-h-[200px] overflow-y-auto">
                      {tags.map(tag => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleTag(tag.id)}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-dark-700 transition-colors ${
                            selectedTags.includes(tag.id) ? 'bg-dark-700' : ''
                          }`}
                        >
                          <span 
                            className="w-2.5 h-2.5 rounded-full" 
                            style={{ backgroundColor: TAG_COLORS[tag.color] || '#64748b' }}
                          />
                          <span className="text-zinc-300">{getTagLabel(tag)}</span>
                          {selectedTags.includes(tag.id) && <Check size={12} className="ml-auto text-accent" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Due Date Options */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Calendar size={12} className="text-zinc-500" />
                {QUICK_DATES.map(qd => (
                  <button
                    key={qd.label}
                    type="button"
                    onClick={() => { setDueDate(dueDate === qd.value ? null : qd.value); setCustomDate('') }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      dueDate === qd.value
                        ? 'bg-accent text-white'
                        : 'bg-dark-700 text-zinc-400 hover:bg-dark-600 hover:text-zinc-300'
                    }`}
                  >
                    {language === 'is' ? qd.labelIs : qd.label}
                  </button>
                ))}
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => { setCustomDate(e.target.value); setDueDate(null) }}
                  className="px-2 py-1 bg-dark-700 rounded-lg text-xs text-zinc-400 outline-none border border-transparent focus:border-accent transition-colors cursor-pointer"
                  style={{ colorScheme: 'dark' }}
                />
              </div>

              {/* More Options Toggle */}
              <button
                type="button"
                onClick={() => setShowMoreOptions(!showMoreOptions)}
                className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-3"
              >
                {showMoreOptions ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {showMoreOptions 
                  ? (language === 'is' ? 'Færri valkostir' : 'Fewer options')
                  : (language === 'is' ? 'Fleiri valkostir' : 'More options')
                }
              </button>

              {showMoreOptions && (
                <div className="space-y-3 mb-3 p-3 bg-dark-800/50 rounded-lg border border-dark-600">
                  {/* Time Estimate */}
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-zinc-500" />
                    <span className="text-xs text-zinc-500 w-20">{language === 'is' ? 'Tímaáætlun' : 'Estimate'}</span>
                    <input
                      type="number"
                      value={estimate}
                      onChange={(e) => setEstimate(e.target.value)}
                      placeholder={language === 'is' ? 'mínútur' : 'minutes'}
                      className="flex-1 px-2 py-1 bg-dark-700 rounded text-sm outline-none border border-transparent focus:border-accent transition-colors"
                      min="1"
                    />
                  </div>

                  {/* Subtasks */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ListTodo size={14} className="text-zinc-500" />
                      <span className="text-xs text-zinc-500">{language === 'is' ? 'Undirverkefni' : 'Subtasks'}</span>
                    </div>
                    {subtasks.length > 0 && (
                      <div className="space-y-1 mb-2">
                        {subtasks.map((st, idx) => (
                          <div key={idx} className="flex items-center gap-2 pl-5">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                            <span className="flex-1 text-sm text-zinc-300">{st}</span>
                            <button
                              type="button"
                              onClick={() => removeSubtask(idx)}
                              className="p-0.5 text-zinc-600 hover:text-red-400 transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2 pl-5">
                      <input
                        type="text"
                        value={newSubtask}
                        onChange={(e) => setNewSubtask(e.target.value)}
                        onKeyDown={handleSubtaskKeyDown}
                        placeholder={language === 'is' ? 'Bæta við undirverkefni...' : 'Add subtask...'}
                        className="flex-1 px-2 py-1 bg-dark-700 rounded text-sm outline-none placeholder:text-zinc-600 border border-transparent focus:border-accent transition-colors"
                      />
                      <button
                        type="button"
                        onClick={handleAddSubtask}
                        disabled={!newSubtask.trim()}
                        className="p-1 text-zinc-500 hover:text-accent disabled:opacity-30 disabled:hover:text-zinc-500 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Selected Tags Preview */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {selectedTags.map(tagId => {
                    const tag = tags.find(t => t.id === tagId)
                    if (!tag) return null
                    return (
                      <span 
                        key={tagId}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                        style={{ 
                          backgroundColor: `${TAG_COLORS[tag.color] || '#64748b'}20`,
                          color: TAG_COLORS[tag.color] || '#64748b'
                        }}
                      >
                        {getTagLabel(tag)}
                        <button
                          type="button"
                          onClick={() => toggleTag(tagId)}
                          className="hover:opacity-70"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    )
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="mb-4">
              <div className="flex gap-1.5 flex-wrap">
                {IDEA_TYPES.map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setIdeaType(type.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-all ${
                      ideaType === type.id
                        ? 'bg-amber-500 text-white'
                        : 'bg-dark-700 text-zinc-400 hover:bg-dark-600'
                    }`}
                  >
                    <type.icon size={12} />
                    {language === 'is' ? type.labelIs : type.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!text.trim()}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
              mode === 'task'
                ? 'bg-accent hover:bg-accent-light active:scale-[0.99]'
                : 'bg-amber-500 hover:bg-amber-400 active:scale-[0.99]'
            }`}
          >
            <Plus size={16} />
            {mode === 'task' 
              ? (language === 'is' ? 'Bæta við verkefni' : 'Add Task')
              : (language === 'is' ? 'Fanga hugmynd' : 'Capture Idea')
            }
          </button>
        </form>

        {/* Footer - Keyboard Shortcuts */}
        <div className="px-4 pb-3 flex items-center justify-center gap-4 text-2xs text-zinc-600">
          <span><kbd className="kbd">↵</kbd> {language === 'is' ? 'Vista' : 'Save'}</span>
          <span><kbd className="kbd">Esc</kbd> {language === 'is' ? 'Loka' : 'Close'}</span>
          <span><kbd className="kbd">Tab</kbd> {language === 'is' ? 'Skipta' : 'Switch'}</span>
        </div>
      </div>
    </div>
  )
}

export default QuickAddModal
