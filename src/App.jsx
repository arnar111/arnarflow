import React, { useEffect } from 'react'
import useStore from './store/useStore'
import TitleBar from './components/TitleBar'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import ProjectView from './components/ProjectView'
import IdeasInbox from './components/IdeasInbox'
import HabitsView from './components/HabitsView'
import QuickAddModal from './components/QuickAddModal'
import CommandPalette from './components/CommandPalette'
import SettingsModal from './components/SettingsModal'

function App() {
  const { 
    activeView, 
    quickAddOpen, 
    setQuickAddOpen,
    commandPaletteOpen,
    setCommandPaletteOpen,
    settingsOpen,
    setSettingsOpen,
    focusStartTime,
    updateFocusElapsed
  } = useStore()

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
      
      // Escape to close modals
      if (e.key === 'Escape') {
        setQuickAddOpen(false)
        setCommandPaletteOpen(false)
        setSettingsOpen(false)
      }
      
      // Comma for settings
      if (e.key === ',' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSettingsOpen(true)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setQuickAddOpen, setCommandPaletteOpen])

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
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
      </div>
    </div>
  )
}

export default App
