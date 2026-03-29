import React, { useState, useEffect, useCallback, useMemo } from 'react'
import useStore from '../store/useStore'
import { useTranslation } from '../i18n/useTranslation'
import { Target, Check, ChevronRight, Sparkles, Coffee, ArrowLeft } from 'lucide-react'
import Confetti from './Confetti'

/**
 * FocusModeView — "Just One Thing" ADHD focus mode
 * Shows ONE task at a time. Complete it, get the next one.
 * Reduces decision paralysis by eliminating choice.
 */
function FocusModeView() {
  const { t, language } = useTranslation()
  const { tasks, projects, updateTask, setActiveView } = useStore()
  const [showConfetti, setShowConfetti] = useState(false)
  const [completedCount, setCompletedCount] = useState(0)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [skippedIds, setSkippedIds] = useState(new Set())

  // Get actionable tasks sorted by priority then due date
  const actionableTasks = useMemo(() => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    const now = new Date()

    return tasks
      .filter(task => !task.completed && !skippedIds.has(task.id))
      .sort((a, b) => {
        // Priority first
        const pa = priorityOrder[a.priority] ?? 2
        const pb = priorityOrder[b.priority] ?? 2
        if (pa !== pb) return pa - pb

        // Then due date (sooner first, no date last)
        const da = a.dueDate ? new Date(a.dueDate) : null
        const db = b.dueDate ? new Date(b.dueDate) : null
        if (da && db) return da - db
        if (da) return -1
        if (db) return 1

        return 0
      })
  }, [tasks, skippedIds])

  const currentTask = actionableTasks[0] || null
  const remainingCount = actionableTasks.length

  const currentProject = useMemo(() => {
    if (!currentTask?.projectId) return null
    return projects.find(p => p.id === currentTask.projectId)
  }, [currentTask, projects])

  const handleComplete = useCallback(() => {
    if (!currentTask) return
    updateTask(currentTask.id, { completed: true, completedAt: new Date().toISOString() })
    setCompletedCount(prev => prev + 1)
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 2000)
  }, [currentTask, updateTask])

  const handleSkip = useCallback(() => {
    if (!currentTask) return
    setSkippedIds(prev => new Set([...prev, currentTask.id]))
  }, [currentTask])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        handleComplete()
      }
      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault()
        handleSkip()
      }
      if (e.key === 'Escape') {
        setActiveView('dashboard')
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleComplete, handleSkip, setActiveView])

  const isIs = language === 'is'

  // All done state
  if (sessionStarted && !currentTask) {
    return (
      <div style={styles.container}>
        {showConfetti && <Confetti />}
        <div style={styles.allDone}>
          <div style={styles.allDoneEmoji}>🎉</div>
          <h1 style={styles.allDoneTitle}>
            {isIs ? 'Allt klárað!' : 'All done!'}
          </h1>
          <p style={styles.allDoneSubtitle}>
            {isIs
              ? `Þú kláraðir ${completedCount} verkefni í þessari lotu`
              : `You completed ${completedCount} task${completedCount !== 1 ? 's' : ''} this session`}
          </p>
          <div style={styles.allDoneActions}>
            <button
              onClick={() => { setSkippedIds(new Set()); setSessionStarted(false) }}
              style={styles.secondaryBtn}
            >
              {isIs ? 'Byrja aftur' : 'Start over'}
            </button>
            <button
              onClick={() => setActiveView('dashboard')}
              style={styles.secondaryBtn}
            >
              <ArrowLeft size={16} />
              {isIs ? 'Til baka' : 'Back to dashboard'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // No tasks at all
  if (!currentTask && !sessionStarted) {
    return (
      <div style={styles.container}>
        <div style={styles.allDone}>
          <Coffee size={48} style={{ opacity: 0.5, marginBottom: 16 }} />
          <h1 style={styles.allDoneTitle}>
            {isIs ? 'Engin verkefni' : 'No tasks'}
          </h1>
          <p style={styles.allDoneSubtitle}>
            {isIs ? 'Bættu við verkefnum til að nota Focus Mode' : 'Add some tasks to use Focus Mode'}
          </p>
          <button onClick={() => setActiveView('dashboard')} style={styles.secondaryBtn}>
            <ArrowLeft size={16} />
            {isIs ? 'Til baka' : 'Back'}
          </button>
        </div>
      </div>
    )
  }

  // Main focus view
  if (!sessionStarted) setSessionStarted(true)

  const priorityColors = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#3b82f6',
    low: '#6b7280'
  }

  return (
    <div style={styles.container}>
      {showConfetti && <Confetti />}

      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => setActiveView('dashboard')} style={styles.backBtn}>
          <ArrowLeft size={18} />
        </button>
        <div style={styles.headerCenter}>
          <Target size={18} style={{ color: '#a855f7' }} />
          <span style={styles.headerTitle}>Focus Mode</span>
        </div>
        <div style={styles.stats}>
          <Sparkles size={14} style={{ color: '#f59e0b' }} />
          <span>{completedCount}</span>
          <span style={{ opacity: 0.4, margin: '0 6px' }}>|</span>
          <span style={{ opacity: 0.5 }}>{remainingCount} {isIs ? 'eftir' : 'left'}</span>
        </div>
      </div>

      {/* Task card */}
      <div style={styles.cardWrapper}>
        <div style={styles.card}>
          {/* Project + priority */}
          <div style={styles.meta}>
            {currentProject && (
              <span style={{
                ...styles.projectBadge,
                background: (currentProject.color || '#6b7280') + '20',
                color: currentProject.color || '#6b7280'
              }}>
                {currentProject.icon || '📁'} {currentProject.name}
              </span>
            )}
            {currentTask.priority && currentTask.priority !== 'medium' && (
              <span style={{
                ...styles.priorityBadge,
                background: (priorityColors[currentTask.priority] || '#3b82f6') + '15',
                color: priorityColors[currentTask.priority] || '#3b82f6'
              }}>
                {currentTask.priority === 'critical' ? '🔴' : currentTask.priority === 'high' ? '🟠' : '⚪'}
                {' '}{currentTask.priority}
              </span>
            )}
          </div>

          {/* Task title */}
          <h1 style={styles.taskTitle}>{currentTask.title}</h1>

          {/* Description */}
          {currentTask.description && (
            <p style={styles.taskDescription}>{currentTask.description}</p>
          )}

          {/* Subtasks */}
          {currentTask.subtasks?.length > 0 && (
            <div style={styles.subtasks}>
              {currentTask.subtasks.map((st, i) => (
                <div key={i} style={styles.subtaskItem}>
                  <span style={{
                    ...styles.subtaskCheck,
                    background: st.completed ? '#22c55e' : 'transparent',
                    borderColor: st.completed ? '#22c55e' : '#475569'
                  }}>
                    {st.completed && <Check size={10} color="#fff" />}
                  </span>
                  <span style={{
                    textDecoration: st.completed ? 'line-through' : 'none',
                    opacity: st.completed ? 0.5 : 1
                  }}>
                    {st.title}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Due date */}
          {currentTask.dueDate && (
            <div style={styles.dueDate}>
              📅 {new Date(currentTask.dueDate).toLocaleDateString(isIs ? 'is-IS' : 'en-US', {
                weekday: 'short', month: 'short', day: 'numeric'
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <button onClick={handleSkip} style={styles.skipBtn}>
            <ChevronRight size={20} />
            <span>{isIs ? 'Sleppa' : 'Skip'}</span>
            <span style={styles.shortcutHint}>Tab</span>
          </button>

          <button onClick={handleComplete} style={styles.doneBtn}>
            <Check size={24} />
            <span>{isIs ? 'Búið!' : 'Done!'}</span>
            <span style={styles.shortcutHint}>Enter ↵</span>
          </button>
        </div>
      </div>

      {/* Tip */}
      <p style={styles.tip}>
        {isIs
          ? 'Einbeittu þér að þessu eina verkefni. Allt annað bíður.'
          : 'Focus on this one thing. Everything else can wait.'}
      </p>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
    padding: '24px',
    position: 'relative',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 600,
    marginBottom: 32,
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-text-secondary, #94a3b8)',
    cursor: 'pointer',
    padding: 8,
    borderRadius: 8,
  },
  headerCenter: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--color-text-secondary, #94a3b8)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  stats: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 14,
    color: 'var(--color-text-secondary, #94a3b8)',
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 600,
  },
  card: {
    background: 'var(--color-bg-secondary, #1e293b)',
    borderRadius: 16,
    padding: '32px 28px',
    border: '1px solid var(--color-border, #334155)',
    marginBottom: 20,
  },
  meta: {
    display: 'flex',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  projectBadge: {
    padding: '4px 10px',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 500,
  },
  priorityBadge: {
    padding: '4px 10px',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 500,
    textTransform: 'capitalize',
  },
  taskTitle: {
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 1.3,
    color: 'var(--color-text-primary, #f1f5f9)',
    margin: 0,
  },
  taskDescription: {
    fontSize: 16,
    color: 'var(--color-text-secondary, #94a3b8)',
    lineHeight: 1.6,
    marginTop: 12,
  },
  subtasks: {
    marginTop: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  subtaskItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 14,
    color: 'var(--color-text-primary, #e2e8f0)',
  },
  subtaskCheck: {
    width: 18,
    height: 18,
    borderRadius: 4,
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  dueDate: {
    marginTop: 20,
    fontSize: 13,
    color: 'var(--color-text-secondary, #94a3b8)',
  },
  actions: {
    display: 'flex',
    gap: 12,
  },
  skipBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '16px 20px',
    borderRadius: 12,
    border: '1px solid var(--color-border, #334155)',
    background: 'transparent',
    color: 'var(--color-text-secondary, #94a3b8)',
    fontSize: 16,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  doneBtn: {
    flex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '16px 20px',
    borderRadius: 12,
    border: 'none',
    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
    color: '#fff',
    fontSize: 18,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
  },
  shortcutHint: {
    fontSize: 11,
    opacity: 0.5,
    background: 'rgba(255,255,255,0.1)',
    padding: '2px 6px',
    borderRadius: 4,
  },
  tip: {
    marginTop: 32,
    fontSize: 14,
    color: 'var(--color-text-secondary, #64748b)',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  allDone: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  allDoneEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  allDoneTitle: {
    fontSize: 32,
    fontWeight: 700,
    color: 'var(--color-text-primary, #f1f5f9)',
    margin: '0 0 8px',
  },
  allDoneSubtitle: {
    fontSize: 16,
    color: 'var(--color-text-secondary, #94a3b8)',
    marginBottom: 24,
  },
  allDoneActions: {
    display: 'flex',
    gap: 12,
  },
  secondaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 20px',
    borderRadius: 10,
    border: '1px solid var(--color-border, #334155)',
    background: 'transparent',
    color: 'var(--color-text-secondary, #94a3b8)',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
  },
}

export default FocusModeView
