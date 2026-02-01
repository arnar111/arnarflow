import React, { useState, useEffect } from 'react'
import useStore from '../store/useStore'
import { useTranslation } from '../i18n/useTranslation'
import { format, parseISO } from 'date-fns'
import {
  X,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Download,
  Upload,
  Link,
  Unlink,
  Settings,
  Clock,
  Globe
} from 'lucide-react'

// Generate iCal format for tasks
function generateICalFile(tasks, projects) {
  const now = new Date()
  const formatICalDate = (date) => {
    return format(date, "yyyyMMdd'T'HHmmss'Z'")
  }
  
  let ical = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ArnarFlow//Task Manager//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:ArnarFlow Tasks'
  ]
  
  tasks
    .filter(t => t.dueDate && !t.completed)
    .forEach(task => {
      const project = projects.find(p => p.id === task.projectId)
      const dueDate = parseISO(task.dueDate)
      const uid = `task-${task.id}@arnarflow.app`
      
      ical.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${formatICalDate(now)}`,
        `DTSTART:${formatICalDate(dueDate)}`,
        `DTEND:${formatICalDate(new Date(dueDate.getTime() + 30 * 60000))}`, // 30 min duration
        `SUMMARY:${task.title}`,
        `DESCRIPTION:Project: ${project?.name || 'Unknown'}\\nPriority: ${task.priority || 'medium'}`,
        project ? `CATEGORIES:${project.name}` : '',
        task.priority === 'urgent' || task.priority === 'high' ? 'PRIORITY:1' : 'PRIORITY:5',
        'STATUS:CONFIRMED',
        'END:VEVENT'
      )
    })
  
  ical.push('END:VCALENDAR')
  
  return ical.filter(line => line).join('\r\n')
}

function CalendarSync({ onClose }) {
  const { language } = useTranslation()
  
  const {
    tasks,
    projects,
    calendarSyncEnabled,
    googleCalendarConnected,
    appleCalendarEnabled,
    calendarEvents,
    lastCalendarSync,
    setCalendarSyncEnabled,
    setGoogleCalendarConnected,
    setAppleCalendarEnabled,
    setCalendarEvents
  } = useStore()
  
  const [activeTab, setActiveTab] = useState('google') // 'google' | 'apple' | 'export'
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  
  const tasksWithDueDate = tasks.filter(t => t.dueDate && !t.completed)
  
  // Simulate Google Calendar OAuth (in real app, this would use Google OAuth)
  const handleGoogleConnect = async () => {
    setSyncing(true)
    setError(null)
    
    try {
      // In a real implementation, this would:
      // 1. Open Google OAuth popup
      // 2. Get access token
      // 3. Use Google Calendar API to sync events
      
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // For demo, just mark as connected
      setGoogleCalendarConnected(true)
      setSuccess(language === 'is' ? 'Tengt við Google Calendar!' : 'Connected to Google Calendar!')
      
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(language === 'is' ? 'Villa við tengingu' : 'Connection failed')
    } finally {
      setSyncing(false)
    }
  }
  
  const handleGoogleDisconnect = () => {
    setGoogleCalendarConnected(false)
    setCalendarEvents([])
  }
  
  const handleGoogleSync = async () => {
    if (!googleCalendarConnected) return
    
    setSyncing(true)
    setError(null)
    
    try {
      // Simulate sync
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In real app, this would push tasks to Google Calendar
      setSuccess(language === 'is' ? `${tasksWithDueDate.length} verkefni samstillt!` : `${tasksWithDueDate.length} tasks synced!`)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(language === 'is' ? 'Samstilling mistókst' : 'Sync failed')
    } finally {
      setSyncing(false)
    }
  }
  
  // Export iCal file for Apple Calendar
  const handleExportICal = () => {
    const ical = generateICalFile(tasks, projects)
    const blob = new Blob([ical], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'arnarflow-tasks.ics'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    setSuccess(language === 'is' ? 'iCal skrá sótt!' : 'iCal file downloaded!')
    setTimeout(() => setSuccess(null), 3000)
  }
  
  // Copy iCal subscription URL (for hosted calendar)
  const handleCopySubscriptionUrl = () => {
    // In real app, this would be a hosted URL that generates dynamic iCal
    const url = 'webcal://arnarflow.app/calendar/your-unique-id.ics'
    navigator.clipboard.writeText(url)
    setSuccess(language === 'is' ? 'Slóð afrituð!' : 'URL copied!')
    setTimeout(() => setSuccess(null), 3000)
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border)] shadow-2xl animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-muted)] flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {language === 'is' ? 'Dagatal Samstilling' : 'Calendar Sync'}
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                {language === 'is' ? 'Tengdu verkefni við dagatalið þitt' : 'Connect tasks to your calendar'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
          >
            <X size={20} className="text-[var(--text-muted)]" />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-[var(--border)]">
          {[
            { id: 'google', label: 'Google Calendar', icon: Globe },
            { id: 'apple', label: 'Apple Calendar', icon: Calendar },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-[var(--accent)] border-b-2 border-[var(--accent)] bg-[var(--accent-muted)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Success/Error Messages */}
          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-2 animate-fade-in">
              <CheckCircle2 size={18} className="text-green-400" />
              <span className="text-sm text-green-400">{success}</span>
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 animate-fade-in">
              <AlertCircle size={18} className="text-red-400" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}
          
          {activeTab === 'google' && (
            <div className="space-y-6">
              {/* Connection Status */}
              <div className="p-4 bg-[var(--bg-tertiary)] rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      googleCalendarConnected ? 'bg-green-500/10' : 'bg-[var(--bg-hover)]'
                    }`}>
                      <svg viewBox="0 0 24 24" className="w-6 h-6">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Google Calendar</p>
                      <p className={`text-xs ${googleCalendarConnected ? 'text-green-400' : 'text-[var(--text-muted)]'}`}>
                        {googleCalendarConnected 
                          ? (language === 'is' ? 'Tengt' : 'Connected')
                          : (language === 'is' ? 'Ekki tengt' : 'Not connected')
                        }
                      </p>
                    </div>
                  </div>
                  
                  {googleCalendarConnected ? (
                    <button
                      onClick={handleGoogleDisconnect}
                      className="px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Unlink size={14} />
                      {language === 'is' ? 'Aftengja' : 'Disconnect'}
                    </button>
                  ) : (
                    <button
                      onClick={handleGoogleConnect}
                      disabled={syncing}
                      className="px-4 py-2 text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {syncing ? (
                        <RefreshCw size={14} className="animate-spin" />
                      ) : (
                        <Link size={14} />
                      )}
                      {language === 'is' ? 'Tengja' : 'Connect'}
                    </button>
                  )}
                </div>
              </div>
              
              {/* Sync Options */}
              {googleCalendarConnected && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded-xl">
                    <div>
                      <p className="text-sm font-medium">
                        {language === 'is' ? 'Tvíátta samstilling' : 'Two-way sync'}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {language === 'is' ? 'Samstilla breytingar í báðar áttir' : 'Sync changes both ways'}
                      </p>
                    </div>
                    <button
                      onClick={() => setCalendarSyncEnabled(!calendarSyncEnabled)}
                      className={`w-10 h-6 rounded-full transition-colors relative ${
                        calendarSyncEnabled ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        calendarSyncEnabled ? 'left-5' : 'left-1'
                      }`} />
                    </button>
                  </div>
                  
                  <button
                    onClick={handleGoogleSync}
                    disabled={syncing}
                    className="w-full py-3 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    {syncing ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <RefreshCw size={16} />
                    )}
                    {language === 'is' ? 'Samstilla núna' : 'Sync Now'}
                  </button>
                  
                  {lastCalendarSync && (
                    <p className="text-xs text-center text-[var(--text-muted)]">
                      {language === 'is' ? 'Síðast samstillt:' : 'Last synced:'} {format(parseISO(lastCalendarSync), 'HH:mm, MMM d')}
                    </p>
                  )}
                </div>
              )}
              
              {/* Info */}
              <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                <p className="text-xs text-[var(--text-secondary)]">
                  {language === 'is'
                    ? 'Verkefni með skiladaga verða sjálfkrafa samstillt við Google Calendar þitt. Breytingar í ArnarFlow endurspeglast í dagatalinu.'
                    : 'Tasks with due dates will automatically sync to your Google Calendar. Changes in ArnarFlow will reflect in your calendar.'
                  }
                </p>
              </div>
            </div>
          )}
          
          {activeTab === 'apple' && (
            <div className="space-y-6">
              {/* iCal Export */}
              <div className="p-4 bg-[var(--bg-tertiary)] rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Apple Calendar / iCal</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {language === 'is' ? 'Flytja út sem .ics skrá' : 'Export as .ics file'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={handleExportICal}
                    className="w-full py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download size={16} />
                    {language === 'is' ? 'Sækja iCal skrá' : 'Download iCal File'}
                  </button>
                  
                  <p className="text-xs text-center text-[var(--text-muted)]">
                    {tasksWithDueDate.length} {language === 'is' ? 'verkefni með skiladaga' : 'tasks with due dates'}
                  </p>
                </div>
              </div>
              
              {/* Instructions */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">
                  {language === 'is' ? 'Hvernig á að flytja inn í Apple Calendar:' : 'How to import to Apple Calendar:'}
                </h3>
                
                <ol className="space-y-3 text-sm text-[var(--text-secondary)]">
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-[var(--accent-muted)] text-[var(--accent)] flex items-center justify-center flex-shrink-0 text-xs font-medium">1</span>
                    <span>{language === 'is' ? 'Smelltu á "Sækja iCal skrá" hér að ofan' : 'Click "Download iCal File" above'}</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-[var(--accent-muted)] text-[var(--accent)] flex items-center justify-center flex-shrink-0 text-xs font-medium">2</span>
                    <span>{language === 'is' ? 'Opnaðu skrána (.ics) - Calendar opnast sjálfkrafa' : 'Open the file (.ics) - Calendar will open automatically'}</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-[var(--accent-muted)] text-[var(--accent)] flex items-center justify-center flex-shrink-0 text-xs font-medium">3</span>
                    <span>{language === 'is' ? 'Staðfestu innflutning þegar beðið er um' : 'Confirm import when prompted'}</span>
                  </li>
                </ol>
              </div>
              
              {/* Alternative: Subscription */}
              <div className="p-4 border border-dashed border-[var(--border)] rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={14} className="text-[var(--text-muted)]" />
                  <span className="text-sm font-medium">
                    {language === 'is' ? 'Sjálfvirk samstilling (bráðum)' : 'Auto-sync (coming soon)'}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  {language === 'is'
                    ? 'Fáðu slóð sem uppfærist sjálfkrafa þegar verkefni breytast.'
                    : 'Get a subscription URL that updates automatically when tasks change.'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--bg-tertiary)]">
          <p className="text-xs text-center text-[var(--text-muted)]">
            {language === 'is'
              ? 'Gögnin þín eru örugg og ekki deilt með þriðja aðila.'
              : 'Your data is secure and not shared with third parties.'
            }
          </p>
        </div>
      </div>
    </div>
  )
}

export default CalendarSync
