import React, { useState, useRef, useEffect } from 'react'
import useStore from '../store/useStore'
import { useTranslation } from '../i18n/useTranslation'
import { 
  Plus, 
  CheckSquare, 
  Lightbulb, 
  Zap, 
  Calendar,
  Hash,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import DynamicIcon from './Icons'
import { InlineTagSelector } from './TagBadge'

// Quick capture types
const CAPTURE_TYPES = {
  task: { icon: CheckSquare, color: '#3b82f6', label: 'Task', labelIs: 'Verkefni' },
  idea: { icon: Lightbulb, color: '#f59e0b', label: 'Idea', labelIs: 'Hugmynd' },
  quick: { icon: Zap, color: '#a855f7', label: 'Quick', labelIs: 'Fljótt' },
}

function QuickCaptureBar({ isExpanded, onExpand, onCollapse }) {
  const { t, language } = useTranslation()
  const { 
    projects, 
    tags,
    addTask, 
    addIdea,
    setFocusProject,
    setActiveView 
  } = useStore()

  const [input, setInput] = useState('')
  const [captureType, setCaptureType] = useState('task')
  const [selectedProject, setSelectedProject] = useState(null)
  const [selectedTags, setSelectedTags] = useState([])
  const [showProjects, setShowProjects] = useState(false)
  const inputRef = useRef(null)
  const containerRef = useRef(null)

  // Auto-focus when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isExpanded])

  // Click outside to collapse
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        if (isExpanded && !input) {
          onCollapse?.()
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isExpanded, input, onCollapse])

  // Parse input for special commands
  const parseInput = (text) => {
    const result = {
      title: text,
      projectId: selectedProject,
      tags: [...selectedTags],
      priority: 'medium',
      dueDate: null,
    }

    // Parse #project
    const projectMatch = text.match(/#(\w+)/)
    if (projectMatch) {
      const projectName = projectMatch[1].toLowerCase()
      const project = projects.find(p => 
        p.name.toLowerCase().startsWith(projectName) ||
        p.id.toLowerCase() === projectName
      )
      if (project) {
        result.projectId = project.id
        result.title = text.replace(/#\w+/, '').trim()
      }
    }

    // Parse !priority
    if (text.includes('!high') || text.includes('!urgent')) {
      result.priority = 'high'
      result.title = result.title.replace(/!(high|urgent)/g, '').trim()
    }
    if (text.includes('!low')) {
      result.priority = 'low'
      result.title = result.title.replace(/!low/g, '').trim()
    }

    // Parse @today, @tomorrow
    if (text.includes('@today')) {
      result.dueDate = new Date().toISOString().split('T')[0]
      result.title = result.title.replace(/@today/g, '').trim()
    }
    if (text.includes('@tomorrow')) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      result.dueDate = tomorrow.toISOString().split('T')[0]
      result.title = result.title.replace(/@tomorrow/g, '').trim()
    }

    return result
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const parsed = parseInput(input)

    if (captureType === 'idea') {
      addIdea({
        title: parsed.title,
        projectId: parsed.projectId,
        tags: parsed.tags,
      })
    } else {
      addTask({
        title: parsed.title,
        projectId: parsed.projectId || projects[0]?.id,
        priority: parsed.priority,
        dueDate: parsed.dueDate,
        tags: parsed.tags,
      })
    }

    setInput('')
    setSelectedProject(null)
    setSelectedTags([])
    onCollapse?.()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setInput('')
      onCollapse?.()
    }
    // Tab to cycle capture type
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault()
      const types = Object.keys(CAPTURE_TYPES)
      const currentIndex = types.indexOf(captureType)
      const nextIndex = (currentIndex + 1) % types.length
      setCaptureType(types[nextIndex])
    }
  }

  const toggleTag = (tagId) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const TypeIcon = CAPTURE_TYPES[captureType].icon
  const typeColor = CAPTURE_TYPES[captureType].color

  if (!isExpanded) {
    return (
      <button
        onClick={onExpand}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/30 flex items-center justify-center transition-all hover:scale-105 z-40"
      >
        <Plus size={24} />
      </button>
    )
  }

  return (
    <div 
      ref={containerRef}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50 animate-fade-in"
    >
      <div className="bg-dark-900 rounded-2xl border border-dark-500 shadow-2xl shadow-black/50 overflow-hidden">
        {/* Type selector */}
        <div className="flex items-center gap-1 px-3 pt-3">
          {Object.entries(CAPTURE_TYPES).map(([type, config]) => {
            const Icon = config.icon
            const isActive = captureType === type
            return (
              <button
                key={type}
                onClick={() => setCaptureType(type)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive 
                    ? 'bg-white/10 text-white' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Icon size={14} style={{ color: isActive ? config.color : undefined }} />
                {language === 'is' ? config.labelIs : config.label}
              </button>
            )
          })}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-3">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${typeColor}20` }}
            >
              <TypeIcon size={20} style={{ color: typeColor }} />
            </div>
            
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                captureType === 'idea' 
                  ? (language === 'is' ? 'Skráðu hugmynd...' : 'Capture an idea...')
                  : (language === 'is' ? 'Bæta við verkefni... (#verkefni @today !high)' : 'Add a task... (#project @today !high)')
              }
              className="flex-1 bg-transparent text-white placeholder-zinc-600 outline-none text-sm"
            />
            
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2 rounded-lg bg-accent hover:bg-accent/90 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </form>

        {/* Quick options */}
        <div className="px-3 pb-3 flex items-center justify-between gap-4">
          {/* Project selector */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowProjects(!showProjects)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-all ${
                selectedProject 
                  ? 'bg-accent/20 text-accent' 
                  : 'bg-dark-700 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {selectedProject ? (
                <>
                  <DynamicIcon 
                    name={projects.find(p => p.id === selectedProject)?.icon || 'Folder'} 
                    size={12} 
                  />
                  {projects.find(p => p.id === selectedProject)?.name}
                </>
              ) : (
                <>
                  <Hash size={12} />
                  {language === 'is' ? 'Verkefni' : 'Project'}
                </>
              )}
            </button>
            
            {showProjects && (
              <div className="absolute bottom-full mb-2 left-3 bg-dark-800 rounded-xl border border-dark-600 p-2 shadow-xl min-w-[160px]">
                {projects.map(project => (
                  <button
                    key={project.id}
                    onClick={() => {
                      setSelectedProject(project.id)
                      setShowProjects(false)
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-dark-700 transition-colors"
                  >
                    <DynamicIcon name={project.icon} size={14} style={{ color: project.color }} />
                    {project.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <InlineTagSelector 
            tags={tags}
            selectedTags={selectedTags}
            onToggle={toggleTag}
            language={language}
          />
        </div>

        {/* Help text */}
        <div className="px-3 pb-2 text-2xs text-zinc-600 flex items-center gap-3">
          <span><kbd className="kbd">Tab</kbd> {language === 'is' ? 'skipta tegund' : 'switch type'}</span>
          <span><kbd className="kbd">Esc</kbd> {language === 'is' ? 'loka' : 'close'}</span>
          <span className="ml-auto flex items-center gap-1">
            <Sparkles size={10} />
            {language === 'is' ? '#verkefni @dagur !forgangsröðun' : '#project @date !priority'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default QuickCaptureBar
