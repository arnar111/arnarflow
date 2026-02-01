import React, { useMemo } from 'react'
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
  ArrowRight
} from 'lucide-react'
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns'
import { ProgressRing } from './DailyGoals'

function WeeklyReview({ onClose }) {
  const { language } = useTranslation()
  const { tasks, habits, habitLogs, pomodoroSessions } = useStore()

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
    const lastWeekTasks = tasks.filter(t => {
      if (!t.completedAt) return false
      const completed = new Date(t.completedAt)
      return completed >= lastWeekStart && completed <= lastWeekEnd
    })

    // Habits
    const thisWeekHabits = thisWeekDays.reduce((count, day) => {
      const dateStr = format(day, 'yyyy-MM-dd')
      return count + habits.filter(h => habitLogs[`${h.id}-${dateStr}`]).length
    }, 0)
    const lastWeekHabits = lastWeekDays.reduce((count, day) => {
      const dateStr = format(day, 'yyyy-MM-dd')
      return count + habits.filter(h => habitLogs[`${h.id}-${dateStr}`]).length
    }, 0)

    const maxPossibleHabits = thisWeekDays.length * habits.length
    const lastMaxPossibleHabits = lastWeekDays.length * habits.length

    // Focus time
    const thisWeekFocus = (pomodoroSessions || []).filter(s => {
      if (!s.completedAt) return false
      const completed = new Date(s.completedAt)
      return completed >= thisWeekStart && completed <= thisWeekEnd
    }).reduce((sum, s) => sum + (s.duration || 0), 0)

    const lastWeekFocus = (pomodoroSessions || []).filter(s => {
      if (!s.completedAt) return false
      const completed = new Date(s.completedAt)
      return completed >= lastWeekStart && completed <= lastWeekEnd
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
          .filter(s => s.completedAt?.startsWith(dateStr))
          .reduce((sum, s) => sum + (s.duration || 0), 0)
      }
    })

    return {
      thisWeekTasks: thisWeekTasks.length,
      lastWeekTasks: lastWeekTasks.length,
      thisWeekHabits,
      lastWeekHabits,
      maxPossibleHabits,
      lastMaxPossibleHabits,
      thisWeekFocus,
      lastWeekFocus,
      dailyBreakdown
    }
  }, [tasks, habits, habitLogs, pomodoroSessions, thisWeekStart, thisWeekEnd, lastWeekStart, lastWeekEnd])

  // Calculate changes
  const taskChange = stats.thisWeekTasks - stats.lastWeekTasks
  const habitRate = stats.maxPossibleHabits > 0 ? (stats.thisWeekHabits / stats.maxPossibleHabits) * 100 : 0
  const lastHabitRate = stats.lastMaxPossibleHabits > 0 ? (stats.lastWeekHabits / stats.lastMaxPossibleHabits) * 100 : 0
  const habitChange = habitRate - lastHabitRate
  const focusChange = stats.thisWeekFocus - stats.lastWeekFocus

  const formatMinutes = (mins) => {
    const hours = Math.floor(mins / 60)
    const minutes = mins % 60
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const getTrendIcon = (change) => {
    if (change > 0) return <TrendingUp size={14} className="text-green-400" />
    if (change < 0) return <TrendingDown size={14} className="text-red-400" />
    return <Minus size={14} className="text-zinc-500" />
  }

  const getTrendColor = (change) => {
    if (change > 0) return 'text-green-400'
    if (change < 0) return 'text-red-400'
    return 'text-zinc-500'
  }

  // Best day
  const bestDay = stats.dailyBreakdown.reduce((best, day) => {
    const score = day.tasks * 10 + day.habits * 5 + day.focus
    const bestScore = best.tasks * 10 + best.habits * 5 + best.focus
    return score > bestScore ? day : best
  }, stats.dailyBreakdown[0])

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="w-full max-w-2xl bg-dark-900 rounded-2xl border border-dark-500 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-5 border-b border-dark-600 bg-gradient-to-br from-accent/10 to-purple-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center">
                <Calendar size={24} className="text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {language === 'is' ? 'Vikuyfirlit' : 'Weekly Review'}
                </h2>
                <p className="text-xs text-zinc-500">
                  {format(thisWeekStart, 'MMM d')} - {format(today, 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              {language === 'is' ? 'Loka' : 'Close'}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Tasks */}
            <div className="bg-dark-800/50 rounded-2xl p-4 border border-dark-600/50">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={16} className="text-blue-400" />
                <span className="text-xs text-zinc-500 uppercase tracking-wider">
                  {language === 'is' ? 'Verkefni' : 'Tasks'}
                </span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {stats.thisWeekTasks}
              </div>
              <div className={`flex items-center gap-1 text-xs ${getTrendColor(taskChange)}`}>
                {getTrendIcon(taskChange)}
                <span>{taskChange >= 0 ? '+' : ''}{taskChange} {language === 'is' ? 'frá síðustu viku' : 'from last week'}</span>
              </div>
            </div>

            {/* Habits */}
            <div className="bg-dark-800/50 rounded-2xl p-4 border border-dark-600/50">
              <div className="flex items-center gap-2 mb-3">
                <Flame size={16} className="text-orange-400" />
                <span className="text-xs text-zinc-500 uppercase tracking-wider">
                  {language === 'is' ? 'Venjur' : 'Habits'}
                </span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {Math.round(habitRate)}%
              </div>
              <div className={`flex items-center gap-1 text-xs ${getTrendColor(habitChange)}`}>
                {getTrendIcon(habitChange)}
                <span>{habitChange >= 0 ? '+' : ''}{Math.round(habitChange)}% {language === 'is' ? 'frá síðustu viku' : 'from last week'}</span>
              </div>
            </div>

            {/* Focus Time */}
            <div className="bg-dark-800/50 rounded-2xl p-4 border border-dark-600/50">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={16} className="text-purple-400" />
                <span className="text-xs text-zinc-500 uppercase tracking-wider">
                  {language === 'is' ? 'Einbeiting' : 'Focus'}
                </span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {formatMinutes(stats.thisWeekFocus)}
              </div>
              <div className={`flex items-center gap-1 text-xs ${getTrendColor(focusChange)}`}>
                {getTrendIcon(focusChange)}
                <span>{focusChange >= 0 ? '+' : ''}{formatMinutes(Math.abs(focusChange))}</span>
              </div>
            </div>
          </div>

          {/* Daily Breakdown Chart */}
          <div className="bg-dark-800/30 rounded-2xl p-5 border border-dark-600/30 mb-6">
            <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
              <BarChart3 size={16} className="text-accent" />
              {language === 'is' ? 'Dagleg sundurliðun' : 'Daily Breakdown'}
            </h3>
            <div className="flex items-end justify-between gap-2 h-32">
              {stats.dailyBreakdown.map((day, i) => {
                const maxTasks = Math.max(...stats.dailyBreakdown.map(d => d.tasks), 1)
                const height = (day.tasks / maxTasks) * 100
                const isToday = isSameDay(day.date, today)
                const isBest = day === bestDay && day.tasks > 0

                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col items-center justify-end h-20 relative">
                      {isBest && (
                        <Award size={14} className="text-amber-400 absolute -top-5 animate-bounce" />
                      )}
                      <div 
                        className={`w-full rounded-t-lg transition-all duration-500 ${
                          isToday ? 'bg-accent' : isBest ? 'bg-amber-500' : 'bg-dark-600'
                        }`}
                        style={{ 
                          height: `${Math.max(height, 8)}%`,
                          minHeight: day.tasks > 0 ? '12px' : '4px'
                        }}
                      />
                    </div>
                    <div className="text-center">
                      <span className={`text-2xs block ${isToday ? 'text-accent font-medium' : 'text-zinc-500'}`}>
                        {day.dayName}
                      </span>
                      <span className="text-2xs text-zinc-600">{day.tasks}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Best Day Highlight */}
          {bestDay && bestDay.tasks > 0 && (
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl p-4 border border-amber-500/20 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Award size={20} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-400">
                    {language === 'is' ? 'Besti dagurinn' : 'Best Day'}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {format(bestDay.date, 'EEEE, MMMM d')} - {bestDay.tasks} {language === 'is' ? 'verkefni' : 'tasks'}, {bestDay.habits} {language === 'is' ? 'venjur' : 'habits'}, {formatMinutes(bestDay.focus)} {language === 'is' ? 'einbeiting' : 'focus'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Motivational Message */}
          <div className="text-center py-4">
            {stats.thisWeekTasks >= 20 ? (
              <p className="text-sm text-green-400">
                🏆 {language === 'is' ? 'Frábær vika! Þú rokkaðir!' : 'Amazing week! You crushed it!'}
              </p>
            ) : stats.thisWeekTasks >= 10 ? (
              <p className="text-sm text-blue-400">
                💪 {language === 'is' ? 'Góð vika! Haltu áfram svona!' : 'Good week! Keep it up!'}
              </p>
            ) : stats.thisWeekTasks >= 5 ? (
              <p className="text-sm text-amber-400">
                🌱 {language === 'is' ? 'Góð byrjun! Þú getur gert betur næstu viku.' : 'Good start! You can do more next week.'}
              </p>
            ) : (
              <p className="text-sm text-zinc-500">
                🎯 {language === 'is' ? 'Næsta vika verður betri!' : 'Next week will be better!'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WeeklyReview
