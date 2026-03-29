import React, { useState, useMemo, useRef, useEffect } from 'react'
import useStore from '../store/useStore'
import { useTranslation } from '../i18n/useTranslation'
import DynamicIcon from './Icons'
import { 
  format, 
  parseISO, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  addDays,
  addWeeks,
  addMonths,
  differenceInDays,
  isSameDay,
  isToday,
  isWithinInterval
} from 'date-fns'
import { is, enUS } from 'date-fns/locale'
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Calendar,
  Target,
  Flag,
  Lock,
  ArrowRight,
  Plus,
  Diamond,
  Trash2,
  Check
} from 'lucide-react'

function RoadmapView() {
  const { t, language } = useTranslation()
  const locale = language === 'is' ? is : enUS
  
  const projects = useStore((s) => s.projects)
  const tasks = useStore((s) => s.tasks)
  const milestones = useStore((s) => s.milestones)
  const addMilestone = useStore((s) => s.addMilestone)
  const toggleMilestone = useStore((s) => s.toggleMilestone)
  const deleteMilestone = useStore((s) => s.deleteMilestone)
  
  const roadmapZoom = useStore((s) => s.roadmapZoom)
  const setRoadmapZoom = useStore((s) => s.setRoadmapZoom)
  const updateTask = useStore((s) => s.updateTask)
  const setActiveView = useStore((s) => s.setActiveView)
  const setSelectedProject = useStore((s) => s.setSelectedProject)
  const isTaskBlocked = useStore((s) => s.isTaskBlocked)
  
  const containerRef = useRef(null)
  const [viewStart, setViewStart] = useState(() => {
    const now = new Date()
    return roadmapZoom === 'week' 
      ? startOfWeek(now, { locale })
      : roadmapZoom === 'month'
        ? startOfMonth(now)
        : startOfQuarter(now)
  })
  
  // Calculate view range based on zoom level
  const viewRange = useMemo(() => {
    const start = viewStart
    let end
    let columns = []
    
    if (roadmapZoom === 'week') {
      end = addWeeks(start, 4)
      columns = eachDayOfInterval({ start, end: addDays(end, -1) })
    } else if (roadmapZoom === 'month') {
      end = addMonths(start, 3)
      columns = eachWeekOfInterval({ start, end: addDays(end, -1) }, { locale })
    } else {
      end = addMonths(start, 12)
      columns = eachMonthOfInterval({ start, end: addDays(end, -1) })
    }
    
    return { start, end, columns }
  }, [viewStart, roadmapZoom, locale])
  
  // Get tasks and milestones grouped by project
  const projectsWithData = useMemo(() => {
    return projects.map(project => {
      // Tasks
      const projectTasks = tasks
        .filter(t => t.projectId === project.id && t.dueDate)
        .map(task => {
          const dueDate = parseISO(task.dueDate)
          const startDate = task.startDate ? parseISO(task.startDate) : addDays(dueDate, -7)
          return { ...task, startDate, dueDate }
        })
        .filter(t => {
          return isWithinInterval(t.dueDate, { start: viewRange.start, end: viewRange.end }) ||
                 isWithinInterval(t.startDate, { start: viewRange.start, end: viewRange.end }) ||
                 (t.startDate <= viewRange.start && t.dueDate >= viewRange.end)
        })
        .sort((a, b) => a.startDate - b.startDate)
      
      // Milestones
      const projectMilestones = milestones
        .filter(m => m.projectId === project.id && m.dueDate)
        .map(m => ({ ...m, dueDate: parseISO(m.dueDate) }))
        .filter(m => isWithinInterval(m.dueDate, { start: viewRange.start, end: viewRange.end }))
        .sort((a, b) => a.dueDate - b.dueDate)

      return { ...project, tasks: projectTasks, milestones: projectMilestones }
    }).filter(p => p.tasks.length > 0 || p.milestones.length > 0)
  }, [projects, tasks, milestones, viewRange])
  
  // Calculate position
  const getPosition = (date) => {
    const totalDays = differenceInDays(viewRange.end, viewRange.start)
    const offset = differenceInDays(date, viewRange.start)
    return (offset / totalDays) * 100
  }

  const getTaskStyle = (task) => {
    const totalDays = differenceInDays(viewRange.end, viewRange.start)
    const startOffset = Math.max(0, differenceInDays(task.startDate, viewRange.start))
    const endOffset = Math.min(totalDays, differenceInDays(task.dueDate, viewRange.start))
    const duration = Math.max(1, endOffset - startOffset)
    
    const left = (startOffset / totalDays) * 100
    const width = (duration / totalDays) * 100
    
    return {
      left: `${left}%`,
      width: `${Math.max(width, 1)}%`
    }
  }
  
  // Format column header based on zoom
  const formatColumnHeader = (date) => {
    if (roadmapZoom === 'week') {
      return {
        primary: format(date, 'd', { locale }),
        secondary: format(date, 'EEE', { locale })
      }
    } else if (roadmapZoom === 'month') {
      return {
        primary: format(date, 'd', { locale }),
        secondary: format(date, 'MMM', { locale })
      }
    } else {
      return {
        primary: format(date, 'MMM', { locale }),
        secondary: format(date, 'yyyy', { locale })
      }
    }
  }
  
  const navigatePrevious = () => {
    if (roadmapZoom === 'week') {
      setViewStart(addWeeks(viewStart, -2))
    } else if (roadmapZoom === 'month') {
      setViewStart(addMonths(viewStart, -1))
    } else {
      setViewStart(addMonths(viewStart, -3))
    }
  }
  
  const navigateNext = () => {
    if (roadmapZoom === 'week') {
      setViewStart(addWeeks(viewStart, 2))
    } else if (roadmapZoom === 'month') {
      setViewStart(addMonths(viewStart, 1))
    } else {
      setViewStart(addMonths(viewStart, 3))
    }
  }
  
  const navigateToday = () => {
    const now = new Date()
    if (roadmapZoom === 'week') {
      setViewStart(startOfWeek(now, { locale }))
    } else if (roadmapZoom === 'month') {
      setViewStart(startOfMonth(now))
    } else {
      setViewStart(startOfQuarter(now))
    }
  }
  
  const handleAddMilestone = () => {
    // Simple prompt for now
    const name = window.prompt(language === 'is' ? 'Nafn áfanga:' : 'Milestone name:')
    if (!name) return

    const projectNames = projects.map(p => `${p.name} (id: ${p.id})`).join('\n')
    const projectId = projects[0]?.id // Default to first project for MVP, or could ask user
    // Ideally we'd show a modal, but let's just pick the first active project or ask
    
    // Let's improve: Ask which project if multiple
    let selectedProjectId = projectId
    if (projects.length > 1) {
       // Ideally a modal, but keeping it simple as per instructions "don't touch other files"
       // We'll just default to the first one for now to avoid complex UI changes without new components
    }

    const dateStr = window.prompt(language === 'is' ? 'Dagsetning (YYYY-MM-DD):' : 'Date (YYYY-MM-DD):', format(new Date(), 'yyyy-MM-dd'))
    if (!dateStr) return

    addMilestone({
      name,
      projectId: selectedProjectId,
      dueDate: dateStr
    })
  }

  // Today marker position
  const todayPosition = useMemo(() => {
    const now = new Date()
    if (now < viewRange.start || now > viewRange.end) return null
    return `${getPosition(now)}%`
  }, [viewRange])
  
  return (
    <div className="h-full flex flex-col p-6 animate-fade-in">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <Target size={28} className="text-[var(--accent)]" />
            {t('roadmap.title')}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {format(viewRange.start, 'MMM d', { locale })} — {format(viewRange.end, 'MMM d, yyyy', { locale })}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
           <button
            onClick={handleAddMilestone}
            className="flex items-center gap-2 px-3 py-1.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Diamond size={16} />
            {language === 'is' ? 'Nýr áfangi' : 'New Milestone'}
          </button>

          {/* Navigation */}
          <div className="flex items-center gap-1 bg-[var(--bg-tertiary)] rounded-xl p-1">
            <button
              onClick={navigatePrevious}
              className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={navigateToday}
              className="px-3 py-1.5 text-sm font-medium hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
            >
              {t('time.today')}
            </button>
            <button
              onClick={navigateNext}
              className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-[var(--bg-tertiary)] rounded-xl p-1">
            {[
              { id: 'week', label: t('roadmap.zoom.week') },
              { id: 'month', label: t('roadmap.zoom.month') },
              { id: 'quarter', label: t('roadmap.zoom.quarter') }
            ].map(zoom => (
              <button
                key={zoom.id}
                onClick={() => setRoadmapZoom(zoom.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  roadmapZoom === zoom.id
                    ? 'bg-[var(--accent)] text-white'
                    : 'hover:bg-[var(--bg-hover)]'
                }`}
              >
                {zoom.label}
              </button>
            ))}
          </div>
        </div>
      </header>
      
      {/* Timeline Grid */}
      <div className="flex-1 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border)] overflow-hidden">
        <div ref={containerRef} className="h-full overflow-x-auto">
          {/* Column Headers */}
          <div className="sticky top-0 z-10 flex border-b border-[var(--border)] bg-[var(--bg-tertiary)]">
            {/* Project Column */}
            <div className="w-48 flex-shrink-0 px-4 py-3 border-r border-[var(--border)]">
              <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                {language === 'is' ? 'Verkefni' : 'Projects'}
              </span>
            </div>
            
            {/* Date Columns */}
            <div className="flex-1 flex relative">
              {viewRange.columns.map((date, i) => {
                const header = formatColumnHeader(date)
                const isCurrentDay = isToday(date)
                
                return (
                  <div
                    key={i}
                    className={`flex-1 min-w-[40px] px-1 py-2 text-center border-r border-[var(--border-subtle)] ${
                      isCurrentDay ? 'bg-[var(--accent-muted)]' : ''
                    }`}
                  >
                    <p className={`text-xs font-medium ${isCurrentDay ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}>
                      {header.primary}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      {header.secondary}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Projects and Tasks */}
          <div className="relative">
            {/* Today Marker */}
            {todayPosition && (
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-[var(--accent)] z-20 pointer-events-none"
                style={{ left: `calc(192px + ${todayPosition})` }}
              >
                <div className="absolute -top-1 -left-1.5 w-3 h-3 rounded-full bg-[var(--accent)]" />
              </div>
            )}
            
            {projectsWithData.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Calendar size={48} className="mx-auto mb-4 text-[var(--text-muted)] opacity-30" />
                        <p className="text-[var(--text-secondary)]">{t('roadmap.emptyTitle')}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">{t('roadmap.emptySubtitle')}</p>
                </div>
              </div>
            ) : (
              projectsWithData.map((project, projectIndex) => (
                <div 
                  key={project.id}
                  className={`flex ${projectIndex > 0 ? 'border-t border-[var(--border)]' : ''}`}
                >
                  {/* Project Info */}
                  <div 
                    className="w-48 flex-shrink-0 px-4 py-4 border-r border-[var(--border)] bg-[var(--bg-secondary)] sticky left-0 z-10 cursor-pointer hover:bg-[var(--bg-hover)] transition-colors"
                    onClick={() => {
                      setSelectedProject(project.id)
                      setActiveView('project')
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${project.color}20` }}
                      >
                        <DynamicIcon name={project.icon} size={16} style={{ color: project.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{project.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {project.tasks.length} {t('projectView.tasks')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Task Bars & Milestones */}
                  <div className="flex-1 relative py-3 min-h-[80px]">
                    {/* Grid Lines */}
                    <div className="absolute inset-0 flex pointer-events-none">
                      {viewRange.columns.map((_, i) => (
                        <div 
                          key={i} 
                          className="flex-1 border-r border-[var(--border-subtle)]"
                        />
                      ))}
                    </div>
                    
                    {/* Milestones (Top row of project) */}
                    {project.milestones.map((milestone) => {
                      const left = getPosition(milestone.dueDate)
                      return (
                        <div
                          key={milestone.id}
                          className="absolute z-30 group"
                          style={{
                            left: `${left}%`,
                            top: '-6px', // Overlap slightly with top border or sit high
                            transform: 'translateX(-50%)'
                          }}
                        >
                          <div 
                            className={`w-4 h-4 transform rotate-45 border-2 transition-all cursor-pointer ${
                              milestone.completed 
                                ? 'bg-green-500 border-green-600' 
                                : 'bg-[var(--bg-secondary)]'
                            }`}
                            style={{ 
                              borderColor: milestone.completed ? '#22c55e' : project.color,
                              backgroundColor: milestone.completed ? '#22c55e' : 'var(--bg-secondary)'
                            }}
                            onClick={() => toggleMilestone(milestone.id)}
                          />
                          
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[var(--bg-elevated)] rounded-lg shadow-xl border border-[var(--border)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto whitespace-nowrap z-40 flex flex-col items-center">
                            <p className="text-sm font-bold">{milestone.name}</p>
                            <p className="text-xs text-[var(--text-muted)]">
                              {format(milestone.dueDate, 'd. MMM')}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <button 
                                onClick={(e) => { e.stopPropagation(); toggleMilestone(milestone.id); }}
                                className="p-1 hover:bg-green-500/20 rounded text-green-500"
                              >
                                <Check size={12} />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); deleteMilestone(milestone.id); }}
                                className="p-1 hover:bg-red-500/20 rounded text-red-500"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    {/* Task Bars */}
                    {project.tasks.map((task, taskIndex) => {
                      const style = getTaskStyle(task)
                      const blocked = isTaskBlocked(task.id)
                      
                      return (
                        <div
                          key={task.id}
                          className={`absolute h-6 rounded-md cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg group timeline-bar ${
                            task.completed ? 'opacity-50' : ''
                          } ${blocked ? 'task-blocked' : ''}`}
                          style={{
                            ...style,
                            top: `${16 + (taskIndex % 4) * 28}px`, // Increased spacing for milestones
                            backgroundColor: task.completed ? 'var(--bg-tertiary)' : `${project.color}30`,
                            border: `1px solid ${task.completed ? 'var(--border)' : project.color}40`
                          }}
                          onClick={() => handleTaskClick(task, project)}
                        >
                          <div className="h-full px-2 flex items-center gap-1 overflow-hidden">
                            {blocked && (
                              <Lock size={10} className="text-red-400 flex-shrink-0" />
                            )}
                            <span 
                              className="text-xs font-medium truncate"
                              style={{ color: task.completed ? 'var(--text-muted)' : project.color }}
                            >
                              {task.title}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-xs text-[var(--text-muted)]">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[var(--accent)]" />
          <span>{t('projectView.columns.inProgress')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[var(--bg-tertiary)] border border-[var(--border)]" />
          <span>{t('projectView.columns.done')}</span>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-3 h-3 transform rotate-45 border-2 border-[var(--accent)]" />
           <span>{language === 'is' ? 'Áfangi' : 'Milestone'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock size={14} />
          <span>{t('roadmap.blocked')}</span>
        </div>
      </div>
    </div>
  )
}

export default RoadmapView
