import React, { useMemo, useState } from 'react'
import useStore from '../store/useStore'
import { useTranslation } from '../i18n/useTranslation'
import { 
  Clock, 
  Calendar, 
  Zap, 
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Play,
  Coffee,
  Target
} from 'lucide-react'
import { format, parseISO, isToday, isYesterday, startOfDay, subDays } from 'date-fns'
import DynamicIcon from './Icons'

function FocusHistory() {
  const { language } = useTranslation()
  const { pomodoroSessions, projects, tasks } = useStore()
  const [expandedDays, setExpandedDays] = useState(new Set([format(new Date(), 'yyyy-MM-dd')]))

  // Group sessions by day
  const groupedSessions = useMemo(() => {
    const sessions = pomodoroSessions || []
    const grouped = {}

    sessions.forEach(session => {
      if (!session.completedAt) return
      const dateStr = session.completedAt.split('T')[0]
      if (!grouped[dateStr]) {
        grouped[dateStr] = []
      }
      grouped[dateStr].push(session)
    })

    // Sort days descending
    const sortedDays = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

    return sortedDays.map(dateStr => ({
      dateStr,
      date: parseISO(dateStr),
      sessions: grouped[dateStr].sort((a, b) => 
        new Date(b.completedAt) - new Date(a.completedAt)
      ),
      totalMinutes: grouped[dateStr].reduce((sum, s) => sum + (s.duration || 0), 0),
      sessionCount: grouped[dateStr].length
    }))
  }, [pomodoroSessions])

  // Calculate overall stats
  const stats = useMemo(() => {
    const sessions = pomodoroSessions || []
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0)
    const totalSessions = sessions.length
    
    // Last 7 days
    const sevenDaysAgo = subDays(new Date(), 7)
    const recentSessions = sessions.filter(s => 
      s.completedAt && new Date(s.completedAt) >= sevenDaysAgo
    )
    const weeklyMinutes = recentSessions.reduce((sum, s) => sum + (s.duration || 0), 0)
    const weeklySessions = recentSessions.length

    // Average per day (last 7 days with activity)
    const activeDays = new Set(recentSessions.map(s => s.completedAt?.split('T')[0])).size
    const avgPerDay = activeDays > 0 ? Math.round(weeklyMinutes / activeDays) : 0

    return {
      totalMinutes,
      totalSessions,
      weeklyMinutes,
      weeklySessions,
      avgPerDay,
      totalHours: Math.round(totalMinutes / 60 * 10) / 10
    }
  }, [pomodoroSessions])

  const toggleDay = (dateStr) => {
    setExpandedDays(prev => {
      const next = new Set(prev)
      if (next.has(dateStr)) {
        next.delete(dateStr)
      } else {
        next.add(dateStr)
      }
      return next
    })
  }

  const formatDayLabel = (date, dateStr) => {
    if (isToday(date)) return language === 'is' ? 'Í dag' : 'Today'
    if (isYesterday(date)) return language === 'is' ? 'Í gær' : 'Yesterday'
    return format(date, 'EEEE, MMMM d')
  }

  const formatTime = (dateStr) => {
    return format(parseISO(dateStr), 'HH:mm')
  }

  const getProject = (projectId) => projects.find(p => p.id === projectId)
  const getTask = (taskId) => tasks.find(t => t.id === taskId)

  if (!pomodoroSessions || pomodoroSessions.length === 0) {
    return (
      <div className="p-8 max-w-4xl mx-auto animate-fade-in">
        <header className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Clock size={28} className="text-accent" />
            {language === 'is' ? 'Einbeitingarsaga' : 'Focus History'}
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            {language === 'is' ? 'Fylgstu með Pomodoro lotunum þínum' : 'Track your Pomodoro sessions'}
          </p>
        </header>

        <div className="bg-dark-800/30 rounded-2xl border border-dark-600/30 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-dark-700 flex items-center justify-center mx-auto mb-4">
            <Clock size={32} className="text-zinc-600" />
          </div>
          <h3 className="text-lg font-medium text-zinc-400 mb-2">
            {language === 'is' ? 'Engar lotur ennþá' : 'No sessions yet'}
          </h3>
          <p className="text-sm text-zinc-600">
            {language === 'is' 
              ? 'Byrjaðu Pomodoro lotu til að fylgjast með einbeitingu þinni'
              : 'Start a Pomodoro session to track your focus time'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Clock size={28} className="text-accent" />
          {language === 'is' ? 'Einbeitingarsaga' : 'Focus History'}
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          {language === 'is' ? 'Fylgstu með Pomodoro lotunum þínum' : 'Track your Pomodoro sessions'}
        </p>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-dark-800/30 rounded-2xl p-4 border border-dark-600/30">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} className="text-purple-400" />
            <span className="text-2xs text-zinc-500 uppercase tracking-wider">
              {language === 'is' ? 'Heildar tími' : 'Total Time'}
            </span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalHours}h</p>
          <p className="text-2xs text-zinc-600">{stats.totalSessions} {language === 'is' ? 'lotur' : 'sessions'}</p>
        </div>

        <div className="bg-dark-800/30 rounded-2xl p-4 border border-dark-600/30">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={14} className="text-blue-400" />
            <span className="text-2xs text-zinc-500 uppercase tracking-wider">
              {language === 'is' ? 'Þessi vika' : 'This Week'}
            </span>
          </div>
          <p className="text-2xl font-bold text-white">{Math.round(stats.weeklyMinutes / 60 * 10) / 10}h</p>
          <p className="text-2xs text-zinc-600">{stats.weeklySessions} {language === 'is' ? 'lotur' : 'sessions'}</p>
        </div>

        <div className="bg-dark-800/30 rounded-2xl p-4 border border-dark-600/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-green-400" />
            <span className="text-2xs text-zinc-500 uppercase tracking-wider">
              {language === 'is' ? 'Meðaltal/dag' : 'Avg/Day'}
            </span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.avgPerDay}m</p>
          <p className="text-2xs text-zinc-600">{language === 'is' ? 'síðustu 7 daga' : 'last 7 days'}</p>
        </div>

        <div className="bg-dark-800/30 rounded-2xl p-4 border border-dark-600/30">
          <div className="flex items-center gap-2 mb-2">
            <Target size={14} className="text-amber-400" />
            <span className="text-2xs text-zinc-500 uppercase tracking-wider">
              {language === 'is' ? 'Í dag' : 'Today'}
            </span>
          </div>
          <p className="text-2xl font-bold text-white">
            {groupedSessions.find(d => d.dateStr === format(new Date(), 'yyyy-MM-dd'))?.totalMinutes || 0}m
          </p>
          <p className="text-2xs text-zinc-600">
            {groupedSessions.find(d => d.dateStr === format(new Date(), 'yyyy-MM-dd'))?.sessionCount || 0} {language === 'is' ? 'lotur' : 'sessions'}
          </p>
        </div>
      </div>

      {/* Sessions by Day */}
      <div className="space-y-3">
        {groupedSessions.map(day => {
          const isExpanded = expandedDays.has(day.dateStr)
          
          return (
            <div 
              key={day.dateStr}
              className="bg-dark-800/30 rounded-2xl border border-dark-600/30 overflow-hidden"
            >
              {/* Day Header */}
              <button
                onClick={() => toggleDay(day.dateStr)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-dark-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {isExpanded ? (
                    <ChevronDown size={18} className="text-zinc-500" />
                  ) : (
                    <ChevronRight size={18} className="text-zinc-500" />
                  )}
                  <div>
                    <p className="font-medium text-sm">
                      {formatDayLabel(day.date, day.dateStr)}
                    </p>
                    <p className="text-2xs text-zinc-600">
                      {day.sessionCount} {language === 'is' ? 'lotur' : 'sessions'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-accent">
                    {day.totalMinutes}m
                  </p>
                  <p className="text-2xs text-zinc-600">
                    {Math.round(day.totalMinutes / 60 * 10) / 10}h
                  </p>
                </div>
              </button>

              {/* Sessions List */}
              {isExpanded && (
                <div className="px-5 pb-4 space-y-2 border-t border-dark-600/30 pt-3">
                  {day.sessions.map(session => {
                    const project = getProject(session.projectId)
                    const task = getTask(session.taskId)

                    return (
                      <div 
                        key={session.id}
                        className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-xl"
                      >
                        <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                          <Play size={14} className="text-accent" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          {project ? (
                            <div className="flex items-center gap-2">
                              <DynamicIcon 
                                name={project.icon} 
                                size={12} 
                                style={{ color: project.color }} 
                              />
                              <span className="text-sm truncate">{project.name}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-zinc-400">
                              {language === 'is' ? 'Einbeitingarlota' : 'Focus session'}
                            </span>
                          )}
                          {task && (
                            <p className="text-2xs text-zinc-600 truncate mt-0.5">
                              {task.title}
                            </p>
                          )}
                        </div>

                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-mono font-medium">
                            {session.duration}m
                          </p>
                          <p className="text-2xs text-zinc-600">
                            {formatTime(session.completedAt)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default FocusHistory
