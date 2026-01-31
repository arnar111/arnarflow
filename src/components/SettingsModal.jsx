import React, { useState, useEffect } from 'react'
import useStore, { APP_VERSION } from '../store/useStore'
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
  ArrowDownCircle
} from 'lucide-react'

function SettingsModal() {
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
        return { icon: RefreshCw, text: 'Checking for updates...', spin: true, color: 'text-zinc-400' }
      case 'available':
        return { icon: ArrowDownCircle, text: `Update ${updateStatus.version} available!`, color: 'text-green-400' }
      case 'downloading':
        return { icon: RefreshCw, text: `Downloading ${updateStatus.percent}%...`, spin: true, color: 'text-accent' }
      case 'ready':
        return { icon: CheckCircle, text: `v${updateStatus.version} ready to install!`, color: 'text-green-400', showInstall: true }
      case 'up-to-date':
        return { icon: CheckCircle, text: 'You\'re up to date!', color: 'text-green-400' }
      case 'error':
        return { icon: AlertCircle, text: updateStatus.message || 'Update failed', color: 'text-red-400' }
      default:
        return { icon: RefreshCw, text: 'Check for Updates', color: 'text-zinc-400' }
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
    setKeyboardShortcutsOpen,
    setAboutOpen
  } = useStore()

  const themes = [
    { id: 'dark', icon: Moon, label: 'Dark' },
    { id: 'light', icon: Sun, label: 'Light' },
    { id: 'system', icon: Monitor, label: 'System' },
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

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-lg bg-dark-900 rounded-xl border border-dark-500 shadow-2xl shadow-black/50 overflow-hidden animate-fade-in-scale">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-600">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button
            onClick={() => setSettingsOpen(false)}
            className="p-1.5 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <X size={18} className="text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Appearance */}
          <section>
            <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
              <Palette size={14} className="text-accent" />
              Appearance
            </h3>
            
            {/* Theme */}
            <div className="mb-4">
              <label className="text-xs text-zinc-500 block mb-2">Theme</label>
              <div className="flex gap-2">
                {themes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border transition-all ${
                      theme === t.id
                        ? 'bg-accent/10 border-accent/50 text-accent'
                        : 'bg-dark-800 border-dark-600 text-zinc-400 hover:border-dark-500'
                    }`}
                  >
                    <t.icon size={14} />
                    <span className="text-sm">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Color */}
            <div>
              <label className="text-xs text-zinc-500 block mb-2">Accent Color</label>
              <div className="flex gap-2">
                {accentColors.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setAccentColor(c.id)}
                    className={`w-8 h-8 rounded-lg transition-all ${
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
              Notifications
            </h3>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-zinc-400">Enable desktop notifications</span>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
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
          </section>

          {/* Data */}
          <section>
            <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
              <Database size={14} className="text-accent" />
              Data Management
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-lg transition-colors text-sm"
              >
                <Download size={14} />
                Export Data
              </button>
              <button
                onClick={handleImport}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-lg transition-colors text-sm"
              >
                <Upload size={14} />
                Import Data
              </button>
            </div>
          </section>

          {/* Updates */}
          <section>
            <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
              <RefreshCw size={14} className="text-accent" />
              Updates
            </h3>
            <div className="bg-dark-800 rounded-lg p-4 border border-dark-600">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-zinc-400">Current version</span>
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
                        Restart & Install
                      </button>
                    )}
                  </div>
                )
              })()}
            </div>
          </section>

          {/* Quick Links */}
          <section>
            <h3 className="text-sm font-medium mb-3">More</h3>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setSettingsOpen(false)
                  setKeyboardShortcutsOpen(true)
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-dark-800 transition-colors text-left"
              >
                <Keyboard size={16} className="text-zinc-500" />
                <span className="text-sm">Keyboard Shortcuts</span>
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
                <span className="text-sm">About ArnarFlow</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
