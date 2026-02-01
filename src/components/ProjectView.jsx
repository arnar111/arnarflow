import React, { useState, useMemo, useRef } from 'react'
import useStore from '../store/useStore'
import { useTranslation } from '../i18n/useTranslation'
import DynamicIcon from './Icons'
import { format, parseISO, isPast, isToday, isTomorrow, differenceInDays } from 'date-fns'
import { is, enUS } from 'date-fns/locale'
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  Trash2,
  Calendar,
  Flag,
  Play,
  Timer,
  LayoutGrid,
  List,
  GripVertical,
  MoreHorizontal,
  Clock,
  ChevronRight,
  Sparkles,
  AlertCircle,
  CheckCheck,
  MoreVertical,
  Zap,
  Copy,
  Check
} from 'lucide-react'

// Plane-inspired Drop Indicator
function DropIndicator({ isVisible }) {
  if (!isVisible) return null
  
  return (
    <div className="relative h-[3px] w-full my-1">
      <div className="absolute inset-0 bg-accent rounded-full" />
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-accent rounded-full shadow-lg shadow-accent/50" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 bg-accent rounded-full shadow-lg shadow-accent/50" />
    </div>
  )
}

// Plane-inspired Drag Handle
function DragHandle({ className = '' }) {
  return (
    <div className={`flex items-center cursor-grab active:cursor-grabbing p-1 rounded-md hover:bg-white/10 transition-colors ${className}`}>
      <MoreVertical className="h-4 w-4 text-zinc-600" />
      <MoreVertical className="-ml-3 h-4 w-4 text-zinc-600" />
    </div>
  )
}

// Badge component
function Badge({ variant = 'default', size = 'sm', children, className = '' }) {
  const variants = {
    default: 'bg-dark-700/50 text-zinc-400 border-dark-600/50',
    success: 'bg-green-500/10 text-green-400 border-green-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    danger: 'bg-red-500/10 text-red-400 border-red-500/20',
    accent: 'bg-accent/10 text-accent border-accent/20',
  }
  
  const sizes = {
    sm: 'px-2 py-0.5 text-2xs',
    md: 'px-2.5 py-1 text-xs',
  }

  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full border ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  )
}

// Circular Progress
function CircularProgress({ size = 32, percentage = 0, strokeWidth = 3, color = '#3b82f6' }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * Math.PI * 2
  const dashOffset = circumference - (circumference * percentage) / 100

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(39, 39, 42, 0.5)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        className="transition-all duration-500"
      />
    </svg>
  )
}

function ProjectView() {
  const { t, language } = useTranslation()
  const locale = language === 'is' ? is : enUS

  const COLUMNS = [
    { id: 'todo', title: t('projectView.columns.todo'), icon: Circle, color: '#6366f1', gradient: 'from-indigo-500/10 to-purple-500/5' },
    { id: 'in-progress', title: t('projectView.columns.inProgress'), icon: Clock, color: '#f59e0b', gradient: 'from-amber-500/10 to-orange-500/5' },
    { id: 'done', title: t('projectView.columns.done'), icon: CheckCircle2, color: '#22c55e', gradient: 'from-green-500/10 to-emerald-500/5' }
  ]

  const PRIORITIES = {
    urgent: { label: t('projectView.priority.urgent'), color: '#ef4444', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: '🔴' },
    high: { label: t('projectView.priority.high'), color: '#f97316', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: '🟠' },
    medium: { label: t('projectView.priority.medium'), color: '#eab308', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: '🟡' },
    low: { label: t('projectView.priority.low'), color: '#22c55e', bg: 'bg-green-500/10', border: 'border-green-500/20', icon: '🟢' }
  }
  
  const { 
    projects, 
    selectedProject, 
    tasks, 
    addTask, 
    toggleTask, 
    deleteTask,
    updateTask,
    setFocusProject,
    setFocusTask,
    focusProject
  } = useStore()
  
  const [viewMode, setViewMode] = useState('kanban')
  const [newTask, setNewTask] = useState('')
  const [newTaskColumn, setNewTaskColumn] = useState(null)
  const [priority, setPriority] = useState('medium')
  const [draggedTask, setDraggedTask] = useState(null)
  const [dragOverColumn, setDragOverColumn] = useState(null)
  const [dragOverTaskId, setDragOverTaskId] = useState(null)
  const [expandedCard, setExpandedCard] = useState(null)
  const [blaerCopied, setBlaerCopied] = useState(false)
  
  const project = projects.find(p => p.id === selectedProject)
  
  const projectTasks = useMemo(() => {
    return tasks.filter(t => t.projectId === selectedProject)
  }, [tasks, selectedProject])
  
  const getTasksByStatus = (status) => {
    return projectTasks.filter(t => {
      if (status === 'done') return t.completed
      if (status === 'in-progress') return !t.completed && t.status === 'in-progress'
      return !t.completed && t.status !== 'in-progress'
    }).sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
      return (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3)
    })
  }

  const completedCount = projectTasks.filter(t => t.completed).length
  const progress = projectTasks.length > 0 ? (completedCount / projectTasks.length) * 100 : 0
  const totalTimeSpent = projectTasks.reduce((sum, t) => sum + (t.timeSpent || 0), 0)

  if (!project) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-dark-700/50 to-dark-800/50 flex items-center justify-center">
            <Sparkles size={36} className="text-zinc-700" />
          </div>
          <p className="text-zinc-500 text-lg">{t('projectView.selectProject')}</p>
        </div>
      </div>
    )
  }

  const handleAddTask = (columnId) => {
    if (!newTask.trim()) return
    
    addTask({
      title: newTask.trim(),
      projectId: selectedProject,
      priority,
      status: columnId === 'in-progress' ? 'in-progress' : 'todo',
      completed: columnId === 'done'
    })
    setNewTask('')
    setNewTaskColumn(null)
  }

  const handleDragStart = (e, task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', task.id)
    // Add dragging class after a short delay to prevent flash
    setTimeout(() => {
      e.target.classList.add('opacity-50', 'scale-95')
    }, 0)
  }

  const handleDragEnd = (e) => {
    e.target.classList.remove('opacity-50', 'scale-95')
    setDraggedTask(null)
    setDragOverColumn(null)
    setDragOverTaskId(null)
  }

  const handleDragOver = (e, columnId, taskId = null) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(columnId)
    if (taskId) {
      setDragOverTaskId(taskId)
    }
  }

  const handleDragLeave = (e) => {
    // Only clear if leaving the column entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverColumn(null)
      setDragOverTaskId(null)
    }
  }

  const handleDrop = (e, columnId) => {
    e.preventDefault()
    setDragOverColumn(null)
    setDragOverTaskId(null)
    
    if (!draggedTask) return
    
    const updates = {
      status: columnId === 'in-progress' ? 'in-progress' : 'todo',
      completed: columnId === 'done'
    }
    
    if (columnId === 'done' && !draggedTask.completed) {
      updates.completedAt = new Date().toISOString()
    } else if (columnId !== 'done' && draggedTask.completed) {
      updates.completedAt = null
    }
    
    updateTask(draggedTask.id, updates)
    setDraggedTask(null)
  }

  const formatDueDate = (dateStr) => {
    if (!dateStr) return null
    const date = parseISO(dateStr)
    const daysUntil = differenceInDays(date, new Date())
    
    if (isToday(date)) return { text: t('time.today'), urgent: true }
    if (isTomorrow(date)) return { text: t('time.tomorrow'), urgent: false }
    if (isPast(date)) return { text: `${Math.abs(daysUntil)}${t('projectView.daysOverdue')}`, urgent: true }
    if (daysUntil <= 7) return { text: `${daysUntil}d`, urgent: false }
    return { text: format(date, 'MMM d', { locale }), urgent: false }
  }

  const formatTime = (minutes) => {
    if (!minutes) return null
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (h > 0) return `${h}h ${m}m`
    return `${m}m`
  }

  // Generate Blær prompt from todo tasks
  const generateBlaerPrompt = () => {
    const todoTasks = getTasksByStatus('todo')
    const inProgressTasks = getTasksByStatus('in-progress')
    
    if (todoTasks.length === 0 && inProgressTasks.length === 0) {
      return language === 'is' 
        ? 'Engin verkefni í Að gera eða Í vinnslu!' 
        : 'No tasks in To-do or In Progress!'
    }

    let prompt = language === 'is' 
      ? `Blær, hér er yfirlit yfir verkefnin mín í ${project.name}:\n\n`
      : `Blær, here's an overview of my tasks in ${project.name}:\n\n`

    if (todoTasks.length > 0) {
      prompt += language === 'is' ? '📋 **Að gera:**\n' : '📋 **To-do:**\n'
      todoTasks.forEach((task, i) => {
        const priorityInfo = PRIORITIES[task.priority] || PRIORITIES.medium
        const dueInfo = task.dueDate ? ` (${formatDueDate(task.dueDate).text})` : ''
        prompt += `${i + 1}. ${priorityInfo.icon} ${task.title}${dueInfo}\n`
        if (task.description) prompt += `   └─ ${task.description}\n`
      })
      prompt += '\n'
    }

    if (inProgressTasks.length > 0) {
      prompt += language === 'is' ? '🔄 **Í vinnslu:**\n' : '🔄 **In Progress:**\n'
      inProgressTasks.forEach((task, i) => {
        const priorityInfo = PRIORITIES[task.priority] || PRIORITIES.medium
        const timeInfo = task.timeSpent ? ` [${formatTime(task.timeSpent)}]` : ''
        prompt += `${i + 1}. ${priorityInfo.icon} ${task.title}${timeInfo}\n`
        if (task.description) prompt += `   └─ ${task.description}\n`
      })
      prompt += '\n'
    }

    prompt += language === 'is' 
      ? 'Getur þú hjálpað mér að forgangsraða og skipuleggja þessi verkefni?' 
      : 'Can you help me prioritize and organize these tasks?'

    return prompt
  }

  const handleBlaerClick = async () => {
    const prompt = generateBlaerPrompt()
    try {
      await navigator.clipboard.writeText(prompt)
      setBlaerCopied(true)
      setTimeout(() => setBlaerCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 px-8 pt-8 pb-6 border-b border-dark-600/30">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-lg group transition-transform hover:scale-105"
              style={{ background: `linear-gradient(135deg, ${project.color}40, ${project.color}20)` }}
            >
              <div 
                className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity"
                style={{ background: `radial-gradient(circle at 30% 30%, ${project.color}, transparent 70%)` }}
              />
              <DynamicIcon name={project.icon} size={28} style={{ color: project.color }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                {project.name}
              </h1>
              <p className="text-sm text-zinc-500 mt-0.5">{project.description}</p>
            </div>
          </div>
          
          {/* View Toggle & Stats */}
          <div className="flex items-center gap-4">
            {/* Stats Pills */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-dark-800/50 rounded-xl border border-dark-600/30">
                <Circle size={14} className="text-indigo-400" />
                <span className="text-sm font-medium">{projectTasks.length - completedCount}</span>
                <span className="text-xs text-zinc-600">{language === 'is' ? 'opin' : 'open'}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-dark-800/50 rounded-xl border border-dark-600/30">
                <CheckCheck size={14} className="text-green-400" />
                <span className="text-sm font-medium">{completedCount}</span>
                <span className="text-xs text-zinc-600">{language === 'is' ? 'lokið' : 'done'}</span>
              </div>
              {totalTimeSpent > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-dark-800/50 rounded-xl border border-dark-600/30">
                  <Timer size={14} className="text-purple-400" />
                  <span className="text-sm font-medium">{formatTime(totalTimeSpent)}</span>
                </div>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-dark-800/80 rounded-xl p-1 border border-dark-600/50">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-2.5 rounded-lg transition-all ${
                  viewMode === 'kanban' 
                    ? 'bg-white/10 text-white shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title={t('projectView.viewKanban')}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-lg transition-all ${
                  viewMode === 'list' 
                    ? 'bg-white/10 text-white shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title={t('projectView.viewList')}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="relative">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-zinc-500 flex items-center gap-2">
              {t('projectView.progress')}
              <CircularProgress size={20} percentage={progress} strokeWidth={2} color={project.color} />
            </span>
            <span className="font-mono text-zinc-400 font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-dark-700/50 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden"
              style={{ 
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${project.color}, ${project.color}bb)`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>
      </header>

      {/* Kanban Board */}
      {viewMode === 'kanban' ? (
        <div className="flex-1 overflow-x-auto p-6">
          <div className="flex gap-5 h-full min-w-max">
            {COLUMNS.map(column => {
              const columnTasks = getTasksByStatus(column.id)
              const isDropTarget = dragOverColumn === column.id
              
              return (
                <div 
                  key={column.id}
                  className={`w-[360px] flex flex-col rounded-2xl border transition-all duration-200 ${
                    isDropTarget 
                      ? 'border-accent/50 bg-accent/5 shadow-lg shadow-accent/10' 
                      : 'border-dark-600/30 bg-dark-800/20'
                  }`}
                  onDragOver={(e) => handleDragOver(e, column.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, column.id)}
                >
                  {/* Column Header */}
                  <div className={`px-4 py-3.5 border-b border-dark-600/30 bg-gradient-to-r ${column.gradient} rounded-t-2xl`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full shadow-lg transition-transform hover:scale-125"
                          style={{ backgroundColor: column.color, boxShadow: `0 0 12px ${column.color}50` }}
                        />
                        <h3 className="font-semibold text-sm">{column.title}</h3>
                        <Badge variant="default" size="sm">
                          {columnTasks.length}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        {/* Blær button - only on todo column */}
                        {column.id === 'todo' && (
                          <button
                            onClick={handleBlaerClick}
                            className={`p-2 rounded-lg transition-all flex items-center gap-1.5 ${
                              blaerCopied 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 hover:scale-110'
                            }`}
                            title={language === 'is' ? 'Senda til Blær' : 'Send to Blær'}
                          >
                            {blaerCopied ? (
                              <Check size={16} />
                            ) : (
                              <Zap size={16} />
                            )}
                            <span className="text-xs font-medium">Blær</span>
                          </button>
                        )}
                        <button
                          onClick={() => setNewTaskColumn(newTaskColumn === column.id ? null : column.id)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-all text-zinc-500 hover:text-white hover:scale-110"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Add Task Form */}
                  {newTaskColumn === column.id && (
                    <div className="p-4 border-b border-dark-600/30 bg-dark-800/50 animate-fade-in">
                      <input
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTask(column.id)}
                        placeholder={t('projectView.taskTitle')}
                        className="w-full bg-dark-700/50 border border-dark-500/50 rounded-xl px-4 py-3 text-sm focus:border-accent/50 focus:bg-dark-700 transition-all"
                        autoFocus
                      />
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex gap-1.5">
                          {Object.entries(PRIORITIES).map(([key, p]) => (
                            <button
                              key={key}
                              onClick={() => setPriority(key)}
                              className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-all hover:scale-110 ${
                                priority === key 
                                  ? `${p.bg} ${p.border} border-2 shadow-md` 
                                  : 'bg-dark-700/50 hover:bg-dark-600/50 border border-dark-600/30'
                              }`}
                              title={p.label}
                            >
                              {p.icon}
                            </button>
                          ))}
                        </div>
                        <div className="flex-1" />
                        <button
                          onClick={() => setNewTaskColumn(null)}
                          className="px-4 py-2 text-sm text-zinc-500 hover:text-white transition-colors rounded-lg hover:bg-dark-700/50"
                        >
                          {t('projectView.cancel')}
                        </button>
                        <button
                          onClick={() => handleAddTask(column.id)}
                          disabled={!newTask.trim()}
                          className="px-4 py-2 bg-accent hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-all hover:shadow-lg hover:shadow-accent/20"
                        >
                          {t('projectView.add')}
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Tasks */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {/* Drop indicator at top */}
                    <DropIndicator isVisible={isDropTarget && columnTasks.length === 0} />
                    
                    {columnTasks.length === 0 && !isDropTarget ? (
                      <div className="text-center py-16 text-zinc-600 text-sm">
                        <div className="w-12 h-12 rounded-2xl bg-dark-700/30 flex items-center justify-center mx-auto mb-3">
                          <column.icon size={22} className="opacity-30" />
                        </div>
                        {column.id === 'done' ? t('projectView.completedTasks') : t('projectView.dropHere')}
                      </div>
                    ) : (
                      columnTasks.map((task, index) => (
                        <React.Fragment key={task.id}>
                          {/* Drop indicator before this task */}
                          <DropIndicator isVisible={dragOverTaskId === task.id && isDropTarget} />
                          <TaskCard
                            task={task}
                            project={project}
                            priorities={PRIORITIES}
                            onDragStart={(e) => handleDragStart(e, task)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => handleDragOver(e, column.id, task.id)}
                            onToggle={() => toggleTask(task.id)}
                            onDelete={() => deleteTask(task.id)}
                            onFocus={() => {
                              setFocusProject(project.id)
                              setFocusTask(task.id)
                            }}
                            formatDueDate={formatDueDate}
                            formatTime={formatTime}
                            isFocusing={focusProject === project.id}
                            isDragging={draggedTask?.id === task.id}
                            isExpanded={expandedCard === task.id}
                            onExpand={() => setExpandedCard(expandedCard === task.id ? null : task.id)}
                            t={t}
                            language={language}
                          />
                        </React.Fragment>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <ListView 
          tasks={projectTasks}
          project={project}
          priorities={PRIORITIES}
          onToggle={toggleTask}
          onDelete={deleteTask}
          onAddTask={addTask}
          formatDueDate={formatDueDate}
          formatTime={formatTime}
          t={t}
          language={language}
        />
      )}
    </div>
  )
}

function TaskCard({ 
  task, 
  project, 
  priorities,
  onDragStart,
  onDragEnd,
  onDragOver,
  onToggle,
  onDelete, 
  onFocus, 
  formatDueDate, 
  formatTime, 
  isFocusing, 
  isDragging,
  isExpanded,
  onExpand,
  t,
  language
}) {
  const dueInfo = formatDueDate(task.dueDate)
  const timeSpent = formatTime(task.timeSpent)
  const priorityConfig = priorities[task.priority] || priorities.medium
  const [showActions, setShowActions] = useState(false)

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={`
        group relative rounded-xl border transition-all duration-200
        ${isDragging ? 'opacity-50 scale-95 rotate-1' : ''}
        ${task.completed 
          ? 'bg-dark-800/30 border-dark-600/20' 
          : 'bg-dark-800/60 border-dark-600/40 hover:bg-dark-700/70 hover:border-dark-500/60 hover:shadow-xl hover:shadow-black/30 hover:-translate-y-0.5'
        }
        ${isExpanded ? 'ring-2 ring-accent/30' : ''}
      `}
    >
      {/* Priority indicator bar */}
      <div 
        className="absolute left-0 top-4 bottom-4 w-1 rounded-full transition-all group-hover:h-3/4 group-hover:top-[12.5%]"
        style={{ backgroundColor: priorityConfig.color }}
      />

      <div className="p-4 pl-5">
        {/* Header Row */}
        <div className="flex items-start gap-3">
          {/* Drag Handle - appears on hover */}
          <div className={`transition-opacity duration-150 ${showActions ? 'opacity-100' : 'opacity-0'}`}>
            <DragHandle className="-ml-1 -mt-0.5" />
          </div>
          
          {/* Checkbox */}
          <button 
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
              task.completed 
                ? 'bg-green-500 border-green-500 shadow-lg shadow-green-500/30' 
                : 'border-dark-400 hover:border-accent hover:bg-accent/10 hover:scale-110'
            }`}
          >
            {task.completed && <CheckCircle2 size={12} className="text-white" />}
          </button>
          
          <div className="flex-1 min-w-0" onClick={onExpand}>
            <h4 className={`text-sm font-medium leading-snug cursor-pointer ${
              task.completed ? 'line-through text-zinc-500' : 'hover:text-white transition-colors'
            }`}>
              {task.title}
            </h4>
          </div>

          {/* Actions */}
          <div className={`flex items-center gap-1 transition-opacity duration-150 ${showActions ? 'opacity-100' : 'opacity-0'}`}>
            {onFocus && !task.completed && !isFocusing && (
              <button
                onClick={(e) => { e.stopPropagation(); onFocus(); }}
                className="p-1.5 hover:bg-accent/20 rounded-lg transition-all hover:scale-110"
                title={t('projectView.startFocus')}
              >
                <Play size={14} className="text-accent" />
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1.5 hover:bg-red-500/20 rounded-lg text-zinc-500 hover:text-red-400 transition-all hover:scale-110"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        
        {/* Metadata Row */}
        <div className="flex items-center gap-2 flex-wrap mt-3 ml-8">
          {/* Priority Badge */}
          <span className={`text-2xs px-2.5 py-1 rounded-full border font-medium ${priorityConfig.bg} ${priorityConfig.border}`}
            style={{ color: priorityConfig.color }}
          >
            {priorityConfig.label}
          </span>
          
          {/* Due Date */}
          {dueInfo && !task.completed && (
            <Badge variant={dueInfo.urgent ? 'danger' : 'default'} size="sm">
              <Calendar size={10} />
              {dueInfo.text}
            </Badge>
          )}
          
          {/* Time Tracked */}
          {timeSpent && (
            <Badge variant="accent" size="sm">
              <Timer size={10} />
              {timeSpent}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}

function ListView({ tasks, project, priorities, onToggle, onDelete, onAddTask, formatDueDate, formatTime, t, language }) {
  const [newTask, setNewTask] = useState('')
  
  const openTasks = tasks.filter(t => !t.completed)
  const completedTasks = tasks.filter(t => t.completed)
  
  const handleAdd = () => {
    if (!newTask.trim()) return
    onAddTask({ title: newTask.trim(), projectId: project.id, priority: 'medium' })
    setNewTask('')
  }
  
  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-3xl mx-auto">
        {/* Add Task */}
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder={t('projectView.addNewTask')}
            className="flex-1 bg-dark-800/50 border border-dark-600/50 rounded-xl px-4 py-3 text-sm focus:border-accent/50 focus:bg-dark-800 transition-all"
          />
          <button
            onClick={handleAdd}
            disabled={!newTask.trim()}
            className="px-6 py-3 rounded-xl font-medium text-sm disabled:opacity-40 transition-all flex items-center gap-2 hover:shadow-lg"
            style={{ backgroundColor: project.color }}
          >
            <Plus size={18} />
            {t('projectView.add')}
          </button>
        </div>
        
        {/* Tasks */}
        <div className="space-y-2">
          {openTasks.map(task => {
            const dueInfo = formatDueDate(task.dueDate)
            const priorityConfig = priorities[task.priority] || priorities.medium
            
            return (
              <div 
                key={task.id}
                className="flex items-center gap-4 p-4 bg-dark-800/40 rounded-xl border border-dark-600/30 hover:bg-dark-700/40 hover:border-dark-500/50 transition-all group"
              >
                <button 
                  onClick={() => onToggle(task.id)} 
                  className="w-5 h-5 rounded-md border-2 border-dark-400 hover:border-accent hover:bg-accent/10 flex items-center justify-center transition-all"
                />
                <div 
                  className="w-1 h-8 rounded-full"
                  style={{ backgroundColor: priorityConfig.color }}
                />
                <span className="flex-1 text-sm">{task.title}</span>
                {dueInfo && (
                  <span className={`text-xs px-2 py-1 rounded-full ${dueInfo.urgent ? 'bg-red-500/10 text-red-400' : 'bg-dark-700/50 text-zinc-500'}`}>
                    {dueInfo.text}
                  </span>
                )}
                <button 
                  onClick={() => onDelete(task.id)} 
                  className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 rounded-lg text-zinc-500 hover:text-red-400 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )
          })}
        </div>
        
        {completedTasks.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <CheckCheck size={14} />
              {t('projectView.columns.done')} ({completedTasks.length})
            </h3>
            <div className="space-y-2 opacity-60">
              {completedTasks.slice(0, 10).map(task => (
                <div 
                  key={task.id}
                  className="flex items-center gap-4 p-3 bg-dark-800/20 rounded-xl group hover:bg-dark-800/30 transition-all"
                >
                  <button 
                    onClick={() => onToggle(task.id)} 
                    className="w-5 h-5 rounded-md bg-green-500 flex items-center justify-center"
                  >
                    <CheckCircle2 size={12} className="text-white" />
                  </button>
                  <span className="flex-1 text-sm line-through text-zinc-500">{task.title}</span>
                  <button 
                    onClick={() => onDelete(task.id)} 
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded-lg text-zinc-600 hover:text-red-400 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectView
