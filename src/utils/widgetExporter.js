/**
 * ArnarFlow Rainmeter Widget Exporter
 * Exports kanban tasks to JSON → Rainmeter reads it
 */

export function exportTasksForWidget(tasks, projects, activeProject) {
  const data = {
    updatedAt: new Date().toISOString(),
    activeProject: activeProject || null,
    columns: { todo: [], inProgress: [], done: [] },
    stats: { total: 0, completed: 0, inProgress: 0, todo: 0 }
  }

  const filteredTasks = activeProject
    ? tasks.filter(t => t.projectId === activeProject)
    : tasks.filter(t => {
        const proj = projects.find(p => p.id === t.projectId)
        return proj && proj.status === 'active'
      })

  filteredTasks.forEach(task => {
    const project = projects.find(p => p.id === task.projectId)
    const taskData = {
      title: task.title || task.name || 'Untitled',
      project: project ? project.name : '',
      projectColor: project ? project.color : '#6366f1',
      priority: task.priority || 'medium',
      dueDate: task.dueDate || null
    }

    if (task.completed) {
      data.columns.done.push(taskData)
      data.stats.completed++
    } else if (task.status === 'in-progress') {
      data.columns.inProgress.push(taskData)
      data.stats.inProgress++
    } else {
      data.columns.todo.push(taskData)
      data.stats.todo++
    }
  })

  data.stats.total = filteredTasks.length
  data.columns.todo = data.columns.todo.slice(0, 8)
  data.columns.inProgress = data.columns.inProgress.slice(0, 8)
  data.columns.done = data.columns.done.slice(0, 5)

  return data
}

let exportTimer = null

export function scheduleWidgetExport(tasks, projects, activeProject) {
  // Debounce: don't write on every keystroke
  if (exportTimer) clearTimeout(exportTimer)
  exportTimer = setTimeout(() => {
    const data = exportTasksForWidget(tasks, projects, activeProject)
    const json = JSON.stringify(data, null, 2)

    if (window.electronAPI && window.electronAPI.exportWidgetData) {
      window.electronAPI.exportWidgetData(json)
    }
  }, 2000)
}
