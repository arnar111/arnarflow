import React, { useEffect, useState, Suspense } from 'react'
import useStore from './store/useStore'
import TitleBar from './components/TitleBar'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import ProjectView from './components/ProjectView'
import ProjectsBoard from './components/ProjectsBoard'
import IdeasInbox from './components/IdeasInbox'
import QuickAddModal from './components/QuickAddModal'
import CommandPalette from './components/CommandPalette'
import SettingsModal from './components/SettingsModal'
import AddProjectModal from './components/AddProjectModal'
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal'
import WhatsNewModal from './components/WhatsNewModal'
import AboutModal from './components/AboutModal'
// PomodoroTimer lazy loaded below
import QuickCaptureBar from './components/QuickCaptureBar'
import OnboardingModal from './components/OnboardingModal'
import RecurringTasksModal from './components/RecurringTasksModal'
import BlaerSync from './components/BlaerSync'
import NotificationSystem, { useNotificationChecker } from './components/NotificationSystem'
import CalendarSync from './components/CalendarSync'
import TaskDetailPanel from './components/TaskDetailPanel'
import ErrorBoundary from './components/ErrorBoundary'
import { ACCENT_COLORS } from './store/useStore'
import { requestNotificationPermission } from './utils/notifications'

// Lazy load heavier views/modals
const BudgetSaver = React.lazy(() => import('./components/BudgetSaver'))
const StatsView = React.lazy(() => import('./components/StatsView'))
const CalendarView = React.lazy(() => import('./components/CalendarView'))
const RoadmapView = React.lazy(() => import('./components/RoadmapView'))
const HabitsView = React.lazy(() => import('./components/HabitsView'))
const NotesView = React.lazy(() => import('./components/NotesView'))
const FocusHistory = React.lazy(() => import('./components/FocusHistory'))
const WeeklyReview = React.lazy(() => import('./components/WeeklyReview'))
const TimeTracker = React.lazy(() => import('./components/TimeTracker'))
const PomodoroTimer = React.lazy(() => import('./components/PomodoroTimer'))
const SubscriptionsView = React.lazy(() => import('./components/SubscriptionsView'))
const SubscriptionsTab = React.lazy(() => import('./components/SubscriptionsView'))

function LoadingFallback() {
  return (
    <div className="p-6">
      <div className="w-10 h-10 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
    </div>
  )
}

function App() {
  const activeView = useStore((s) => s.activeView)

  const quickAddOpen = useStore((s) => s.quickAddOpen)
  const setQuickAddOpen = useStore((s) => s.setQuickAddOpen)
  const setQuickIdeaMode = useStore((s) => s.setQuickIdeaMode)

  const commandPaletteOpen = useStore((s) => s.commandPaletteOpen)
  const setCommandPaletteOpen = useStore((s) => s.setCommandPaletteOpen)

  const settingsOpen = useStore((s) => s.settingsOpen)
  const setSettingsOpen = useStore((s) => s.setSettingsOpen)

  const addProjectOpen = useStore((s) => s.addProjectOpen)
  const setAddProjectOpen = useStore((s) => s.setAddProjectOpen)

  const keyboardShortcutsOpen = useStore((s) => s.keyboardShortcutsOpen)
  const setKeyboardShortcutsOpen = useStore((s) => s.setKeyboardShortcutsOpen)

  const aboutOpen = useStore((s) => s.aboutOpen)

  const whatsNewOpen = useStore((s) => s.whatsNewOpen)
  const setWhatsNewOpen = useStore((s) => s.setWhatsNewOpen)

  const onboardingOpen = useStore((s) => s.onboardingOpen)
  const setOnboardingOpen = useStore((s) => s.setOnboardingOpen)
  const shouldShowOnboarding = useStore((s) => s.shouldShowOnboarding)

  const recurringOpen = useStore((s) => s.recurringOpen)
  const setRecurringOpen = useStore((s) => s.setRecurringOpen)

  const focusStartTime = useStore((s) => s.focusStartTime)
  const updateFocusElapsed = useStore((s) => s.updateFocusElapsed)

  const shouldShowWhatsNew = useStore((s) => s.shouldShowWhatsNew)

  const theme = useStore((s) => s.theme)
  const accentColor = useStore((s) => s.accentColor)

  const notificationsEnabled = useStore((s) => s.notificationsEnabled)

  const pomodoroOpen = useStore((s) => s.pomodoroOpen)
  const setPomodoroOpen = useStore((s) => s.setPomodoroOpen)
  const focusProject = useStore((s) => s.focusProject)

  const quickCaptureExpanded = useStore((s) => s.quickCaptureExpanded)
  const setQuickCaptureExpanded = useStore((s) => s.setQuickCaptureExpanded)

  // v5.0.0 state
  const timeTrackerOpen = useStore((s) => s.timeTrackerOpen)
  const setTimeTrackerOpen = useStore((s) => s.setTimeTrackerOpen)

  const notificationsPanelOpen = useStore((s) => s.notificationsPanelOpen)
  const setNotificationsPanelOpen = useStore((s) => s.setNotificationsPanelOpen)

  // v5.1.2 state
  const selectedTaskId = useStore((s) => s.selectedTaskId)
  const setSelectedTaskId = useStore((s) => s.setSelectedTaskId)

  // v5.0.0 - Calendar Sync modal
  const [calendarSyncOpen, setCalendarSyncOpen] = useState(false)

  // Local state for quick capture if not in store
  const [localQuickCapture, setLocalQuickCapture] = useState(false)
  const isQuickCaptureOpen = quickCaptureExpanded ?? localQuickCapture
  const toggleQuickCapture = setQuickCaptureExpanded ?? setLocalQuickCapture

  // Weekly Review modal state
  const [weeklyReviewOpen, setWeeklyReviewOpen] = useState(false)

  // Seed initial tasks on first run (moved into onboarding flow)
  const recalculateAllStreaks = useStore((s) => s.recalculateAllStreaks)

  useEffect(() => {
    // Recalculate streaks on mount; seeding is handled via the onboarding wizard when user opts in.
    recalculateAllStreaks()
  }, [recalculateAllStreaks])

  // v5.0.0 - Use notification checker hook
  useNotificationChecker()

  // Request notification permission on mount if enabled
  useEffect(() => {
    if (notificationsEnabled) {
      requestNotificationPermission()
    }
  }, [notificationsEnabled])

  // Check for "What's New" on mount
  useEffect(() => {
    if (shouldShowWhatsNew()) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setWhatsNewOpen(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [shouldShowWhatsNew, setWhatsNewOpen])

  // Check for onboarding on first run
  useEffect(() => {
    if (shouldShowOnboarding()) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setOnboardingOpen(true)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [shouldShowOnboarding, setOnboardingOpen])

  // Apply theme
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'light') {
      root.classList.add('light-theme')
    } else {
      root.classList.remove('light-theme')
    }
  }, [theme])

  // Apply accent color
  useEffect(() => {
    const root = document.documentElement
    const color = ACCENT_COLORS[accentColor] || ACCENT_COLORS.indigo
    root.style.setProperty('--accent', color)
    root.style.setProperty('--accent-hover', color + 'dd')
    root.style.setProperty('--accent-muted', color + '26')
    root.style.setProperty('--accent-glow', color + '40')
  }, [accentColor])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if typing in input
      const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)

      // Cmd/Ctrl + K for quick add task
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setQuickIdeaMode(false)
        setQuickAddOpen(true)
      }

      // Cmd/Ctrl + I for quick add idea
      if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault()
        setQuickIdeaMode(true)
        setQuickAddOpen(true)
      }

      // Cmd/Ctrl + P for command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }

      // Cmd/Ctrl + , for settings
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault()
        setSettingsOpen(true)
      }

      // Cmd/Ctrl + Shift + F for Pomodoro/Focus timer (when in focus mode)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault()
        if (focusProject) {
          setPomodoroOpen(true)
        }
      }

      // Cmd/Ctrl + T for Time Tracker (v5.0.0)
      if ((e.metaKey || e.ctrlKey) && e.key === 't') {
        e.preventDefault()
        setTimeTrackerOpen(true)
      }

      // ? for keyboard shortcuts help (only when not typing)
      if (e.key === '?' && !isTyping) {
        e.preventDefault()
        setKeyboardShortcutsOpen(true)
      }

      // Escape to close modals
      if (e.key === 'Escape') {
        setQuickAddOpen(false)
        setCommandPaletteOpen(false)
        setSettingsOpen(false)
        setKeyboardShortcutsOpen(false)
        setTimeTrackerOpen(false)
        setNotificationsPanelOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    setQuickAddOpen,
    setCommandPaletteOpen,
    setSettingsOpen,
    setKeyboardShortcutsOpen,
    setQuickIdeaMode,
    setTimeTrackerOpen,
    setNotificationsPanelOpen,
    setPomodoroOpen,
    focusProject,
  ])

  // Focus timer tick
  useEffect(() => {
    if (!focusStartTime) return
    const interval = setInterval(() => {
      updateFocusElapsed()
    }, 1000)
    return () => clearInterval(interval)
  }, [focusStartTime, updateFocusElapsed])

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />
      case 'projects':
        return <ProjectsBoard />
      case 'project':
        return <ProjectView />
      case 'ideas':
        return <IdeasInbox />
      case 'inbox':
        return <IdeasInbox />
      case 'habits':
        return <HabitsView />
      case 'calendar':
        return <CalendarView />
      case 'focus':
        return <FocusHistory />
      case 'stats':
        return <StatsView />
      case 'notes':
        return <NotesView />
      case 'roadmap':
        return <RoadmapView />
      case 'budget':
        return <BudgetSaver />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-primary)]">
      {/* Custom Title Bar */}
      <TitleBar />

      {/* Noise texture overlay */}
      <div className="noise-overlay" />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar onOpenCalendarSync={() => setCalendarSyncOpen(true)} />

        <main className="flex-1 overflow-auto relative z-0">
          {/* Subtle gradient overlay at top */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[var(--bg-primary)]/50 to-transparent pointer-events-none z-10" />
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              {renderView()}
            </Suspense>
          </ErrorBoundary>
        </main>

        {/* Modals */}
        <ErrorBoundary>
          {quickAddOpen && <QuickAddModal />}
          {commandPaletteOpen && <CommandPalette />}
          {settingsOpen && <SettingsModal />}
          {addProjectOpen && <AddProjectModal onClose={() => setAddProjectOpen(false)} />}
          {keyboardShortcutsOpen && <KeyboardShortcutsModal />}
          {whatsNewOpen && <WhatsNewModal />}
          {aboutOpen && <AboutModal />}
          {pomodoroOpen && (
            <Suspense fallback={<LoadingFallback />}>
              <PomodoroTimer onClose={() => setPomodoroOpen(false)} />
            </Suspense>
          )}
          {weeklyReviewOpen && (
            <Suspense fallback={<LoadingFallback />}>
              <WeeklyReview onClose={() => setWeeklyReviewOpen(false)} />
            </Suspense>
          )}
          {onboardingOpen && <OnboardingModal />}
          {recurringOpen && <RecurringTasksModal onClose={() => setRecurringOpen(false)} />}
        </ErrorBoundary>

        {/* v5.0.0 Modals */}
        <ErrorBoundary>
          {timeTrackerOpen && (
            <Suspense fallback={<LoadingFallback />}>
              <TimeTracker onClose={() => setTimeTrackerOpen(false)} />
            </Suspense>
          )}
          {notificationsPanelOpen && <NotificationSystem onClose={() => setNotificationsPanelOpen(false)} />}
          {calendarSyncOpen && <CalendarSync onClose={() => setCalendarSyncOpen(false)} />}
        </ErrorBoundary>

        {/* Quick Capture Bar (Floating) */}
        <QuickCaptureBar
          isExpanded={isQuickCaptureOpen}
          onExpand={() => toggleQuickCapture(true)}
          onCollapse={() => toggleQuickCapture(false)}
        />

        {/* Blær AI Sync */}
        <BlaerSync />

        {/* Task Detail Panel (v5.1.2) */}
        <ErrorBoundary>
          {selectedTaskId && (
            <TaskDetailPanel taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
          )}
        </ErrorBoundary>
      </div>
    </div>
  )
}

export default App
