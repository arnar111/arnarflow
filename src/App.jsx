import React, { useEffect } from 'react'
import useStore from './store/useStore'
import TitleBar from './components/TitleBar'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import ProjectView from './components/ProjectView'
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
import { ACCENT_COLORS } from './store/useStore'

function App() {
  const { 
    activeView, 
    quickAddOpen, 
    setQuickAddOpen,
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
    focusStartTime,
    updateFocusElapsed,
    shouldShowWhatsNew,
    theme,
    accentColor
  } = useStore()

  // Seed initial tasks on first run
  const seedProjectTasks = useStore(state => state.seedProjectTasks)
  
  useEffect(() => {
    seedProjectTasks()
  }, [seedProjectTasks])

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
    const color = ACCENT_COLORS[accentColor] || ACCENT_COLORS.blue
    root.style.setProperty('--accent', color)
    root.style.setProperty('--accent-glow', `${color}26`)
  }, [accentColor])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if typing in input
      const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)
      
      // Cmd/Ctrl + K for quick add
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
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
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setQuickAddOpen, setCommandPaletteOpen, setSettingsOpen, setKeyboardShortcutsOpen])

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
      case 'project':
        return <ProjectView />
      case 'ideas':
        return <IdeasInbox />
      case 'habits':
        return <HabitsView />
      case 'calendar':
        return <CalendarView />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex flex-col h-screen bg-dark-950">
      {/* Custom Title Bar */}
      <TitleBar />
      
      {/* Noise texture overlay */}
      <div className="noise-overlay" />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto relative">
          {/* Subtle gradient overlay at top */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-dark-950/50 to-transparent pointer-events-none z-10" />
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
      </div>
    </div>
  )
}

export default App
