import React, { useMemo, useState } from 'react'
import useStore from '../store/useStore'
import { useTranslation } from '../i18n/useTranslation'
import { 
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Award,
  BarChart3,
  ArrowRight,
  ArrowLeft,
  X,
  AlertCircle
} from 'lucide-react'
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isBefore, startOfDay } from 'date-fns'

function WeeklyReview({ onClose }) {
  const { language } = useTranslation()
  const tasks = useStore(state => state.tasks)
  const habits = useStore(state => state.habits)
  const habitLogs = useStore(state => state.habitLogs)
  const pomodoroSessions = useStore(state => state.pomodoroSessions)
  const addWeeklyReview = useStore(state => state.addWeeklyReview)

  const [step, setStep] = useState(1)
  const [goals, setGoals] = useState('')

  // Calculate date ranges
  const today = new Date()
  const thisWeekStart = startOfWeek(today, { weekStartsOn: 1 })
  const thisWeekEnd = endOfWeek(today, { weekStartsOn: 1 })
  const lastWeekStart = subDays(thisWeekStart, 7)
  const lastWeekEnd = subDays(thisWeekStart, 1)

  const thisWeekDays = eachDayOfInterval({ start: thisWeekStart, end: today })
  const lastWeekDays = eachDayOfInterval({ start: lastWeekStart, end: lastWeekEnd })

  // Calculate stats
  const stats = useMemo(() => {
    // Tasks
    const thisWeekTasks = tasks.filter(t => {
      if (!t.completedAt) return false
      const completed = new Date(t.completedAt)
      return completed >= thisWeekStart && completed <= thisWeekEnd
    })
    
    // Overdue Tasks
    const overdueTasks = tasks.filter(t => {
      if (t.completed || !t.dueDate) return false
      return isBefore(new Date(t.dueDate), startOfDay(today))
    })

    // Habits
    const thisWeekHabits = thisWeekDays.reduce((count, day) => {
      const dateStr = format(day, 'yyyy-MM-dd')
      return count + habits.filter(h => habitLogs[`${h.id}-${dateStr}`]).length
    }, 0)
    
    const maxPossibleHabits = thisWeekDays.length * habits.length
    const habitConsistency = maxPossibleHabits > 0 ? Math.round((thisWeekHabits / maxPossibleHabits) * 100) : 0

    // Focus time
    const thisWeekFocus = (pomodoroSessions || []).filter(s => {
      if (!s.completedAt && !s.startTime) return false
      const date = new Date(s.completedAt || s.startTime)
      return date >= thisWeekStart && date <= thisWeekEnd
    }).reduce((sum, s) => sum + (s.duration || 0), 0)

    // Daily breakdown
    const dailyBreakdown = thisWeekDays.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd')
      return {
        date: day,
        dateStr,
        dayName: format(day, 'EEE'),
        tasks: tasks.filter(t => t.completedAt?.startsWith(dateStr)).length,
        habits: habits.filter(h => habitLogs[`${h.id}-${dateStr}`]).length,
        focus: (pomodoroSessions || [])
          .filter(s => (s.completedAt || s.startTime)?.startsWith(dateStr))
          .reduce((sum, s) => sum + (s.duration || 0), 0)
      }
    })

    return {
      thisWeekTasks,
      overdueTasks,
      habitConsistency,
      thisWeekFocus,
      dailyBreakdown,
      completedCount: thisWeekTasks.length,
      overdueCount: overdueTasks.length
    }
  }, [tasks, habits, habitLogs, pomodoroSessions, thisWeekStart, thisWeekEnd])

  const formatMinutes = (mins) => {
    const hours = Math.floor(mins / 60)
    const minutes = mins % 60
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const handleSave = () => {
    addWeeklyReview({
      weekStart: thisWeekStart.toISOString(),
      completedTasks: stats.completedCount,
      overdueTasks: stats.overdueCount,
      habitConsistency: stats.habitConsistency,
      focusHours: Math.round((stats.thisWeekFocus / 60) * 10) / 10,
      goals,
      createdAt: new Date().toISOString()
    })
    onClose()
  }

  // Render step content
  const renderStep = () => {
    switch (step) {
      case 1: // Completed Tasks
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Hvað kláraðist?</h3>
              <p className="text-zinc-400">Yfirlit yfir verkefni vikunnar</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-800 p-6 rounded-2xl border border-dark-600 text-center">
                <span className="text-4xl font-bold text-white block mb-2">{stats.completedCount}</span>
                <span className="text-sm text-zinc-500 uppercase tracking-wider">Verkefni kláruð</span>
              </div>
              <div className="bg-dark-800 p-6 rounded-2xl border border-dark-600 text-center">
                <span className="text-4xl font-bold text-accent block mb-2">
                  {stats.dailyBreakdown.reduce((acc, day) => acc + day.tasks, 0) > 0 ? 'Já' : 'Nei'}
                </span>
                <span className="text-sm text-zinc-500 uppercase tracking-wider">Virkni</span>
              </div>
            </div>

            <div className="bg-dark-800/50 rounded-xl p-4 max-h-60 overflow-y-auto">
              <h4 className="text-sm font-medium text-zinc-400 mb-3">Nýlega klárað</h4>
              {stats.thisWeekTasks.length > 0 ? (
                <div className="space-y-2">
                  {stats.thisWeekTasks.slice(0, 5).map(task => (
                    <div key={task.id} className="flex items-center gap-3 p-2 hover:bg-dark-700/50 rounded-lg">
                      <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                      <span className="text-sm text-zinc-300 truncate">{task.title}</span>
                    </div>
                  ))}
                  {stats.thisWeekTasks.length > 5 && (
                    <div className="text-xs text-center text-zinc-500 pt-2">
                      + {stats.thisWeekTasks.length - 5} önnur verkefni
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-zinc-500 text-center py-4">Engin verkefni kláruð þessa viku.</p>
              )}
            </div>
          </div>
        )

      case 2: // Overdue Tasks
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} className="text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Hvað seinkaði?</h3>
              <p className="text-zinc-400">Verkefni sem þurfa athygli</p>
            </div>

            <div className="bg-dark-800 p-6 rounded-2xl border border-dark-600 text-center mb-6">
              <span className="text-4xl font-bold text-red-400 block mb-2">{stats.overdueCount}</span>
              <span className="text-sm text-zinc-500 uppercase tracking-wider">Verkefni framyfir áætlun</span>
            </div>

            <div className="bg-dark-800/50 rounded-xl p-4 max-h-60 overflow-y-auto">
              {stats.overdueTasks.length > 0 ? (
                <div className="space-y-2">
                  {stats.overdueTasks.slice(0, 5).map(task => (
                    <div key={task.id} className="flex items-center gap-3 p-2 hover:bg-dark-700/50 rounded-lg border-l-2 border-red-500/50">
                      <span className="text-sm text-zinc-300 truncate">{task.title}</span>
                      <span className="text-xs text-red-400 ml-auto whitespace-nowrap">
                        {task.dueDate && format(new Date(task.dueDate), 'd. MMM')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 size={32} className="text-green-500 mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-zinc-400">Allt á áætlun! Engin verkefni framyfir.</p>
                </div>
              )}
            </div>
          </div>
        )

      case 3: // Habits
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Flame size={32} className="text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Vanabrot</h3>
              <p className="text-zinc-400">Hvernig gengur að halda rútínu?</p>
            </div>

            <div className="flex justify-center mb-8">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-dark-700" />
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" 
                    strokeDasharray={440}
                    strokeDashoffset={440 - (440 * stats.habitConsistency) / 100}
                    className="text-orange-500 transition-all duration-1000 ease-out" 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-white">{stats.habitConsistency}%</span>
                  <span className="text-xs text-zinc-500 uppercase">Árangur</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {habits.slice(0, 4).map(habit => {
                const streak = 0 // Placeholder, could calculate real streak
                return (
                  <div key={habit.id} className="bg-dark-800 p-3 rounded-xl border border-dark-600 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center text-lg">
                      {/* Icon placeholder */}
                      🔥
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium text-zinc-200 truncate">{habit.nameIs || habit.name}</p>
                      <p className="text-xs text-zinc-500">
                         {stats.habitConsistency > 80 ? 'Vel gert!' : 'Má bæta'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )

      case 4: // Focus
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock size={32} className="text-purple-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Einbeiting</h3>
              <p className="text-zinc-400">Tími varið í djúpvinnu</p>
            </div>

            <div className="bg-dark-800 p-8 rounded-2xl border border-dark-600 text-center mb-6">
              <span className="text-5xl font-bold text-white block mb-2">{formatMinutes(stats.thisWeekFocus)}</span>
              <span className="text-sm text-zinc-500 uppercase tracking-wider">Fókus tími</span>
            </div>

            <div className="bg-dark-800/50 rounded-xl p-5">
              <h4 className="text-sm font-medium text-zinc-400 mb-4">Dagleg dreifing</h4>
              <div className="flex items-end justify-between h-32 gap-2">
                {stats.dailyBreakdown.map((day, i) => {
                  const maxFocus = Math.max(...stats.dailyBreakdown.map(d => d.focus), 1)
                  const height = (day.focus / maxFocus) * 100
                  const isTodayDay = isSameDay(day.date, today)
                  
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="w-full bg-dark-700 rounded-t-sm relative h-full flex items-end">
                        <div 
                          className={`w-full ${isTodayDay ? 'bg-purple-500' : 'bg-purple-500/50'} rounded-t-sm transition-all duration-500 group-hover:bg-purple-400`}
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <span className="text-xs text-zinc-500">{day.dayName}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )

      case 5: // Goals
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target size={32} className="text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Markmið næstu viku</h3>
              <p className="text-zinc-400">Hvað viltu áorka?</p>
            </div>

            <textarea
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="Skrifaðu niður helstu markmiðin þín..."
              className="w-full h-40 bg-dark-800 border border-dark-600 rounded-xl p-4 text-white placeholder-zinc-500 focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
              autoFocus
            />

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <h4 className="text-sm font-bold text-blue-400 mb-1">Ráð:</h4>
              <p className="text-xs text-zinc-400">Veldu 1-3 stór markmið. Ekki ofhlaða listann.</p>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="w-full max-w-lg bg-dark-900 rounded-2xl border border-dark-600 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-dark-700 flex justify-between items-center bg-dark-800/50">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <div 
                key={i} 
                className={`h-1.5 w-8 rounded-full transition-colors ${i <= step ? 'bg-accent' : 'bg-dark-600'}`}
              />
            ))}
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 flex-1 overflow-y-auto">
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-dark-700 bg-dark-800/30 flex justify-between items-center">
          <button
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              step === 1 ? 'text-zinc-600 cursor-not-allowed' : 'text-zinc-400 hover:bg-dark-700 hover:text-white'
            }`}
          >
            <ArrowLeft size={16} />
            Til baka
          </button>

          {step < 5 ? (
            <button
              onClick={() => setStep(s => Math.min(5, s + 1))}
              className="flex items-center gap-2 px-6 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-accent/20"
            >
              Áfram
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-green-600/20"
            >
              <CheckCircle2 size={16} />
              Vista yfirlit
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default WeeklyReview
