import React from 'react'
import useStore from '../store/useStore'
import DynamicIcon from './Icons'
import { format, isToday, isTomorrow, isPast, parseISO, subDays, startOfDay } from 'date-fns'
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
  AlertTriangle,
  Flame,
  Target,
  Sparkles,
  Trophy,
  BarChart3
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
  const todaysTasks = openTasks.slice(0, 5)
  const completedToday = tasks.filter(t => 
    t.completedAt && t.completedAt.startsWith(today)
  ).length
  const inboxIdeas = ideas.filter(i => i.status === 'inbox').length
  const overdueTasks = openTasks.filter(t => t.dueDate && isPast(parseISO(t.dueDate)))

  // Weekly activity data
  const getWeeklyActivity = () => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const dateStr = format(date, 'yyyy-MM-dd')
      const completed = tasks.filter(t => 
        t.completedAt && t.completedAt.startsWith(dateStr)
      ).length
      days.push({
        date: dateStr,
        day: format(date, 'EEE'),
        completed,
        isToday: i === 0
      })
    }
    return days
  }

  const weeklyActivity = getWeeklyActivity()
  const maxCompleted = Math.max(...weeklyActivity.map(d => d.completed), 1)
  const weeklyTotal = weeklyActivity.reduce((sum, d) => sum + d.completed, 0)

  // Streak calculation
  const getCurrentStreak = () => {
    let streak = 0
    let checkDate = new Date()
    
    while (true) {
      const dateStr = format(checkDate, 'yyyy-MM-dd')
      const hasActivity = tasks.some(t => t.completedAt && t.completedAt.startsWith(dateStr))
      
      if (hasActivity) {
        streak++
        checkDate = subDays(checkDate, 1)
      } else if (format(checkDate, 'yyyy-MM-dd') === today) {
        checkDate = subDays(checkDate, 1)
      } else {
        break
      }
    }
    return streak
  }

  const getHabitsDoneToday = () => {
    return habits.filter(h => habitLogs[`${h.id}-${today}`]).length
  }

  const getProjectById = (id) => projects.find(p => p.id === id)
  const focusedProject = focusProject ? getProjectById(focusProject) : null
  const currentStreak = getCurrentStreak()

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
        <h1 className="text-3xl font-bold tracking-tight">
          Good {getTimeOfDay()}, <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Arnar</span>
        </h1>
      </header>

      {/* Overdue Alert */}
      {overdueTasks.length > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 flex items-center gap-3 animate-fade-in">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-400" />
          </div>
          <div className="flex-1">
            <p className="text-red-400 font-medium">
              {overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''}
            </p>
            <p className="text-xs text-red-400/70">Need your attention</p>
          </div>
          <button 
            onClick={() => setActiveView('ideas')}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            View all →
          </button>
        </div>
      )}

      {/* Top Stats Row */}
      <div className="grid grid-cols-5 gap-3 mb-8">
        <StatCard 
          icon={CheckCircle2}
          label="Done Today"
          value={completedToday}
          color="#22c55e"
          gradient="from-green-500/20 to-emerald-500/10"
        />
        <StatCard 
          icon={Circle}
          label="Open Tasks"
          value={openTasks.length}
          color="#3b82f6"
          gradient="from-blue-500/20 to-cyan-500/10"
        />
        <StatCard 
          icon={Lightbulb}
          label="Ideas"
          value={inboxIdeas}
          color="#f59e0b"
          gradient="from-amber-500/20 to-yellow-500/10"
          onClick={() => setActiveView('ideas')}
        />
        <StatCard 
          icon={Target}
          label="Habits"
          value={`${getHabitsDoneToday()}/${habits.length}`}
          color="#a855f7"
          gradient="from-purple-500/20 to-pink-500/10"
          onClick={() => setActiveView('habits')}
        />
        <StatCard 
          icon={Flame}
          label="Streak"
          value={`${currentStreak}d`}
          color="#f97316"
          gradient="from-orange-500/20 to-red-500/10"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Tasks & Activity */}
        <div className="col-span-2 space-y-6">
          {/* Weekly Activity Chart */}
          <div className="bg-dark-800/30 rounded-2xl border border-dark-600/30 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium flex items-center gap-2">
                <BarChart3 size={16} className="text-accent" />
                Weekly Activity
              </h2>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span className="font-mono text-accent">{weeklyTotal}</span>
                <span>tasks completed</span>
              </div>
            </div>
            
            <div className="flex items-end justify-between gap-2 h-24">
              {weeklyActivity.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center justify-end h-16">
                    <div 
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        day.isToday ? 'bg-accent' : 'bg-dark-600 hover:bg-dark-500'
                      }`}
                      style={{ 
                        height: `${Math.max((day.completed / maxCompleted) * 100, 8)}%`,
                        minHeight: day.completed > 0 ? '12px' : '4px'
                      }}
                    />
                  </div>
                  <span className={`text-2xs ${day.isToday ? 'text-accent font-medium' : 'text-zinc-500'}`}>
                    {day.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Tasks */}
          <div className="bg-dark-800/30 rounded-2xl border border-dark-600/30 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium flex items-center gap-2">
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
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-2xl bg-dark-700 flex items-center justify-center mx-auto mb-3">
                  <Sparkles size={24} className="text-zinc-600" />
                </div>
                <p className="text-zinc-500 text-sm">All clear!</p>
                <p className="text-zinc-600 text-xs mt-1">
                  Press <kbd className="kbd">⌘K</kbd> to add a task
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {todaysTasks.map(task => {
                  const project = getProjectById(task.projectId)
                  const dueLabel = formatDueDate(task.dueDate)
                  const isOverdue = task.dueDate && isPast(parseISO(task.dueDate))
                  
                  return (
                    <li 
                      key={task.id}
                      className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-xl border border-dark-600/30 hover:bg-dark-800 hover:border-dark-500 transition-all group"
                    >
                      <button 
                        onClick={() => toggleTask(task.id)}
                        className="task-checkbox"
                      />
                      <span className="flex-1 text-sm truncate">{task.title}</span>
                      
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
                          className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-accent/20 rounded-lg transition-all"
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
        </div>

        {/* Right Column - Focus & Projects */}
        <div className="space-y-6">
          {/* Focus Mode */}
          <div className="bg-dark-800/30 rounded-2xl border border-dark-600/30 p-5">
            <h2 className="text-sm font-medium flex items-center gap-2 mb-4">
              <Zap size={16} className="text-yellow-400" />
              Focus
            </h2>
            
            {focusedProject ? (
              <div className="text-center py-2">
                <div 
                  className="w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center relative overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${focusedProject.color}30, ${focusedProject.color}10)` }}
                >
                  <DynamicIcon name={focusedProject.icon} size={32} style={{ color: focusedProject.color }} />
                </div>
                <h3 className="font-semibold" style={{ color: focusedProject.color }}>
                  {focusedProject.name}
                </h3>
                <p className="text-xs text-zinc-500 mt-1">{focusedProject.description}</p>
              </div>
            ) : (
              <div>
                <p className="text-zinc-500 text-xs mb-3">Quick focus:</p>
                <div className="space-y-1.5">
                  {projects.slice(0, 4).map(project => (
                    <button
                      key={project.id}
                      onClick={() => setFocusProject(project.id)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-dark-700 transition-colors text-left"
                    >
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${project.color}15` }}
                      >
                        <DynamicIcon name={project.icon} size={16} style={{ color: project.color }} />
                      </div>
                      <span className="text-sm text-zinc-400">{project.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Projects Mini Grid */}
          <div className="bg-dark-800/30 rounded-2xl border border-dark-600/30 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium flex items-center gap-2">
                <Trophy size={16} className="text-accent" />
                Projects
              </h2>
            </div>
            
            <div className="space-y-3">
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
                    className="w-full text-left group"
                  >
                    <div className="flex items-center gap-3 mb-1.5">
                      <DynamicIcon name={project.icon} size={14} style={{ color: project.color }} />
                      <span className="flex-1 text-sm truncate group-hover:text-white transition-colors">
                        {project.name}
                      </span>
                      <span className="text-2xs font-mono text-zinc-500">
                        {completed}/{total}
                      </span>
                    </div>
                    <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${progress}%`, backgroundColor: project.color }}
                      />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color, gradient, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`relative overflow-hidden rounded-2xl p-4 border border-dark-600/30 text-left transition-all hover:scale-[1.02] hover:border-dark-500 disabled:hover:scale-100 disabled:cursor-default bg-gradient-to-br ${gradient || 'from-dark-800/50 to-dark-800/30'}`}
    >
      <Icon size={18} style={{ color }} className="mb-2 opacity-80" />
      <p className="text-2xl font-bold font-mono">{value}</p>
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
