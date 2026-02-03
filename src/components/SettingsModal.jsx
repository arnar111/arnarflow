import React, { useState, useEffect } from 'react'
import useStore, { APP_VERSION } from '../store/useStore'
import { useTranslation } from '../i18n/useTranslation'
import { 
  X, 
  Sun, 
  Moon, 
  Monitor, 
  Download, 
  Upload, 
  Keyboard,
  Info,
  Palette,
  Bell,
  Database,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ArrowDownCircle,
  Languages,
  BellRing,
  Clock,
  HardDrive,
  Sparkles
} from 'lucide-react'
import DataExportImport from './DataExportImport'

function SettingsModal() {
  const { t, language } = useTranslation()
  const [updateStatus, setUpdateStatus] = useState({ status: 'idle' })
  
  useEffect(() => {
    // Listen for update status from Electron
    if (window.electronAPI?.onUpdateStatus) {
      window.electronAPI.onUpdateStatus((data) => {
        setUpdateStatus(data)
      })
    }
  }, [])
  
  const handleCheckUpdates = () => {
    if (window.electronAPI?.checkForUpdates) {
      setUpdateStatus({ status: 'checking' })
      window.electronAPI.checkForUpdates()
    } else {
      setUpdateStatus({ status: 'error', message: 'Not running in Electron' })
    }
  }
  
  const handleInstallUpdate = () => {
    if (window.electronAPI?.installUpdate) {
      window.electronAPI.installUpdate()
    }
  }
  
  const getUpdateStatusDisplay = () => {
    switch (updateStatus.status) {
      case 'checking':
        return { icon: RefreshCw, text: t('settings.checking'), spin: true, color: 'text-zinc-400' }
      case 'available':
        return { icon: ArrowDownCircle, text: `${t('settings.updateAvailable')} v${updateStatus.version}`, color: 'text-green-400' }
      case 'downloading':
        return { icon: RefreshCw, text: `${t('settings.downloading')} ${updateStatus.percent}%`, spin: true, color: 'text-accent' }
      case 'ready':
        return { icon: CheckCircle, text: `v${updateStatus.version} ${t('settings.readyToInstall')}`, color: 'text-green-400', showInstall: true }
      case 'up-to-date':
        return { icon: CheckCircle, text: t('settings.upToDate'), color: 'text-green-400' }
      case 'error':
        return { icon: AlertCircle, text: updateStatus.message || 'Update failed', color: 'text-red-400' }
      default:
        return { icon: RefreshCw, text: t('settings.checkUpdates'), color: 'text-zinc-400' }
    }
  }
  
  const { 
    setSettingsOpen,
    theme,
    setTheme,
    accentColor,
    setAccentColor,
    notificationsEnabled,
    setNotificationsEnabled,
    habitRemindersEnabled,
    setHabitRemindersEnabled,
    taskRemindersEnabled,
    setTaskRemindersEnabled,
    setKeyboardShortcutsOpen,
    setAboutOpen,
    setLanguage
  } = useStore()

  const themes = [
    { id: 'dark', icon: Moon, label: t('settings.dark') },
    { id: 'light', icon: Sun, label: t('settings.light') },
    { id: 'system', icon: Monitor, label: t('settings.system') },
  ]

  const languages = [
    { id: 'is', label: t('settings.icelandic'), flag: '🇮🇸' },
    { id: 'en', label: t('settings.english'), flag: '🇬🇧' },
  ]

  const accentColors = [
    { id: 'blue', color: '#3b82f6', label: 'Blue' },
    { id: 'purple', color: '#a855f7', label: 'Purple' },
    { id: 'cyan', color: '#06b6d4', label: 'Cyan' },
    { id: 'green', color: '#22c55e', label: 'Green' },
    { id: 'orange', color: '#f97316', label: 'Orange' },
    { id: 'pink', color: '#ec4899', label: 'Pink' },
  ]

  const handleExport = () => {
    const state = localStorage.getItem('arnarflow-storage')
    if (state) {
      const blob = new Blob([state], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `arnarflow-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target.result)
            if (data.state) {
              localStorage.setItem('arnarflow-storage', JSON.stringify(data))
              window.location.reload()
            }
          } catch (err) {
            alert('Invalid backup file')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setSettingsOpen(false)
    }
  }

  // Request notification permission
  const handleEnableNotifications = async (enabled) => {
    if (enabled && 'Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setNotificationsEnabled(true)
      } else {
        setNotificationsEnabled(false)
      }
    } else {
      setNotificationsEnabled(enabled)
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-lg bg-dark-900 rounded-xl border border-dark-500 shadow-2xl shadow-black/50 overflow-hidden animate-fade-in-scale">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-600">
          <h2 className="text-lg font-semibold">{t('settings.title')}</h2>
          <button
            onClick={() => setSettingsOpen(false)}
            className="p-1.5 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <X size={18} className="text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Language */}
          <section>
            <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
              <Languages size={14} className="text-accent" />
              {t('settings.language')}
            </h3>
            <div className="flex gap-2">
              {languages.map(lang => (
                <button
                  key={lang.id}
                  onClick={() => setLanguage(lang.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border transition-all ${
                    language === lang.id
                      ? 'bg-accent/10 border-accent/50 text-accent'
                      : 'bg-dark-800 border-dark-600 text-zinc-400 hover:border-dark-500'
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="text-sm">{lang.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Appearance */}
          <section>
            <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
              <Palette size={14} className="text-accent" />
              {t('settings.appearance')}
            </h3>
            
            {/* Theme */}
            <div className="mb-4">
              <label className="text-xs text-zinc-500 block mb-2">{t('settings.theme')}</label>
              <div className="flex gap-2">
                {themes.map(thm => (
                  <button
                    key={thm.id}
                    onClick={() => setTheme(thm.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border transition-all ${
                      theme === thm.id
                        ? 'bg-accent/10 border-accent/50 text-accent'
                        : 'bg-dark-800 border-dark-600 text-zinc-400 hover:border-dark-500'
                    }`}
                  >
                    <thm.icon size={14} />
                    <span className="text-sm">{thm.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Color */}
            <div>
              <label className="text-xs text-zinc-500 block mb-2">{t('settings.accentColor')}</label>
              <div className="flex gap-2">
                {accentColors.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setAccentColor(c.id)}
                    className={`w-8 h-8 rounded-lg transition-all hover:scale-110 ${
                      accentColor === c.id ? 'ring-2 ring-offset-2 ring-offset-dark-900' : ''
                    }`}
                    style={{ 
                      backgroundColor: c.color,
                      ringColor: c.color
                    }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section>
            <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
              <Bell size={14} className="text-accent" />
              {t('settings.notifications')}
            </h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-zinc-400">{t('settings.enableNotifications')}</span>
                <button
                  onClick={() => handleEnableNotifications(!notificationsEnabled)}
                  className={`w-10 h-6 rounded-full transition-all relative ${
                    notificationsEnabled ? 'bg-accent' : 'bg-dark-600'
                  }`}
                >
                  <span 
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                      notificationsEnabled ? 'left-5' : 'left-1'
                    }`}
                  />
                </button>
              </label>
              
              {notificationsEnabled && (
                <div className="pl-4 space-y-3 border-l-2 border-dark-600 animate-fade-in">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2">
                      <BellRing size={14} className="text-zinc-500" />
                      <span className="text-sm text-zinc-400">{t('settings.habitReminders')}</span>
                    </div>
                    <button
                      onClick={() => setHabitRemindersEnabled(!habitRemindersEnabled)}
                      className={`w-10 h-6 rounded-full transition-all relative ${
                        habitRemindersEnabled ? 'bg-accent' : 'bg-dark-600'
                      }`}
                    >
                      <span 
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                          habitRemindersEnabled ? 'left-5' : 'left-1'
                        }`}
                      />
                    </button>
                  </label>
                  
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-zinc-500" />
                      <span className="text-sm text-zinc-400">{t('settings.taskReminders')}</span>
                    </div>
                    <button
                      onClick={() => setTaskRemindersEnabled(!taskRemindersEnabled)}
                      className={`w-10 h-6 rounded-full transition-all relative ${
                        taskRemindersEnabled ? 'bg-accent' : 'bg-dark-600'
                      }`}
                    >
                      <span 
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                          taskRemindersEnabled ? 'left-5' : 'left-1'
                        }`}
                      />
                    </button>
                  </label>
                </div>
              )}
            </div>
          </section>

          {/* Data */}
          <section>
            <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
              <HardDrive size={14} className="text-accent" />
              {language === 'is' ? 'Gögn og Afrit' : 'Data & Backup'}
            </h3>
            <DataExportImport />
          </section>

          {/* Updates */}
          <section>
            <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
              <RefreshCw size={14} className="text-accent" />
              {t('settings.updates')}
            </h3>
            <div className="bg-dark-800 rounded-lg p-4 border border-dark-600">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-zinc-400">{t('settings.currentVersion')}</span>
                <span className="text-sm font-mono text-zinc-300">v{APP_VERSION}</span>
              </div>
              
              {(() => {
                const status = getUpdateStatusDisplay()
                return (
                  <div className="space-y-2">
                    <button
                      onClick={handleCheckUpdates}
                      disabled={updateStatus.status === 'checking' || updateStatus.status === 'downloading'}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-dark-700 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-sm"
                    >
                      <status.icon size={14} className={`${status.color} ${status.spin ? 'animate-spin' : ''}`} />
                      <span className={status.color}>{status.text}</span>
                    </button>
                    
                    {status.showInstall && (
                      <button
                        onClick={handleInstallUpdate}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-500 rounded-lg transition-colors text-sm font-medium"
                      >
                        {t('settings.installRestart')}
                      </button>
                    )}
                  </div>
                )
              })()}
            </div>
          </section>

          {/* Quick Links */}
          <section>
            <h3 className="text-sm font-medium mb-3">{t('settings.more')}</h3>
            <div className="space-y-1">
              <button
                onClick={() => {
                  // Re-open the onboarding wizard
                  setSettingsOpen(false)
                  // Ensure onboarding can be shown again
                  useStore.getState().setOnboardingComplete(false)
                  useStore.getState().setOnboardingOpen(true)
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-dark-800 transition-colors text-left"
              >
                <Sparkles size={16} className="text-zinc-500" />
                <span className="text-sm">{language === 'is' ? 'Kynning / Uppsetning' : 'Run Onboarding'}</span>
              </button>

              <button
                onClick={() => {
                  setSettingsOpen(false)
                  setKeyboardShortcutsOpen(true)
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-dark-800 transition-colors text-left"
              >
                <Keyboard size={16} className="text-zinc-500" />
                <span className="text-sm">{t('settings.keyboardShortcuts')}</span>
                <kbd className="kbd ml-auto">?</kbd>
              </button>
              <button
                onClick={() => {
                  setSettingsOpen(false)
                  setAboutOpen(true)
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-dark-800 transition-colors text-left"
              >
                <Info size={16} className="text-zinc-500" />
                <span className="text-sm">{t('settings.about')}</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
