import React, { useState, useMemo } from 'react'
import useStore from '../store/useStore'
import DynamicIcon from './Icons'
import { format, parseISO, isPast, isToday, isTomorrow, differenceInDays } from 'date-fns'
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
  CheckCheck
} from 'lucide-react'

const COLUMNS = [
  { id: 'todo', title: 'To Do', icon: Circle, color: '#6366f1', gradient: 'from-indigo-500/10 to-purple-500/5' },
  { id: 'in-progress', title: 'In Progress', icon: Clock, color: '#f59e0b', gradient: 'from-amber-500/10 to-orange-500/5' },
  { id: 'done', title: 'Done', icon: CheckCircle2, color: '#22c55e', gradient: 'from-green-500/10 to-emerald-500/5' }
]

const PRIORITIES = {
  urgent: { label: 'Urgent', color: '#ef4444', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: '🔴' },
  high: { label: 'High', color: '#f97316', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: '🟠' },
  medium: { label: 'Medium', color: '#eab308', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: '🟡' },
  low: { label: 'Low', color: '#22c55e', bg: 'bg-green-500/10', border: 'border-green-500/20', icon: '🟢' }
}

function ProjectView() {
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
  const [expandedCard, setExpandedCard] = useState(null)
  
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
          <Sparkles size={48} className="mx-auto text-zinc-700 mb-4" />
          <p className="text-zinc-500">Select a project from the sidebar</p>
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
  }

  const handleDragOver = (e, columnId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(columnId)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = (e, columnId) => {
    e.preventDefault()
    setDragOverColumn(null)
    
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
    
    if (isToday(date)) return { text: 'Today', urgent: true }
    if (isTomorrow(date)) return { text: 'Tomorrow', urgent: false }
    if (isPast(date)) return { text: `${Math.abs(daysUntil)}d overdue`, urgent: true }
    if (daysUntil <= 7) return { text: `${daysUntil}d`, urgent: false }
    return { text: format(date, 'MMM d'), urgent: false }
  }

  const formatTime = (minutes) => {
    if (!minutes) return null
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (h > 0) return `${h}h ${m}m`
    return `${m}m`
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 px-8 pt-8 pb-6 border-b border-dark-600/30">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-lg"
              style={{ background: `linear-gradient(135deg, ${project.color}40, ${project.color}20)` }}
            >
              <div 
                className="absolute inset-0 opacity-30"
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
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-800/50 rounded-full border border-dark-600/30">
                <Circle size={12} className="text-blue-400" />
                <span className="text-xs font-medium">{projectTasks.length - completedCount}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-800/50 rounded-full border border-dark-600/30">
                <CheckCheck size={12} className="text-green-400" />
                <span className="text-xs font-medium">{completedCount}</span>
              </div>
              {totalTimeSpent > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-800/50 rounded-full border border-dark-600/30">
                  <Timer size={12} className="text-purple-400" />
                  <span className="text-xs font-medium">{formatTime(totalTimeSpent)}</span>
                </div>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-dark-800/80 rounded-xl p-1 border border-dark-600/50">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'kanban' 
                    ? 'bg-white/10 text-white shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list' 
                    ? 'bg-white/10 text-white shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="relative">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-zinc-500">Progress</span>
            <span className="font-mono text-zinc-400">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-dark-700/50 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-700 ease-out relative"
              style={{ 
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${project.color}, ${project.color}bb)`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
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
                  className={`w-[340px] flex flex-col rounded-2xl border transition-all ${
                    isDropTarget 
                      ? 'border-accent/50 bg-accent/5' 
                      : 'border-dark-600/30 bg-dark-800/20'
                  }`}
                  onDragOver={(e) => handleDragOver(e, column.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, column.id)}
                >
                  {/* Column Header */}
                  <div className={`px-4 py-3 border-b border-dark-600/30 bg-gradient-to-r ${column.gradient} rounded-t-2xl`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-2.5 h-2.5 rounded-full shadow-lg"
                          style={{ backgroundColor: column.color, boxShadow: `0 0 8px ${column.color}50` }}
                        />
                        <h3 className="font-semibold text-sm">{column.title}</h3>
                        <span className="text-xs text-zinc-500 font-mono bg-dark-700/50 px-2 py-0.5 rounded-full">
                          {columnTasks.length}
                        </span>
                      </div>
                      <button
                        onClick={() => setNewTaskColumn(newTaskColumn === column.id ? null : column.id)}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-zinc-500 hover:text-white"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Add Task Form */}
                  {newTaskColumn === column.id && (
                    <div className="p-3 border-b border-dark-600/30 bg-dark-800/30 animate-fade-in">
                      <input
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTask(column.id)}
                        placeholder="Task title..."
                        className="w-full bg-dark-700/50 border border-dark-500/50 rounded-xl px-3 py-2.5 text-sm focus:border-accent/50 focus:bg-dark-700 transition-all"
                        autoFocus
                      />
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex gap-1">
                          {Object.entries(PRIORITIES).map(([key, p]) => (
                            <button
                              key={key}
                              onClick={() => setPriority(key)}
                              className={`w-7 h-7 rounded-lg text-xs flex items-center justify-center transition-all ${
                                priority === key 
                                  ? `${p.bg} ${p.border} border` 
                                  : 'bg-dark-700/50 hover:bg-dark-600/50'
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
                          className="px-3 py-1.5 text-xs text-zinc-500 hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleAddTask(column.id)}
                          disabled={!newTask.trim()}
                          className="px-3 py-1.5 bg-accent hover:bg-accent/80 disabled:opacity-40 rounded-lg text-xs font-medium transition-all"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Tasks */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {columnTasks.length === 0 ? (
                      <div className="text-center py-12 text-zinc-600 text-xs">
                        <div className="w-10 h-10 rounded-xl bg-dark-700/30 flex items-center justify-center mx-auto mb-2">
                          <column.icon size={18} className="opacity-30" />
                        </div>
                        {column.id === 'done' ? 'Completed tasks' : 'Drop tasks here'}
                      </div>
                    ) : (
                      columnTasks.map(task => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          project={project}
                          onDragStart={(e) => handleDragStart(e, task)}
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
                        />
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
          onToggle={toggleTask}
          onDelete={deleteTask}
          onAddTask={addTask}
          formatDueDate={formatDueDate}
          formatTime={formatTime}
        />
      )}
    </div>
  )
}

function TaskCard({ 
  task, 
  project, 
  onDragStart, 
  onToggle,
  onDelete, 
  onFocus, 
  formatDueDate, 
  formatTime, 
  isFocusing, 
  isDragging,
  isExpanded,
  onExpand
}) {
  const dueInfo = formatDueDate(task.dueDate)
  const timeSpent = formatTime(task.timeSpent)
  const priorityConfig = PRIORITIES[task.priority] || PRIORITIES.medium

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onExpand}
      className={`
        group relative p-4 rounded-xl border cursor-grab active:cursor-grabbing transition-all duration-200
        ${isDragging ? 'opacity-40 scale-95 rotate-2' : ''}
        ${task.completed 
          ? 'bg-dark-800/30 border-dark-600/20 opacity-60' 
          : 'bg-dark-800/60 border-dark-600/40 hover:bg-dark-700/60 hover:border-dark-500/50 hover:shadow-lg hover:shadow-black/20'
        }
        ${isExpanded ? 'ring-1 ring-accent/30' : ''}
      `}
    >
      {/* Priority indicator bar */}
      <div 
        className="absolute left-0 top-3 bottom-3 w-1 rounded-full"
        style={{ backgroundColor: priorityConfig.color }}
      />

      {/* Main Content */}
      <div className="pl-3">
        {/* Header Row */}
        <div className="flex items-start gap-3 mb-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
              task.completed 
                ? 'bg-green-500 border-green-500' 
                : 'border-dark-400 hover:border-accent hover:bg-accent/10'
            }`}
          >
            {task.completed && <CheckCircle2 size={12} className="text-white" />}
          </button>
          
          <h4 className={`flex-1 text-sm font-medium leading-snug ${
            task.completed ? 'line-through text-zinc-500' : ''
          }`}>
            {task.title}
          </h4>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onFocus && !task.completed && !isFocusing && (
              <button
                onClick={(e) => { e.stopPropagation(); onFocus(); }}
                className="p-1.5 hover:bg-accent/20 rounded-lg transition-all"
                title="Start focus"
              >
                <Play size={12} className="text-accent" />
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1.5 hover:bg-red-500/20 rounded-lg text-zinc-500 hover:text-red-400 transition-all"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
        
        {/* Metadata Row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Priority Badge */}
          <span className={`text-2xs px-2 py-0.5 rounded-full border ${priorityConfig.bg} ${priorityConfig.border}`}
            style={{ color: priorityConfig.color }}
          >
            {priorityConfig.label}
          </span>
          
          {/* Due Date */}
          {dueInfo && !task.completed && (
            <span className={`text-2xs flex items-center gap-1 px-2 py-0.5 rounded-full ${
              dueInfo.urgent 
                ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                : 'bg-dark-700/50 text-zinc-400'
            }`}>
              <Calendar size={10} />
              {dueInfo.text}
            </span>
          )}
          
          {/* Time Tracked */}
          {timeSpent && (
            <span className="text-2xs flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Timer size={10} />
              {timeSpent}
            </span>
          )}
        </div>
      </div>

      {/* Drag Handle Indicator */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-30 transition-opacity">
        <GripVertical size={14} />
      </div>
    </div>
  )
}

function ListView({ tasks, project, onToggle, onDelete, onAddTask, formatDueDate, formatTime }) {
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
            placeholder="Add a new task..."
            className="flex-1 bg-dark-800/50 border border-dark-600/50 rounded-xl px-4 py-3 text-sm focus:border-accent/50 focus:bg-dark-800 transition-all"
          />
          <button
            onClick={handleAdd}
            disabled={!newTask.trim()}
            className="px-5 py-3 rounded-xl font-medium text-sm disabled:opacity-40 transition-all flex items-center gap-2"
            style={{ backgroundColor: project.color }}
          >
            <Plus size={16} />
            Add
          </button>
        </div>
        
        {/* Tasks */}
        <div className="space-y-2">
          {openTasks.map(task => {
            const dueInfo = formatDueDate(task.dueDate)
            const priorityConfig = PRIORITIES[task.priority] || PRIORITIES.medium
            
            return (
              <div 
                key={task.id}
                className="flex items-center gap-4 p-4 bg-dark-800/40 rounded-xl border border-dark-600/30 hover:bg-dark-700/40 transition-all group"
              >
                <button 
                  onClick={() => onToggle(task.id)} 
                  className="w-5 h-5 rounded-md border-2 border-dark-400 hover:border-accent flex items-center justify-center transition-all"
                />
                <div 
                  className="w-1 h-8 rounded-full"
                  style={{ backgroundColor: priorityConfig.color }}
                />
                <span className="flex-1 text-sm">{task.title}</span>
                {dueInfo && (
                  <span className={`text-xs ${dueInfo.urgent ? 'text-red-400' : 'text-zinc-500'}`}>
                    {dueInfo.text}
                  </span>
                )}
                <button 
                  onClick={() => onDelete(task.id)} 
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded-lg text-zinc-500 hover:text-red-400 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )
          })}
        </div>
        
        {completedTasks.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
              Completed ({completedTasks.length})
            </h3>
            <div className="space-y-2 opacity-50">
              {completedTasks.slice(0, 10).map(task => (
                <div 
                  key={task.id}
                  className="flex items-center gap-4 p-3 bg-dark-800/20 rounded-xl group"
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
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded text-zinc-600 hover:text-red-400"
                  >
                    <Trash2 size={12} />
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
