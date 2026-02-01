import React, { useEffect } from 'react'
import useStore from '../store/useStore'
import { useTranslation } from '../i18n/useTranslation'
import DynamicIcon from './Icons'
import DailyGoals from './DailyGoals'
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
  BarChart3,
  Square
} from 'lucide-react'
import { checkTaskReminders, checkHabitReminders } from '../utils/notifications'

function Dashboard() {
  const { t, language } = useTranslation()
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
    endFocus,
    focusElapsed,
    focusTask,
    setActiveView,
    setSelectedProject,
    notificationsEnabled,
    taskRemindersEnabled,
    habitRemindersEnabled,
    lastNotificationCheck,
    setLastNotificationCheck
  } = useStore()

  const today = format(new Date(), 'yyyy-MM-dd')
  const openTasks = tasks.filter(t => !t.completed)
  const todaysTasks = openTasks.slice(0, 5)
  const completedToday = tasks.filter(t => 
    t.completedAt && t.completedAt.startsWith(today)
  ).length
  const inboxIdeas = ideas.filter(i => i.status === 'inbox').length
  const overdueTasks = openTasks.filter(t => t.dueDate && isPast(parseISO(t.dueDate)) && !isToday(parseISO(t.dueDate)))

  // Check for notifications periodically
  useEffect(() => {
    const now = Date.now()
    const hourAgo = now - 3600000
    
    if (!lastNotificationCheck || lastNotificationCheck < hourAgo) {
      if (notificationsEnabled && taskRemindersEnabled) {
        checkTaskReminders(tasks, true, language)
      }
      if (notificationsEnabled && habitRemindersEnabled) {
        checkHabitReminders(habits, habitLogs, true, language)
      }
      setLastNotificationCheck(now)
    }
  }, [notificationsEnabled, taskRemindersEnabled, habitRemindersEnabled])

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
  const focusedTask = focusTask ? tasks.find(t => t.id === focusTask) : null
  const currentStreak = getCurrentStreak()

  const formatDueDate = (dateStr) => {
    if (!dateStr) return null
    const date = parseISO(dateStr)
    if (isToday(date)) return t('time.today')
    if (isTomorrow(date)) return t('time.tomorrow')
    if (isPast(date)) return t('tasks.overdue')
    return format(date, 'MMM d')
  }

  const formatFocusTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours()
    if (language === 'is') {
      if (hour < 12) return 'Góðan dag'
      if (hour < 17) return 'Góðan dag'
      return 'Gott kvöld'
    }
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="p-8 max-w-6xl animate-fade-in">
      {/* Header */}
      <header className="mb-8">
        <p className="text-zinc-500 text-sm mb-1">
          {format(new Date(), 'EEEE, MMMM d')}
        </p>
        <h1 className="text-3xl font-bold tracking-tight">
          {getTimeOfDayGreeting()}, <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Arnar</span>
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
              {overdueTasks.length} {language === 'is' ? 'seinkuð verkefni' : `overdue task${overdueTasks.length > 1 ? 's' : ''}`}
            </p>
            <p className="text-xs text-red-400/70">{language === 'is' ? 'Þarfnast athygli' : 'Need your attention'}</p>
          </div>
          <button 
            onClick={() => setActiveView('calendar')}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            {language === 'is' ? 'Sjá allt →' : 'View all →'}
          </button>
        </div>
      )}

      {/* Top Stats Row */}
      <div className="grid grid-cols-5 gap-3 mb-8">
        <StatCard 
          icon={CheckCircle2}
          label={t('dashboard.completed')}
          value={completedToday}
          color="#22c55e"
          gradient="from-green-500/20 to-emerald-500/10"
        />
        <StatCard 
          icon={Circle}
          label={t('dashboard.pending')}
          value={openTasks.length}
          color="#3b82f6"
          gradient="from-blue-500/20 to-cyan-500/10"
        />
        <StatCard 
          icon={Lightbulb}
          label={t('nav.ideas')}
          value={inboxIdeas}
          color="#f59e0b"
          gradient="from-amber-500/20 to-yellow-500/10"
          onClick={() => setActiveView('ideas')}
        />
        <StatCard 
          icon={Target}
          label={t('nav.habits')}
          value={`${getHabitsDoneToday()}/${habits.length}`}
          color="#a855f7"
          gradient="from-purple-500/20 to-pink-500/10"
          onClick={() => setActiveView('habits')}
        />
        <StatCard 
          icon={Flame}
          label={t('habits.streak')}
          value={`${currentStreak}${language === 'is' ? 'd' : 'd'}`}
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
                {language === 'is' ? 'Virkni vikunnar' : 'Weekly Activity'}
              </h2>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span className="font-mono text-accent">{weeklyTotal}</span>
                <span>{language === 'is' ? 'verkefnum lokið' : 'tasks completed'}</span>
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
                {t('dashboard.todaysTasks')}
              </h2>
              <button 
                onClick={() => setActiveView('calendar')}
                className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
              >
                {language === 'is' ? 'Sjá allt' : 'View all'} <ArrowRight size={12} />
              </button>
            </div>
            
            {todaysTasks.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-2xl bg-dark-700 flex items-center justify-center mx-auto mb-3">
                  <Sparkles size={24} className="text-zinc-600" />
                </div>
                <p className="text-zinc-500 text-sm">{t('dashboard.noTasksToday')}</p>
                <p className="text-zinc-600 text-xs mt-1">
                  {language === 'is' ? 'Ýttu á' : 'Press'} <kbd className="kbd">⌘K</kbd> {language === 'is' ? 'til að bæta við verkefni' : 'to add a task'}
                </p>
              </div>
            ) : (
              <ul className="space-y-2 stagger-children">
                {todaysTasks.map(task => {
                  const project = getProjectById(task.projectId)
                  const dueLabel = formatDueDate(task.dueDate)
                  const isOverdue = task.dueDate && isPast(parseISO(task.dueDate)) && !isToday(parseISO(task.dueDate))
                  
                  return (
                    <li 
                      key={task.id}
                      className="flex items-center gap-3 p-3.5 bg-dark-800/50 rounded-xl border border-dark-600/30 hover:bg-dark-700/60 hover:border-dark-500/40 transition-all group"
                    >
                      <button 
                        onClick={() => toggleTask(task.id)}
                        className="task-checkbox"
                      />
                      <span className="flex-1 text-sm font-semibold text-white truncate">{task.title}</span>
                      
                      {dueLabel && (
                        <span className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full font-medium border ${
                          isOverdue 
                            ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                            : 'bg-zinc-500/10 border-zinc-500/30 text-zinc-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isOverdue ? 'bg-red-400' : 'bg-zinc-400'}`} />
                          {dueLabel}
                        </span>
                      )}
                      
                      {project && (
                        <span 
                          className="inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full font-medium border"
                          style={{ 
                            backgroundColor: `${project.color}15`, 
                            borderColor: `${project.color}30`,
                            color: project.color 
                          }}
                        >
                          <span 
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: project.color }}
                          />
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
                          title={t('dashboard.startFocus')}
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
          <div className={`bg-dark-800/30 rounded-2xl border transition-all ${
            focusedProject ? 'border-accent/30 animate-glow' : 'border-dark-600/30'
          } p-5`}>
            <h2 className="text-sm font-medium flex items-center gap-2 mb-4">
              <Zap size={16} className={focusedProject ? 'text-yellow-400 animate-pulse-subtle' : 'text-yellow-400'} />
              {t('dashboard.focusMode')}
              {focusedProject && (
                <span className="ml-auto text-2xs px-2 py-0.5 bg-accent/20 text-accent rounded-full">
                  {t('dashboard.focusActive')}
                </span>
              )}
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
                {focusedTask && (
                  <p className="text-xs text-zinc-400 mt-1 truncate">{focusedTask.title}</p>
                )}
                
                {/* Timer */}
                <div className="mt-4 mb-3">
                  <p className="text-3xl font-mono font-bold text-accent">
                    {formatFocusTime(focusElapsed)}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">{t('dashboard.timeSpent')}</p>
                </div>
                
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => useStore.getState().setPomodoroOpen(true)}
                    className="px-4 py-2 bg-accent hover:bg-accent/90 rounded-lg text-sm transition-colors flex items-center gap-2"
                  >
                    <Clock size={14} />
                    Pomodoro
                  </button>
                  <button
                    onClick={endFocus}
                    className="px-4 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg text-sm transition-colors flex items-center gap-2"
                  >
                    <Square size={14} />
                    {t('dashboard.endFocus')}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-zinc-500 text-xs mb-3">{t('dashboard.selectTask')}:</p>
                <div className="space-y-1.5">
                  {projects.slice(0, 4).map(project => (
                    <button
                      key={project.id}
                      onClick={() => setFocusProject(project.id)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-dark-700 transition-colors text-left group"
                    >
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                        style={{ backgroundColor: `${project.color}15` }}
                      >
                        <DynamicIcon name={project.icon} size={16} style={{ color: project.color }} />
                      </div>
                      <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors">{project.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Daily Goals */}
          <DailyGoals />

          {/* Projects Mini Grid */}
          <div className="bg-dark-800/30 rounded-2xl border border-dark-600/30 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium flex items-center gap-2">
                <Trophy size={16} className="text-accent" />
                {t('dashboard.projectProgress')}
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

export default Dashboard
