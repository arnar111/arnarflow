import React, { useMemo } from 'react'
import useStore from '../store/useStore'

// Helper to get date string
const getDateStr = (date) => date.toISOString().split('T')[0]

// Helper to get start of week (Monday)
const getWeekStart = (date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

// Get last N days
const getLastNDays = (n) => {
  const days = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(getDateStr(d))
  }
  return days
}

export default function StatsView() {
  const tasks = useStore(state => state.tasks)
  const projects = useStore(state => state.projects)
  const habits = useStore(state => state.habits)
  const pomodoroSessions = useStore(state => state.pomodoroSessions || [])
  const accentColor = useStore(state => state.accentColor)

  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date()
    const todayStr = getDateStr(now)
    const weekStart = getWeekStart(now)
    const weekStartStr = getDateStr(weekStart)
    
    // Task stats
    const allTasks = Object.values(tasks)
    const completedTasks = allTasks.filter(t => t.completed)
    const todayCompleted = completedTasks.filter(t => 
      t.completedAt && getDateStr(new Date(t.completedAt)) === todayStr
    )
    const weekCompleted = completedTasks.filter(t => 
      t.completedAt && new Date(t.completedAt) >= weekStart
    )
    
    // Streak calculation
    let currentStreak = 0
    const checkDate = new Date()
    while (true) {
      const dateStr = getDateStr(checkDate)
      const dayCompleted = completedTasks.some(t => 
        t.completedAt && getDateStr(new Date(t.completedAt)) === dateStr
      )
      if (dayCompleted) {
        currentStreak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else if (dateStr !== todayStr) {
        break
      } else {
        checkDate.setDate(checkDate.getDate() - 1)
      }
      if (currentStreak > 365) break // Safety limit
    }
    
    // Pomodoro stats
    const todayPomodoros = pomodoroSessions.filter(s => 
      getDateStr(new Date(s.startTime)) === todayStr
    )
    const weekPomodoros = pomodoroSessions.filter(s => 
      new Date(s.startTime) >= weekStart
    )
    const totalFocusMinutes = pomodoroSessions.reduce((acc, s) => acc + (s.duration || 25), 0)
    const todayFocusMinutes = todayPomodoros.reduce((acc, s) => acc + (s.duration || 25), 0)
    
    // Project stats
    const projectStats = projects.map(p => {
      const projectTasks = allTasks.filter(t => t.projectId === p.id)
      const completed = projectTasks.filter(t => t.completed).length
      const total = projectTasks.length
      return {
        ...p,
        completed,
        total,
        percent: total > 0 ? Math.round((completed / total) * 100) : 0
      }
    }).filter(p => p.total > 0)
    
    // Daily completion chart data (last 7 days)
    const last7Days = getLastNDays(7)
    const dailyData = last7Days.map(dateStr => {
      const count = completedTasks.filter(t => 
        t.completedAt && getDateStr(new Date(t.completedAt)) === dateStr
      ).length
      return { date: dateStr, count }
    })
    const maxDaily = Math.max(...dailyData.map(d => d.count), 1)
    
    // Habit stats
    const habitCompletionRate = habits.length > 0
      ? Math.round(habits.reduce((acc, h) => acc + (h.currentStreak || 0), 0) / habits.length)
      : 0
    
    return {
      // Tasks
      totalTasks: allTasks.length,
      completedTasks: completedTasks.length,
      todayCompleted: todayCompleted.length,
      weekCompleted: weekCompleted.length,
      completionRate: allTasks.length > 0 
        ? Math.round((completedTasks.length / allTasks.length) * 100) 
        : 0,
      currentStreak,
      
      // Pomodoro
      totalPomodoros: pomodoroSessions.length,
      todayPomodoros: todayPomodoros.length,
      weekPomodoros: weekPomodoros.length,
      totalFocusMinutes,
      todayFocusMinutes,
      
      // Projects
      projectStats,
      activeProjects: projects.length,
      
      // Daily chart
      dailyData,
      maxDaily,
      
      // Habits
      totalHabits: habits.length,
      habitCompletionRate,
    }
  }, [tasks, projects, habits, pomodoroSessions])

  const dayNames = ['Sun', 'Mán', 'Þri', 'Mið', 'Fim', 'Fös', 'Lau']

  return (
    <div className="stats-view">
      <div className="stats-header">
        <h1>📊 Tölfræði</h1>
        <p className="stats-subtitle">Yfirlit yfir framleiðni þína</p>
      </div>

      {/* Key Metrics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-value">{stats.currentStreak}</div>
          <div className="stat-label">Daga í röð</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{stats.todayCompleted}</div>
          <div className="stat-label">Lokið í dag</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🍅</div>
          <div className="stat-value">{stats.todayPomodoros}</div>
          <div className="stat-label">Pomodoros í dag</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-value">{Math.round(stats.todayFocusMinutes / 60 * 10) / 10}h</div>
          <div className="stat-label">Einbeiting í dag</div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="stats-section">
        <h2>📈 Síðustu 7 dagar</h2>
        <div className="weekly-chart">
          {stats.dailyData.map((day, i) => {
            const height = (day.count / stats.maxDaily) * 100
            const date = new Date(day.date)
            const dayName = dayNames[date.getDay()]
            const isToday = day.date === getDateStr(new Date())
            
            return (
              <div key={day.date} className={`chart-bar-container ${isToday ? 'today' : ''}`}>
                <div className="chart-bar-wrapper">
                  <div 
                    className="chart-bar"
                    style={{ 
                      height: `${Math.max(height, 5)}%`,
                      background: isToday ? `var(--accent-${accentColor})` : 'var(--bg-tertiary)'
                    }}
                  />
                </div>
                <div className="chart-label">{dayName}</div>
                <div className="chart-count">{day.count}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats-row">
        <div className="stats-section half">
          <h2>📋 Verkefni</h2>
          <div className="summary-stats">
            <div className="summary-item">
              <span className="summary-label">Heildar verkefni</span>
              <span className="summary-value">{stats.totalTasks}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Lokið</span>
              <span className="summary-value">{stats.completedTasks}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Þessa viku</span>
              <span className="summary-value">{stats.weekCompleted}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Completion %</span>
              <span className="summary-value">{stats.completionRate}%</span>
            </div>
          </div>
        </div>

        <div className="stats-section half">
          <h2>🍅 Einbeiting</h2>
          <div className="summary-stats">
            <div className="summary-item">
              <span className="summary-label">Heildar Pomodoros</span>
              <span className="summary-value">{stats.totalPomodoros}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Þessa viku</span>
              <span className="summary-value">{stats.weekPomodoros}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Heildar tími</span>
              <span className="summary-value">{Math.round(stats.totalFocusMinutes / 60)}h</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Venjur aktívar</span>
              <span className="summary-value">{stats.totalHabits}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Project Progress */}
      {stats.projectStats.length > 0 && (
        <div className="stats-section">
          <h2>📁 Framvinda verkefna</h2>
          <div className="project-progress-list">
            {stats.projectStats.map(project => (
              <div key={project.id} className="project-progress-item">
                <div className="project-progress-header">
                  <span className="project-progress-icon">{project.icon}</span>
                  <span className="project-progress-name">{project.name}</span>
                  <span className="project-progress-count">
                    {project.completed}/{project.total}
                  </span>
                </div>
                <div className="project-progress-bar-bg">
                  <div 
                    className="project-progress-bar"
                    style={{ 
                      width: `${project.percent}%`,
                      background: `var(--accent-${accentColor})`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .stats-view {
          padding: 24px;
          max-width: 900px;
          margin: 0 auto;
        }
        
        .stats-header {
          margin-bottom: 32px;
        }
        
        .stats-header h1 {
          font-size: 28px;
          margin: 0 0 8px 0;
        }
        
        .stats-subtitle {
          color: var(--text-secondary);
          margin: 0;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }
        
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        .stat-card {
          background: var(--bg-secondary);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          border: 1px solid var(--border-color);
        }
        
        .stat-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }
        
        .stat-value {
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 4px;
        }
        
        .stat-label {
          font-size: 12px;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .stats-section {
          background: var(--bg-secondary);
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          border: 1px solid var(--border-color);
        }
        
        .stats-section.half {
          flex: 1;
        }
        
        .stats-row {
          display: flex;
          gap: 24px;
        }
        
        @media (max-width: 768px) {
          .stats-row {
            flex-direction: column;
          }
        }
        
        .stats-section h2 {
          font-size: 16px;
          margin: 0 0 16px 0;
          color: var(--text-primary);
        }
        
        .weekly-chart {
          display: flex;
          gap: 12px;
          height: 150px;
          align-items: flex-end;
        }
        
        .chart-bar-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
        }
        
        .chart-bar-container.today {
          font-weight: 600;
        }
        
        .chart-bar-wrapper {
          flex: 1;
          width: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }
        
        .chart-bar {
          width: 100%;
          max-width: 40px;
          border-radius: 6px 6px 0 0;
          transition: height 0.3s ease;
        }
        
        .chart-label {
          font-size: 12px;
          color: var(--text-secondary);
          margin-top: 8px;
        }
        
        .chart-count {
          font-size: 14px;
          font-weight: 600;
          margin-top: 2px;
        }
        
        .summary-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        
        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: var(--bg-tertiary);
          border-radius: 8px;
        }
        
        .summary-label {
          font-size: 13px;
          color: var(--text-secondary);
        }
        
        .summary-value {
          font-size: 18px;
          font-weight: 600;
        }
        
        .project-progress-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .project-progress-item {
          
        }
        
        .project-progress-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        
        .project-progress-icon {
          font-size: 18px;
        }
        
        .project-progress-name {
          flex: 1;
          font-weight: 500;
        }
        
        .project-progress-count {
          font-size: 14px;
          color: var(--text-secondary);
        }
        
        .project-progress-bar-bg {
          height: 8px;
          background: var(--bg-tertiary);
          border-radius: 4px;
          overflow: hidden;
        }
        
        .project-progress-bar {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }
      `}</style>
    </div>
  )
}
