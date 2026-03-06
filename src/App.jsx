import React, { useEffect, useState, lazy, Suspense } from 'react'
import useStore from './store/useStore'
import TitleBar from './components/TitleBar'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import { ACCENT_COLORS } from './store/useStore'
import { requestNotificationPermission } from './utils/notifications'

// Eagerly loaded (core shell)
import QuickCaptureBar from './components/QuickCaptureBar'

// Lazy-loaded views (loaded on navigation)
const ProjectView = lazy(() => import('./components/ProjectView'))
const ProjectsBoard = lazy(() => import('./components/ProjectsBoard'))
const IdeasInbox = lazy(() => import('./components/IdeasInbox'))
const HabitsView = lazy(() => import('./components/HabitsView'))
const CalendarView = lazy(() => import('./components/CalendarView'))
const FocusHistory = lazy(() => import('./components/FocusHistory'))
const StatsView = lazy(() => import('./components/StatsView'))
const NotesView = lazy(() => import('./components/NotesView'))
const BudgetSaver = lazy(() => import('./components/BudgetSaver'))
const RoadmapView = lazy(() => import('./components/RoadmapView'))

// Lazy-loaded modals (loaded on open)
const QuickAddModal = lazy(() => import('./components/QuickAddModal'))
const CommandPalette = lazy(() => import('./components/CommandPalette'))
const SettingsModal = lazy(() => import('./components/SettingsModal'))
const AddProjectModal = lazy(() => import('./components/AddProjectModal'))
const KeyboardShortcutsModal = lazy(() => import('./components/KeyboardShortcutsModal'))
const WhatsNewModal = lazy(() => import('./components/WhatsNewModal'))
const AboutModal = lazy(() => import('./components/AboutModal'))
const PomodoroTimer = lazy(() => import('./components/PomodoroTimer'))
const WeeklyReview = lazy(() => import('./components/WeeklyReview'))
const OnboardingModal = lazy(() => import('./components/OnboardingModal'))
const RecurringTasksModal = lazy(() => import('./components/RecurringTasksModal'))
const BlaerSync = lazy(() => import('./components/BlaerSync'))
const TimeTracker = lazy(() => import('./components/TimeTracker'))
const CalendarSync = lazy(() => import('./components/CalendarSync'))
const TaskDetailPanel = lazy(() => import('./components/TaskDetailPanel'))

// NotificationSystem — eagerly imported because useNotificationChecker hook runs at top level
import NotificationSystem, { useNotificationChecker } from './components/NotificationSystem'

// Minimal loading fallback for lazy components
const LazyFallback = () => (
  <div className="flex items-center justify-center h-full opacity-50">
    <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
  </div>
)

function App() {
  const { 
    activeView, 
    quickAddOpen, 
    setQuickAddOpen,
    setQuickIdeaMode,
    commandPaletteOpen,
    setCommandPaletteOpen,
    settingsOpen,
    setSettingsOpen,
    addProjectOpen,
    setAddProjectOpen,
    keyboardShortcutsOpen,
    setKeyboardShortcutsOpen,
    aboutOpen,
    whatsNewOpen,
    setWhatsNewOpen,
    onboardingOpen,
    setOnboardingOpen,
    shouldShowOnboarding,
    recurringOpen,
    setRecurringOpen,
    focusStartTime,
    updateFocusElapsed,
    shouldShowWhatsNew,
    theme,
    accentColor,
    notificationsEnabled,
    pomodoroOpen,
    setPomodoroOpen,
    focusProject,
    quickCaptureExpanded,
    setQuickCaptureExpanded,
    // v5.0.0 state
    timeTrackerOpen,
    setTimeTrackerOpen,
    notificationsPanelOpen,
    setNotificationsPanelOpen,
    activeTimeSession,
    // v5.1.2 state
    selectedTaskId,
    setSelectedTaskId
  } = useStore()

  // v5.0.0 - Calendar Sync modal
  const [calendarSyncOpen, setCalendarSyncOpen] = useState(false)

  // Local state for quick capture if not in store
  const [localQuickCapture, setLocalQuickCapture] = useState(false)
  const isQuickCaptureOpen = quickCaptureExpanded ?? localQuickCapture
  const toggleQuickCapture = setQuickCaptureExpanded ?? setLocalQuickCapture

  // Weekly Review modal state
  const [weeklyReviewOpen, setWeeklyReviewOpen] = useState(false)

  // Seed initial tasks on first run (moved into onboarding flow)
  const seedProjectTasks = useStore(state => state.seedProjectTasks)
  const recalculateAllStreaks = useStore(state => state.recalculateAllStreaks)
  
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
  }, [])

  // Check for onboarding on first run
  useEffect(() => {
    if (shouldShowOnboarding()) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setOnboardingOpen(true)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [])

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
  }, [setQuickAddOpen, setCommandPaletteOpen, setSettingsOpen, setKeyboardShortcutsOpen, setQuickIdeaMode, setTimeTrackerOpen, setNotificationsPanelOpen])

  // Focus timer tick
  useEffect(() => {
    if (!focusStartTime) return
    const interval = setInterval(() => {
      updateFocusElapsed()
    }, 1000)
    return () => clearInterval(interval)
  }, [focusStartTime, updateFocusElapsed])

  const renderView = () => {
    let view
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />
      case 'projects':
        view = <ProjectsBoard />; break
      case 'project':
        view = <ProjectView />; break
      case 'ideas':
        view = <IdeasInbox />; break
      case 'habits':
        view = <HabitsView />; break
      case 'calendar':
        view = <CalendarView />; break
      case 'focus':
        view = <FocusHistory />; break
      case 'stats':
        view = <StatsView />; break
      case 'notes':
        view = <NotesView />; break
      case 'roadmap':
        view = <RoadmapView />; break
      case 'budget':
        view = <BudgetSaver />; break
      default:
        return <Dashboard />
    }
    return <Suspense fallback={<LazyFallback />}>{view}</Suspense>
  }

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-primary)]">
      {/* Custom Title Bar */}
      <TitleBar />
      
      {/* Noise texture overlay */}
      <div className="noise-overlay" />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          onOpenCalendarSync={() => setCalendarSyncOpen(true)}
        />
        <main className="flex-1 overflow-auto relative">
          {/* Subtle gradient overlay at top */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[var(--bg-primary)]/50 to-transparent pointer-events-none z-10" />
          {renderView()}
        </main>
      
        {/* Modals — lazy loaded, wrapped in Suspense */}
        <Suspense fallback={null}>
          {quickAddOpen && <QuickAddModal />}
          {commandPaletteOpen && <CommandPalette />}
          {settingsOpen && <SettingsModal />}
          {addProjectOpen && <AddProjectModal onClose={() => setAddProjectOpen(false)} />}
          {keyboardShortcutsOpen && <KeyboardShortcutsModal />}
          {whatsNewOpen && <WhatsNewModal />}
          {aboutOpen && <AboutModal />}
          {pomodoroOpen && <PomodoroTimer onClose={() => setPomodoroOpen(false)} />}
          {weeklyReviewOpen && <WeeklyReview onClose={() => setWeeklyReviewOpen(false)} />}
          {onboardingOpen && <OnboardingModal />}
          {recurringOpen && <RecurringTasksModal onClose={() => setRecurringOpen(false)} />}
          {timeTrackerOpen && <TimeTracker onClose={() => setTimeTrackerOpen(false)} />}
          {notificationsPanelOpen && <NotificationSystem onClose={() => setNotificationsPanelOpen(false)} />}
          {calendarSyncOpen && <CalendarSync onClose={() => setCalendarSyncOpen(false)} />}
        </Suspense>
        
        {/* Quick Capture Bar (Floating) */}
        <QuickCaptureBar 
          isExpanded={isQuickCaptureOpen}
          onExpand={() => toggleQuickCapture(true)}
          onCollapse={() => toggleQuickCapture(false)}
        />
        
        {/* Blær AI Sync */}
        <Suspense fallback={null}><BlaerSync /></Suspense>
        
        {/* Task Detail Panel (v5.1.2) */}
        {selectedTaskId && (
          <Suspense fallback={null}>
            <TaskDetailPanel 
              taskId={selectedTaskId} 
              onClose={() => setSelectedTaskId(null)} 
            />
          </Suspense>
        )}
      </div>
    </div>
  )
}

export default App
