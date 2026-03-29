import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import useStore from '../store/useStore'
import { useTranslation } from '../i18n/useTranslation'
import DynamicIcon from './Icons'
import * as chrono from 'chrono-node'
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
  addWeeks,
  subWeeks,
  parseISO,
  isPast,
  getHours,
  setHours,
  setMinutes
} from 'date-fns'
import { is, enUS } from 'date-fns/locale'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Plus,
  Sparkles,
  Target,
  ChefHat,
  CreditCard,
  Zap,
  LayoutGrid,
  List,
  X
} from 'lucide-react'

// ── Item type colors & icons for the hub ──
const ITEM_TYPES = {
  task: { color: '#6366f1', icon: CheckCircle2, label: 'Task', labelIs: 'Verkefni' },
  event: { color: '#3b82f6', icon: Calendar, label: 'Event', labelIs: 'Viðburður' },
  habit: { color: '#22c55e', icon: Target, label: 'Habit', labelIs: 'Vani' },
  meal: { color: '#f59e0b', icon: ChefHat, label: 'Meal', labelIs: 'Máltíð' },
  bill: { color: '#ef4444', icon: CreditCard, label: 'Bill', labelIs: 'Reikningur' },
}

// ── Quick Add with chrono-node ──
function QuickAddBar({ selectedDate, language, onAdd }) {
  const [input, setInput] = useState('')
  const [parsed, setParsed] = useState(null)
  const inputRef = useRef(null)

  const handleChange = (val) => {
    setInput(val)
    if (val.trim().length > 3) {
      const results = chrono.parse(val, new Date(), { forwardDate: true })
      if (results.length > 0) {
        const r = results[0]
        setParsed({
          text: val.replace(r.text, '').trim() || val,
          date: r.start.date(),
          timeFound: r.start.isCertain('hour'),
          originalMatch: r.text
        })
      } else {
        setParsed(null)
      }
    } else {
      setParsed(null)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    const title = parsed ? parsed.text || input.trim() : input.trim()
    const date = parsed?.date || selectedDate
    const hasTime = parsed?.timeFound || false
    onAdd({ title, date, hasTime })
    setInput('')
    setParsed(null)
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl px-3 py-2">
        <Plus size={16} className="text-[var(--text-muted)] flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={language === 'is' ? 'Bæta við... (t.d. "Fundur á föstudag kl 14")' : 'Add... (e.g. "Meeting on Friday at 2pm")'}
          className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none"
        />
        {input && (
          <button type="button" onClick={() => { setInput(''); setParsed(null) }} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <X size={14} />
          </button>
        )}
      </div>
      {parsed && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text-secondary)] z-10 shadow-lg">
          <Sparkles size={12} className="inline mr-1 text-[var(--accent)]" />
          {language === 'is' ? 'Greint: ' : 'Parsed: '}
          <span className="text-[var(--text-primary)] font-medium">
            {format(parsed.date, parsed.timeFound ? 'EEE d. MMM, HH:mm' : 'EEE d. MMM', { locale: language === 'is' ? is : enUS })}
          </span>
          {parsed.text && parsed.text !== input.trim() && (
            <span className="ml-2">— "{parsed.text}"</span>
          )}
        </div>
      )}
    </form>
  )
}

// ── Week View (time-blocking style) ──
function WeekView({ weekStart, items, language, locale, onSelectDate, selectedDate, onItemClick }) {
  const hours = Array.from({ length: 16 }, (_, i) => i + 7) // 07:00 - 22:00
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const getItemsForDayHour = (day, hour) => {
    const dateStr = format(day, 'yyyy-MM-dd')
    return items.filter(item => {
      if (item.dateStr !== dateStr) return false
      if (item.hour != null) return item.hour === hour
      return hour === 9 // default slot for all-day items
    })
  }

  return (
    <div className="flex-1 overflow-auto">
      {/* Day headers */}
      <div className="sticky top-0 z-10 bg-[var(--bg-primary)] grid grid-cols-[60px_repeat(7,1fr)] border-b border-[var(--border)]">
        <div className="p-2 text-xs text-[var(--text-muted)]" />
        {days.map((day) => (
          <button
            key={day.toISOString()}
            onClick={() => onSelectDate(day)}
            className={`p-2 text-center border-l border-[var(--border)] transition-colors ${
              isSameDay(day, selectedDate) ? 'bg-[var(--accent)]/10' : 'hover:bg-[var(--bg-hover)]'
            }`}
          >
            <div className="text-xs text-[var(--text-muted)]">
              {format(day, 'EEE', { locale })}
            </div>
            <div className={`text-lg font-semibold ${isToday(day) ? 'w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center mx-auto' : ''}`}>
              {format(day, 'd')}
            </div>
          </button>
        ))}
      </div>

      {/* Time grid */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)]">
        {hours.map((hour) => (
          <React.Fragment key={hour}>
            <div className="p-1 text-right text-xs text-[var(--text-muted)] border-b border-[var(--border)] h-14 flex items-start justify-end pr-2 pt-1">
              {String(hour).padStart(2, '0')}:00
            </div>
            {days.map((day) => {
              const dayItems = getItemsForDayHour(day, hour)
              return (
                <div
                  key={`${day.toISOString()}-${hour}`}
                  className="border-l border-b border-[var(--border)] h-14 p-0.5 relative hover:bg-[var(--bg-hover)]/30 transition-colors"
                >
                  {dayItems.map((item) => {
                    const typeInfo = ITEM_TYPES[item.type] || ITEM_TYPES.task
                    return (
                      <div
                        key={item.id}
                        onClick={() => onItemClick?.(item)}
                        className="text-2xs px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80 transition-opacity"
                        style={{
                          backgroundColor: `${item.color || typeInfo.color}20`,
                          color: item.color || typeInfo.color,
                          borderLeft: `2px solid ${item.color || typeInfo.color}`
                        }}
                        title={item.title}
                      >
                        {item.title}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

// ── Filter chips ──
function FilterChips({ filters, setFilters, language }) {
  const types = Object.entries(ITEM_TYPES)
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {types.map(([key, info]) => {
        const active = filters.includes(key)
        const Icon = info.icon
        return (
          <button
            key={key}
            onClick={() => {
              if (active) setFilters(filters.filter(f => f !== key))
              else setFilters([...filters, key])
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all ${
              active 
                ? 'text-white' 
                : 'text-[var(--text-muted)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)]'
            }`}
            style={active ? { backgroundColor: info.color } : {}}
          >
            <Icon size={12} />
            {language === 'is' ? info.labelIs : info.label}
          </button>
        )
      })}
    </div>
  )
}

// ── Main CalendarView ──
function CalendarView() {
  const { t, language } = useTranslation()
  const tasks = useStore(state => state.tasks)
  const projects = useStore(state => state.projects)
  const habits = useStore(state => state.habits)
  const habitLogs = useStore(state => state.habitLogs)
  const calendarEvents = useStore(state => state.calendarEvents)
  const mealPlanEntries = useStore(state => state.mealPlanEntries) || []
  const recipes = useStore(state => state.recipes) || []
  const toggleTask = useStore(state => state.toggleTask)
  const addCalendarEvent = useStore(state => state.addCalendarEvent)
  const setActiveView = useStore(state => state.setActiveView)
  const setSelectedProject = useStore(state => state.setSelectedProject)

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('month') // 'month' | 'week'
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [filters, setFilters] = useState(['task', 'event', 'habit', 'meal', 'bill'])

  const locale = language === 'is' ? is : enUS

  // ── Unified items for any date ──
  const getItemsForDate = useCallback((dateStr) => {
    const items = []

    // Tasks with due dates
    if (filters.includes('task')) {
      tasks.filter(t => t.dueDate === dateStr).forEach(task => {
        const project = projects.find(p => p.id === task.projectId)
        items.push({
          id: `task-${task.id}`,
          type: 'task',
          title: task.title,
          dateStr,
          hour: null,
          completed: task.completed,
          color: project?.color,
          taskId: task.id,
          projectId: task.projectId,
        })
      })
    }

    // Calendar events
    if (filters.includes('event')) {
      calendarEvents.filter(e => {
        const eDate = e.date || (e.start && e.start.slice(0, 10))
        return eDate === dateStr
      }).forEach(event => {
        const startHour = event.start ? parseInt(event.start.slice(11, 13)) : null
        items.push({
          id: `event-${event.id}`,
          type: 'event',
          title: event.title || event.summary || 'Event',
          dateStr,
          hour: startHour,
          color: '#3b82f6',
        })
      })
    }

    // Habits (show as indicators)
    if (filters.includes('habit')) {
      const completedHabits = habits.filter(h => {
        const log = habitLogs[`${h.id}-${dateStr}`]
        return log === true || log === 'done'
      })
      const totalHabits = habits.length
      if (totalHabits > 0) {
        items.push({
          id: `habits-${dateStr}`,
          type: 'habit',
          title: `${language === 'is' ? 'Vanir' : 'Habits'}: ${completedHabits.length}/${totalHabits}`,
          dateStr,
          hour: 7, // morning slot
          color: '#22c55e',
          completed: completedHabits.length === totalHabits,
        })
      }
    }

    // Meal plan
    if (filters.includes('meal')) {
      mealPlanEntries.filter(m => m.dateISO === dateStr).forEach(meal => {
        const recipe = meal.recipeId ? recipes.find(r => r.id === meal.recipeId) : null
        items.push({
          id: `meal-${meal.id || dateStr + meal.slot}`,
          type: 'meal',
          title: recipe?.name || meal.note || `${meal.slot === 'lunch' ? '🍽️ Lunch' : '🍽️ Dinner'}`,
          dateStr,
          hour: meal.slot === 'lunch' ? 12 : 18,
          color: '#f59e0b',
        })
      })
    }

    return items
  }, [tasks, projects, calendarEvents, habits, habitLogs, mealPlanEntries, recipes, filters, language])

  // ── Month view data ──
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

  // Week view items
  const weekItems = useMemo(() => {
    if (viewMode !== 'week') return []
    const items = []
    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i)
      const dateStr = format(day, 'yyyy-MM-dd')
      items.push(...getItemsForDate(dateStr))
    }
    return items
  }, [weekStart, viewMode, getItemsForDate])

  // Selected date items
  const selectedDateItems = useMemo(() => {
    return getItemsForDate(format(selectedDate, 'yyyy-MM-dd'))
  }, [selectedDate, getItemsForDate])

  const getProject = (projectId) => projects.find(p => p.id === projectId)

  // Navigation
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevWeek = () => setWeekStart(subWeeks(weekStart, 1))
  const nextWeek = () => setWeekStart(addWeeks(weekStart, 1))

  const goToToday = () => {
    setCurrentMonth(new Date())
    setSelectedDate(new Date())
    setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))
  }

  // Quick add handler (chrono-node parsed)
  const handleQuickAdd = ({ title, date, hasTime }) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    if (hasTime) {
      // Create calendar event with time
      addCalendarEvent({
        id: `evt-${Date.now()}`,
        title,
        date: dateStr,
        start: format(date, "yyyy-MM-dd'T'HH:mm"),
        end: format(setMinutes(setHours(date, getHours(date) + 1), 0), "yyyy-MM-dd'T'HH:mm"),
        allDay: false,
        createdAt: new Date().toISOString(),
      })
    } else {
      // Create as task with due date
      const { addTask } = useStore.getState()
      if (addTask) {
        addTask({ title, dueDate: dateStr })
      }
    }
    setSelectedDate(date)
  }

  const isMonthView = viewMode === 'month'

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header */}
      <header className="px-8 pt-6 pb-4 border-b border-[var(--border)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 flex items-center justify-center">
              <Calendar size={24} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t('calendarView.title')}</h1>
              <p className="text-sm text-[var(--text-muted)]">{language === 'is' ? 'Allt á einum stað — tasks, viðburðir, vanir, máltíðir' : 'Everything in one place — tasks, events, habits, meals'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex items-center bg-[var(--bg-secondary)] rounded-lg p-0.5 border border-[var(--border)]">
              <button
                onClick={() => setViewMode('month')}
                className={`p-1.5 rounded-md transition-all ${isMonthView ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                title={language === 'is' ? 'Mánuður' : 'Month'}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => {
                  setViewMode('week')
                  setWeekStart(startOfWeek(selectedDate, { weekStartsOn: 1 }))
                }}
                className={`p-1.5 rounded-md transition-all ${!isMonthView ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                title={language === 'is' ? 'Vika' : 'Week'}
              >
                <CalendarDays size={16} />
              </button>
            </div>

            {/* Navigation */}
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border)] rounded-lg transition-colors"
            >
              {t('calendarView.today')}
            </button>
            <button onClick={isMonthView ? prevMonth : prevWeek} className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors">
              <ChevronLeft size={18} />
            </button>
            <span className="text-lg font-semibold min-w-[180px] text-center">
              {isMonthView 
                ? format(currentMonth, 'MMMM yyyy', { locale })
                : `${format(weekStart, 'd. MMM', { locale })} – ${format(addDays(weekStart, 6), 'd. MMM yyyy', { locale })}`
              }
            </span>
            <button onClick={isMonthView ? nextMonth : nextWeek} className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Quick Add + Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-lg">
            <QuickAddBar selectedDate={selectedDate} language={language} onAdd={handleQuickAdd} />
          </div>
          <FilterChips filters={filters} setFilters={setFilters} language={language} />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {isMonthView ? (
          <>
            {/* Month Calendar Grid */}
            <div className="flex-1 p-6 overflow-auto">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {(t('calendarView.weekdays') || ['Mán','Þri','Mið','Fim','Fös','Lau','Sun']).map(day => (
                  <div key={day} className="text-center text-xs font-medium text-[var(--text-muted)] py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, i) => {
                  const dateStr = format(day, 'yyyy-MM-dd')
                  const dayItems = getItemsForDate(dateStr)
                  const isCurrentMonth = isSameMonth(day, currentMonth)
                  const isSelected = isSameDay(day, selectedDate)
                  const isTodayDate = isToday(day)
                  const hasOverdue = dayItems.some(item => item.type === 'task' && !item.completed && isPast(day) && !isToday(day))
                  
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(day)}
                      onDoubleClick={() => {
                        setSelectedDate(day)
                        setViewMode('week')
                        setWeekStart(startOfWeek(day, { weekStartsOn: 1 }))
                      }}
                      className={`
                        relative min-h-[80px] p-2 rounded-xl text-left transition-all
                        ${isCurrentMonth ? 'bg-[var(--bg-secondary)]/30' : 'bg-[var(--bg-primary)]/50 opacity-40'}
                        ${isSelected ? 'ring-2 ring-[var(--accent)] bg-[var(--bg-hover)]' : 'hover:bg-[var(--bg-hover)]/50'}
                        ${isTodayDate ? 'bg-[var(--accent)]/10' : ''}
                      `}
                    >
                      <span className={`
                        text-sm font-medium
                        ${isTodayDate ? 'w-7 h-7 rounded-full bg-[var(--accent)] text-white flex items-center justify-center' : ''}
                        ${!isCurrentMonth ? 'text-zinc-600' : ''}
                      `}>
                        {format(day, 'd')}
                      </span>

                      {dayItems.length > 0 && (
                        <div className="mt-1 space-y-0.5">
                          {dayItems.slice(0, 3).map(item => {
                            const typeInfo = ITEM_TYPES[item.type]
                            return (
                              <div 
                                key={item.id}
                                className={`text-2xs truncate px-1 py-0.5 rounded ${
                                  item.completed ? 'line-through opacity-50' : ''
                                }`}
                                style={{ 
                                  backgroundColor: `${item.color || typeInfo.color}20`,
                                  color: item.color || typeInfo.color
                                }}
                              >
                                {item.title}
                              </div>
                            )
                          })}
                          {dayItems.length > 3 && (
                            <span className="text-2xs text-[var(--text-muted)]">
                              +{dayItems.length - 3}
                            </span>
                          )}
                        </div>
                      )}

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
            <div className="w-80 border-l border-[var(--border)] bg-[var(--bg-secondary)]/20 flex flex-col">
              <div className="p-4 border-b border-[var(--border)]">
                <h2 className="font-semibold">
                  {isToday(selectedDate) ? (language === 'is' ? 'Í dag' : 'Today') : format(selectedDate, 'EEEE, d. MMM', { locale })}
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {selectedDateItems.length} {language === 'is' ? 'atriði' : 'items'}
                </p>
              </div>

              <div className="flex-1 overflow-auto p-4">
                {selectedDateItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar size={32} className="mx-auto text-zinc-700 mb-2" />
                    <p className="text-sm text-[var(--text-muted)]">{language === 'is' ? 'Ekkert á dagskrá' : 'Nothing scheduled'}</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {selectedDateItems.map(item => {
                      const typeInfo = ITEM_TYPES[item.type]
                      const Icon = typeInfo.icon
                      const project = item.projectId ? getProject(item.projectId) : null
                      return (
                        <li 
                          key={item.id}
                          className="flex items-start gap-3 p-3 bg-[var(--bg-secondary)]/50 rounded-xl hover:bg-[var(--bg-hover)] transition-colors group"
                        >
                          <div 
                            className="mt-0.5 w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${item.color || typeInfo.color}20` }}
                          >
                            {item.type === 'task' ? (
                              <button onClick={() => toggleTask(item.taskId)}>
                                {item.completed 
                                  ? <CheckCircle2 size={14} style={{ color: item.color || typeInfo.color }} />
                                  : <Circle size={14} style={{ color: item.color || typeInfo.color }} />
                                }
                              </button>
                            ) : (
                              <Icon size={14} style={{ color: item.color || typeInfo.color }} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${item.completed ? 'line-through text-[var(--text-muted)]' : ''}`}>
                              {item.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span 
                                className="text-2xs px-1.5 py-0.5 rounded"
                                style={{ backgroundColor: `${typeInfo.color}20`, color: typeInfo.color }}
                              >
                                {language === 'is' ? typeInfo.labelIs : typeInfo.label}
                              </span>
                              {item.hour != null && (
                                <span className="text-2xs text-[var(--text-muted)] flex items-center gap-0.5">
                                  <Clock size={10} />
                                  {String(item.hour).padStart(2, '0')}:00
                                </span>
                              )}
                              {project && (
                                <button
                                  onClick={() => {
                                    setActiveView('project')
                                    setSelectedProject(project.id)
                                  }}
                                  className="text-2xs hover:underline"
                                  style={{ color: project.color }}
                                >
                                  {project.name}
                                </button>
                              )}
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Week View */
          <WeekView
            weekStart={weekStart}
            items={weekItems}
            language={language}
            locale={locale}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        )}
      </div>
    </div>
  )
}

export default CalendarView
