import React, { useEffect, useState } from 'react'
import useStore from './store/useStore'
import TitleBar from './components/TitleBar'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import ProjectView from './components/ProjectView'
import ProjectsBoard from './components/ProjectsBoard'
import IdeasInbox from './components/IdeasInbox'
import HabitsView from './components/HabitsView'
import CalendarView from './components/CalendarView'
import QuickAddModal from './components/QuickAddModal'
import CommandPalette from './components/CommandPalette'
import SettingsModal from './components/SettingsModal'
import AddProjectModal from './components/AddProjectModal'
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal'
import WhatsNewModal from './components/WhatsNewModal'
import AboutModal from './components/AboutModal'
import PomodoroTimer from './components/PomodoroTimer'
import QuickCaptureBar from './components/QuickCaptureBar'
import FocusHistory from './components/FocusHistory'
import WeeklyReview from './components/WeeklyReview'
import StatsView from './components/StatsView'
import NotesView from './components/NotesView'
import BudgetSaver from './components/BudgetSaver'
import OnboardingModal from './components/OnboardingModal'
import RecurringTasksModal from './components/RecurringTasksModal'
import BlaerSync from './components/BlaerSync'
// v5.0.0 imports
import TimeTracker from './components/TimeTracker'
import NotificationSystem, { useNotificationChecker } from './components/NotificationSystem'
import RoadmapView from './components/RoadmapView'
import CalendarSync from './components/CalendarSync'
import TaskDetailPanel from './components/TaskDetailPanel'
import { ACCENT_COLORS } from './store/useStore'
import { requestNotificationPermission } from './utils/notifications'

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

  // Seed initial tasks on first run
  const seedProjectTasks = useStore(state => state.seedProjectTasks)
  const recalculateAllStreaks = useStore(state => state.recalculateAllStreaks)
  
  useEffect(() => {
    seedProjectTasks()
    recalculateAllStreaks()
  }, [seedProjectTasks, recalculateAllStreaks])

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
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />
      case 'projects':
        return <ProjectsBoard />
      case 'project':
        return <ProjectView />
      case 'ideas':
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
        <Sidebar 
          onOpenCalendarSync={() => setCalendarSyncOpen(true)}
        />
        <main className="flex-1 overflow-auto relative">
          {/* Subtle gradient overlay at top */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[var(--bg-primary)]/50 to-transparent pointer-events-none z-10" />
          {renderView()}
        </main>
      
        {/* Modals */}
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
        
        {/* v5.0.0 Modals */}
        {timeTrackerOpen && <TimeTracker onClose={() => setTimeTrackerOpen(false)} />}
        {notificationsPanelOpen && <NotificationSystem onClose={() => setNotificationsPanelOpen(false)} />}
        {calendarSyncOpen && <CalendarSync onClose={() => setCalendarSyncOpen(false)} />}
        
        {/* Quick Capture Bar (Floating) */}
        <QuickCaptureBar 
          isExpanded={isQuickCaptureOpen}
          onExpand={() => toggleQuickCapture(true)}
          onCollapse={() => toggleQuickCapture(false)}
        />
        
        {/* Blær AI Sync */}
        <BlaerSync />
        
        {/* Task Detail Panel (v5.1.2) */}
        {selectedTaskId && (
          <TaskDetailPanel 
            taskId={selectedTaskId} 
            onClose={() => setSelectedTaskId(null)} 
          />
        )}
      </div>
    </div>
  )
}

export default App
