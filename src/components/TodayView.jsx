import React, { useState, useMemo } from 'react'
import useStore from '../store/useStore'
import { useTranslation } from '../i18n/useTranslation'
import {
  Sun,
  Check,
  Circle,
  Plus,
  Sparkles,
  ChevronRight,
  Target,
  Clock,
  Star,
  Flame,
  ArrowRight,
} from 'lucide-react'

/**
 * TodayView — ADHD-friendly "Today Only" view
 * 
 * Shows max 3 tasks to focus on today. Clean, distraction-free.
 * Designed for executive function support:
 * - Limited choices (3 max)
 * - Clear visual hierarchy
 * - Satisfying completion animations
 * - Gentle encouragement, not pressure
 */

const MAX_TODAY_TASKS = 3

function TodayView() {
  const { language } = useTranslation()
  const {
    tasks,
    toggleTask,
    projects,
    habits,
    habitLogs,
    toggleHabit,
    todayTaskIds,
    setTodayTaskIds,
    updateTask,
  } = useStore()

  const [showPicker, setShowPicker] = useState(false)
  const [justCompleted, setJustCompleted] = useState(null)

  const is = language === 'is'

  // Get today's date string
  const today = new Date().toISOString().split('T')[0]
  const now = new Date()
  const hour = now.getHours()

  // Time-based greeting
  const greeting = useMemo(() => {
    if (hour < 12) return is ? 'Góðan daginn' : 'Good morning'
    if (hour < 17) return is ? 'Góðan dag' : 'Good afternoon'
    if (hour < 21) return is ? 'Gott kvöld' : 'Good evening'
    return is ? 'Góða nótt' : 'Good night'
  }, [hour, is])

  // Tasks selected for today
  const todayTasks = useMemo(() => {
    if (!todayTaskIds || todayTaskIds.length === 0) return []
    return todayTaskIds
      .map(id => tasks.find(t => t.id === id))
      .filter(Boolean)
  }, [todayTaskIds, tasks])

  // Available tasks to pick from (incomplete, not already selected)
  const availableTasks = useMemo(() => {
    const selectedIds = new Set(todayTaskIds || [])
    return tasks
      .filter(t => !t.completed && !selectedIds.has(t.id))
      .sort((a, b) => {
        // High priority first
        const prio = { high: 0, medium: 1, low: 2 }
        const pa = prio[a.priority] ?? 1
        const pb = prio[b.priority] ?? 1
        if (pa !== pb) return pa - pb
        // Then by due date
        if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate)
        if (a.dueDate) return -1
        if (b.dueDate) return 1
        return 0
      })
  }, [tasks, todayTaskIds])

  // Smart suggestions (top 3 from available)
  const suggestions = availableTasks.slice(0, 6)

  // Habits for today
  const todayHabits = useMemo(() => {
    return habits.map(h => ({
      ...h,
      done: !!habitLogs[`${h.id}-${today}`],
    }))
  }, [habits, habitLogs, today])

  const completedCount = todayTasks.filter(t => t.completed).length
  const totalCount = todayTasks.length
  const allDone = totalCount > 0 && completedCount === totalCount
  const habitsCompleted = todayHabits.filter(h => h.done).length

  // Handle completing a today task
  const handleToggle = (taskId) => {
    const task = tasks.find(t => t.id === taskId)
    if (task && !task.completed) {
      setJustCompleted(taskId)
      setTimeout(() => setJustCompleted(null), 1500)
    }
    toggleTask(taskId)
  }

  // Add task to today
  const addToToday = (taskId) => {
    const current = todayTaskIds || []
    if (current.length >= MAX_TODAY_TASKS) return
    setTodayTaskIds([...current, taskId])
    if (current.length + 1 >= MAX_TODAY_TASKS) {
      setShowPicker(false)
    }
  }

  // Remove task from today
  const removeFromToday = (taskId) => {
    setTodayTaskIds((todayTaskIds || []).filter(id => id !== taskId))
  }

  // Get project for a task
  const getProject = (projectId) => projects.find(p => p.id === projectId)

  // Priority colors
  const prioColor = (p) => {
    if (p === 'high') return 'text-red-400'
    if (p === 'medium') return 'text-amber-400'
    return 'text-slate-500'
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 relative z-20">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Sun className="w-6 h-6 text-amber-400" />
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {greeting} 👋
          </h1>
        </div>
        <p className="text-[var(--text-secondary)] text-sm ml-9">
          {is
            ? totalCount === 0
              ? 'Veldu allt að 3 verkefni til að einbeita þér að í dag.'
              : allDone
                ? '🎉 Þú kláraðir allt í dag! Vel gert.'
                : `${completedCount} af ${totalCount} verkefnum kláruð.`
            : totalCount === 0
              ? 'Pick up to 3 tasks to focus on today.'
              : allDone
                ? '🎉 You finished everything today! Great job.'
                : `${completedCount} of ${totalCount} tasks done.`}
        </p>
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="mb-8">
          <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${(completedCount / totalCount) * 100}%`,
                background: allDone
                  ? 'linear-gradient(90deg, #22c55e, #10b981)'
                  : 'linear-gradient(90deg, var(--accent), var(--accent-hover))',
              }}
            />
          </div>
        </div>
      )}

      {/* Today's Tasks */}
      <div className="space-y-3 mb-8">
        {todayTasks.map((task, idx) => {
          const project = getProject(task.projectId)
          const isCompleted = task.completed
          const wasJustCompleted = justCompleted === task.id

          return (
            <div
              key={task.id}
              className={`
                group relative rounded-xl border p-4 transition-all duration-300
                ${isCompleted
                  ? 'bg-[var(--bg-tertiary)]/50 border-[var(--border-primary)]/30'
                  : 'bg-[var(--bg-secondary)] border-[var(--border-primary)] hover:border-[var(--accent)]/40'
                }
                ${wasJustCompleted ? 'scale-[0.98] opacity-80' : ''}
              `}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <button
                  onClick={() => handleToggle(task.id)}
                  className={`
                    mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center
                    transition-all duration-300
                    ${isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-[var(--text-secondary)]/40 hover:border-[var(--accent)] hover:bg-[var(--accent)]/10'
                    }
                  `}
                >
                  {isCompleted && <Check className="w-3.5 h-3.5" />}
                </button>

                {/* Task content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {project && (
                      <span
                        className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                    )}
                    <span
                      className={`
                        text-base font-medium transition-all duration-300
                        ${isCompleted
                          ? 'line-through text-[var(--text-secondary)]/60'
                          : 'text-[var(--text-primary)]'
                        }
                      `}
                    >
                      {task.title}
                    </span>
                  </div>
                  {project && (
                    <span className="text-xs text-[var(--text-secondary)]">
                      {project.name}
                    </span>
                  )}
                </div>

                {/* Priority indicator */}
                <div className={`flex-shrink-0 ${prioColor(task.priority)}`}>
                  {task.priority === 'high' && <Flame className="w-4 h-4" />}
                  {task.priority === 'medium' && <Star className="w-4 h-4" />}
                </div>

                {/* Remove from today */}
                {!isCompleted && (
                  <button
                    onClick={() => removeFromToday(task.id)}
                    className="opacity-0 group-hover:opacity-100 text-[var(--text-secondary)] hover:text-red-400 transition-opacity text-xs"
                    title={is ? 'Fjarlægja' : 'Remove'}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Celebration animation */}
              {wasJustCompleted && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-4xl animate-bounce">✨</span>
                </div>
              )}
            </div>
          )
        })}

        {/* Add task slot */}
        {totalCount < MAX_TODAY_TASKS && (
          <button
            onClick={() => setShowPicker(!showPicker)}
            className={`
              w-full rounded-xl border-2 border-dashed p-4 flex items-center justify-center gap-2
              transition-all duration-200
              ${showPicker
                ? 'border-[var(--accent)]/40 bg-[var(--accent)]/5 text-[var(--accent)]'
                : 'border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-[var(--accent)]/30 hover:text-[var(--accent)]'
              }
            `}
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">
              {is ? 'Bæta við verkefni' : 'Add a task'}
            </span>
            <span className="text-xs opacity-60">
              ({totalCount}/{MAX_TODAY_TASKS})
            </span>
          </button>
        )}
      </div>

      {/* Task Picker */}
      {showPicker && suggestions.length > 0 && (
        <div className="mb-8 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border-primary)] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {is ? 'Tillögur' : 'Suggestions'}
            </span>
          </div>
          <div className="divide-y divide-[var(--border-primary)]/50">
            {suggestions.map(task => {
              const project = getProject(task.projectId)
              return (
                <button
                  key={task.id}
                  onClick={() => addToToday(task.id)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--accent)]/5 transition-colors text-left"
                >
                  <Circle className="w-4 h-4 text-[var(--text-secondary)]/40 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-[var(--text-primary)] block truncate">
                      {task.title}
                    </span>
                    {project && (
                      <span className="text-xs text-[var(--text-secondary)]">
                        {project.name}
                      </span>
                    )}
                  </div>
                  <div className={`flex-shrink-0 ${prioColor(task.priority)}`}>
                    {task.priority === 'high' && <Flame className="w-3.5 h-3.5" />}
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[var(--accent)] opacity-0 group-hover:opacity-100" />
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* All Done celebration */}
      {allDone && totalCount > 0 && (
        <div className="text-center py-8 mb-8">
          <div className="text-5xl mb-4">🏆</div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
            {is ? 'Allt klárt!' : 'All done!'}
          </h2>
          <p className="text-[var(--text-secondary)] text-sm">
            {is
              ? 'Þú kláraðir öll verkefni dagsins. Taktu þér frí eða veldu ný verkefni.'
              : 'You finished all your tasks for today. Take a break or pick new ones.'}
          </p>
        </div>
      )}

      {/* Quick Habits Section */}
      {todayHabits.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-[var(--accent)]" />
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              {is ? 'Vanir' : 'Habits'}
            </h3>
            <span className="text-xs text-[var(--text-secondary)]">
              {habitsCompleted}/{todayHabits.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {todayHabits.map(habit => (
              <button
                key={habit.id}
                onClick={() => toggleHabit(habit.id)}
                className={`
                  px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all duration-200
                  ${habit.done
                    ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-primary)] hover:border-[var(--accent)]/30'
                  }
                `}
              >
                {habit.done ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Circle className="w-3.5 h-3.5" />
                )}
                <span>{is ? habit.nameIs : habit.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {totalCount === 0 && !showPicker && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🎯</div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">
            {is ? 'Hvað viltu gera í dag?' : 'What do you want to do today?'}
          </h2>
          <p className="text-[var(--text-secondary)] text-sm mb-6">
            {is
              ? 'Veldu 1-3 verkefni. Ekki fleiri. Einbeittu þér.'
              : 'Pick 1-3 tasks. No more. Stay focused.'}
          </p>
          <button
            onClick={() => setShowPicker(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
          >
            <Plus className="w-4 h-4" />
            {is ? 'Velja verkefni' : 'Choose tasks'}
          </button>
        </div>
      )}
    </div>
  )
}

export default TodayView
