import React, { useState, useRef, useEffect } from 'react'
import useStore from '../store/useStore'
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
  Flag
} from 'lucide-react'

const IDEA_TYPES = [
  { id: 'app', icon: Smartphone, label: 'App' },
  { id: 'feature', icon: Sparkles, label: 'Feature' },
  { id: 'saas', icon: DollarSign, label: 'SaaS' },
  { id: 'content', icon: FileText, label: 'Content' },
  { id: 'other', icon: Lightbulb, label: 'Other' },
]

const QUICK_DATES = [
  { label: 'Today', value: format(new Date(), 'yyyy-MM-dd') },
  { label: 'Tomorrow', value: format(addDays(new Date(), 1), 'yyyy-MM-dd') },
  { label: 'Next Week', value: format(addDays(new Date(), 7), 'yyyy-MM-dd') },
  { label: 'None', value: null },
]

const PRIORITIES = [
  { id: 'urgent', label: 'Urgent', color: '#ef4444', icon: '!!' },
  { id: 'high', label: 'High', color: '#f97316', icon: '!' },
  { id: 'medium', label: 'Medium', color: '#eab308', icon: '-' },
  { id: 'low', label: 'Low', color: '#22c55e', icon: '~' },
]

function QuickAddModal() {
  const { 
    setQuickAddOpen, 
    addTask, 
    addIdea, 
    projects 
  } = useStore()
  
  const [mode, setMode] = useState('task')
  const [text, setText] = useState('')
  const [projectId, setProjectId] = useState(projects[0]?.id || '')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState(null)
  const [estimate, setEstimate] = useState('') // in minutes
  const [ideaType, setIdeaType] = useState('app')
  const [showDetails, setShowDetails] = useState(false)
  
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [mode])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim()) return

    if (mode === 'task') {
      addTask({
        title: text.trim(),
        projectId,
        priority,
        dueDate,
        estimate: estimate ? parseInt(estimate) : null
      })
    } else {
      addIdea({
        title: text.trim(),
        type: ideaType
      })
    }

    setText('')
    setQuickAddOpen(false)
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setQuickAddOpen(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e)
    }
  }

  const selectedProject = projects.find(p => p.id === projectId)

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-24 z-50 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-lg bg-dark-900 rounded-2xl border border-dark-500 shadow-2xl shadow-black/50 overflow-hidden animate-fade-in-scale">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-dark-600">
          <div className="flex gap-1">
            <button
              onClick={() => setMode('task')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                mode === 'task' 
                  ? 'bg-accent text-white' 
                  : 'text-zinc-400 hover:bg-dark-700'
              }`}
            >
              <CheckSquare size={14} />
              Task
            </button>
            <button
              onClick={() => setMode('idea')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                mode === 'idea' 
                  ? 'bg-amber-500 text-white' 
                  : 'text-zinc-400 hover:bg-dark-700'
              }`}
            >
              <Lightbulb size={14} />
              Idea
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
            placeholder={mode === 'task' ? 'What needs to be done?' : 'Capture your idea...'}
            className="w-full bg-transparent text-lg font-medium outline-none placeholder:text-zinc-600 mb-4"
            autoFocus
          />

          {mode === 'task' ? (
            <>
              {/* Quick Options Row */}
              <div className="flex flex-wrap gap-2 mb-4">
                {/* Project Selector */}
                <button
                  type="button"
                  onClick={() => {
                    const idx = projects.findIndex(p => p.id === projectId)
                    const nextIdx = (idx + 1) % projects.length
                    setProjectId(projects[nextIdx].id)
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-dark-700 hover:bg-dark-600 rounded-lg text-sm transition-colors"
                  style={{ color: selectedProject?.color }}
                >
                  <DynamicIcon name={selectedProject?.icon} size={12} />
                  {selectedProject?.name}
                </button>

                {/* Priority */}
                <button
                  type="button"
                  onClick={() => {
                    const idx = PRIORITIES.findIndex(p => p.id === priority)
                    const nextIdx = (idx + 1) % PRIORITIES.length
                    setPriority(PRIORITIES[nextIdx].id)
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-dark-700 hover:bg-dark-600 rounded-lg text-sm transition-colors"
                >
                  <Flag size={12} style={{ color: PRIORITIES.find(p => p.id === priority)?.color }} />
                  <span style={{ color: PRIORITIES.find(p => p.id === priority)?.color }}>
                    {PRIORITIES.find(p => p.id === priority)?.label}
                  </span>
                </button>

                {/* Due Date */}
                <div className="flex gap-1">
                  {QUICK_DATES.slice(0, 3).map(qd => (
                    <button
                      key={qd.label}
                      type="button"
                      onClick={() => setDueDate(qd.value)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                        dueDate === qd.value
                          ? 'bg-accent text-white'
                          : 'bg-dark-700 text-zinc-400 hover:bg-dark-600'
                      }`}
                    >
                      {qd.label}
                    </button>
                  ))}
                </div>

                {/* Time Estimate */}
                <div className="flex items-center gap-1 px-2 py-1 bg-dark-700 rounded-lg">
                  <Clock size={12} className="text-zinc-500" />
                  <input
                    type="number"
                    value={estimate}
                    onChange={(e) => setEstimate(e.target.value)}
                    placeholder="min"
                    className="w-12 bg-transparent text-xs outline-none text-center"
                  />
                </div>
              </div>
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
                    {type.label}
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
                ? 'bg-accent hover:bg-accent-light'
                : 'bg-amber-500 hover:bg-amber-400'
            }`}
          >
            <Plus size={16} />
            {mode === 'task' ? 'Add Task' : 'Capture Idea'}
          </button>
        </form>

        {/* Footer */}
        <div className="px-4 pb-3 flex items-center justify-center gap-4 text-2xs text-zinc-600">
          <span><kbd className="kbd">↵</kbd> Save</span>
          <span><kbd className="kbd">Esc</kbd> Close</span>
          <span><kbd className="kbd">Tab</kbd> Switch mode</span>
        </div>
      </div>
    </div>
  )
}

export default QuickAddModal
