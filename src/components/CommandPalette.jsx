import React, { useState, useEffect, useRef } from 'react'
import useStore from '../store/useStore'
import DynamicIcon from './Icons'
import { 
  Search, 
  LayoutDashboard, 
  Lightbulb, 
  Target, 
  Plus,
  Settings,
  Keyboard,
  Info
} from 'lucide-react'

function CommandPalette() {
  const { 
    setCommandPaletteOpen, 
    setActiveView, 
    setSelectedProject,
    setQuickAddOpen,
    setSettingsOpen,
    setKeyboardShortcutsOpen,
    setAboutOpen,
    projects 
  } = useStore()
  
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)

  const commands = [
    { id: 'new-task', icon: Plus, label: 'New Task', shortcut: '⌘K', action: () => { setCommandPaletteOpen(false); setQuickAddOpen(true) } },
    { id: 'dashboard', icon: LayoutDashboard, label: 'Go to Dashboard', shortcut: 'G D', action: () => { setActiveView('dashboard'); setSelectedProject(null) } },
    { id: 'ideas', icon: Lightbulb, label: 'Go to Ideas', shortcut: 'G I', action: () => { setActiveView('ideas'); setSelectedProject(null) } },
    { id: 'habits', icon: Target, label: 'Go to Habits', shortcut: 'G H', action: () => { setActiveView('habits'); setSelectedProject(null) } },
    ...projects.map(p => ({
      id: `project-${p.id}`,
      icon: () => <DynamicIcon name={p.icon} size={16} style={{ color: p.color }} />,
      label: `Go to ${p.name}`,
      action: () => { setActiveView('project'); setSelectedProject(p.id) }
    })),
    { id: 'settings', icon: Settings, label: 'Open Settings', shortcut: '⌘,', action: () => { setCommandPaletteOpen(false); setSettingsOpen(true) } },
    { id: 'shortcuts', icon: Keyboard, label: 'Keyboard Shortcuts', shortcut: '?', action: () => { setCommandPaletteOpen(false); setKeyboardShortcutsOpen(true) } },
    { id: 'about', icon: Info, label: 'About ArnarFlow', action: () => { setCommandPaletteOpen(false); setAboutOpen(true) } },
  ]

  const filtered = query 
    ? commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault()
      filtered[selectedIndex].action()
      setCommandPaletteOpen(false)
    } else if (e.key === 'Escape') {
      setCommandPaletteOpen(false)
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setCommandPaletteOpen(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 z-50 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-xl bg-dark-900 rounded-xl border border-dark-500 shadow-2xl shadow-black/50 overflow-hidden animate-fade-in-scale">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-dark-600">
          <Search size={18} className="text-zinc-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-base outline-none placeholder:text-zinc-600"
          />
          <kbd className="kbd">Esc</kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-zinc-500">No commands found</p>
          ) : (
            <ul className="stagger-children">
              {filtered.map((cmd, index) => {
                const Icon = cmd.icon
                return (
                  <li key={cmd.id}>
                    <button
                      onClick={() => {
                        cmd.action()
                        setCommandPaletteOpen(false)
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        index === selectedIndex 
                          ? 'bg-dark-700 text-white' 
                          : 'text-zinc-400 hover:bg-dark-800'
                      }`}
                    >
                      {typeof Icon === 'function' ? <Icon /> : <Icon size={16} />}
                      <span className="flex-1">{cmd.label}</span>
                      {cmd.shortcut && (
                        <kbd className="kbd">{cmd.shortcut}</kbd>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-dark-600 text-2xs text-zinc-600">
          <span className="flex items-center gap-1">
            <kbd className="kbd">↑↓</kbd> Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="kbd">↵</kbd> Select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="kbd">Esc</kbd> Close
          </span>
        </div>
      </div>
    </div>
  )
}

export default CommandPalette
