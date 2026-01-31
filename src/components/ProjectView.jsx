import React, { useState, useMemo } from 'react'
import useStore from '../store/useStore'
import DynamicIcon from './Icons'
import { format, parseISO, isPast, isToday, isTomorrow } from 'date-fns'
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
  Sparkles,
  GripVertical,
  MoreHorizontal,
  ChevronDown,
  Clock,
  Target,
  Zap
} from 'lucide-react'

const COLUMNS = [
  { id: 'todo', title: 'To Do', icon: Circle, color: '#6366f1' },
  { id: 'in-progress', title: 'In Progress', icon: Clock, color: '#f59e0b' },
  { id: 'done', title: 'Done', icon: CheckCircle2, color: '#22c55e' }
]

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
  
  const [viewMode, setViewMode] = useState('kanban') // kanban | list
  const [newTask, setNewTask] = useState('')
  const [newTaskColumn, setNewTaskColumn] = useState('todo')
  const [priority, setPriority] = useState('medium')
  const [draggedTask, setDraggedTask] = useState(null)
  const [showAddForm, setShowAddForm] = useState(null)
  
  const project = projects.find(p => p.id === selectedProject)
  
  const projectTasks = useMemo(() => {
    return tasks.filter(t => t.projectId === selectedProject)
  }, [tasks, selectedProject])
  
  const getTasksByStatus = (status) => {
    return projectTasks.filter(t => {
      if (status === 'done') return t.completed
      if (status === 'in-progress') return !t.completed && t.status === 'in-progress'
      return !t.completed && t.status !== 'in-progress'
    })
  }

  const totalTimeSpent = projectTasks.reduce((sum, t) => sum + (t.timeSpent || 0), 0)
  const completedCount = projectTasks.filter(t => t.completed).length
  const progress = projectTasks.length > 0 ? (completedCount / projectTasks.length) * 100 : 0

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500">
        Select a project from the sidebar
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
    setShowAddForm(null)
  }

  const handleDragStart = (e, task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, columnId) => {
    e.preventDefault()
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
    <div className="h-full flex flex-col animate-fade-in">
      {/* Project Header */}
      <header className="px-8 pt-8 pb-6 border-b border-dark-600/30">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${project.color}30, ${project.color}10)` }}
            >
              <div 
                className="absolute inset-0 opacity-20"
                style={{ background: `radial-gradient(circle at 30% 30%, ${project.color}, transparent)` }}
              />
              <DynamicIcon name={project.icon} size={28} style={{ color: project.color }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                {project.name}
                <span 
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: `${project.color}20`, color: project.color }}
                >
                  {projectTasks.length} tasks
                </span>
              </h1>
              <p className="text-sm text-zinc-500 mt-0.5">{project.description}</p>
            </div>
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-dark-800/80 rounded-xl p-1 border border-dark-600/50">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'kanban' 
                  ? 'bg-dark-600 text-white shadow-lg' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Kanban view"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list' 
                  ? 'bg-dark-600 text-white shadow-lg' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="List view"
            >
              <List size={18} />
            </button>
          </div>
        </div>
        
        {/* Stats Bar */}
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-zinc-500">Progress</span>
              <span className="font-mono text-zinc-400">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-dark-700/50 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-700 ease-out relative"
                style={{ 
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${project.color}, ${project.color}cc)`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 text-sm">
            <Stat icon={Target} value={projectTasks.length - completedCount} label="Open" />
            <Stat icon={CheckCircle2} value={completedCount} label="Done" color="#22c55e" />
            {totalTimeSpent > 0 && (
              <Stat icon={Timer} value={formatTime(totalTimeSpent)} label="Tracked" color={project.color} />
            )}
          </div>
        </div>
      </header>

      {/* Kanban Board */}
      {viewMode === 'kanban' ? (
        <div className="flex-1 overflow-x-auto p-6">
          <div className="flex gap-4 h-full min-w-max">
            {COLUMNS.map(column => {
              const columnTasks = getTasksByStatus(column.id)
              
              return (
                <div 
                  key={column.id}
                  className="w-80 flex flex-col bg-dark-800/30 rounded-2xl border border-dark-600/30 overflow-hidden"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.id)}
                >
                  {/* Column Header */}
                  <div className="px-4 py-3 border-b border-dark-600/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: column.color }}
                      />
                      <h3 className="font-medium text-sm">{column.title}</h3>
                      <span className="text-xs text-zinc-500 font-mono bg-dark-700/50 px-1.5 py-0.5 rounded">
                        {columnTasks.length}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowAddForm(showAddForm === column.id ? null : column.id)}
                      className="p-1 hover:bg-dark-600 rounded-lg transition-colors text-zinc-500 hover:text-zinc-300"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  
                  {/* Add Task Form */}
                  {showAddForm === column.id && (
                    <div className="p-3 border-b border-dark-600/30 bg-dark-800/50 animate-fade-in">
                      <input
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTask(column.id)}
                        placeholder="Task title..."
                        className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-sm mb-2 focus:border-accent transition-colors"
                        autoFocus
                      />
                      <div className="flex items-center gap-2">
                        <select
                          value={priority}
                          onChange={(e) => setPriority(e.target.value)}
                          className="flex-1 bg-dark-700 border border-dark-500 rounded-lg px-2 py-1.5 text-xs"
                        >
                          <option value="urgent">🔴 Urgent</option>
                          <option value="high">🟠 High</option>
                          <option value="medium">🟡 Medium</option>
                          <option value="low">🟢 Low</option>
                        </select>
                        <button
                          onClick={() => handleAddTask(column.id)}
                          disabled={!newTask.trim()}
                          className="px-3 py-1.5 bg-accent hover:bg-accent/80 disabled:opacity-40 rounded-lg text-xs font-medium transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Tasks */}
                  <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {columnTasks.length === 0 ? (
                      <div className="text-center py-8 text-zinc-600 text-xs">
                        {column.id === 'done' ? 'Completed tasks appear here' : 'Drop tasks here'}
                      </div>
                    ) : (
                      columnTasks.map(task => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          project={project}
                          onDragStart={(e) => handleDragStart(e, task)}
                          onDelete={() => deleteTask(task.id)}
                          onFocus={() => {
                            setFocusProject(project.id)
                            setFocusTask(task.id)
                          }}
                          formatDueDate={formatDueDate}
                          formatTime={formatTime}
                          isFocusing={focusProject === project.id}
                          isDragging={draggedTask?.id === task.id}
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
        // List View
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

function TaskCard({ task, project, onDragStart, onDelete, onFocus, formatDueDate, formatTime, isFocusing, isDragging }) {
  const dueLabel = formatDueDate(task.dueDate)
  const isOverdue = task.dueDate && isPast(parseISO(task.dueDate)) && !task.completed
  const timeSpent = formatTime(task.timeSpent)

  const priorityColors = {
    urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-green-500/20 text-green-400 border-green-500/30'
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={`group p-3 bg-dark-800/80 hover:bg-dark-700 rounded-xl border border-dark-600/50 hover:border-dark-500 cursor-grab active:cursor-grabbing transition-all ${
        isDragging ? 'opacity-50 scale-95' : ''
      } ${task.completed ? 'opacity-60' : ''}`}
    >
      {/* Card Header */}
      <div className="flex items-start gap-2 mb-2">
        <GripVertical size={14} className="text-zinc-600 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <h4 className={`flex-1 text-sm font-medium leading-snug ${task.completed ? 'line-through text-zinc-500' : ''}`}>
          {task.title}
        </h4>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded text-zinc-500 hover:text-red-400 transition-all"
        >
          <Trash2 size={12} />
        </button>
      </div>
      
      {/* Card Footer */}
      <div className="flex items-center gap-2 flex-wrap">
        {task.priority && (
          <span className={`text-2xs px-1.5 py-0.5 rounded border ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
        )}
        
        {dueLabel && !task.completed && (
          <span className={`text-2xs flex items-center gap-1 ${isOverdue ? 'text-red-400' : 'text-zinc-500'}`}>
            <Calendar size={10} />
            {dueLabel}
          </span>
        )}
        
        {timeSpent && (
          <span className="text-2xs text-accent flex items-center gap-1">
            <Timer size={10} />
            {timeSpent}
          </span>
        )}
        
        <div className="flex-1" />
        
        {onFocus && !task.completed && !isFocusing && (
          <button
            onClick={(e) => { e.stopPropagation(); onFocus(); }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-accent/20 rounded transition-all"
            title="Focus on this task"
          >
            <Play size={12} className="text-accent" />
          </button>
        )}
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
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Add a task..."
            className="flex-1 bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-sm focus:border-accent transition-colors"
          />
          <button
            onClick={handleAdd}
            disabled={!newTask.trim()}
            className="px-5 py-3 rounded-xl font-medium text-sm disabled:opacity-40 transition-all"
            style={{ backgroundColor: project.color }}
          >
            <Plus size={18} />
          </button>
        </div>
        
        {/* Tasks */}
        <div className="space-y-2">
          {openTasks.map(task => (
            <ListItem 
              key={task.id} 
              task={task} 
              project={project}
              onToggle={() => onToggle(task.id)}
              onDelete={() => onDelete(task.id)}
              formatDueDate={formatDueDate}
              formatTime={formatTime}
            />
          ))}
        </div>
        
        {completedTasks.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
              Completed ({completedTasks.length})
            </h3>
            <div className="space-y-2 opacity-50">
              {completedTasks.map(task => (
                <ListItem 
                  key={task.id} 
                  task={task} 
                  project={project}
                  onToggle={() => onToggle(task.id)}
                  onDelete={() => onDelete(task.id)}
                  formatDueDate={formatDueDate}
                  formatTime={formatTime}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ListItem({ task, project, onToggle, onDelete, formatDueDate, formatTime }) {
  const dueLabel = formatDueDate(task.dueDate)
  const isOverdue = task.dueDate && isPast(parseISO(task.dueDate)) && !task.completed
  
  return (
    <div className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-xl border border-dark-600/50 hover:bg-dark-800 transition-all group">
      <button onClick={onToggle} className={`task-checkbox ${task.completed ? 'checked' : ''}`}>
        {task.completed && <CheckCircle2 size={12} className="text-white" />}
      </button>
      <span className={`flex-1 text-sm ${task.completed ? 'line-through text-zinc-500' : ''}`}>
        {task.title}
      </span>
      {dueLabel && !task.completed && (
        <span className={`text-xs ${isOverdue ? 'text-red-400' : 'text-zinc-500'}`}>{dueLabel}</span>
      )}
      {task.priority && <Flag size={12} className={`priority-${task.priority}`} />}
      <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded text-zinc-500 hover:text-red-400 transition-all">
        <Trash2 size={12} />
      </button>
    </div>
  )
}

function Stat({ icon: Icon, value, label, color }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-dark-800/50 rounded-xl border border-dark-600/30">
      <Icon size={14} style={{ color: color || '#a1a1aa' }} />
      <span className="font-semibold font-mono text-sm" style={{ color }}>{value}</span>
      <span className="text-2xs text-zinc-500">{label}</span>
    </div>
  )
}

export default ProjectView
