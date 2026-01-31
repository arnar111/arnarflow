import React, { useState, useMemo } from 'react'
import useStore from '../store/useStore'
import DynamicIcon from './Icons'
import { format, parseISO, isPast, isToday, isTomorrow } from 'date-fns'
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  Trash2,
  Clock,
  Calendar,
  Flag,
  Filter,
  SortAsc,
  Play,
  MoreHorizontal,
  Timer
} from 'lucide-react'

function ProjectView() {
  const { 
    projects, 
    selectedProject, 
    tasks, 
    addTask, 
    toggleTask, 
    deleteTask,
    setFocusProject,
    setFocusTask,
    focusProject
  } = useStore()
  
  const [newTask, setNewTask] = useState('')
  const [priority, setPriority] = useState('medium')
  const [sortBy, setSortBy] = useState('created') // created, priority, dueDate
  const [showCompleted, setShowCompleted] = useState(false)
  
  const project = projects.find(p => p.id === selectedProject)
  
  const projectTasks = useMemo(() => {
    let filtered = tasks.filter(t => t.projectId === selectedProject)
    
    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'priority') {
        const order = { urgent: 0, high: 1, medium: 2, low: 3 }
        return (order[a.priority] || 3) - (order[b.priority] || 3)
      }
      if (sortBy === 'dueDate') {
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate) - new Date(b.dueDate)
      }
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
    
    return filtered
  }, [tasks, selectedProject, sortBy])
  
  const openTasks = projectTasks.filter(t => !t.completed)
  const completedTasks = projectTasks.filter(t => t.completed)
  
  const totalTimeSpent = projectTasks.reduce((sum, t) => sum + (t.timeSpent || 0), 0)

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500">
        Select a project from the sidebar
      </div>
    )
  }

  const handleAddTask = (e) => {
    e.preventDefault()
    if (!newTask.trim()) return
    
    addTask({
      title: newTask.trim(),
      projectId: selectedProject,
      priority
    })
    setNewTask('')
  }

  const formatDueDate = (dateStr) => {
    if (!dateStr) return null
    const date = parseISO(dateStr)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    if (isPast(date)) return 'Overdue'
    return format(date, 'MMM d')
  }

  const formatTime = (minutes) => {
    if (!minutes) return null
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (h > 0) return `${h}h ${m}m`
    return `${m}m`
  }

  return (
    <div className="p-8 max-w-4xl animate-fade-in">
      {/* Project Header */}
      <header className="mb-8">
        <div className="flex items-start gap-4 mb-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${project.color}15` }}
          >
            <DynamicIcon name={project.icon} size={24} style={{ color: project.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight" style={{ color: project.color }}>
              {project.name}
            </h1>
            <p className="text-sm text-zinc-500 mt-0.5">{project.description}</p>
          </div>
          
          {/* Stats */}
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <p className="text-xl font-semibold font-mono">{openTasks.length}</p>
              <p className="text-2xs text-zinc-500">Open</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold font-mono text-green-400">{completedTasks.length}</p>
              <p className="text-2xs text-zinc-500">Done</p>
            </div>
            {totalTimeSpent > 0 && (
              <div className="text-center">
                <p className="text-xl font-semibold font-mono text-accent">{formatTime(totalTimeSpent)}</p>
                <p className="text-2xs text-zinc-500">Tracked</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: projectTasks.length > 0 
                ? `${(completedTasks.length / projectTasks.length) * 100}%` 
                : '0%',
              backgroundColor: project.color 
            }}
          />
        </div>
      </header>

      {/* Add Task Form */}
      <form onSubmit={handleAddTask} className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-dark-800 border border-dark-600 rounded-xl px-4 py-2.5 focus-within:border-accent transition-colors">
            <Plus size={16} className="text-zinc-500" />
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a task..."
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-zinc-600"
            />
          </div>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="bg-dark-800 border border-dark-600 rounded-xl px-3 py-2.5 text-sm focus:border-accent transition-colors"
          >
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button
            type="submit"
            disabled={!newTask.trim()}
            className="px-4 py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-40"
            style={{ backgroundColor: project.color }}
          >
            Add
          </button>
        </div>
      </form>

      {/* Filters & Sort */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 flex items-center gap-1">
            <SortAsc size={12} /> Sort:
          </span>
          {['created', 'priority', 'dueDate'].map(sort => (
            <button
              key={sort}
              onClick={() => setSortBy(sort)}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                sortBy === sort 
                  ? 'bg-dark-600 text-white' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {sort === 'created' ? 'Recent' : sort === 'priority' ? 'Priority' : 'Due Date'}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowCompleted(!showCompleted)}
          className={`text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors ${
            showCompleted ? 'bg-dark-600 text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <CheckCircle2 size={12} />
          {showCompleted ? 'Hide' : 'Show'} completed
        </button>
      </div>

      {/* Tasks List */}
      <div className="space-y-6">
        {/* Open Tasks */}
        {openTasks.length === 0 ? (
          <div className="text-center py-12 bg-dark-800/30 rounded-xl border border-dark-600/50">
            <Circle size={32} className="mx-auto text-zinc-700 mb-3" />
            <p className="text-zinc-500 text-sm">No open tasks</p>
            <p className="text-zinc-600 text-xs mt-1">Add one above to get started</p>
          </div>
        ) : (
          <ul className="space-y-1.5 stagger-children">
            {openTasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                project={project}
                onToggle={() => toggleTask(task.id)}
                onDelete={() => deleteTask(task.id)}
                onFocus={() => {
                  setFocusProject(project.id)
                  setFocusTask(task.id)
                }}
                formatDueDate={formatDueDate}
                formatTime={formatTime}
                isFocusing={focusProject === project.id}
              />
            ))}
          </ul>
        )}

        {/* Completed Tasks */}
        {showCompleted && completedTasks.length > 0 && (
          <div>
            <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <CheckCircle2 size={12} />
              Completed ({completedTasks.length})
            </h2>
            <ul className="space-y-1.5 opacity-50">
              {completedTasks.map(task => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  project={project}
                  onToggle={() => toggleTask(task.id)}
                  onDelete={() => deleteTask(task.id)}
                  formatDueDate={formatDueDate}
                  formatTime={formatTime}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

function TaskItem({ task, project, onToggle, onDelete, onFocus, formatDueDate, formatTime, isFocusing }) {
  const dueLabel = formatDueDate(task.dueDate)
  const isOverdue = task.dueDate && isPast(parseISO(task.dueDate)) && !task.completed
  const timeSpent = formatTime(task.timeSpent)

  return (
    <li className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-xl border border-dark-600/50 hover:bg-dark-800 hover:border-dark-500 transition-all group">
      <button 
        onClick={onToggle}
        className={`task-checkbox ${task.completed ? 'checked' : ''}`}
      >
        {task.completed && <CheckCircle2 size={12} className="text-white" />}
      </button>
      
      <span className={`flex-1 text-sm ${task.completed ? 'line-through text-zinc-500' : ''}`}>
        {task.title}
      </span>
      
      <div className="flex items-center gap-2">
        {timeSpent && (
          <span className="text-2xs text-accent flex items-center gap-1">
            <Timer size={10} />
            {timeSpent}
          </span>
        )}
        
        {dueLabel && !task.completed && (
          <span className={`text-2xs flex items-center gap-1 ${
            isOverdue ? 'text-red-400' : 'text-zinc-500'
          }`}>
            <Calendar size={10} />
            {dueLabel}
          </span>
        )}
        
        {task.priority && !task.completed && (
          <Flag size={12} className={`priority-${task.priority}`} />
        )}
        
        {onFocus && !task.completed && !isFocusing && (
          <button
            onClick={onFocus}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-accent/20 rounded transition-all"
            title="Focus on this task"
          >
            <Play size={12} className="text-accent" />
          </button>
        )}
        
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded text-zinc-500 hover:text-red-400 transition-all"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </li>
  )
}

export default ProjectView
