import React from 'react'
import useStore from '../store/useStore'
import DynamicIcon from './Icons'
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns'
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  TrendingUp,
  Lightbulb,
  Zap,
  Play,
  ArrowRight,
  Calendar,
  AlertTriangle
} from 'lucide-react'

function Dashboard() {
  const { 
    projects, 
    tasks, 
    ideas, 
    habits, 
    habitLogs,
    toggleTask,
    focusProject,
    setFocusProject,
    setFocusTask,
    setActiveView,
    setSelectedProject
  } = useStore()

  const today = format(new Date(), 'yyyy-MM-dd')
  const openTasks = tasks.filter(t => !t.completed)
  const todaysTasks = openTasks.slice(0, 6)
  const completedToday = tasks.filter(t => 
    t.completedAt && t.completedAt.startsWith(today)
  ).length
  const inboxIdeas = ideas.filter(i => i.status === 'inbox').length
  const overdueTasks = openTasks.filter(t => t.dueDate && isPast(parseISO(t.dueDate)))

  const getHabitsDoneToday = () => {
    return habits.filter(h => habitLogs[`${h.id}-${today}`]).length
  }

  const getProjectById = (id) => projects.find(p => p.id === id)
  const focusedProject = focusProject ? getProjectById(focusProject) : null

  const formatDueDate = (dateStr) => {
    if (!dateStr) return null
    const date = parseISO(dateStr)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    if (isPast(date)) return 'Overdue'
    return format(date, 'MMM d')
  }

  return (
    <div className="p-8 max-w-6xl animate-fade-in">
      {/* Header */}
      <header className="mb-8">
        <p className="text-zinc-500 text-sm mb-1">
          {format(new Date(), 'EEEE, MMMM d')}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Good {getTimeOfDay()}, <span className="text-cyan-400">Arnar</span>
        </h1>
      </header>

      {/* Overdue Alert */}
      {overdueTasks.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 animate-fade-in">
          <AlertTriangle size={20} className="text-red-400" />
          <span className="text-red-400 text-sm font-medium">
            {overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''} need attention
          </span>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        <StatCard 
          icon={CheckCircle2}
          label="Done Today"
          value={completedToday}
          color="#22c55e"
        />
        <StatCard 
          icon={Circle}
          label="Open Tasks"
          value={openTasks.length}
          color="#3b82f6"
        />
        <StatCard 
          icon={Lightbulb}
          label="Ideas"
          value={inboxIdeas}
          color="#f59e0b"
          onClick={() => setActiveView('ideas')}
        />
        <StatCard 
          icon={TrendingUp}
          label="Habits"
          value={`${getHabitsDoneToday()}/${habits.length}`}
          color="#a855f7"
          onClick={() => setActiveView('habits')}
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-medium flex items-center gap-2">
              <Clock size={16} className="text-accent" />
              Up Next
            </h2>
            <button 
              onClick={() => setActiveView('ideas')}
              className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>
          
          {todaysTasks.length === 0 ? (
            <div className="bg-dark-800/50 rounded-xl border border-dark-600/50 p-8 text-center">
              <Circle size={32} className="mx-auto text-zinc-700 mb-3" />
              <p className="text-zinc-500 text-sm">No tasks yet</p>
              <p className="text-zinc-600 text-xs mt-1">
                Press <kbd className="kbd">⌘K</kbd> to add one
              </p>
            </div>
          ) : (
            <ul className="space-y-2 stagger-children">
              {todaysTasks.map(task => {
                const project = getProjectById(task.projectId)
                const dueLabel = formatDueDate(task.dueDate)
                const isOverdue = task.dueDate && isPast(parseISO(task.dueDate))
                
                return (
                  <li 
                    key={task.id}
                    className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-xl border border-dark-600/50 hover:bg-dark-800 hover:border-dark-500 transition-all group"
                  >
                    <button 
                      onClick={() => toggleTask(task.id)}
                      className="task-checkbox"
                    >
                      {task.completed && <CheckCircle2 size={14} />}
                    </button>
                    <span className="flex-1 text-sm">{task.title}</span>
                    
                    {dueLabel && (
                      <span className={`text-2xs flex items-center gap-1 ${
                        isOverdue ? 'text-red-400' : 'text-zinc-500'
                      }`}>
                        <Calendar size={10} />
                        {dueLabel}
                      </span>
                    )}
                    
                    {project && (
                      <span 
                        className="text-2xs px-1.5 py-0.5 rounded flex items-center gap-1"
                        style={{ backgroundColor: `${project.color}15`, color: project.color }}
                      >
                        <DynamicIcon name={project.icon} size={10} />
                        {project.name}
                      </span>
                    )}
                    
                    {!focusProject && (
                      <button
                        onClick={() => {
                          setFocusProject(task.projectId)
                          setFocusTask(task.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-accent/20 rounded transition-all"
                        title="Start focus session"
                      >
                        <Play size={12} className="text-accent" />
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Focus Mode */}
        <div className="bg-dark-800/50 rounded-xl border border-dark-600/50 p-5">
          <h2 className="text-base font-medium flex items-center gap-2 mb-4">
            <Zap size={16} className="text-yellow-400" />
            Focus
          </h2>
          
          {focusedProject ? (
            <div className="text-center py-4">
              <div 
                className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${focusedProject.color}20` }}
              >
                <DynamicIcon name={focusedProject.icon} size={28} style={{ color: focusedProject.color }} />
              </div>
              <h3 className="font-medium" style={{ color: focusedProject.color }}>
                {focusedProject.name}
              </h3>
              <p className="text-xs text-zinc-500 mt-1">{focusedProject.description}</p>
            </div>
          ) : (
            <div>
              <p className="text-zinc-500 text-xs mb-3">Start a focus session:</p>
              <div className="space-y-1.5">
                {projects.slice(0, 4).map(project => (
                  <button
                    key={project.id}
                    onClick={() => setFocusProject(project.id)}
                    className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-dark-700 transition-colors text-left text-sm"
                  >
                    <DynamicIcon name={project.icon} size={14} style={{ color: project.color }} />
                    <span className="text-zinc-400">{project.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Projects Overview */}
      <div className="mt-8">
        <h2 className="text-base font-medium mb-4">Projects</h2>
        <div className="grid grid-cols-5 gap-3">
          {projects.map(project => {
            const projectTasks = tasks.filter(t => t.projectId === project.id)
            const completed = projectTasks.filter(t => t.completed).length
            const total = projectTasks.length
            const progress = total > 0 ? (completed / total) * 100 : 0
            
            return (
              <button
                key={project.id}
                onClick={() => {
                  setActiveView('project')
                  setSelectedProject(project.id)
                }}
                className="bg-dark-800/50 rounded-xl p-4 border border-dark-600/50 hover:bg-dark-800 hover:border-dark-500 transition-all text-left group"
              >
                <div className="flex items-center gap-2 mb-3">
                  <DynamicIcon name={project.icon} size={16} style={{ color: project.color }} />
                  <span className="font-medium text-sm truncate">{project.name}</span>
                </div>
                <div className="h-1 bg-dark-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%`, backgroundColor: project.color }}
                  />
                </div>
                <p className="text-2xs text-zinc-600 mt-2 font-mono">
                  {completed}/{total}
                </p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className="bg-dark-800/50 rounded-xl p-4 border border-dark-600/50 hover:bg-dark-800 hover:border-dark-500 transition-all text-left disabled:hover:bg-dark-800/50 disabled:hover:border-dark-600/50"
    >
      <Icon size={18} style={{ color }} className="mb-2 opacity-80" />
      <p className="text-2xl font-semibold font-mono">{value}</p>
      <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
    </button>
  )
}

function getTimeOfDay() {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

export default Dashboard
