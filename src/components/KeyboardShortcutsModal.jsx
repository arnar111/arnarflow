import React from 'react'
import useStore from '../store/useStore'
import { X, Keyboard } from 'lucide-react'

function KeyboardShortcutsModal() {
  const { setKeyboardShortcutsOpen } = useStore()

  const shortcutGroups = [
    {
      title: 'General',
      shortcuts: [
        { keys: ['⌘', 'K'], description: 'Quick add task' },
        { keys: ['⌘', 'P'], description: 'Open command palette' },
        { keys: ['⌘', ','], description: 'Open settings' },
        { keys: ['?'], description: 'Show keyboard shortcuts' },
        { keys: ['Esc'], description: 'Close modal / Cancel' },
      ]
    },
    {
      title: 'Navigation',
      shortcuts: [
        { keys: ['G', 'D'], description: 'Go to Dashboard' },
        { keys: ['G', 'I'], description: 'Go to Ideas' },
        { keys: ['G', 'H'], description: 'Go to Habits' },
        { keys: ['G', 'P'], description: 'Go to Projects' },
      ]
    },
    {
      title: 'Tasks',
      shortcuts: [
        { keys: ['N'], description: 'New task' },
        { keys: ['Enter'], description: 'Complete task (when selected)' },
        { keys: ['E'], description: 'Edit task' },
        { keys: ['Delete'], description: 'Delete task' },
      ]
    },
    {
      title: 'Focus Mode',
      shortcuts: [
        { keys: ['F'], description: 'Start focus on selected task' },
        { keys: ['S'], description: 'Stop current focus session' },
        { keys: ['Space'], description: 'Pause/resume timer' },
      ]
    },
  ]

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setKeyboardShortcutsOpen(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-2xl bg-dark-900 rounded-xl border border-dark-500 shadow-2xl shadow-black/50 overflow-hidden animate-fade-in-scale">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-600">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Keyboard size={20} className="text-accent" />
            Keyboard Shortcuts
          </h2>
          <button
            onClick={() => setKeyboardShortcutsOpen(false)}
            className="p-1.5 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <X size={18} className="text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 grid grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
          {shortcutGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                {group.title}
              </h3>
              <ul className="space-y-2">
                {group.shortcuts.map((shortcut, index) => (
                  <li 
                    key={index}
                    className="flex items-center justify-between py-1"
                  >
                    <span className="text-sm text-zinc-400">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, i) => (
                        <span key={i}>
                          <kbd className="kbd min-w-[24px] text-center">
                            {key}
                          </kbd>
                          {i < shortcut.keys.length - 1 && (
                            <span className="text-zinc-600 mx-0.5">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-dark-600 bg-dark-800/50">
          <p className="text-xs text-zinc-500 text-center">
            Press <kbd className="kbd">?</kbd> anytime to show this help
          </p>
        </div>
      </div>
    </div>
  )
}

export default KeyboardShortcutsModal
