import React, { useMemo } from 'react'
import useStore from '../store/useStore'
import DynamicIcon from './Icons'
import { 
  format, 
  isToday, 
  isTomorrow, 
  isThisWeek, 
  isPast, 
  parseISO,
  addDays,
  startOfDay
} from 'date-fns'
import { 
  CheckCircle2, 
  Circle, 
  Calendar,
  Clock,
  AlertTriangle,
  Inbox,
  CalendarDays
} from 'lucide-react'

function Timeline({ tasks, compact = false }) {
  const { projects, toggleTask } = useStore()

  // Group tasks by time period
  const groupedTasks = useMemo(() => {
    const groups = {
      overdue: { label: 'Overdue', icon: AlertTriangle, color: 'text-red-400', tasks: [] },
      today: { label: 'Today', icon: Clock, color: 'text-green-400', tasks: [] },
      tomorrow: { label: 'Tomorrow', icon: Calendar, color: 'text-blue-400', tasks: [] },
      thisWeek: { label: 'This Week', icon: CalendarDays, color: 'text-purple-400', tasks: [] },
      later: { label: 'Later', icon: Calendar, color: 'text-zinc-400', tasks: [] },
      noDue: { label: 'No Due Date', icon: Inbox, color: 'text-zinc-500', tasks: [] },
    }

    const openTasks = tasks.filter(t => !t.completed)

    openTasks.forEach(task => {
      if (!task.dueDate) {
        groups.noDue.tasks.push(task)
        return
      }

      const dueDate = parseISO(task.dueDate)
      const today = startOfDay(new Date())

      if (isPast(dueDate) && !isToday(dueDate)) {
        groups.overdue.tasks.push(task)
      } else if (isToday(dueDate)) {
        groups.today.tasks.push(task)
      } else if (isTomorrow(dueDate)) {
        groups.tomorrow.tasks.push(task)
      } else if (isThisWeek(dueDate)) {
        groups.thisWeek.tasks.push(task)
      } else {
        groups.later.tasks.push(task)
      }
    })

    // Sort tasks within each group by due date
    Object.values(groups).forEach(group => {
      group.tasks.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate) - new Date(b.dueDate)
      })
    })

    return groups
  }, [tasks])

  const getProject = (projectId) => projects.find(p => p.id === projectId)

  if (compact) {
    // Compact version for dashboard
    const urgentTasks = [
      ...groupedTasks.overdue.tasks,
      ...groupedTasks.today.tasks,
      ...groupedTasks.tomorrow.tasks
    ].slice(0, 5)

    return (
      <div className="space-y-2">
        {urgentTasks.map(task => {
          const project = getProject(task.projectId)
          const isOverdue = task.dueDate && isPast(parseISO(task.dueDate)) && !isToday(parseISO(task.dueDate))
          
          return (
            <div 
              key={task.id}
              className="flex items-center gap-3 p-2 bg-dark-800/30 rounded-lg hover:bg-dark-700/50 transition-colors group"
            >
              <button
                onClick={() => toggleTask(task.id)}
                className="task-checkbox"
              />
              <span className="flex-1 text-sm truncate">{task.title}</span>
              {project && (
                <span 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
              )}
              {isOverdue && <AlertTriangle size={12} className="text-red-400" />}
            </div>
          )
        })}
      </div>
    )
  }

  // Full timeline view
  return (
    <div className="space-y-6">
      {Object.entries(groupedTasks).map(([key, group]) => {
        if (group.tasks.length === 0) return null
        
        const Icon = group.icon
        
        return (
          <div key={key}>
            <div className={`flex items-center gap-2 mb-3 ${group.color}`}>
              <Icon size={16} />
              <h3 className="text-sm font-medium">{group.label}</h3>
              <span className="text-xs opacity-60">({group.tasks.length})</span>
            </div>
            
            <div className="space-y-2 pl-6 border-l-2 border-dark-600 ml-2">
              {group.tasks.map(task => {
                const project = getProject(task.projectId)
                
                return (
                  <div 
                    key={task.id}
                    className="relative flex items-start gap-3 p-3 bg-dark-800/30 rounded-xl hover:bg-dark-700/50 transition-colors group -ml-[25px]"
                  >
                    {/* Timeline dot */}
                    <div 
                      className="absolute -left-[9px] top-4 w-4 h-4 rounded-full border-2 border-dark-600 bg-dark-900"
                      style={{ borderColor: project?.color || '#52525b' }}
                    />
                    
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="task-checkbox ml-4"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {project && (
                          <span 
                            className="text-2xs flex items-center gap-1"
                            style={{ color: project.color }}
                          >
                            <DynamicIcon name={project.icon} size={10} />
                            {project.name}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className="text-2xs text-zinc-500">
                            {format(parseISO(task.dueDate), 'MMM d')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Timeline
