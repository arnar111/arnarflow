import React, { useState, useEffect } from 'react'
import useStore from '../store/useStore'
import { useTranslation } from '../i18n/useTranslation'
import DynamicIcon from './Icons'
import { format, parseISO, formatDistanceToNow } from 'date-fns'
import { is, enUS } from 'date-fns/locale'
import {
  X,
  Play,
  Pause,
  Square,
  Clock,
  Timer,
  Calendar,
  Trash2,
  DollarSign,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Download,
  Target,
  Flame,
  TrendingUp
} from 'lucide-react'

function TimeTracker({ onClose }) {
  const { t, language } = useTranslation()
  const locale = language === 'is' ? is : enUS
  
  const {
    projects,
    tasks,
    activeTimeSession,
    timeSessions,
    startTimeTracking,
    stopTimeTracking,
    updateActiveSessionDescription,
    toggleSessionBillable,
    deleteTimeSession,
    getTimeStats,
    getWeeklyTimeReport
  } = useStore()
  
  const [activeTab, setActiveTab] = useState('timer') // 'timer' | 'history' | 'reports'
  const [selectedProject, setSelectedProject] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [description, setDescription] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [expandedDays, setExpandedDays] = useState({})
  
  // Timer tick
  useEffect(() => {
    if (!activeTimeSession) {
      setElapsed(0)
      return
    }
    
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - activeTimeSession.startTime) / 1000))
    }, 1000)
    
    return () => clearInterval(interval)
  }, [activeTimeSession])
  
  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  
  const formatHours = (seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    if (h > 0) return `${h}h ${m}m`
    return `${m}m`
  }
  
  const handleStart = () => {
    startTimeTracking(selectedTask, selectedProject, description)
  }
  
  const handleStop = () => {
    stopTimeTracking()
    setDescription('')
    setSelectedTask(null)
  }
  
  const getProjectById = (id) => projects.find(p => p.id === id)
  const getTaskById = (id) => tasks.find(t => t.id === id)
  
  const projectTasks = selectedProject 
    ? tasks.filter(t => t.projectId === selectedProject && !t.completed)
    : []
  
  const stats = getTimeStats()
  const weeklyReport = getWeeklyTimeReport()
  const maxWeekHours = Math.max(...weeklyReport.map(d => d.hours), 1)
  
  // Group sessions by day
  const sessionsByDay = {}
  timeSessions.slice().reverse().forEach(session => {
    const day = new Date(session.startTime).toISOString().split('T')[0]
    if (!sessionsByDay[day]) sessionsByDay[day] = []
    sessionsByDay[day].push(session)
  })
  
  const exportToCSV = () => {
    const headers = ['Date', 'Project', 'Task', 'Description', 'Duration (hours)', 'Billable']
    const rows = timeSessions.map(s => {
      const project = getProjectById(s.projectId)
      const task = getTaskById(s.taskId)
      return [
        format(new Date(s.startTime), 'yyyy-MM-dd HH:mm'),
        project?.name || '',
        task?.title || '',
        s.description || '',
        (s.duration / 3600).toFixed(2),
        s.billable ? 'Yes' : 'No'
      ]
    })
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `time-tracking-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border)] shadow-2xl animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-muted)] flex items-center justify-center">
              <Timer className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {language === 'is' ? 'Tímamælir' : 'Time Tracker'}
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                {language === 'is' ? 'Fylgstu með vinnustundum' : 'Track your work sessions'}
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
            { id: 'timer', label: language === 'is' ? 'Tímamælir' : 'Timer', icon: Clock },
            { id: 'history', label: language === 'is' ? 'Saga' : 'History', icon: Calendar },
            { id: 'reports', label: language === 'is' ? 'Skýrslur' : 'Reports', icon: BarChart3 }
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
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'timer' && (
            <div className="space-y-6">
              {/* Active Session Display */}
              {activeTimeSession ? (
                <div className="text-center py-8">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${
                    activeTimeSession ? 'bg-red-500/10 text-red-400' : 'bg-[var(--bg-tertiary)]'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-red-500 timer-recording" />
                    <span className="text-sm font-medium">
                      {language === 'is' ? 'Í gangi' : 'Recording'}
                    </span>
                  </div>
                  
                  <p className="text-5xl font-mono font-bold text-[var(--text-primary)] mb-4">
                    {formatDuration(elapsed)}
                  </p>
                  
                  {activeTimeSession.projectId && (
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {(() => {
                        const project = getProjectById(activeTimeSession.projectId)
                        if (!project) return null
                        return (
                          <>
                            <DynamicIcon name={project.icon} size={16} style={{ color: project.color }} />
                            <span className="text-sm" style={{ color: project.color }}>{project.name}</span>
                          </>
                        )
                      })()}
                    </div>
                  )}
                  
                  {activeTimeSession.taskId && (
                    <p className="text-sm text-[var(--text-secondary)] mb-4">
                      {getTaskById(activeTimeSession.taskId)?.title}
                    </p>
                  )}
                  
                  <button
                    onClick={handleStop}
                    className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium flex items-center gap-2 mx-auto transition-colors"
                  >
                    <Square size={18} />
                    {language === 'is' ? 'Stöðva' : 'Stop'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Project Select */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      {language === 'is' ? 'Verkefni' : 'Project'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {projects.map(project => (
                        <button
                          key={project.id}
                          onClick={() => {
                            setSelectedProject(project.id)
                            setSelectedTask(null)
                          }}
                          className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                            selectedProject === project.id
                              ? 'border-[var(--accent)] bg-[var(--accent-muted)]'
                              : 'border-[var(--border)] hover:border-[var(--border-focus)] hover:bg-[var(--bg-hover)]'
                          }`}
                        >
                          <DynamicIcon name={project.icon} size={16} style={{ color: project.color }} />
                          <span className="text-sm truncate">{project.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Task Select */}
                  {selectedProject && projectTasks.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        {language === 'is' ? 'Verkefni (valfrjálst)' : 'Task (optional)'}
                      </label>
                      <select
                        value={selectedTask || ''}
                        onChange={(e) => setSelectedTask(e.target.value || null)}
                        className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-xl text-sm focus:border-[var(--accent)] transition-colors"
                      >
                        <option value="">{language === 'is' ? '— Ekkert verkefni —' : '— No task —'}</option>
                        {projectTasks.map(task => (
                          <option key={task.id} value={task.id}>{task.title}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      {language === 'is' ? 'Lýsing (valfrjálst)' : 'Description (optional)'}
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={language === 'is' ? 'Hvað ertu að vinna í?' : 'What are you working on?'}
                      className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-xl text-sm focus:border-[var(--accent)] transition-colors"
                    />
                  </div>
                  
                  {/* Start Button */}
                  <button
                    onClick={handleStart}
                    disabled={!selectedProject}
                    className="w-full py-4 bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <Play size={20} />
                    {language === 'is' ? 'Byrja tímamælingu' : 'Start Tracking'}
                  </button>
                </div>
              )}
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[var(--border)]">
                <div className="text-center">
                  <p className="text-2xl font-bold font-mono text-[var(--accent)]">
                    {stats.todayHours}h
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {language === 'is' ? 'Í dag' : 'Today'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold font-mono text-[var(--success)]">
                    {stats.weekHours}h
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {language === 'is' ? 'Þessi vika' : 'This week'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold font-mono text-[var(--warning)]">
                    {stats.billableHours}h
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {language === 'is' ? 'Reikningshæft' : 'Billable'}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'history' && (
            <div className="space-y-4">
              {Object.keys(sessionsByDay).length === 0 ? (
                <div className="text-center py-12">
                  <Clock size={48} className="mx-auto mb-4 text-[var(--text-muted)] opacity-30" />
                  <p className="text-[var(--text-secondary)]">
                    {language === 'is' ? 'Engar tímaskráningar ennþá' : 'No time sessions yet'}
                  </p>
                </div>
              ) : (
                Object.entries(sessionsByDay).map(([day, sessions]) => {
                  const dayTotal = sessions.reduce((sum, s) => sum + s.duration, 0)
                  const isExpanded = expandedDays[day] !== false
                  
                  return (
                    <div key={day} className="border border-[var(--border)] rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedDays(prev => ({ ...prev, [day]: !isExpanded }))}
                        className="w-full flex items-center justify-between p-4 hover:bg-[var(--bg-hover)] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          <span className="font-medium">
                            {format(parseISO(day), 'EEEE, MMM d', { locale })}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
                            {sessions.length} {language === 'is' ? 'lotur' : 'sessions'}
                          </span>
                        </div>
                        <span className="font-mono text-sm text-[var(--accent)]">
                          {formatHours(dayTotal)}
                        </span>
                      </button>
                      
                      {isExpanded && (
                        <div className="border-t border-[var(--border)]">
                          {sessions.map(session => {
                            const project = getProjectById(session.projectId)
                            const task = getTaskById(session.taskId)
                            
                            return (
                              <div
                                key={session.id}
                                className="flex items-center gap-4 p-4 hover:bg-[var(--bg-hover)] transition-colors group"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    {project && (
                                      <span 
                                        className="text-xs px-2 py-0.5 rounded"
                                        style={{ backgroundColor: `${project.color}20`, color: project.color }}
                                      >
                                        {project.name}
                                      </span>
                                    )}
                                    {task && (
                                      <span className="text-sm truncate">{task.title}</span>
                                    )}
                                  </div>
                                  {session.description && (
                                    <p className="text-xs text-[var(--text-muted)] mt-1 truncate">
                                      {session.description}
                                    </p>
                                  )}
                                  <p className="text-xs text-[var(--text-muted)] mt-1">
                                    {format(new Date(session.startTime), 'HH:mm')} — {format(new Date(session.endTime), 'HH:mm')}
                                  </p>
                                </div>
                                
                                <span className="font-mono text-sm">
                                  {formatHours(session.duration)}
                                </span>
                                
                                <button
                                  onClick={() => toggleSessionBillable(session.id)}
                                  className={`p-2 rounded-lg transition-colors ${
                                    session.billable 
                                      ? 'bg-green-500/10 text-green-400' 
                                      : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
                                  }`}
                                  title={language === 'is' ? 'Merkja sem reikningshæft' : 'Mark as billable'}
                                >
                                  <DollarSign size={16} />
                                </button>
                                
                                <button
                                  onClick={() => deleteTimeSession(session.id)}
                                  className="p-2 hover:bg-red-500/10 rounded-lg text-[var(--text-muted)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          )}
          
          {activeTab === 'reports' && (
            <div className="space-y-6">
              {/* Weekly Chart */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">
                    {language === 'is' ? 'Síðustu 7 dagar' : 'Last 7 Days'}
                  </h3>
                  <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
                  >
                    <Download size={14} />
                    {language === 'is' ? 'Flytja út CSV' : 'Export CSV'}
                  </button>
                </div>
                
                <div className="flex items-end justify-between gap-2 h-32 mb-2">
                  {weeklyReport.map((day, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex flex-col items-center justify-end h-24">
                        <div
                          className={`w-full rounded-t-lg transition-all ${
                            day.hours > 0 ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
                          }`}
                          style={{ height: `${Math.max((day.hours / maxWeekHours) * 100, 4)}%` }}
                        />
                      </div>
                      <span className="text-xs text-[var(--text-muted)]">{day.dayName}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-center gap-2 text-sm text-[var(--text-secondary)]">
                  <TrendingUp size={16} className="text-[var(--accent)]" />
                  <span className="font-mono font-medium">{stats.weekHours}h</span>
                  <span>{language === 'is' ? 'heildar þessa viku' : 'total this week'}</span>
                </div>
              </div>
              
              {/* Project Breakdown */}
              <div>
                <h3 className="font-medium mb-4">
                  {language === 'is' ? 'Eftir verkefnum' : 'By Project'}
                </h3>
                
                {Object.keys(stats.byProject).length === 0 ? (
                  <p className="text-sm text-[var(--text-muted)] text-center py-4">
                    {language === 'is' ? 'Engin gögn ennþá' : 'No data yet'}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(stats.byProject)
                      .sort(([, a], [, b]) => b - a)
                      .map(([projectId, seconds]) => {
                        const project = getProjectById(projectId)
                        if (!project) return null
                        
                        const percentage = stats.totalSeconds > 0 
                          ? (seconds / stats.totalSeconds) * 100 
                          : 0
                        
                        return (
                          <div key={projectId}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <DynamicIcon name={project.icon} size={14} style={{ color: project.color }} />
                                <span className="text-sm">{project.name}</span>
                              </div>
                              <span className="text-sm font-mono text-[var(--text-secondary)]">
                                {formatHours(seconds)}
                              </span>
                            </div>
                            <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%`, backgroundColor: project.color }}
                              />
                            </div>
                          </div>
                        )
                      })}
                  </div>
                )}
              </div>
              
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border)]">
                <div className="p-4 bg-[var(--bg-tertiary)] rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Target size={16} className="text-[var(--accent)]" />
                    <span className="text-sm text-[var(--text-secondary)]">
                      {language === 'is' ? 'Heildar lotur' : 'Total Sessions'}
                    </span>
                  </div>
                  <p className="text-2xl font-bold font-mono">{stats.totalSessions}</p>
                </div>
                
                <div className="p-4 bg-[var(--bg-tertiary)] rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Flame size={16} className="text-[var(--warning)]" />
                    <span className="text-sm text-[var(--text-secondary)]">
                      {language === 'is' ? 'Heildar tímar' : 'Total Hours'}
                    </span>
                  </div>
                  <p className="text-2xl font-bold font-mono">{stats.totalHours}h</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Floating Time Tracker Widget (for header/sidebar)
export function TimeTrackerWidget({ compact = false }) {
  const { language } = useTranslation()
  const {
    activeTimeSession,
    stopTimeTracking,
    setTimeTrackerOpen,
    projects,
    tasks
  } = useStore()
  
  const [elapsed, setElapsed] = useState(0)
  
  useEffect(() => {
    if (!activeTimeSession) {
      setElapsed(0)
      return
    }
    
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - activeTimeSession.startTime) / 1000))
    }, 1000)
    
    return () => clearInterval(interval)
  }, [activeTimeSession])
  
  if (!activeTimeSession) {
    return (
      <button
        onClick={() => setTimeTrackerOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
        title={language === 'is' ? 'Opna tímamælir' : 'Open Time Tracker'}
      >
        <Timer size={16} className="text-[var(--text-muted)]" />
        {!compact && (
          <span className="text-sm text-[var(--text-muted)]">
            {language === 'is' ? 'Tímamælir' : 'Timer'}
          </span>
        )}
      </button>
    )
  }
  
  const project = projects.find(p => p.id === activeTimeSession.projectId)
  const task = tasks.find(t => t.id === activeTimeSession.taskId)
  
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  
  return (
    <div 
      className="flex items-center gap-3 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl cursor-pointer hover:bg-red-500/15 transition-colors time-tracker-active"
      onClick={() => setTimeTrackerOpen(true)}
    >
      <span className="w-2 h-2 rounded-full bg-red-500 timer-recording" />
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-mono font-medium text-red-400">
          {formatTime(elapsed)}
        </p>
        {!compact && task && (
          <p className="text-xs text-[var(--text-muted)] truncate">
            {task.title}
          </p>
        )}
      </div>
      
      <button
        onClick={(e) => {
          e.stopPropagation()
          stopTimeTracking()
        }}
        className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
        title={language === 'is' ? 'Stöðva' : 'Stop'}
      >
        <Square size={14} className="text-red-400" />
      </button>
    </div>
  )
}

export default TimeTracker
