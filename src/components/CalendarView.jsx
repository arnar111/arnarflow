import React, { useState, useMemo } from 'react'
import useStore from '../store/useStore'
import { useTranslation } from '../i18n/useTranslation'
import DynamicIcon from './Icons'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay, 
  isToday,
  addMonths,
  subMonths,
  parseISO,
  isPast
} from 'date-fns'
import { is, enUS } from 'date-fns/locale'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle
} from 'lucide-react'

function CalendarView() {
  const { t, language } = useTranslation()
  const { tasks, projects, toggleTask, setActiveView, setSelectedProject } = useStore()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  const locale = language === 'is' ? is : enUS

  // Get all days to display in the calendar grid
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const days = []
    let day = startDate

    while (day <= endDate) {
      days.push(day)
      day = addDays(day, 1)
    }

    return days
  }, [currentMonth])

  // Get tasks for a specific date
  const getTasksForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return tasks.filter(t => t.dueDate === dateStr)
  }

  // Get tasks for selected date
  const selectedDateTasks = useMemo(() => {
    return getTasksForDate(selectedDate)
  }, [selectedDate, tasks])

  // Get project by ID
  const getProject = (projectId) => projects.find(p => p.id === projectId)

  // Navigate months
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const goToToday = () => {
    setCurrentMonth(new Date())
    setSelectedDate(new Date())
  }

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header */}
      <header className="px-8 pt-8 pb-6 border-b border-dark-600/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 flex items-center justify-center">
              <Calendar size={24} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t('calendarView.title')}</h1>
              <p className="text-sm text-zinc-500">{t('calendarView.subtitle')}</p>
            </div>
          </div>
          
          {/* Month Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-xs font-medium bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
            >
              {t('calendarView.today')}
            </button>
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-lg font-semibold min-w-[160px] text-center">
              {format(currentMonth, 'MMMM yyyy', { locale })}
            </span>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Calendar Grid */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {t('calendarView.weekdays').map(day => (
              <div key={day} className="text-center text-xs font-medium text-zinc-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              const dayTasks = getTasksForDate(day)
              const isCurrentMonth = isSameMonth(day, currentMonth)
              const isSelected = isSameDay(day, selectedDate)
              const isTodayDate = isToday(day)
              const hasOverdue = dayTasks.some(t => !t.completed && isPast(day) && !isToday(day))
              
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    relative min-h-[80px] p-2 rounded-xl text-left transition-all
                    ${isCurrentMonth ? 'bg-dark-800/30' : 'bg-dark-900/50 opacity-40'}
                    ${isSelected ? 'ring-2 ring-accent bg-dark-700' : 'hover:bg-dark-700/50'}
                    ${isTodayDate ? 'bg-accent/10' : ''}
                  `}
                >
                  {/* Day Number */}
                  <span className={`
                    text-sm font-medium
                    ${isTodayDate ? 'w-7 h-7 rounded-full bg-accent flex items-center justify-center' : ''}
                    ${!isCurrentMonth ? 'text-zinc-600' : ''}
                  `}>
                    {format(day, 'd')}
                  </span>

                  {/* Task Dots */}
                  {dayTasks.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {dayTasks.slice(0, 3).map(task => {
                        const project = getProject(task.projectId)
                        return (
                          <div 
                            key={task.id}
                            className={`text-2xs truncate px-1 py-0.5 rounded ${
                              task.completed ? 'line-through opacity-50' : ''
                            }`}
                            style={{ 
                              backgroundColor: `${project?.color || '#6366f1'}20`,
                              color: project?.color || '#6366f1'
                            }}
                          >
                            {task.title}
                          </div>
                        )
                      })}
                      {dayTasks.length > 3 && (
                        <span className="text-2xs text-zinc-500">
                          +{dayTasks.length - 3} {t('projectView.more')}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Overdue indicator */}
                  {hasOverdue && (
                    <div className="absolute top-1 right-1">
                      <AlertTriangle size={12} className="text-red-400" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected Date Sidebar */}
        <div className="w-80 border-l border-dark-600/30 bg-dark-800/20 flex flex-col">
          <div className="p-4 border-b border-dark-600/30">
            <h2 className="font-semibold">
              {isToday(selectedDate) ? t('calendarView.today') : format(selectedDate, 'EEEE, MMM d', { locale })}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {selectedDateTasks.length} {selectedDateTasks.length === 1 ? t('calendarView.task') : t('calendarView.tasks')}
            </p>
          </div>

          <div className="flex-1 overflow-auto p-4">
            {selectedDateTasks.length === 0 ? (
              <div className="text-center py-8">
                <Calendar size={32} className="mx-auto text-zinc-700 mb-2" />
                <p className="text-sm text-zinc-500">{t('calendarView.noTasksDue')}</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {selectedDateTasks.map(task => {
                  const project = getProject(task.projectId)
                  return (
                    <li 
                      key={task.id}
                      className="flex items-start gap-3 p-3 bg-dark-800/50 rounded-xl hover:bg-dark-700 transition-colors group"
                    >
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`mt-0.5 task-checkbox ${task.completed ? 'checked' : ''}`}
                      >
                        {task.completed && <CheckCircle2 size={12} className="text-white" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${task.completed ? 'line-through text-zinc-500' : ''}`}>
                          {task.title}
                        </p>
                        {project && (
                          <button
                            onClick={() => {
                              setActiveView('project')
                              setSelectedProject(project.id)
                            }}
                            className="flex items-center gap-1 mt-1 text-2xs hover:underline"
                            style={{ color: project.color }}
                          >
                            <DynamicIcon name={project.icon} size={10} />
                            {project.name}
                          </button>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalendarView
