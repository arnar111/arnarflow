import React, { useMemo } from 'react'
import useStore from '../store/useStore'
import { useTranslation } from '../i18n/useTranslation'
import { 
  Target, 
  Flame, 
  Zap, 
  TrendingUp,
  CheckCircle2,
  Clock,
  Trophy,
  Star
} from 'lucide-react'
import { format } from 'date-fns'

// Circular Progress Ring Component
function ProgressRing({ progress, size = 80, strokeWidth = 6, color = '#3b82f6' }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-dark-700"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold" style={{ color }}>
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  )
}

// Mini Progress Bar Component
function MiniProgressBar({ progress, color = '#3b82f6', height = 4 }) {
  return (
    <div 
      className="w-full bg-dark-700 rounded-full overflow-hidden"
      style={{ height }}
    >
      <div 
        className="h-full rounded-full transition-all duration-500"
        style={{ 
          width: `${Math.min(progress, 100)}%`,
          backgroundColor: color 
        }}
      />
    </div>
  )
}

function DailyGoals() {
  const { t, language } = useTranslation()
  const { 
    tasks, 
    habits, 
    habitLogs, 
    dailyGoals,
    setDailyGoals,
    pomodoroSessions 
  } = useStore()

  const today = format(new Date(), 'yyyy-MM-dd')

  // Calculate stats
  const stats = useMemo(() => {
    const todayTasks = tasks.filter(task => 
      task.completedAt && task.completedAt.startsWith(today)
    )
    const todayHabits = habits.filter(h => habitLogs[`${h.id}-${today}`])
    const todayPomodoros = pomodoroSessions?.filter(s => 
      s.completedAt?.startsWith(today)
    ) || []
    const focusMinutes = todayPomodoros.reduce((sum, s) => sum + (s.duration || 0), 0)

    return {
      tasksCompleted: todayTasks.length,
      habitsCompleted: todayHabits.length,
      habitsTotal: habits.length,
      pomodoroSessions: todayPomodoros.length,
      focusMinutes,
    }
  }, [tasks, habits, habitLogs, pomodoroSessions, today])

  // Default goals
  const goals = dailyGoals || {
    tasks: 5,
    habits: habits.length,
    focusMinutes: 90,
    pomodoroSessions: 4,
  }

  // Calculate percentages
  const taskProgress = goals.tasks > 0 ? (stats.tasksCompleted / goals.tasks) * 100 : 0
  const habitProgress = goals.habits > 0 ? (stats.habitsCompleted / goals.habits) * 100 : 0
  const focusProgress = goals.focusMinutes > 0 ? (stats.focusMinutes / goals.focusMinutes) * 100 : 0
  const overallProgress = (taskProgress + habitProgress + focusProgress) / 3

  // Achievement unlocked?
  const allGoalsReached = taskProgress >= 100 && habitProgress >= 100 && focusProgress >= 100

  return (
    <div className="bg-dark-800/30 rounded-2xl border border-dark-600/30 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-medium flex items-center gap-2">
          <Target size={16} className="text-accent" />
          {language === 'is' ? 'Dagsmarkmið' : 'Daily Goals'}
        </h2>
        {allGoalsReached && (
          <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full animate-pulse">
            <Trophy size={12} />
            {language === 'is' ? 'Náð!' : 'Complete!'}
          </span>
        )}
      </div>

      {/* Overall Progress Ring */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <ProgressRing 
            progress={overallProgress} 
            size={120} 
            strokeWidth={10}
            color={overallProgress >= 100 ? '#22c55e' : overallProgress >= 50 ? '#3b82f6' : '#6366f1'}
          />
          {allGoalsReached && (
            <div className="absolute -top-1 -right-1">
              <Star size={24} className="text-amber-400 fill-amber-400 animate-bounce" />
            </div>
          )}
        </div>
      </div>

      {/* Individual Goals */}
      <div className="space-y-4">
        {/* Tasks Goal */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-zinc-400">
              <CheckCircle2 size={14} className="text-blue-400" />
              {language === 'is' ? 'Verkefni' : 'Tasks'}
            </span>
            <span className="font-mono text-xs">
              <span className={taskProgress >= 100 ? 'text-green-400' : ''}>
                {stats.tasksCompleted}
              </span>
              <span className="text-zinc-600">/{goals.tasks}</span>
            </span>
          </div>
          <MiniProgressBar progress={taskProgress} color="#3b82f6" />
        </div>

        {/* Habits Goal */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-zinc-400">
              <Flame size={14} className="text-orange-400" />
              {language === 'is' ? 'Venjur' : 'Habits'}
            </span>
            <span className="font-mono text-xs">
              <span className={habitProgress >= 100 ? 'text-green-400' : ''}>
                {stats.habitsCompleted}
              </span>
              <span className="text-zinc-600">/{goals.habits}</span>
            </span>
          </div>
          <MiniProgressBar progress={habitProgress} color="#f97316" />
        </div>

        {/* Focus Time Goal */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-zinc-400">
              <Clock size={14} className="text-purple-400" />
              {language === 'is' ? 'Einbeiting' : 'Focus Time'}
            </span>
            <span className="font-mono text-xs">
              <span className={focusProgress >= 100 ? 'text-green-400' : ''}>
                {stats.focusMinutes}
              </span>
              <span className="text-zinc-600">/{goals.focusMinutes}m</span>
            </span>
          </div>
          <MiniProgressBar progress={focusProgress} color="#a855f7" />
        </div>
      </div>

      {/* Motivational message */}
      <div className="mt-5 pt-4 border-t border-dark-600/50 text-center">
        {overallProgress < 25 && (
          <p className="text-xs text-zinc-500">
            {language === 'is' ? '🚀 Byrjaðu daginn sterkt!' : '🚀 Start your day strong!'}
          </p>
        )}
        {overallProgress >= 25 && overallProgress < 50 && (
          <p className="text-xs text-zinc-500">
            {language === 'is' ? '💪 Þú ert á réttri leið!' : '💪 You\'re making progress!'}
          </p>
        )}
        {overallProgress >= 50 && overallProgress < 75 && (
          <p className="text-xs text-zinc-500">
            {language === 'is' ? '🔥 Hálf leið búin!' : '🔥 Halfway there!'}
          </p>
        )}
        {overallProgress >= 75 && overallProgress < 100 && (
          <p className="text-xs text-zinc-500">
            {language === 'is' ? '⭐ Næstum því!' : '⭐ Almost there!'}
          </p>
        )}
        {overallProgress >= 100 && (
          <p className="text-xs text-amber-400">
            {language === 'is' ? '🏆 Frábært! Öll markmið náð!' : '🏆 Amazing! All goals reached!'}
          </p>
        )}
      </div>
    </div>
  )
}

export { ProgressRing, MiniProgressBar }
export default DailyGoals
