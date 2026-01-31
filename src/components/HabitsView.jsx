import React from 'react'
import useStore from '../store/useStore'
import DynamicIcon from './Icons'
import { format, subDays, startOfWeek, addDays } from 'date-fns'
import { Target, Check, Flame, Heart, TrendingUp } from 'lucide-react'

function HabitsView() {
  const { habits, habitLogs, toggleHabit } = useStore()
  
  const today = format(new Date(), 'yyyy-MM-dd')
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i)
    return {
      date: format(date, 'yyyy-MM-dd'),
      dayName: format(date, 'EEE'),
      dayNum: format(date, 'd'),
      isToday: format(date, 'yyyy-MM-dd') === today
    }
  })

  const getStreak = (habitId) => {
    let streak = 0
    let checkDate = new Date()
    
    while (true) {
      const dateKey = format(checkDate, 'yyyy-MM-dd')
      if (habitLogs[`${habitId}-${dateKey}`]) {
        streak++
        checkDate = subDays(checkDate, 1)
      } else {
        break
      }
    }
    return streak
  }

  const getTotalCompletedToday = () => {
    return habits.filter(h => habitLogs[`${h.id}-${today}`]).length
  }

  const getWeeklyProgress = () => {
    let total = 0
    weekDays.forEach(day => {
      habits.forEach(habit => {
        if (habitLogs[`${habit.id}-${day.date}`]) total++
      })
    })
    return total
  }

  return (
    <div className="p-8 max-w-4xl animate-fade-in">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-3">
              <Target className="text-purple-400" size={24} />
              Daily Habits
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Small consistent actions compound into big results
            </p>
          </div>
          
          {/* Stats */}
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-2xl font-semibold font-mono text-green-400">
                {getTotalCompletedToday()}/{habits.length}
              </p>
              <p className="text-2xs text-zinc-500">Today</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold font-mono text-purple-400">
                {getWeeklyProgress()}/{habits.length * 7}
              </p>
              <p className="text-2xs text-zinc-500">This Week</p>
            </div>
          </div>
        </div>
      </header>

      {/* Week Overview */}
      <div className="mb-8 p-4 bg-dark-800/50 rounded-xl border border-dark-600/50">
        <div className="flex justify-between mb-3">
          <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
            Week of {format(weekStart, 'MMM d')}
          </span>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map(day => {
            const completedCount = habits.filter(h => habitLogs[`${h.id}-${day.date}`]).length
            const allDone = completedCount === habits.length
            
            return (
              <div 
                key={day.date}
                className={`text-center py-3 rounded-lg transition-colors ${
                  day.isToday 
                    ? 'bg-accent/20 ring-2 ring-accent' 
                    : 'bg-dark-700/50'
                }`}
              >
                <p className="text-2xs text-zinc-500 mb-1">{day.dayName}</p>
                <p className={`text-sm font-medium ${day.isToday ? 'text-accent' : ''}`}>
                  {day.dayNum}
                </p>
                <div className="mt-2 flex justify-center gap-0.5">
                  {habits.map(habit => (
                    <div
                      key={habit.id}
                      className={`w-1.5 h-1.5 rounded-full ${
                        habitLogs[`${habit.id}-${day.date}`]
                          ? 'bg-green-400'
                          : 'bg-dark-500'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Habits List */}
      <div className="space-y-3 stagger-children">
        {habits.map(habit => {
          const streak = getStreak(habit.id)
          const isCompletedToday = habitLogs[`${habit.id}-${today}`]
          
          return (
            <div 
              key={habit.id}
              className={`p-4 rounded-xl border transition-all ${
                isCompletedToday 
                  ? 'bg-green-500/5 border-green-500/30' 
                  : 'bg-dark-800/50 border-dark-600/50 hover:bg-dark-800'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Toggle Button */}
                <button
                  onClick={() => toggleHabit(habit.id, today)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                    isCompletedToday
                      ? 'bg-green-500 text-white'
                      : 'bg-dark-700 text-zinc-500 hover:bg-dark-600 hover:text-zinc-300'
                  }`}
                >
                  {isCompletedToday ? (
                    <Check size={24} strokeWidth={3} />
                  ) : (
                    <DynamicIcon name={habit.icon} size={24} />
                  )}
                </button>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium">{habit.name}</h3>
                  <p className="text-xs text-zinc-500 truncate">{habit.target}</p>
                </div>
                
                {/* Streak */}
                {streak > 0 && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 rounded-lg">
                    <Flame size={14} className="text-amber-400" />
                    <span className="text-sm font-medium text-amber-400 font-mono">{streak}</span>
                  </div>
                )}
                
                {/* Week Progress */}
                <div className="hidden sm:flex gap-1">
                  {weekDays.map(day => {
                    const isDone = habitLogs[`${habit.id}-${day.date}`]
                    return (
                      <button
                        key={day.date}
                        onClick={() => toggleHabit(habit.id, day.date)}
                        className={`w-7 h-7 rounded-md text-2xs font-medium transition-all ${
                          isDone 
                            ? 'bg-green-500/20 text-green-400' 
                            : day.isToday
                            ? 'bg-dark-600 text-zinc-400 ring-1 ring-accent'
                            : 'bg-dark-700 text-zinc-600 hover:bg-dark-600'
                        }`}
                      >
                        {isDone ? '✓' : day.dayName.charAt(0)}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Encouragement */}
      <div className="mt-8 p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl flex items-start gap-3">
        <Heart size={18} className="text-purple-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm text-purple-300">
            <strong>Be gentle with yourself.</strong> With your back, even 5 minutes of gentle movement counts. 
            Progress isn't linear — consistency over perfection.
          </p>
        </div>
      </div>
    </div>
  )
}

export default HabitsView
