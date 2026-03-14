import React, { useState, useMemo } from 'react'
import useStore from '../store/useStore'
import { useTranslation } from '../i18n/useTranslation'
import { 
  Target, Clock, Play, Pause, X, ChevronUp, ChevronDown, 
  Plus, GripVertical, CheckCircle2, Zap, Coffee
} from 'lucide-react'
import { format, addMinutes } from 'date-fns'

/**
 * FocusQueue — ADHD-friendly dashboard widget
 * Shows a prioritized queue of tasks with time estimates.
 * Helps answer: "What should I do RIGHT NOW?"
 */

const TIME_PRESETS = [15, 25, 30, 45, 60, 90]

function FocusQueue() {
  const { t } = useTranslation()
  const { 
    tasks, projects, toggleTask, focusTask, setFocusTask, 
    setFocusProject, focusElapsed, endFocus,
    focusQueueIds = [],
    setFocusQueueIds,
    focusQueueEstimates = {},
    setFocusQueueEstimate,
  } = useStore()

  const [addingTask, setAddingTask] = useState(false)
  const [dragIdx, setDragIdx] = useState(null)

  // Get queue tasks in order
  const queueTasks = useMemo(() => {
    return focusQueueIds
      .map(id => tasks.find(t => t.id === id))
      .filter(Boolean)
      .filter(t => !t.completed)
  }, [focusQueueIds, tasks])

  // Available tasks not in queue
  const availableTasks = useMemo(() => {
    const queueSet = new Set(focusQueueIds)
    return tasks
      .filter(t => !t.completed && !queueSet.has(t.id))
      .sort((a, b) => {
        // Priority sort: high > medium > low
        const prio = { high: 0, medium: 1, low: 2 }
        return (prio[a.priority] || 1) - (prio[b.priority] || 1)
      })
      .slice(0, 15)
  }, [tasks, focusQueueIds])

  // Timeline calculation
  const timeline = useMemo(() => {
    let currentTime = new Date()
    return queueTasks.map(task => {
      const est = focusQueueEstimates[task.id] || 25
      const start = new Date(currentTime)
      const end = addMinutes(start, est)
      currentTime = end
      return { task, est, start, end }
    })
  }, [queueTasks, focusQueueEstimates])

  const totalMinutes = timeline.reduce((sum, t) => sum + t.est, 0)
  const totalHours = Math.floor(totalMinutes / 60)
  const remainingMins = totalMinutes % 60

  const addToQueue = (taskId) => {
    setFocusQueueIds([...focusQueueIds, taskId])
    if (!focusQueueEstimates[taskId]) {
      setFocusQueueEstimate(taskId, 25)
    }
    setAddingTask(false)
  }

  const removeFromQueue = (taskId) => {
    setFocusQueueIds(focusQueueIds.filter(id => id !== taskId))
  }

  const moveInQueue = (idx, direction) => {
    const newIds = [...focusQueueIds]
    const newIdx = idx + direction
    if (newIdx < 0 || newIdx >= newIds.length) return
    ;[newIds[idx], newIds[newIdx]] = [newIds[newIdx], newIds[idx]]
    setFocusQueueIds(newIds)
  }

  const cycleEstimate = (taskId) => {
    const current = focusQueueEstimates[taskId] || 25
    const idx = TIME_PRESETS.indexOf(current)
    const next = TIME_PRESETS[(idx + 1) % TIME_PRESETS.length]
    setFocusQueueEstimate(taskId, next)
  }

  const startFocusOnTask = (task) => {
    const project = projects.find(p => p.id === task.projectId)
    if (project) {
      setFocusProject(project)
    }
    setFocusTask(task)
  }

  const completeAndNext = (task) => {
    toggleTask(task.id)
    removeFromQueue(task.id)
    // Auto-start next task
    const remaining = queueTasks.filter(t => t.id !== task.id)
    if (remaining.length > 0) {
      startFocusOnTask(remaining[0])
    }
  }

  const priorityColor = (p) => {
    if (p === 'high') return 'text-red-400'
    if (p === 'low') return 'text-blue-400'
    return 'text-yellow-400'
  }

  const isCurrentlyFocused = (taskId) => focusTask?.id === taskId

  if (queueTasks.length === 0 && !addingTask) {
    return (
      <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-white/90">Focus Queue</h3>
          </div>
        </div>
        <div className="text-center py-6">
          <Zap className="w-8 h-8 text-yellow-400/50 mx-auto mb-2" />
          <p className="text-white/40 text-sm mb-3">
            {t('focusQueue.empty', 'Ekkert í biðröð — veldu verkefni!')}
          </p>
          <button
            onClick={() => setAddingTask(true)}
            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-sm transition-colors flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            {t('focusQueue.addTask', 'Bæta við verkefni')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold text-white/90">Focus Queue</h3>
          <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
            {queueTasks.length} {queueTasks.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/50">
          <Clock className="w-3.5 h-3.5" />
          {totalHours > 0 && `${totalHours}h `}{remainingMins}m
          {timeline.length > 0 && (
            <span className="text-white/30">
              → {format(timeline[timeline.length - 1].end, 'HH:mm')}
            </span>
          )}
        </div>
      </div>

      {/* Queue items */}
      <div className="space-y-1.5">
        {timeline.map(({ task, est, start, end }, idx) => (
          <div
            key={task.id}
            className={`group flex items-center gap-2 p-2.5 rounded-xl transition-all ${
              isCurrentlyFocused(task.id)
                ? 'bg-purple-500/20 border border-purple-500/30 ring-1 ring-purple-500/20'
                : 'bg-white/5 hover:bg-white/8 border border-transparent'
            }`}
          >
            {/* Reorder */}
            <div className="flex flex-col opacity-0 group-hover:opacity-50 transition-opacity">
              <button onClick={() => moveInQueue(idx, -1)} className="hover:text-white/80">
                <ChevronUp className="w-3 h-3" />
              </button>
              <button onClick={() => moveInQueue(idx, 1)} className="hover:text-white/80">
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {/* Task info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                {task.priority && (
                  <span className={`text-[10px] ${priorityColor(task.priority)}`}>●</span>
                )}
                <span className={`text-sm truncate ${
                  isCurrentlyFocused(task.id) ? 'text-white font-medium' : 'text-white/80'
                }`}>
                  {task.title}
                </span>
              </div>
              <div className="text-[11px] text-white/30 mt-0.5">
                {format(start, 'HH:mm')} – {format(end, 'HH:mm')}
              </div>
            </div>

            {/* Time estimate (clickable to cycle) */}
            <button
              onClick={() => cycleEstimate(task.id)}
              className="text-xs text-white/40 hover:text-white/70 bg-white/5 px-2 py-1 rounded-md transition-colors shrink-0"
              title="Click to change estimate"
            >
              {est}m
            </button>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {isCurrentlyFocused(task.id) ? (
                <button
                  onClick={() => completeAndNext(task)}
                  className="p-1 text-green-400 hover:text-green-300 transition-colors"
                  title="Complete & next"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => startFocusOnTask(task)}
                  className="p-1 text-purple-400 hover:text-purple-300 transition-colors"
                  title="Start focus"
                >
                  <Play className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => removeFromQueue(task.id)}
                className="p-1 text-white/30 hover:text-red-400 transition-colors"
                title="Remove"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add task button / task picker */}
      {addingTask ? (
        <div className="mt-3 bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/50 font-medium">
              {t('focusQueue.pickTask', 'Veldu verkefni')}
            </span>
            <button onClick={() => setAddingTask(false)} className="text-white/30 hover:text-white/60">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {availableTasks.length === 0 ? (
              <p className="text-xs text-white/30 py-2 text-center">
                {t('focusQueue.noTasks', 'Engin verkefni tiltæk')}
              </p>
            ) : (
              availableTasks.map(task => (
                <button
                  key={task.id}
                  onClick={() => addToQueue(task.id)}
                  className="w-full text-left flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {task.priority && (
                    <span className={`text-[10px] ${priorityColor(task.priority)}`}>●</span>
                  )}
                  <span className="text-sm text-white/70 truncate">{task.title}</span>
                  <span className="text-[10px] text-white/30 ml-auto shrink-0">
                    {projects.find(p => p.id === task.projectId)?.name || ''}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAddingTask(true)}
          className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 text-xs text-white/30 hover:text-white/50 hover:bg-white/5 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          {t('focusQueue.addMore', 'Bæta við')}
        </button>
      )}
    </div>
  )
}

export default FocusQueue
