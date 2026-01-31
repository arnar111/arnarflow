// Desktop notification utilities for ArnarFlow

export const requestNotificationPermission = async () => {
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

export const sendNotification = (title, options = {}) => {
  if (Notification.permission !== 'granted') {
    return null
  }
  
  const notification = new Notification(title, {
    icon: '/icon.ico',
    badge: '/icon.ico',
    ...options
  })
  
  notification.onclick = () => {
    window.focus()
    notification.close()
  }
  
  return notification
}

export const notifyOverdueTasks = (tasks) => {
  if (tasks.length === 0) return
  
  if (tasks.length === 1) {
    sendNotification('Task Overdue', {
      body: tasks[0].title,
      tag: 'overdue-tasks'
    })
  } else {
    sendNotification('Tasks Overdue', {
      body: `You have ${tasks.length} overdue tasks`,
      tag: 'overdue-tasks'
    })
  }
}

export const notifyTaskDueSoon = (task, minutesUntilDue) => {
  sendNotification('Task Due Soon', {
    body: `"${task.title}" is due in ${minutesUntilDue} minutes`,
    tag: `task-due-${task.id}`
  })
}

export const notifyHabitReminder = (habit) => {
  sendNotification('Habit Reminder', {
    body: `Don't forget: ${habit.name} - ${habit.target}`,
    tag: `habit-${habit.id}`
  })
}
