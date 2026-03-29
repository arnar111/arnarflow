import React, { useEffect, useState, useRef, lazy, Suspense } from 'react'
import useStore from './store/useStore'
import TitleBar from './components/TitleBar'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import { ACCENT_COLORS } from './store/useStore'
import { requestNotificationPermission } from './utils/notifications'

import QuickCaptureBar from './components/QuickCaptureBar'

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
const TodayView = lazy(() => import('./components/TodayView'))
const FocusModeView = lazy(() => import('./components/FocusModeView'))

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
const TaskTemplatesModal = lazy(() => import('./components/TaskTemplatesModal'))
const BlaerSync = lazy(() => import('./components/BlaerSync'))
const TimeTracker = lazy(() => import('./components/TimeTracker'))
const CalendarSync = lazy(() => import('./components/CalendarSync'))
const TaskDetailPanel = lazy(() => import('./components/TaskDetailPanel'))

import NotificationSystem, { useNotificationChecker } from './components/NotificationSystem'

const LazyFallback = () => (
  <div className="flex items-center justify-center h-full opacity-50">
    <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
  </div>
)

function App() {
  const {
    activeView,
    setActiveView,
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
    templatesOpen,
    setTemplatesOpen,
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
    timeTrackerOpen,
    setTimeTrackerOpen,
    notificationsPanelOpen,
    setNotificationsPanelOpen,
    selectedTaskId,
    setSelectedTaskId,
  } = useStore()

  const [calendarSyncOpen, setCalendarSyncOpen] = useState(false)
  const [localQuickCapture, setLocalQuickCapture] = useState(false)
  const isQuickCaptureOpen = quickCaptureExpanded ?? localQuickCapture
  const toggleQuickCapture = setQuickCaptureExpanded ?? setLocalQuickCapture
  const [weeklyReviewOpen, setWeeklyReviewOpen] = useState(false)
  const [gKeyPending, setGKeyPending] = useState(false)
  const gKeyTimer = useRef(null)

  const recalculateAllStreaks = useStore(state => state.recalculateAllStreaks)

  useEffect(() => {
    recalculateAllStreaks()
  }, [recalculateAllStreaks])

  useNotificationChecker()

  useEffect(() => {
    if (notificationsEnabled) {
      requestNotificationPermission()
    }
  }, [notificationsEnabled])

  useEffect(() => {
    if (shouldShowWhatsNew()) {
      const timer = setTimeout(() => {
        setWhatsNewOpen(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (shouldShowOnboarding()) {
      const timer = setTimeout(() => {
        setOnboardingOpen(true)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'light') {
      root.classList.add('light-theme')
    } else {
      root.classList.remove('light-theme')
    }
  }, [theme])

  useEffect(() => {
    const root = document.documentElement
    const color = ACCENT_COLORS[accentColor] || ACCENT_COLORS.indigo
    root.style.setProperty('--accent', color)
    root.style.setProperty('--accent-hover', color + 'dd')
    root.style.setProperty('--accent-muted', color + '26')
    root.style.setProperty('--accent-glow', color + '40')
  }, [accentColor])

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)

      if (!isTyping && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (gKeyPending) {
          setGKeyPending(false)
          clearTimeout(gKeyTimer.current)
          const navMap = {
            d: 'dashboard',
            i: 'ideas',
            h: 'habits',
            p: 'projects',
            n: 'notes',
            c: 'calendar',
            s: 'stats',
            f: 'focus',
            b: 'budget',
            r: 'roadmap',
            t: 'today',
          }
          const view = navMap[e.key.toLowerCase()]
          if (view) {
            e.preventDefault()
            setActiveView(view)
            return
          }
        }
        if (e.key === 'g' || e.key === 'G') {
          if (!gKeyPending) {
            setGKeyPending(true)
            gKeyTimer.current = setTimeout(() => setGKeyPending(false), 500)
            return
          }
        }
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setQuickIdeaMode(false)
        setQuickAddOpen(true)
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault()
        setQuickIdeaMode(true)
        setQuickAddOpen(true)
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }

      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault()
        setSettingsOpen(true)
      }

      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault()
        if (focusProject) {
          setPomodoroOpen(true)
        }
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 't') {
        e.preventDefault()
        setTimeTrackerOpen(true)
      }

      if (e.key === '?' && !isTyping) {
        e.preventDefault()
        setKeyboardShortcutsOpen(true)
      }

      if (e.key === 'Escape') {
        setQuickAddOpen(false)
        setCommandPaletteOpen(false)
        setSettingsOpen(false)
        setKeyboardShortcutsOpen(false)
        setTimeTrackerOpen(false)
        setNotificationsPanelOpen(false)
        setTemplatesOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (gKeyTimer.current) clearTimeout(gKeyTimer.current)
    }
  }, [gKeyPending, setActiveView, setQuickAddOpen, setCommandPaletteOpen, setSettingsOpen, setKeyboardShortcutsOpen, setQuickIdeaMode, setTimeTrackerOpen, setNotificationsPanelOpen, setTemplatesOpen])

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
        view = <ProjectsBoard />
        break
      case 'project':
        view = <ProjectView />
        break
      case 'ideas':
        view = <IdeasInbox />
        break
      case 'habits':
        view = <HabitsView />
        break
      case 'calendar':
        view = <CalendarView />
        break
      case 'focus':
        view = <FocusHistory />
        break
      case 'stats':
        view = <StatsView />
        break
      case 'notes':
        view = <NotesView />
        break
      case 'roadmap':
        view = <RoadmapView />
        break
      case 'budget':
        view = <BudgetSaver />
        break
      case 'today':
        view = <TodayView />
        break
      case 'focusmode':
        view = <FocusModeView />
        break
      default:
        return <Dashboard />
    }
    return <Suspense fallback={<LazyFallback />}>{view}</Suspense>
  }

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-primary)]">
      <TitleBar />
      <div className="noise-overlay" />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar onOpenCalendarSync={() => setCalendarSyncOpen(true)} />
        <main className="flex-1 overflow-auto relative">
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[var(--bg-primary)]/50 to-transparent pointer-events-none z-10" />
          {renderView()}
        </main>

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
          {templatesOpen && <TaskTemplatesModal onClose={() => setTemplatesOpen(false)} />}
          {timeTrackerOpen && <TimeTracker onClose={() => setTimeTrackerOpen(false)} />}
          {notificationsPanelOpen && <NotificationSystem onClose={() => setNotificationsPanelOpen(false)} />}
          {calendarSyncOpen && <CalendarSync onClose={() => setCalendarSyncOpen(false)} />}
        </Suspense>

        <QuickCaptureBar
          isExpanded={isQuickCaptureOpen}
          onExpand={() => toggleQuickCapture(true)}
          onCollapse={() => toggleQuickCapture(false)}
        />

        <Suspense fallback={null}><BlaerSync /></Suspense>

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
