import React, { useState, useRef, useEffect } from 'react'
import useStore from '../store/useStore'
import { useTranslation } from '../i18n/useTranslation'
import DynamicIcon from './Icons'
import TagBadge from './TagBadge'
import SubtaskList from './SubtaskList'
import { format, parseISO, isPast, isToday, isTomorrow, differenceInDays } from 'date-fns'
import { is, enUS } from 'date-fns/locale'
import {
  X,
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  Flag,
  Tag,
  AlignLeft,
  Play,
  Trash2,
  MoreHorizontal,
  Link,
  Unlink,
  GitBranch,
  Lock,
  CheckSquare,
  Plus,
  Timer,
  Sparkles,
  ChevronDown
} from 'lucide-react'

const PRIORITIES = [
  { id: 'urgent', label: 'Urgent', labelIs: 'Áríðandi', color: '#ef4444' },
  { id: 'high', label: 'High', labelIs: 'Hár', color: '#f97316' },
  { id: 'medium', label: 'Medium', labelIs: 'Meðal', color: '#eab308' },
  { id: 'low', label: 'Low', labelIs: 'Lágur', color: '#22c55e' },
]

function TaskDetailPanel({ taskId, onClose }) {
  const { language } = useTranslation()
  const locale = language === 'is' ? is : enUS
  
  const {
    tasks,
    projects,
    tags,
    updateTask,
    toggleTask,
    deleteTask,
    isTaskBlocked,
    getBlockingTasks,
    addDependency,
    removeDependency,
    addTagToTask,
    removeTagFromTask,
    setFocusProject,
    setFocusTask,
    startTimeTracking,
    activeTimeSession
  } = useStore()
  
  const task = tasks.find(t => t.id === taskId)
  const project = task ? projects.find(p => p.id === task.projectId) : null
  
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false)
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)
  const [showTagPicker, setShowTagPicker] = useState(false)
  const [showDependencyPicker, setShowDependencyPicker] = useState(false)
  
  const titleInputRef = useRef(null)
  const descriptionRef = useRef(null)
  const panelRef = useRef(null)
  
  // Update local state when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || '')
    }
  }, [task])
  
  // Focus title input when editing
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
  }, [isEditingTitle])
  
  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose()
      }
    }
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (isEditingTitle) {
          setIsEditingTitle(false)
          setTitle(task?.title || '')
        } else if (isEditingDescription) {
          setIsEditingDescription(false)
          setDescription(task?.description || '')
        } else {
          onClose()
        }
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose, isEditingTitle, isEditingDescription, task])
  
  if (!task) return null
  
  const isBlocked = isTaskBlocked(taskId)
  const blockingTasks = getBlockingTasks(taskId)
  const selectedPriority = PRIORITIES.find(p => p.id === task.priority) || PRIORITIES[2]
  
  // Available tasks for dependency
  const availableDependencies = tasks.filter(t => 
    t.projectId === task.projectId && 
    t.id !== task.id && 
    !t.completed &&
    !(task.blockedBy || []).includes(t.id)
  )
  
  const handleTitleSave = () => {
    if (title.trim() && title !== task.title) {
      updateTask(taskId, { title: title.trim() })
    } else {
      setTitle(task.title)
    }
    setIsEditingTitle(false)
  }
  
  const handleDescriptionSave = () => {
    if (description !== (task.description || '')) {
      updateTask(taskId, { description: description.trim() || null })
    }
    setIsEditingDescription(false)
  }
  
  const handleDelete = () => {
    if (window.confirm(language === 'is' ? 'Ertu viss um að þú viljir eyða þessu verkefni?' : 'Are you sure you want to delete this task?')) {
      deleteTask(taskId)
      onClose()
    }
  }
  
  const handleStartFocus = () => {
    if (task.projectId) {
      setFocusProject(task.projectId)
      setFocusTask(taskId)
    }
    onClose()
  }
  
  const handleStartTimer = () => {
    startTimeTracking(taskId, task.projectId, task.title)
  }
  
  const formatDueDate = (dateStr) => {
    if (!dateStr) return null
    const date = parseISO(dateStr)
    const daysUntil = differenceInDays(date, new Date())
    
    if (isToday(date)) return { text: language === 'is' ? 'Í dag' : 'Today', urgent: false }
    if (isTomorrow(date)) return { text: language === 'is' ? 'Á morgun' : 'Tomorrow', urgent: false }
    if (isPast(date)) return { text: `${Math.abs(daysUntil)} ${language === 'is' ? 'dögum seint' : 'days overdue'}`, urgent: true }
    return { text: format(date, 'EEEE, MMMM d', { locale }), urgent: false }
  }
  
  const formatTime = (minutes) => {
    if (!minutes) return null
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (h > 0) return `${h}h ${m}m`
    return `${m}m`
  }
  
  const dueInfo = formatDueDate(task.dueDate)
  const timeSpent = formatTime(task.timeSpent)
  
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40 animate-fade-in" />
      
      {/* Panel */}
      <div 
        ref={panelRef}
        className="fixed top-0 right-0 h-full w-full max-w-lg bg-dark-900 border-l border-dark-600 z-50 flex flex-col animate-slide-in-right overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-600">
          <div className="flex items-center gap-3">
            {/* Checkbox */}
            <button
              onClick={() => !isBlocked && toggleTask(taskId)}
              disabled={isBlocked}
              className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                task.completed
                  ? 'bg-green-500 border-green-500'
                  : isBlocked
                    ? 'border-red-400/50 cursor-not-allowed'
                    : 'border-dark-400 hover:border-accent hover:bg-accent/10'
              }`}
            >
              {task.completed && <CheckCircle2 size={14} className="text-white" />}
              {isBlocked && !task.completed && <Lock size={12} className="text-red-400" />}
            </button>
            
            {/* Project Badge */}
            {project && (
              <div 
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs"
                style={{ backgroundColor: `${project.color}20`, color: project.color }}
              >
                <DynamicIcon name={project.icon} size={12} />
                {project.name}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Quick Actions */}
            {!task.completed && !isBlocked && (
              <>
                <button
                  onClick={handleStartFocus}
                  className="p-2 hover:bg-accent/20 rounded-lg transition-colors"
                  title={language === 'is' ? 'Einbeita' : 'Focus'}
                >
                  <Play size={16} className="text-accent" />
                </button>
                <button
                  onClick={handleStartTimer}
                  disabled={activeTimeSession?.taskId === taskId}
                  className={`p-2 rounded-lg transition-colors ${
                    activeTimeSession?.taskId === taskId 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'hover:bg-purple-500/20 text-purple-400'
                  }`}
                  title={language === 'is' ? 'Hefja tímamælingu' : 'Start timer'}
                >
                  <Timer size={16} />
                </button>
              </>
            )}
            
            <button
              onClick={handleDelete}
              className="p-2 hover:bg-red-500/20 rounded-lg text-zinc-500 hover:text-red-400 transition-colors"
              title={language === 'is' ? 'Eyða' : 'Delete'}
            >
              <Trash2 size={16} />
            </button>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-dark-700 rounded-lg text-zinc-500 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              {isEditingTitle ? (
                <input
                  ref={titleInputRef}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTitleSave()
                    if (e.key === 'Escape') {
                      setTitle(task.title)
                      setIsEditingTitle(false)
                    }
                  }}
                  className="w-full text-xl font-semibold bg-transparent border-b-2 border-accent outline-none pb-1"
                />
              ) : (
                <h2 
                  onClick={() => setIsEditingTitle(true)}
                  className={`text-xl font-semibold cursor-text hover:text-accent/80 transition-colors ${
                    task.completed ? 'line-through text-zinc-500' : ''
                  }`}
                >
                  {task.title}
                </h2>
              )}
            </div>
            
            {/* Blocked Warning */}
            {isBlocked && (
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <Lock size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-400">
                    {language === 'is' ? 'Þetta verkefni er blokkað' : 'This task is blocked'}
                  </p>
                  <p className="text-xs text-red-400/70 mt-1">
                    {language === 'is' ? 'Ljúktu fyrst við:' : 'Complete first:'}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {blockingTasks.filter(bt => !bt.completed).map(bt => (
                      <li key={bt.id} className="flex items-center gap-2 text-sm text-red-300">
                        <Circle size={12} />
                        {bt.title}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {/* Properties Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Priority */}
              <div className="relative">
                <label className="text-xs text-zinc-500 mb-1.5 block">
                  {language === 'is' ? 'Forgangur' : 'Priority'}
                </label>
                <button
                  onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg hover:border-dark-500 transition-colors"
                >
                  <Flag size={14} style={{ color: selectedPriority.color }} />
                  <span style={{ color: selectedPriority.color }}>
                    {language === 'is' ? selectedPriority.labelIs : selectedPriority.label}
                  </span>
                  <ChevronDown size={14} className="ml-auto text-zinc-500" />
                </button>
                {showPriorityDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-dark-800 border border-dark-500 rounded-lg shadow-xl py-1 z-10">
                    {PRIORITIES.map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          updateTask(taskId, { priority: p.id })
                          setShowPriorityDropdown(false)
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-dark-700 transition-colors ${
                          task.priority === p.id ? 'bg-dark-700' : ''
                        }`}
                      >
                        <Flag size={14} style={{ color: p.color }} />
                        <span style={{ color: p.color }}>
                          {language === 'is' ? p.labelIs : p.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Project */}
              <div className="relative">
                <label className="text-xs text-zinc-500 mb-1.5 block">
                  {language === 'is' ? 'Verkefni' : 'Project'}
                </label>
                <button
                  onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg hover:border-dark-500 transition-colors"
                >
                  {project ? (
                    <>
                      <DynamicIcon name={project.icon} size={14} style={{ color: project.color }} />
                      <span style={{ color: project.color }}>{project.name}</span>
                    </>
                  ) : (
                    <span className="text-zinc-500">{language === 'is' ? 'Ekkert' : 'None'}</span>
                  )}
                  <ChevronDown size={14} className="ml-auto text-zinc-500" />
                </button>
                {showProjectDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-dark-800 border border-dark-500 rounded-lg shadow-xl py-1 z-10 max-h-48 overflow-y-auto">
                    {projects.map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          updateTask(taskId, { projectId: p.id })
                          setShowProjectDropdown(false)
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-dark-700 transition-colors ${
                          task.projectId === p.id ? 'bg-dark-700' : ''
                        }`}
                      >
                        <DynamicIcon name={p.icon} size={14} style={{ color: p.color }} />
                        <span style={{ color: p.color }}>{p.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Due Date */}
              <div>
                <label className="text-xs text-zinc-500 mb-1.5 block">
                  {language === 'is' ? 'Skiladagur' : 'Due date'}
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={task.dueDate || ''}
                    onChange={(e) => updateTask(taskId, { dueDate: e.target.value || null })}
                    className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg hover:border-dark-500 transition-colors text-sm"
                  />
                </div>
                {dueInfo && (
                  <p className={`text-xs mt-1 ${dueInfo.urgent ? 'text-red-400' : 'text-zinc-500'}`}>
                    {dueInfo.text}
                  </p>
                )}
              </div>
              
              {/* Time Estimate */}
              <div>
                <label className="text-xs text-zinc-500 mb-1.5 block">
                  {language === 'is' ? 'Áætlaður tími (mín)' : 'Estimate (min)'}
                </label>
                <input
                  type="number"
                  value={task.estimate || ''}
                  onChange={(e) => updateTask(taskId, { estimate: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg hover:border-dark-500 transition-colors text-sm"
                  min="0"
                />
                {timeSpent && (
                  <p className="text-xs mt-1 text-purple-400">
                    {language === 'is' ? 'Eytt:' : 'Spent:'} {timeSpent}
                  </p>
                )}
              </div>
            </div>
            
            {/* Description */}
            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block flex items-center gap-2">
                <AlignLeft size={12} />
                {language === 'is' ? 'Lýsing' : 'Description'}
              </label>
              {isEditingDescription ? (
                <textarea
                  ref={descriptionRef}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={handleDescriptionSave}
                  placeholder={language === 'is' ? 'Bættu við lýsingu...' : 'Add a description...'}
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg hover:border-dark-500 focus:border-accent transition-colors text-sm min-h-[100px] resize-none outline-none"
                  autoFocus
                />
              ) : (
                <div
                  onClick={() => setIsEditingDescription(true)}
                  className="px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg hover:border-dark-500 transition-colors text-sm min-h-[60px] cursor-text"
                >
                  {task.description ? (
                    <p className="text-zinc-300 whitespace-pre-wrap">{task.description}</p>
                  ) : (
                    <p className="text-zinc-600 italic">
                      {language === 'is' ? 'Smelltu til að bæta við lýsingu...' : 'Click to add description...'}
                    </p>
                  )}
                </div>
              )}
            </div>
            
            {/* Tags */}
            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block flex items-center gap-2">
                <Tag size={12} />
                {language === 'is' ? 'Merki' : 'Tags'}
              </label>
              <div className="flex flex-wrap gap-2">
                {(task.tags || []).map(tagId => {
                  const tag = tags.find(t => t.id === tagId)
                  if (!tag) return null
                  return (
                    <button
                      key={tagId}
                      onClick={() => removeTagFromTask(taskId, tagId)}
                      className="group flex items-center gap-1"
                    >
                      <TagBadge tag={tag} size="sm" />
                      <X size={12} className="text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )
                })}
                <button
                  onClick={() => setShowTagPicker(!showTagPicker)}
                  className="px-2 py-1 text-xs text-zinc-500 hover:text-zinc-300 hover:bg-dark-700 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus size={12} />
                  {language === 'is' ? 'Bæta við' : 'Add tag'}
                </button>
              </div>
              {showTagPicker && (
                <div className="mt-2 p-2 bg-dark-800 border border-dark-600 rounded-lg">
                  <div className="flex flex-wrap gap-1.5">
                    {tags.filter(t => !(task.tags || []).includes(t.id)).map(tag => (
                      <button
                        key={tag.id}
                        onClick={() => {
                          addTagToTask(taskId, tag.id)
                          setShowTagPicker(false)
                        }}
                        className="hover:scale-105 transition-transform"
                      >
                        <TagBadge tag={tag} size="sm" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Dependencies */}
            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block flex items-center gap-2">
                <GitBranch size={12} />
                {language === 'is' ? 'Háð verkefnum' : 'Dependencies'}
              </label>
              
              {/* Current dependencies */}
              {blockingTasks.length > 0 && (
                <div className="space-y-2 mb-3">
                  {blockingTasks.map(bt => (
                    <div 
                      key={bt.id} 
                      className={`flex items-center gap-2 p-2 rounded-lg ${
                        bt.completed ? 'bg-green-500/10 border border-green-500/20' : 'bg-orange-500/10 border border-orange-500/20'
                      }`}
                    >
                      {bt.completed ? (
                        <CheckCircle2 size={14} className="text-green-400" />
                      ) : (
                        <Lock size={14} className="text-orange-400" />
                      )}
                      <span className={`flex-1 text-sm ${bt.completed ? 'line-through text-zinc-500' : ''}`}>
                        {bt.title}
                      </span>
                      <button
                        onClick={() => removeDependency(taskId, bt.id)}
                        className="p-1 hover:bg-dark-700 rounded text-zinc-500 hover:text-red-400 transition-colors"
                      >
                        <Unlink size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Add dependency */}
              <button
                onClick={() => setShowDependencyPicker(!showDependencyPicker)}
                className="px-3 py-2 text-xs text-zinc-500 hover:text-zinc-300 hover:bg-dark-700 rounded-lg transition-colors flex items-center gap-2 w-full border border-dashed border-dark-600"
              >
                <Link size={12} />
                {language === 'is' ? 'Bæta við tengingu' : 'Add dependency'}
              </button>
              
              {showDependencyPicker && availableDependencies.length > 0 && (
                <div className="mt-2 p-2 bg-dark-800 border border-dark-600 rounded-lg max-h-40 overflow-y-auto">
                  {availableDependencies.map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        addDependency(taskId, t.id)
                        setShowDependencyPicker(false)
                      }}
                      className="w-full flex items-center gap-2 p-2 hover:bg-dark-700 rounded-lg text-left transition-colors"
                    >
                      <Circle size={12} className="text-zinc-500" />
                      <span className="text-sm truncate">{t.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Subtasks */}
            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block flex items-center gap-2">
                <CheckSquare size={12} />
                {language === 'is' ? 'Undirverkefni' : 'Subtasks'}
              </label>
              <SubtaskList taskId={taskId} />
            </div>
            
            {/* AI Priority Suggestion */}
            {task.aiPriority && task.aiReason && (
              <div className="p-4 bg-accent/10 border border-accent/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} className="text-accent" />
                  <span className="text-xs font-medium text-accent">
                    {language === 'is' ? 'AI tillaga' : 'AI Suggestion'}
                  </span>
                </div>
                <p className="text-sm text-zinc-300">{task.aiReason}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-3 border-t border-dark-600 bg-dark-800/50 text-xs text-zinc-500">
          {task.createdAt && (
            <span>
              {language === 'is' ? 'Búið til' : 'Created'} {format(parseISO(task.createdAt), 'PPP', { locale })}
            </span>
          )}
          {task.completedAt && (
            <span className="ml-4">
              {language === 'is' ? 'Lokið' : 'Completed'} {format(parseISO(task.completedAt), 'PPP', { locale })}
            </span>
          )}
        </div>
      </div>
    </>
  )
}

export default TaskDetailPanel
