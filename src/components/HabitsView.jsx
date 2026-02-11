import React, { useEffect, useState, useRef, useMemo } from 'react'
import useStore from '../store/useStore'
import { useTranslation } from '../i18n/useTranslation'
import DynamicIcon from './Icons'
import { format, subDays, startOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, subYears } from 'date-fns'
import { Target, Check, Flame, Heart, TrendingUp, Calendar, Sparkles, Award, Zap, Trophy, ChevronRight, MoreHorizontal, SkipForward } from 'lucide-react'
import Confetti, { ConfettiBurst } from './Confetti'
import CalendarHeatmap from 'react-calendar-heatmap'
import 'react-calendar-heatmap/dist/styles.css'

// Plane-inspired Circular Progress Indicator
function CircularProgress({ size = 48, percentage = 0, strokeWidth = 4, strokeColor = '#22c55e', children }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * Math.PI * 2
  const dashOffset = circumference - (circumference * percentage) / 100

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(39, 39, 42, 0.5)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-all duration-700 ease-out"
          style={{ filter: `drop-shadow(0 0 6px ${strokeColor}40)` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}

// Plane-inspired Badge component
function Badge({ variant = 'default', size = 'sm', icon: Icon, children, className = '' }) {
  const variants = {
    default: 'bg-dark-700/50 text-zinc-400 border-dark-600/50',
    success: 'bg-green-500/10 text-green-400 border-green-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    fire: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
    accent: 'bg-accent/10 text-accent border-accent/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  }
  
  const sizes = {
    sm: 'px-2 py-0.5 text-2xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  }

  return (
    <span className={`
      inline-flex items-center font-medium rounded-full border transition-all
      ${variants[variant]} ${sizes[size]} ${className}
    `}>
      {Icon && <Icon size={size === 'sm' ? 10 : size === 'md' ? 12 : 14} className="shrink-0" />}
      {children}
    </span>
  )
}

// Tooltip component (Plane-inspired)
function Tooltip({ children, content, position = 'top' }) {
  const [isVisible, setIsVisible] = useState(false)
  
  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <div 
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && content && (
        <div className={`
          absolute z-50 px-2 py-1 text-xs bg-dark-800 border border-dark-600/50 
          rounded-lg shadow-xl whitespace-nowrap animate-fade-in
          ${positions[position]}
        `}>
          {content}
        </div>
      )}
    </div>
  )
}

// Streak Fire Animation Component
function StreakFire({ streak, isAnimating }) {
  const intensity = streak >= 30 ? 'legendary' : streak >= 14 ? 'epic' : streak >= 7 ? 'hot' : 'warm'
  
  const intensityStyles = {
    warm: 'text-amber-400',
    hot: 'text-amber-400 animate-pulse-subtle',
    epic: 'text-orange-400 animate-fire',
    legendary: 'text-orange-500 animate-fire filter drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]',
  }

  return (
    <div className={`relative ${isAnimating ? 'animate-celebrate' : ''}`}>
      <Flame 
        size={streak >= 14 ? 18 : 14} 
        className={intensityStyles[intensity]}
        fill={streak >= 7 ? 'currentColor' : 'none'}
      />
      {streak >= 14 && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-400 rounded-full animate-ping" />
      )}
    </div>
  )
}

// Weekly Calendar Cell
function WeekCell({ day, habits, habitLogs, onToggle, isToday }) {
  const completedCount = habits.filter(h => habitLogs[`${h.id}-${day.date}`]).length
  const allDone = completedCount === habits.length
  const progress = habits.length > 0 ? (completedCount / habits.length) * 100 : 0

  return (
    <Tooltip content={`${completedCount}/${habits.length} lokið`}>
      <div 
        className={`
          relative flex flex-col items-center p-3 rounded-xl transition-all cursor-default
          ${isToday ? 'ring-2 ring-accent ring-offset-2 ring-offset-dark-900' : ''}
          ${allDone ? 'bg-green-500/10' : 'bg-dark-700/30 hover:bg-dark-700/50'}
        `}
      >
        {/* Day name */}
        <span className="text-2xs text-zinc-500 uppercase tracking-wider mb-1">
          {day.dayName}
        </span>
        
        {/* Day number with progress ring */}
        <CircularProgress 
          size={36} 
          percentage={progress} 
          strokeWidth={3}
          strokeColor={allDone ? '#22c55e' : '#3b82f6'}
        >
          <span className={`text-sm font-semibold ${
            isToday ? 'text-accent' : allDone ? 'text-green-400' : 'text-zinc-300'
          }`}>
            {day.dayNum}
          </span>
        </CircularProgress>

        {/* Habit dots */}
        <div className="flex gap-0.5 mt-2">
          {habits.map(habit => (
            <div
              key={habit.id}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                habitLogs[`${habit.id}-${day.date}`]
                  ? 'bg-green-400 shadow-sm shadow-green-400/50'
                  : 'bg-dark-500'
              }`}
            />
          ))}
        </div>

        {/* All done checkmark */}
        {allDone && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
            <Check size={10} className="text-white" strokeWidth={3} />
          </div>
        )}
      </div>
    </Tooltip>
  )
}

function HabitsView() {
  const { t, language } = useTranslation()
  const habits = useStore(state => state.habits)
  const habitLogs = useStore(state => state.habitLogs)
  const habitStreaks = useStore(state => state.habitStreaks)
  const toggleHabit = useStore(state => state.toggleHabit)
  const setHabitStatus = useStore(state => state.setHabitStatus)
  const recalculateAllStreaks = useStore(state => state.recalculateAllStreaks)
  const [completedAnimation, setCompletedAnimation] = useState(null)
  const [viewMode, setViewMode] = useState('week')
  const [showConfetti, setShowConfetti] = useState(false)
  const [burstPosition, setBurstPosition] = useState({ x: 0, y: 0 })
  const [showBurst, setShowBurst] = useState(false)
  const [recentlyCompleted, setRecentlyCompleted] = useState(new Set())
  
  useEffect(() => {
    recalculateAllStreaks()
  }, [])
  
  const today = format(new Date(), 'yyyy-MM-dd')
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i)
    return {
      date: format(date, 'yyyy-MM-dd'),
      dayName: format(date, 'EEE'),
      dayNum: format(date, 'd'),
      isToday: format(date, 'yyyy-MM-dd') === today
    }
  }), [weekStart, today])

  const monthStart = startOfMonth(new Date())
  const monthEnd = endOfMonth(new Date())
  const monthDays = useMemo(() => eachDayOfInterval({ start: monthStart, end: monthEnd }).map(date => ({
    date: format(date, 'yyyy-MM-dd'),
    dayNum: format(date, 'd'),
    isToday: format(date, 'yyyy-MM-dd') === today
  })), [monthStart, monthEnd, today])

  const getStreak = (habitId) => habitStreaks[habitId] || { current: 0, longest: 0 }

  // Stats calculations
  const stats = useMemo(() => {
    const todayCompleted = habits.filter(h => {
      const s = habitLogs[`${h.id}-${today}`]
      return s === true || s === 'done'
    }).length
    let weeklyTotal = 0
    weekDays.forEach(day => {
      habits.forEach(habit => {
        const s = habitLogs[`${habit.id}-${day.date}`]
        if (s === true || s === 'done') weeklyTotal++
      })
    })
    let monthlyTotal = 0
    monthDays.forEach(day => {
      habits.forEach(habit => {
        const s = habitLogs[`${habit.id}-${day.date}`]
        if (s === true || s === 'done') monthlyTotal++
      })
    })
    const totalPossible = habits.length * monthDays.length
    const completionRate = totalPossible > 0 ? Math.round((monthlyTotal / totalPossible) * 100) : 0
    
    // Best streak across all habits
    const bestStreak = Math.max(...habits.map(h => getStreak(h.id).longest), 0)
    const currentTotalStreak = habits.reduce((sum, h) => sum + getStreak(h.id).current, 0)

    return {
      todayCompleted,
      todayTotal: habits.length,
      weeklyTotal,
      weeklyPossible: habits.length * 7,
      monthlyTotal,
      completionRate,
      bestStreak,
      currentTotalStreak,
    }
  }, [habits, habitLogs, habitStreaks, today, weekDays, monthDays])

  const heatmapData = useMemo(() => {
    const counts = {}
    const startDate = subYears(new Date(), 1)
    const endDate = new Date()
    
    // Initialize empty days so heatmap shows full year
    eachDayOfInterval({ start: startDate, end: endDate }).forEach(day => {
      counts[format(day, 'yyyy-MM-dd')] = 0
    })

    // Count completions
    Object.keys(habitLogs).forEach(key => {
      // habitLogs keys are "habitId-YYYY-MM-DD"
      // Wait, splitting by "-" might fail if habitId has dashes.
      // But habits ids are simple strings here.
      // Better regex: /(.+)-(\d{4}-\d{2}-\d{2})/
      const match = key.match(/(.+)-(\d{4}-\d{2}-\d{2})/)
      if (match) {
        const dateStr = match[2]
        const status = habitLogs[key]
        if ((status === true || status === 'done') && counts[dateStr] !== undefined) {
          counts[dateStr] = (counts[dateStr] || 0) + 1
        }
      }
    })
    
    return Object.entries(counts).map(([date, count]) => ({ date, count }))
  }, [habitLogs])

  const handleToggleHabit = (habitId, date, event) => {
    const status = habitLogs[`${habitId}-${date}`]
    const isDone = status === true || status === 'done'
    
    // Use setHabitStatus directly
    // If done -> clear (null)
    // If skipped -> done
    // If clear -> done
    const newStatus = isDone ? null : 'done'
    setHabitStatus(habitId, date, newStatus)
    
    if (newStatus === 'done' && date === today) {
      setCompletedAnimation(habitId)
      setRecentlyCompleted(prev => new Set([...prev, habitId]))
      setTimeout(() => setCompletedAnimation(null), 800)
      setTimeout(() => setRecentlyCompleted(prev => {
        const next = new Set(prev)
        next.delete(habitId)
        return next
      }), 3000)
      
      if (event?.currentTarget) {
        const rect = event.currentTarget.getBoundingClientRect()
        setBurstPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        })
        setShowBurst(true)
      }
      
      const completedAfter = habits.filter(h => 
        h.id === habitId || habitLogs[`${h.id}-${today}`]
      ).length
      
      if (completedAfter === habits.length) {
        setTimeout(() => setShowConfetti(true), 300)
      }
    }
  }

  const getHabitName = (habit) => language === 'is' && habit.nameIs ? habit.nameIs : habit.name
  const getHabitTarget = (habit) => language === 'is' && habit.targetIs ? habit.targetIs : habit.target

  const allDoneToday = stats.todayCompleted === stats.todayTotal

  return (
    <div className="p-8 max-w-5xl animate-fade-in">
      {/* Header with Stats Cards */}
      <header className="mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <Target className="text-purple-400" size={22} />
              </div>
              {t('habits.title')}
            </h1>
            <p className="text-sm text-zinc-500 mt-1.5 ml-[52px]">
              {t('habits.subtitle')}
            </p>
          </div>
        </div>

        {/* Stats Cards - Plane-inspired */}
        <div className="grid grid-cols-4 gap-4">
          {/* Today's Progress */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-dark-800/80 to-dark-800/40 border border-dark-600/30 hover:border-dark-500/50 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">{t('habits.today')}</span>
              <CircularProgress 
                size={40} 
                percentage={(stats.todayCompleted / stats.todayTotal) * 100}
                strokeColor={allDoneToday ? '#22c55e' : '#3b82f6'}
              >
                {allDoneToday ? (
                  <Check size={16} className="text-green-400" />
                ) : (
                  <span className="text-xs font-bold text-zinc-300">
                    {stats.todayCompleted}
                  </span>
                )}
              </CircularProgress>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-green-400">
                {stats.todayCompleted}
              </span>
              <span className="text-sm text-zinc-600">/ {stats.todayTotal}</span>
            </div>
            {allDoneToday && (
              <Badge variant="success" size="sm" icon={Sparkles} className="mt-2">
                {language === 'is' ? 'Frábært!' : 'Perfect!'}
              </Badge>
            )}
          </div>

          {/* This Week */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-dark-800/80 to-dark-800/40 border border-dark-600/30 hover:border-dark-500/50 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">{t('habits.thisWeek')}</span>
              <Calendar size={18} className="text-purple-400" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-purple-400">
                {stats.weeklyTotal}
              </span>
              <span className="text-sm text-zinc-600">/ {stats.weeklyPossible}</span>
            </div>
            <div className="mt-2 h-1.5 bg-dark-700/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-500"
                style={{ width: `${(stats.weeklyTotal / stats.weeklyPossible) * 100}%` }}
              />
            </div>
          </div>

          {/* Completion Rate */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-dark-800/80 to-dark-800/40 border border-dark-600/30 hover:border-dark-500/50 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">{t('habits.completionRate')}</span>
              <TrendingUp size={18} className="text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-cyan-400">
                {stats.completionRate}
              </span>
              <span className="text-lg text-cyan-400/60">%</span>
            </div>
            <Badge 
              variant={stats.completionRate >= 80 ? 'success' : stats.completionRate >= 50 ? 'warning' : 'default'} 
              size="sm" 
              className="mt-2"
            >
              {stats.completionRate >= 80 ? '🔥 ' : ''}{format(monthStart, 'MMMM')}
            </Badge>
          </div>

          {/* Best Streak */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 hover:border-amber-500/30 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-amber-400/70 uppercase tracking-wider">
                {language === 'is' ? 'Besta röð' : 'Best Streak'}
              </span>
              <Trophy size={18} className="text-amber-400" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-amber-400">
                {stats.bestStreak}
              </span>
              <span className="text-sm text-amber-400/60">{t('habits.days')}</span>
            </div>
            {stats.bestStreak >= 7 && (
              <Badge variant="fire" size="sm" icon={Flame} className="mt-2">
                {stats.bestStreak >= 30 ? '🏆 Legend' : stats.bestStreak >= 14 ? '⚡ Epic' : '🔥 Hot'}
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* All Done Celebration */}
      {allDoneToday && (
        <div className="mb-6 p-5 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-green-500/10 border border-green-500/30 rounded-2xl flex items-center gap-4 animate-fade-in overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/5 to-transparent animate-shimmer" />
          <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center relative">
            <Award size={28} className="text-green-400" />
            <div className="absolute inset-0 bg-green-400/20 rounded-2xl animate-ping" />
          </div>
          <div className="flex-1">
            <p className="text-green-400 font-semibold text-lg">{t('habits.allDone')} 🎉</p>
            <p className="text-sm text-green-400/70">{t('habits.keepGoing')}</p>
          </div>
          <div className="flex gap-1">
            {['🎊', '✨', '🌟'].map((emoji, i) => (
              <span key={i} className="text-2xl animate-bounce" style={{ animationDelay: `${i * 100}ms` }}>
                {emoji}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* View Toggle */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex gap-1 p-1 bg-dark-800/50 rounded-xl border border-dark-600/30">
          <button
            onClick={() => setViewMode('week')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              viewMode === 'week'
                ? 'bg-accent/20 text-accent shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-dark-700/50'
            }`}
          >
            <Calendar size={14} />
            {t('habits.thisWeek')}
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              viewMode === 'month'
                ? 'bg-accent/20 text-accent shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-dark-700/50'
            }`}
          >
            <TrendingUp size={14} />
            {t('habits.thisMonth')}
          </button>
        </div>
      </div>

      {/* Week Overview - Enhanced Grid */}
      {viewMode === 'week' && (
        <div className="mb-8 p-5 bg-dark-800/30 rounded-2xl border border-dark-600/30 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-zinc-400">
              {t('habits.weekOf')} {format(weekStart, 'MMM d')}
            </span>
            <Badge variant="accent" size="sm">
              {stats.weeklyTotal}/{stats.weeklyPossible}
            </Badge>
          </div>
          <div className="grid grid-cols-7 gap-3">
            {weekDays.map(day => (
              <WeekCell
                key={day.date}
                day={day}
                habits={habits}
                habitLogs={habitLogs}
                onToggle={handleToggleHabit}
                isToday={day.isToday}
              />
            ))}
          </div>
        </div>
      )}

      {/* Month Heatmap */}
      {viewMode === 'month' && (
        <div className="mb-8 p-5 bg-dark-800/30 rounded-2xl border border-dark-600/30 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-zinc-400">
              {format(monthStart, 'MMMM yyyy')}
            </span>
            <Badge variant="accent" size="sm">
              {stats.monthlyTotal}/{habits.length * monthDays.length} {t('tasks.completed').toLowerCase()}
            </Badge>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <div key={i} className="text-center text-2xs text-zinc-600 py-2 font-medium">{d}</div>
            ))}
            {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {monthDays.map(day => {
              const completedCount = habits.filter(h => habitLogs[`${h.id}-${day.date}`]).length
              const completionPercent = habits.length > 0 ? (completedCount / habits.length) * 100 : 0
              
              return (
                <Tooltip key={day.date} content={`${completedCount}/${habits.length} lokið`}>
                  <div 
                    className={`aspect-square rounded-lg flex items-center justify-center text-2xs transition-all hover:scale-110 cursor-default ${
                      day.isToday ? 'ring-2 ring-accent ring-offset-1 ring-offset-dark-900' : ''
                    }`}
                    style={{
                      backgroundColor: completionPercent === 100 
                        ? 'rgba(34, 197, 94, 0.35)'
                        : completionPercent >= 75
                        ? 'rgba(34, 197, 94, 0.25)'
                        : completionPercent >= 50
                        ? 'rgba(34, 197, 94, 0.18)'
                        : completionPercent >= 25
                        ? 'rgba(34, 197, 94, 0.1)'
                        : 'rgba(39, 39, 42, 0.4)'
                    }}
                  >
                    <span className={day.isToday ? 'text-accent font-semibold' : 'text-zinc-500'}>
                      {day.dayNum}
                    </span>
                  </div>
                </Tooltip>
              )
            })}
          </div>
          
          {/* Legend */}
          <div className="mt-4 flex items-center justify-end gap-2 text-2xs text-zinc-600">
            <span>{language === 'is' ? 'Minna' : 'Less'}</span>
            <div className="flex gap-1">
              {[0, 25, 50, 75, 100].map(level => (
                <div 
                  key={level}
                  className="w-3.5 h-3.5 rounded-sm transition-transform hover:scale-125"
                  style={{
                    backgroundColor: level === 100 
                      ? 'rgba(34, 197, 94, 0.35)'
                      : level >= 75
                      ? 'rgba(34, 197, 94, 0.25)'
                      : level >= 50
                      ? 'rgba(34, 197, 94, 0.18)'
                      : level >= 25
                      ? 'rgba(34, 197, 94, 0.1)'
                      : 'rgba(39, 39, 42, 0.4)'
                  }}
                />
              ))}
            </div>
            <span>{language === 'is' ? 'Meira' : 'More'}</span>
          </div>
        </div>
      )}

      {/* Habits List - Enhanced */}
      <div className="space-y-3">
        {habits.map((habit, index) => {
          const streak = getStreak(habit.id)
          const status = habitLogs[`${habit.id}-${today}`]
          const isDone = status === true || status === 'done'
          const isSkipped = status === 'skip'
          const isAnimating = completedAnimation === habit.id
          const wasRecentlyCompleted = recentlyCompleted.has(habit.id)
          
          return (
            <div 
              key={habit.id}
              className={`
                p-5 rounded-2xl border transition-all duration-300 group relative overflow-hidden
                ${isDone 
                  ? 'bg-gradient-to-r from-green-500/10 via-green-500/5 to-transparent border-green-500/30' 
                  : isSkipped
                  ? 'bg-dark-800/60 border-dark-600/30 opacity-75'
                  : 'bg-dark-800/40 border-dark-600/30 hover:bg-dark-800/60 hover:border-dark-500/50'
                }
                ${isAnimating ? 'scale-[1.02] shadow-lg shadow-green-500/10' : ''}
              `}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Skipped overlay pattern */}
              {isSkipped && (
                <div className="absolute inset-0 pointer-events-none opacity-5" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
              )}
              
              <div className="flex items-center gap-5 relative z-10">
                {/* Toggle Button - Enhanced */}
                <button
                  onClick={(e) => handleToggleHabit(habit.id, today, e)}
                  className={`
                    relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300
                    ${isDone
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                      : isSkipped
                      ? 'bg-dark-700 text-zinc-600 ring-2 ring-zinc-700/50'
                      : 'bg-dark-700/50 text-zinc-500 hover:bg-dark-600 hover:text-zinc-300 hover:scale-105 border border-dark-500/50'
                    }
                    ${isAnimating ? 'animate-celebrate' : ''}
                  `}
                >
                  {isDone ? (
                    <Check size={28} strokeWidth={3} className={isAnimating ? 'animate-scale-in' : ''} />
                  ) : isSkipped ? (
                    <SkipForward size={24} />
                  ) : (
                    <DynamicIcon name={habit.icon} size={26} />
                  )}
                  
                  {/* Ripple effect on complete */}
                  {wasRecentlyCompleted && (
                    <div className="absolute inset-0 rounded-2xl bg-green-400/30 animate-ping" />
                  )}
                </button>
                
                {/* Info & Controls */}
                <div className="flex-1 min-w-0 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-base flex items-center gap-2 ${isDone ? 'text-green-300' : isSkipped ? 'text-zinc-500 line-through' : ''}`}>
                      {getHabitName(habit)}
                      {isSkipped && <span className="text-2xs px-1.5 py-0.5 rounded bg-dark-700 text-zinc-500 font-medium tracking-wide uppercase">{language === 'is' ? 'Sleppt' : 'Skipped'}</span>}
                    </h3>
                    <p className="text-sm text-zinc-500 truncate mt-0.5">{getHabitTarget(habit)}</p>
                  </div>

                  {/* Skip Button - Only show if not done */}
                  {!isDone && (
                    <button
                      onClick={() => setHabitStatus(habit.id, today, isSkipped ? null : 'skip')}
                      className={`
                        p-2 rounded-lg transition-all text-xs font-medium flex items-center gap-1.5
                        ${isSkipped 
                          ? 'text-zinc-400 bg-dark-700 hover:bg-dark-600 hover:text-white' 
                          : 'text-zinc-600 hover:text-zinc-400 hover:bg-dark-700/50'
                        }
                      `}
                      title={language === 'is' ? 'Sleppa deginum (heldur röð)' : 'Skip day (keeps streak)'}
                    >
                      <SkipForward size={14} />
                      <span className="hidden sm:inline">{language === 'is' ? 'Sleppa' : 'Skip'}</span>
                    </button>
                  )}
                </div>
                
                {/* Streak Badge - Enhanced */}
                {(streak.current > 0 || isSkipped) && (
                  <Tooltip content={`${language === 'is' ? 'Lengsta röð' : 'Longest'}: ${streak.longest} ${t('habits.days')}`}>
                    <div className={`
                      flex items-center gap-2 px-4 py-2 rounded-xl transition-all
                      ${streak.current >= 7 
                        ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/20 border border-amber-500/30' 
                        : 'bg-amber-500/10 border border-amber-500/20'
                      }
                      ${isSkipped ? 'opacity-50 grayscale' : ''}
                    `}>
                      <StreakFire streak={streak.current} isAnimating={isAnimating} />
                      <div className="flex flex-col items-end">
                        <span className="text-lg font-bold text-amber-400 font-mono leading-none">
                          {streak.current}
                        </span>
                        <span className="text-2xs text-amber-400/60">
                          {streak.current === 1 ? t('habits.day') : t('habits.days')}
                        </span>
                      </div>
                    </div>
                  </Tooltip>
                )}

                {/* Longest Streak Trophy */}
                {streak.longest > streak.current && streak.longest >= 3 && (
                  <Tooltip content={`${language === 'is' ? 'Lengsta röð' : 'Best streak'}: ${streak.longest} ${t('habits.days')}`}>
                    <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-dark-700/50 rounded-lg border border-dark-600/30">
                      <Trophy size={14} className="text-zinc-500" />
                      <span className="text-sm text-zinc-500 font-mono">{streak.longest}</span>
                    </div>
                  </Tooltip>
                )}
                
                {/* Week Progress Mini - Hidden on small screens */}
                <div className="hidden lg:flex gap-1.5">
                  {weekDays.map(day => {
                    const isDone = habitLogs[`${habit.id}-${day.date}`]
                    return (
                      <Tooltip key={day.date} content={`${day.dayName} - ${isDone ? '✓' : '○'}`}>
                        <button
                          onClick={(e) => handleToggleHabit(habit.id, day.date, e)}
                          className={`
                            w-8 h-8 rounded-lg text-2xs font-medium transition-all
                            hover:scale-110 hover:shadow-md
                            ${isDone 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                              : day.isToday
                              ? 'bg-dark-600 text-zinc-400 ring-2 ring-accent/50'
                              : 'bg-dark-700/50 text-zinc-600 hover:bg-dark-600 border border-dark-600/30'
                            }
                          `}
                        >
                          {isDone ? '✓' : day.dayName.charAt(0)}
                        </button>
                      </Tooltip>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Yearly Heatmap */}
      <div className="mt-8 p-5 bg-dark-800/30 rounded-2xl border border-dark-600/30 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-zinc-400" />
            <span className="text-sm font-medium text-zinc-300">
              {language === 'is' ? 'Ársyfirlit' : 'Yearly Activity'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-2xs text-zinc-500">
            <span>{language === 'is' ? 'Minna' : 'Less'}</span>
            {[0, 1, 2, 3, 4].map(level => (
              <div 
                key={level}
                className={`w-2.5 h-2.5 rounded-sm bg-green-${level === 0 ? '900/20' : level * 200 + 300}`}
                style={{ 
                  backgroundColor: level === 0 ? 'rgba(39, 39, 42, 0.4)' 
                    : `rgba(34, 197, 94, ${0.2 * level})`
                }}
              />
            ))}
            <span>{language === 'is' ? 'Meira' : 'More'}</span>
          </div>
        </div>
        
        <div className="heatmap-container overflow-x-auto pb-2">
          <div className="min-w-[700px]">
            <CalendarHeatmap
              startDate={subDays(new Date(), 365)}
              endDate={new Date()}
              values={heatmapData}
              classForValue={(value) => {
                if (!value || value.count === 0) return 'color-empty';
                return `color-scale-${Math.min(4, value.count)}`;
              }}
              transformDayElement={(element, value, index) => {
                const count = value ? value.count : 0;
                const alpha = count === 0 ? 0.1 : 0.2 + (Math.min(4, count) / 4) * 0.6;
                const fill = count === 0 ? '#27272a' : '#22c55e'; // Zinc-800 or Green-500
                return React.cloneElement(element, { 
                  style: { 
                    fill, 
                    fillOpacity: alpha, 
                    rx: 2, 
                    ry: 2 
                  } 
                });
              }}
              titleForValue={(value) => {
                const date = value ? value.date : '';
                const count = value ? value.count : 0;
                return `${date}: ${count} ${language === 'is' ? 'venjur' : 'habits'}`;
              }}
              showWeekdayLabels={true}
              gutterSize={2}
            />
          </div>
        </div>
      </div>

      {/* Encouragement - Enhanced */}
      <div className="mt-10 p-5 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-purple-500/5 border border-purple-500/20 rounded-2xl flex items-start gap-4 animate-fade-in">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
          <Heart size={20} className="text-purple-400" />
        </div>
        <div>
          <p className="text-sm text-purple-300 leading-relaxed">
            <strong>{language === 'is' ? 'Vertu blíður við sjálfan þig.' : 'Be gentle with yourself.'}</strong>{' '}
            {t('habits.encouragement')}
          </p>
        </div>
      </div>

      {/* Confetti effects */}
      <ConfettiBurst 
        x={burstPosition.x} 
        y={burstPosition.y} 
        active={showBurst}
        onComplete={() => setShowBurst(false)}
      />
      <Confetti 
        active={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />
    </div>
  )
}

export default HabitsView
