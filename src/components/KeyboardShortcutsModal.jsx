import React from 'react'
import useStore from '../store/useStore'
import { useTranslation } from '../i18n/useTranslation'
import { X, Keyboard } from 'lucide-react'

function KeyboardShortcutsModal() {
  const { t } = useTranslation()
  const { setKeyboardShortcutsOpen } = useStore()

  const shortcutGroups = [
    {
      title: t('keyboardShortcuts.general'),
      shortcuts: [
        { keys: ['⌘', 'K'], description: t('keyboardShortcuts.quickAddTask') },
        { keys: ['⌘', 'P'], description: t('keyboardShortcuts.openCommandPalette') },
        { keys: ['⌘', ','], description: t('keyboardShortcuts.openSettings') },
        { keys: ['?'], description: t('keyboardShortcuts.showShortcuts') },
        { keys: ['Esc'], description: t('keyboardShortcuts.closeModal') },
      ]
    },
    {
      title: t('keyboardShortcuts.navigation'),
      shortcuts: [
        { keys: ['G', 'D'], description: t('keyboardShortcuts.goToDashboard') },
        { keys: ['G', 'I'], description: t('keyboardShortcuts.goToIdeas') },
        { keys: ['G', 'H'], description: t('keyboardShortcuts.goToHabits') },
        { keys: ['G', 'P'], description: t('keyboardShortcuts.goToProjects') },
      ]
    },
    {
      title: t('keyboardShortcuts.tasks'),
      shortcuts: [
        { keys: ['N'], description: t('keyboardShortcuts.newTask') },
        { keys: ['Enter'], description: t('keyboardShortcuts.completeTask') },
        { keys: ['E'], description: t('keyboardShortcuts.editTask') },
        { keys: ['Delete'], description: t('keyboardShortcuts.deleteTask') },
      ]
    },
    {
      title: t('keyboardShortcuts.focusMode'),
      shortcuts: [
        { keys: ['F'], description: t('keyboardShortcuts.startFocus') },
        { keys: ['S'], description: t('keyboardShortcuts.stopFocus') },
        { keys: ['Space'], description: t('keyboardShortcuts.pauseResume') },
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
            {t('keyboardShortcuts.title')}
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
            {t('keyboardShortcuts.helpHint')} <kbd className="kbd">?</kbd> {t('keyboardShortcuts.helpHintEnd')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default KeyboardShortcutsModal
