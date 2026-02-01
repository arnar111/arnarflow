import React, { useState, useEffect } from 'react'
import useStore from '../store/useStore'
import { useTranslation } from '../i18n/useTranslation'
import DynamicIcon from './Icons'
import { format, formatDistanceToNow, parseISO, isPast, addHours, isToday } from 'date-fns'
import { is, enUS } from 'date-fns/locale'
import {
  X,
  Bell,
  BellOff,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Flame,
  Calendar,
  Trash2,
  Check,
  ChevronRight,
  Settings,
  Volume2,
  VolumeX,
  Moon
} from 'lucide-react'

// Notification types
const NOTIFICATION_TYPES = {
  DUE_SOON: 'due_soon',
  OVERDUE: 'overdue',
  STREAK_AT_RISK: 'streak_at_risk',
  TASK_COMPLETED: 'task_completed',
  REMINDER: 'reminder',
  SYSTEM: 'system'
}

const NOTIFICATION_ICONS = {
  [NOTIFICATION_TYPES.DUE_SOON]: Clock,
  [NOTIFICATION_TYPES.OVERDUE]: AlertTriangle,
  [NOTIFICATION_TYPES.STREAK_AT_RISK]: Flame,
  [NOTIFICATION_TYPES.TASK_COMPLETED]: CheckCircle2,
  [NOTIFICATION_TYPES.REMINDER]: Bell,
  [NOTIFICATION_TYPES.SYSTEM]: Bell
}

const NOTIFICATION_COLORS = {
  [NOTIFICATION_TYPES.DUE_SOON]: 'var(--warning)',
  [NOTIFICATION_TYPES.OVERDUE]: 'var(--error)',
  [NOTIFICATION_TYPES.STREAK_AT_RISK]: '#F97316',
  [NOTIFICATION_TYPES.TASK_COMPLETED]: 'var(--success)',
  [NOTIFICATION_TYPES.REMINDER]: 'var(--accent)',
  [NOTIFICATION_TYPES.SYSTEM]: 'var(--text-secondary)'
}

function NotificationSystem({ onClose }) {
  const { language } = useTranslation()
  const locale = language === 'is' ? is : enUS
  
  const {
    notifications,
    unreadNotificationCount,
    notificationPreferences,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    clearAllNotifications,
    setNotificationPreference,
    isQuietHours,
    setActiveView,
    setSelectedProject
  } = useStore()
  
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'unread' | 'settings'
  const inQuietHours = isQuietHours()
  
  const filteredNotifications = activeTab === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications
  
  const handleNotificationClick = (notification) => {
    markNotificationRead(notification.id)
    
    // Navigate based on notification type
    if (notification.taskId) {
      setActiveView('project')
      if (notification.projectId) {
        setSelectedProject(notification.projectId)
      }
    } else if (notification.type === NOTIFICATION_TYPES.STREAK_AT_RISK) {
      setActiveView('habits')
    }
    
    onClose()
  }
  
  const getNotificationIcon = (type) => {
    const Icon = NOTIFICATION_ICONS[type] || Bell
    return Icon
  }
  
  const getNotificationColor = (type) => {
    return NOTIFICATION_COLORS[type] || 'var(--text-secondary)'
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-16">
      {/* Backdrop */}
      <div 
        className="absolute inset-0"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative w-full max-w-md bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border)] shadow-2xl animate-slide-in overflow-hidden notification-toast">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <Bell size={20} className="text-[var(--accent)]" />
            <h2 className="font-semibold">
              {language === 'is' ? 'Tilkynningar' : 'Notifications'}
            </h2>
            {unreadNotificationCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-[var(--accent)] text-white rounded-full">
                {unreadNotificationCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {inQuietHours && (
              <div className="flex items-center gap-1 px-2 py-1 text-xs bg-[var(--bg-tertiary)] rounded-lg text-[var(--text-muted)]">
                <Moon size={12} />
                {language === 'is' ? 'Þögn' : 'Quiet'}
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
            >
              <X size={18} className="text-[var(--text-muted)]" />
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-[var(--border)]">
          {[
            { id: 'all', label: language === 'is' ? 'Allar' : 'All' },
            { id: 'unread', label: language === 'is' ? 'Ólesnar' : 'Unread' },
            { id: 'settings', label: language === 'is' ? 'Stillingar' : 'Settings' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto">
          {activeTab === 'settings' ? (
            <div className="p-4 space-y-4">
              {/* Notification Types */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-[var(--text-secondary)]">
                  {language === 'is' ? 'Tilkynningagerðir' : 'Notification Types'}
                </h3>
                
                {[
                  { key: 'dueSoon', label: language === 'is' ? 'Verkefni á að klárast bráðum' : 'Tasks due soon', icon: Clock, desc: language === 'is' ? '< 2 klukkustundum' : '< 2 hours' },
                  { key: 'overdue', label: language === 'is' ? 'Seinkuð verkefni' : 'Overdue tasks', icon: AlertTriangle, desc: language === 'is' ? 'Þegar verkefni fara framyfir tíma' : 'When tasks pass due date' },
                  { key: 'streakAtRisk', label: language === 'is' ? 'Streak í hættu' : 'Streak at risk', icon: Flame, desc: language === 'is' ? 'Þegar streak er við það að rofna' : "When streak's about to break" },
                  { key: 'dailyBriefing', label: language === 'is' ? 'Morgunyfirlit' : 'Daily briefing', icon: Calendar, desc: language === 'is' ? 'Yfirlit um daginn' : 'Summary of your day' }
                ].map(item => (
                  <button
                    key={item.key}
                    onClick={() => setNotificationPreference(item.key, !notificationPreferences[item.key])}
                    className="w-full flex items-center justify-between p-3 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} className="text-[var(--text-muted)]" />
                      <div className="text-left">
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-[var(--text-muted)]">{item.desc}</p>
                      </div>
                    </div>
                    <div className={`w-10 h-6 rounded-full transition-colors relative ${
                      notificationPreferences[item.key] ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
                    }`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        notificationPreferences[item.key] ? 'left-5' : 'left-1'
                      }`} />
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Quiet Hours */}
              <div className="space-y-3 pt-4 border-t border-[var(--border)]">
                <h3 className="text-sm font-medium text-[var(--text-secondary)]">
                  {language === 'is' ? 'Þagnartímar' : 'Quiet Hours'}
                </h3>
                
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-xs text-[var(--text-muted)] mb-1 block">
                      {language === 'is' ? 'Frá' : 'From'}
                    </label>
                    <select
                      value={notificationPreferences.quietHoursStart}
                      onChange={(e) => setNotificationPreference('quietHoursStart', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg text-sm"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-[var(--text-muted)] mb-1 block">
                      {language === 'is' ? 'Til' : 'To'}
                    </label>
                    <select
                      value={notificationPreferences.quietHoursEnd}
                      onChange={(e) => setNotificationPreference('quietHoursEnd', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg text-sm"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <p className="text-xs text-[var(--text-muted)]">
                  {language === 'is' 
                    ? 'Engar tilkynningar á þessum tíma'
                    : 'No notifications during these hours'}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Actions */}
              {filteredNotifications.length > 0 && (
                <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)] bg-[var(--bg-tertiary)]">
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
                  >
                    {language === 'is' ? 'Merkja allt lesið' : 'Mark all read'}
                  </button>
                  <button
                    onClick={clearAllNotifications}
                    className="text-xs text-[var(--text-muted)] hover:text-[var(--error)] transition-colors"
                  >
                    {language === 'is' ? 'Hreinsa allt' : 'Clear all'}
                  </button>
                </div>
              )}
              
              {/* Notification List */}
              {filteredNotifications.length === 0 ? (
                <div className="py-16 text-center">
                  <BellOff size={48} className="mx-auto mb-4 text-[var(--text-muted)] opacity-30" />
                  <p className="text-[var(--text-secondary)]">
                    {activeTab === 'unread'
                      ? (language === 'is' ? 'Engar ólesnar tilkynningar' : 'No unread notifications')
                      : (language === 'is' ? 'Engar tilkynningar' : 'No notifications')
                    }
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {filteredNotifications.map(notification => {
                    const Icon = getNotificationIcon(notification.type)
                    const color = getNotificationColor(notification.type)
                    
                    return (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-[var(--bg-hover)] transition-colors cursor-pointer notification-item ${
                          !notification.read ? 'notification-unread bg-[var(--accent-muted)]' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${color}15` }}
                          >
                            <Icon size={16} style={{ color }} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>
                              {notification.title}
                            </p>
                            {notification.message && (
                              <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-2">
                                {notification.message}
                              </p>
                            )}
                            <p className="text-xs text-[var(--text-muted)] mt-1">
                              {formatDistanceToNow(parseISO(notification.createdAt), { addSuffix: true, locale })}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {!notification.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  markNotificationRead(notification.id)
                                }}
                                className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
                                title={language === 'is' ? 'Merkja lesið' : 'Mark as read'}
                              >
                                <Check size={14} className="text-[var(--text-muted)]" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteNotification(notification.id)
                              }}
                              className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors text-[var(--text-muted)] hover:text-red-400"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Notification Bell Button (for header)
export function NotificationBell({ onClick }) {
  const { unreadNotificationCount } = useStore()
  
  return (
    <button
      onClick={onClick}
      className="relative p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
    >
      <Bell size={18} className="text-[var(--text-secondary)]" />
      {unreadNotificationCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] font-medium bg-[var(--error)] text-white rounded-full flex items-center justify-center badge-pop">
          {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
        </span>
      )}
    </button>
  )
}

// Hook to check for notifications
export function useNotificationChecker() {
  const tasks = useStore(state => state.tasks)
  const habits = useStore(state => state.habits)
  const habitLogs = useStore(state => state.habitLogs)
  const habitStreaks = useStore(state => state.habitStreaks)
  const notificationPreferences = useStore(state => state.notificationPreferences)
  const addNotification = useStore(state => state.addNotification)
  const isQuietHours = useStore(state => state.isQuietHours)
  const language = useStore(state => state.language)
  
  useEffect(() => {
    // Check every 5 minutes
    const checkNotifications = () => {
      if (isQuietHours()) return
      
      const now = new Date()
      const twoHoursFromNow = addHours(now, 2)
      
      // Check for tasks due soon
      if (notificationPreferences.dueSoon) {
        tasks
          .filter(t => !t.completed && t.dueDate)
          .forEach(task => {
            const dueDate = parseISO(task.dueDate)
            if (dueDate > now && dueDate <= twoHoursFromNow) {
              // Check if we already notified for this task today
              addNotification({
                type: NOTIFICATION_TYPES.DUE_SOON,
                title: language === 'is' ? 'Verkefni á að klárast bráðum' : 'Task due soon',
                message: task.title,
                taskId: task.id,
                projectId: task.projectId
              })
            }
          })
      }
      
      // Check for overdue tasks
      if (notificationPreferences.overdue) {
        tasks
          .filter(t => !t.completed && t.dueDate && isPast(parseISO(t.dueDate)))
          .forEach(task => {
            addNotification({
              type: NOTIFICATION_TYPES.OVERDUE,
              title: language === 'is' ? 'Seinkað verkefni' : 'Overdue task',
              message: task.title,
              taskId: task.id,
              projectId: task.projectId
            })
          })
      }
      
      // Check for streak at risk (evening check)
      if (notificationPreferences.streakAtRisk && now.getHours() >= 20) {
        const today = format(now, 'yyyy-MM-dd')
        
        habits.forEach(habit => {
          const streak = habitStreaks[habit.id]
          const completedToday = habitLogs[`${habit.id}-${today}`]
          
          if (streak?.current >= 3 && !completedToday) {
            addNotification({
              type: NOTIFICATION_TYPES.STREAK_AT_RISK,
              title: language === 'is' ? 'Streak í hættu!' : 'Streak at risk!',
              message: `${habit.name}: ${streak.current} ${language === 'is' ? 'daga streak' : 'day streak'}`,
              habitId: habit.id
            })
          }
        })
      }
    }
    
    // Initial check
    checkNotifications()
    
    // Set up interval
    const interval = setInterval(checkNotifications, 5 * 60 * 1000) // 5 minutes
    
    return () => clearInterval(interval)
  }, [tasks, habits, habitLogs, habitStreaks, notificationPreferences, isQuietHours])
}

export default NotificationSystem
