import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns'

/**
 * Request notification permission
 * @returns {Promise<boolean>}
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications')
    return false
  }
  
  if (Notification.permission === 'granted') {
    return true
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }
  
  return false
}

/**
 * Send a desktop notification
 * @param {string} title
 * @param {Object} options
 */
export function sendNotification(title, options = {}) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return null
  }
  
  const notification = new Notification(title, {
    icon: '/icon.png',
    badge: '/icon.png',
    ...options
  })
  
  notification.onclick = () => {
    window.focus()
    notification.close()
    if (options.onClick) options.onClick()
  }
  
  // Auto-close after 5 seconds
  setTimeout(() => notification.close(), 5000)
  
  return notification
}

/**
 * Check for due tasks and send notifications
 * @param {Array} tasks
 * @param {boolean} enabled
 * @param {string} language
 */
export function checkTaskReminders(tasks, enabled, language) {
  if (!enabled) return
  
  const now = new Date()
  const upcomingTasks = tasks.filter(task => {
    if (!task.dueDate || task.completed) return false
    const dueDate = parseISO(task.dueDate)
    
    // Check if due today or overdue
    if (isPast(dueDate) && !isToday(dueDate)) {
      return true // Overdue
    }
    if (isToday(dueDate)) {
      return true // Due today
    }
    return false
  })
  
  upcomingTasks.forEach(task => {
    const dueDate = parseISO(task.dueDate)
    const isOverdue = isPast(dueDate) && !isToday(dueDate)
    
    const title = language === 'is' 
      ? (isOverdue ? 'Verkefni seinkaður!' : 'Verkefni á að skila!')
      : (isOverdue ? 'Task overdue!' : 'Task due!')
    
    sendNotification(title, {
      body: task.title,
      tag: `task-${task.id}`,
      requireInteraction: isOverdue
    })
  })
}

/**
 * Check habits and send reminders
 * @param {Array} habits
 * @param {Object} habitLogs
 * @param {boolean} enabled
 * @param {string} language
 */
export function checkHabitReminders(habits, habitLogs, enabled, language) {
  if (!enabled) return
  
  const today = format(new Date(), 'yyyy-MM-dd')
  const hour = new Date().getHours()
  
  // Only remind in the evening (18:00-21:00)
  if (hour < 18 || hour > 21) return
  
  const incompletedHabits = habits.filter(habit => {
    return !habitLogs[`${habit.id}-${today}`]
  })
  
  if (incompletedHabits.length === 0) {
    // All done! Celebration notification
    sendNotification(
      language === 'is' ? 'Allar venjur loknar! 🎉' : 'All habits done! 🎉',
      {
        body: language === 'is' ? 'Vel gert í dag!' : 'Great job today!',
        tag: 'habits-done'
      }
    )
  } else if (incompletedHabits.length > 0) {
    const habitNames = incompletedHabits
      .map(h => language === 'is' && h.nameIs ? h.nameIs : h.name)
      .join(', ')
    
    sendNotification(
      language === 'is' ? 'Venjuáminning' : 'Habit reminder',
      {
        body: language === 'is' 
          ? `${incompletedHabits.length} venjur eftir: ${habitNames}`
          : `${incompletedHabits.length} habits left: ${habitNames}`,
        tag: 'habit-reminder'
      }
    )
  }
}

/**
 * Format relative time
 * @param {string} dateString
 * @param {string} language
 * @returns {string}
 */
export function formatRelativeTime(dateString, language) {
  const date = parseISO(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) {
    return language === 'is' ? 'Rétt í þessu' : 'Just now'
  }
  if (diffMins < 60) {
    return language === 'is' ? `${diffMins} mín síðan` : `${diffMins} min ago`
  }
  if (diffHours < 24) {
    return language === 'is' ? `${diffHours} klst síðan` : `${diffHours} hrs ago`
  }
  if (diffDays < 7) {
    return language === 'is' ? `${diffDays} dögum síðan` : `${diffDays} days ago`
  }
  
  return format(date, 'MMM d, yyyy')
}

export default {
  requestNotificationPermission,
  sendNotification,
  checkTaskReminders,
  checkHabitReminders,
  formatRelativeTime
}
