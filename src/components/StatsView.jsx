import React, { useMemo, useState, useEffect } from 'react'
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

// Animated counter hook
const useAnimatedValue = (targetValue, duration = 800) => {
  const [value, setValue] = useState(0)
  
  useEffect(() => {
    let startTime
    let animationFrame
    const startValue = value
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(startValue + (targetValue - startValue) * eased))
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }
    
    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [targetValue])
  
  return value
}

// Sparkline mini chart
const Sparkline = ({ data, color = 'var(--accent)', height = 32 }) => {
  const max = Math.max(...data, 1)
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 100 - (v / max) * 100
    return `${x},${y}`
  }).join(' ')
  
  const areaPoints = `0,100 ${points} 100,100`
  const gradId = `spark-${Math.random().toString(36).substr(2, 9)}`
  
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#${gradId})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

// Animated progress ring
const ProgressRing = ({ progress, size = 120, strokeWidth = 8, color = 'var(--accent)' }) => {
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (animatedProgress / 100) * circumference
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(progress), 100)
    return () => clearTimeout(timer)
  }, [progress])
  
  return (
    <svg width={size} height={size} className="progress-ring">
      <defs>
        <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor="var(--accent-hover)" />
        </linearGradient>
      </defs>
      <circle
        stroke="var(--border)"
        strokeWidth={strokeWidth}
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        stroke="url(#ring-gradient)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
        style={{
          strokeDasharray: circumference,
          strokeDashoffset: offset,
          transform: 'rotate(-90deg)',
          transformOrigin: '50% 50%',
          transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />
    </svg>
  )
}

// Area chart component
const AreaChart = ({ data, labels, height = 180 }) => {
  const maxValue = Math.max(...data, 1)
  const padding = { top: 20, right: 16, bottom: 32, left: 16 }
  const chartWidth = 100
  const chartHeight = height - padding.top - padding.bottom
  
  const points = data.map((value, index) => {
    const x = padding.left + (index / (data.length - 1)) * (chartWidth - padding.left - padding.right)
    const y = padding.top + chartHeight - (value / maxValue) * chartHeight
    return { x, y, value }
  })
  
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`
  
  return (
    <svg viewBox={`0 0 ${chartWidth} ${height}`} preserveAspectRatio="none" className="area-chart">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
        <line
          key={i}
          x1={padding.left}
          y1={padding.top + chartHeight * (1 - ratio)}
          x2={chartWidth - padding.right}
          y2={padding.top + chartHeight * (1 - ratio)}
          stroke="var(--border)"
          strokeWidth="0.5"
          strokeDasharray="2,2"
          opacity="0.5"
        />
      ))}
      
      <path d={areaPath} fill="url(#areaGrad)" className="area-fill" />
      <path
        d={linePath}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glow)"
        className="area-line"
      />
      
      {points.map((p, i) => (
        <g key={i} className="data-point">
          <circle cx={p.x} cy={p.y} r="3" fill="var(--bg-primary)" stroke="var(--accent)" strokeWidth="2" />
        </g>
      ))}
      
      {labels.map((label, i) => (
        <text
          key={i}
          x={points[i]?.x || 0}
          y={height - 8}
          textAnchor="middle"
          fill="var(--text-muted)"
          fontSize="8"
          fontFamily="Inter"
        >
          {label}
        </text>
      ))}
    </svg>
  )
}

// Metric card with trend
const MetricCard = ({ icon, value, label, trend, trendValue, sparkData, delay = 0 }) => {
  const animatedValue = useAnimatedValue(typeof value === 'number' ? value : 0)
  const displayValue = typeof value === 'number' ? animatedValue : value
  
  return (
    <div className="metric-card" style={{ animationDelay: `${delay}ms` }}>
      <div className="metric-card-header">
        <div className="metric-icon">{icon}</div>
        {trend && (
          <div className={`metric-trend ${trend}`}>
            <span className="trend-arrow">{trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}</span>
            <span className="trend-value">{trendValue}</span>
          </div>
        )}
      </div>
      <div className="metric-value">{displayValue}</div>
      <div className="metric-label">{label}</div>
      {sparkData && sparkData.length > 0 && (
        <div className="metric-spark">
          <Sparkline data={sparkData} color={trend === 'up' ? 'var(--success)' : trend === 'down' ? 'var(--error)' : 'var(--accent)'} />
        </div>
      )}
    </div>
  )
}

// Project progress card
const ProjectCard = ({ project, index }) => (
  <div className="project-card" style={{ animationDelay: `${index * 50}ms` }}>
    <div className="project-card-left">
      <span className="project-icon">{project.icon}</span>
      <div className="project-info">
        <span className="project-name">{project.name}</span>
        <span className="project-count">{project.completed} / {project.total} verkefni</span>
      </div>
    </div>
    <div className="project-card-right">
      <div className="project-percent">{project.percent}%</div>
      <div className="project-bar-container">
        <div className="project-bar" style={{ width: `${project.percent}%`, transitionDelay: `${index * 50 + 300}ms` }} />
      </div>
    </div>
  </div>
)

export default function StatsView() {
  const tasks = useStore(state => state.tasks)
  const projects = useStore(state => state.projects)
  const habits = useStore(state => state.habits)
  const pomodoroSessions = useStore(state => state.pomodoroSessions || [])
  const accentColor = useStore(state => state.accentColor)

  const stats = useMemo(() => {
    const now = new Date()
    const todayStr = getDateStr(now)
    const weekStart = getWeekStart(now)
    
    const allTasks = Object.values(tasks)
    const completedTasks = allTasks.filter(t => t.completed)
    const todayCompleted = completedTasks.filter(t => t.completedAt && getDateStr(new Date(t.completedAt)) === todayStr)
    const weekCompleted = completedTasks.filter(t => t.completedAt && new Date(t.completedAt) >= weekStart)
    
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = getDateStr(yesterday)
    const yesterdayCompleted = completedTasks.filter(t => t.completedAt && getDateStr(new Date(t.completedAt)) === yesterdayStr)
    
    let currentStreak = 0
    const checkDate = new Date()
    while (true) {
      const dateStr = getDateStr(checkDate)
      const dayCompleted = completedTasks.some(t => t.completedAt && getDateStr(new Date(t.completedAt)) === dateStr)
      if (dayCompleted) {
        currentStreak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else if (dateStr !== todayStr) {
        break
      } else {
        checkDate.setDate(checkDate.getDate() - 1)
      }
      if (currentStreak > 365) break
    }
    
    const todayPomodoros = pomodoroSessions.filter(s => getDateStr(new Date(s.startTime)) === todayStr)
    const weekPomodoros = pomodoroSessions.filter(s => new Date(s.startTime) >= weekStart)
    const totalFocusMinutes = pomodoroSessions.reduce((acc, s) => acc + (s.duration || 25), 0)
    const todayFocusMinutes = todayPomodoros.reduce((acc, s) => acc + (s.duration || 25), 0)
    
    const projectStats = projects.map(p => {
      const projectTasks = allTasks.filter(t => t.projectId === p.id)
      const completed = projectTasks.filter(t => t.completed).length
      const total = projectTasks.length
      return { ...p, completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 }
    }).filter(p => p.total > 0)
    
    const last7Days = getLastNDays(7)
    const dailyData = last7Days.map(dateStr => {
      const count = completedTasks.filter(t => t.completedAt && getDateStr(new Date(t.completedAt)) === dateStr).length
      return { date: dateStr, count }
    })
    
    const pomodoroDaily = last7Days.map(dateStr => pomodoroSessions.filter(s => getDateStr(new Date(s.startTime)) === dateStr).length)
    
    return {
      totalTasks: allTasks.length,
      completedTasks: completedTasks.length,
      todayCompleted: todayCompleted.length,
      yesterdayCompleted: yesterdayCompleted.length,
      weekCompleted: weekCompleted.length,
      completionRate: allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0,
      currentStreak,
      totalPomodoros: pomodoroSessions.length,
      todayPomodoros: todayPomodoros.length,
      weekPomodoros: weekPomodoros.length,
      totalFocusMinutes,
      todayFocusMinutes,
      pomodoroDaily,
      projectStats,
      activeProjects: projects.length,
      dailyData,
      dailyCounts: dailyData.map(d => d.count),
      totalHabits: habits.length,
    }
  }, [tasks, projects, habits, pomodoroSessions])

  const dayNames = ['Sun', 'Mán', 'Þri', 'Mið', 'Fim', 'Fös', 'Lau']
  const shortDayNames = stats.dailyData.map(d => dayNames[new Date(d.date).getDay()])
  const todayTrend = stats.todayCompleted > stats.yesterdayCompleted ? 'up' : stats.todayCompleted < stats.yesterdayCompleted ? 'down' : 'neutral'
  const todayTrendValue = stats.todayCompleted - stats.yesterdayCompleted

  return (
    <div className="stats-view">
      <div className="stats-bg-gradient" />
      
      <header className="stats-header">
        <div className="stats-header-content">
          <h1>Tölfræði</h1>
          <p className="stats-subtitle">Yfirlit yfir framleiðni þína</p>
        </div>
        <div className="stats-header-decoration">
          <div className="decoration-ring" />
          <div className="decoration-ring" />
          <div className="decoration-ring" />
        </div>
      </header>

      <section className="metrics-section">
        <div className="metrics-grid">
          <MetricCard icon="🔥" value={stats.currentStreak} label="Daga í röð" trend={stats.currentStreak > 0 ? 'up' : 'neutral'} trendValue={stats.currentStreak > 0 ? 'Áfram!' : '—'} delay={0} />
          <MetricCard icon="✅" value={stats.todayCompleted} label="Lokið í dag" trend={todayTrend} trendValue={`${todayTrendValue >= 0 ? '+' : ''}${todayTrendValue}`} sparkData={stats.dailyCounts} delay={50} />
          <MetricCard icon="🍅" value={stats.todayPomodoros} label="Pomodoros í dag" sparkData={stats.pomodoroDaily} delay={100} />
          <MetricCard icon="⏱️" value={`${(stats.todayFocusMinutes / 60).toFixed(1)}h`} label="Einbeiting í dag" delay={150} />
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="dashboard-card chart-card">
          <div className="card-header">
            <h2>📈 Virkni síðustu 7 daga</h2>
            <div className="card-header-badge">{stats.weekCompleted} lokið</div>
          </div>
          <div className="chart-container">
            <AreaChart data={stats.dailyCounts} labels={shortDayNames} height={200} />
          </div>
          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-dot" style={{ background: 'var(--accent)' }} />
              <span>Verkefni lokið</span>
            </div>
          </div>
        </section>

        <section className="dashboard-card ring-card">
          <div className="card-header"><h2>🎯 Framvinda</h2></div>
          <div className="ring-container">
            <ProgressRing progress={stats.completionRate} size={140} strokeWidth={10} />
            <div className="ring-center">
              <span className="ring-value">{stats.completionRate}%</span>
              <span className="ring-label">Lokið</span>
            </div>
          </div>
          <div className="ring-stats">
            <div className="ring-stat">
              <span className="ring-stat-value">{stats.completedTasks}</span>
              <span className="ring-stat-label">Lokið</span>
            </div>
            <div className="ring-stat-divider" />
            <div className="ring-stat">
              <span className="ring-stat-value">{stats.totalTasks - stats.completedTasks}</span>
              <span className="ring-stat-label">Eftir</span>
            </div>
          </div>
        </section>

        <section className="dashboard-card summary-card">
          <div className="card-header"><h2>📋 Yfirlit</h2></div>
          <div className="summary-grid">
            <div className="summary-item"><div className="summary-item-icon">📝</div><div className="summary-item-content"><span className="summary-item-value">{stats.totalTasks}</span><span className="summary-item-label">Heildar verkefni</span></div></div>
            <div className="summary-item"><div className="summary-item-icon">📅</div><div className="summary-item-content"><span className="summary-item-value">{stats.weekCompleted}</span><span className="summary-item-label">Þessa viku</span></div></div>
            <div className="summary-item"><div className="summary-item-icon">🍅</div><div className="summary-item-content"><span className="summary-item-value">{stats.totalPomodoros}</span><span className="summary-item-label">Heildar Pomodoros</span></div></div>
            <div className="summary-item"><div className="summary-item-icon">⏰</div><div className="summary-item-content"><span className="summary-item-value">{Math.round(stats.totalFocusMinutes / 60)}h</span><span className="summary-item-label">Heildar einbeiting</span></div></div>
            <div className="summary-item"><div className="summary-item-icon">🎯</div><div className="summary-item-content"><span className="summary-item-value">{stats.totalHabits}</span><span className="summary-item-label">Venjur aktívar</span></div></div>
            <div className="summary-item"><div className="summary-item-icon">📁</div><div className="summary-item-content"><span className="summary-item-value">{stats.activeProjects}</span><span className="summary-item-label">Verkefni í gangi</span></div></div>
          </div>
        </section>
      </div>

      {stats.projectStats.length > 0 && (
        <section className="dashboard-card projects-card">
          <div className="card-header">
            <h2>📁 Framvinda verkefna</h2>
            <span className="card-header-count">{stats.projectStats.length} verkefni</span>
          </div>
          <div className="projects-list">
            {stats.projectStats.map((project, index) => <ProjectCard key={project.id} project={project} index={index} />)}
          </div>
        </section>
      )}

      <style jsx>{`
        .stats-view { position: relative; padding: 32px; max-width: 1200px; margin: 0 auto; min-height: 100%; overflow-y: auto; }
        .stats-bg-gradient { position: fixed; top: 0; left: 0; right: 0; height: 400px; background: radial-gradient(ellipse 80% 50% at 50% -20%, var(--accent-muted), transparent); pointer-events: none; z-index: 0; }
        
        .stats-header { position: relative; display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; z-index: 1; }
        .stats-header h1 { font-size: 32px; font-weight: 700; letter-spacing: -0.03em; background: linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 0 0 8px 0; }
        .stats-subtitle { color: var(--text-secondary); font-size: 14px; margin: 0; }
        .stats-header-decoration { display: flex; gap: 8px; }
        .decoration-ring { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); opacity: 0.3; animation: pulse 2s ease-in-out infinite; }
        .decoration-ring:nth-child(2) { animation-delay: 0.3s; opacity: 0.5; }
        .decoration-ring:nth-child(3) { animation-delay: 0.6s; opacity: 0.7; }
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.3; } 50% { transform: scale(1.2); opacity: 0.7; } }
        
        .metrics-section { position: relative; z-index: 1; margin-bottom: 32px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        @media (max-width: 1024px) { .metrics-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px) { .metrics-grid { grid-template-columns: 1fr; } }
        
        .metric-card { background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%); border: 1px solid var(--border); border-radius: 16px; padding: 24px; position: relative; overflow: hidden; animation: fadeInUp 0.5s ease-out both; transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; }
        .metric-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, var(--accent-glow), transparent); opacity: 0; transition: opacity 0.2s ease; }
        .metric-card:hover { transform: translateY(-2px); border-color: var(--border-focus); box-shadow: var(--shadow-lg), 0 0 40px var(--accent-glow); }
        .metric-card:hover::before { opacity: 1; }
        .metric-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .metric-icon { font-size: 28px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)); }
        .metric-trend { display: flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .metric-trend.up { background: var(--success-muted); color: var(--success); }
        .metric-trend.down { background: var(--error-muted); color: var(--error); }
        .metric-trend.neutral { background: var(--bg-tertiary); color: var(--text-secondary); }
        .metric-value { font-size: 42px; font-weight: 700; letter-spacing: -0.03em; line-height: 1; margin-bottom: 8px; font-feature-settings: 'tnum'; background: linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .metric-label { font-size: 13px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 500; }
        .metric-spark { position: absolute; bottom: 0; left: 0; right: 0; height: 40px; opacity: 0.6; }
        
        .dashboard-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 24px; margin-bottom: 24px; position: relative; z-index: 1; }
        @media (max-width: 1024px) { .dashboard-grid { grid-template-columns: 1fr 1fr; } .chart-card { grid-column: span 2; } }
        @media (max-width: 600px) { .dashboard-grid { grid-template-columns: 1fr; } .chart-card { grid-column: span 1; } }
        
        .dashboard-card { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 16px; padding: 24px; animation: fadeInUp 0.5s ease-out both; animation-delay: 0.2s; }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .card-header h2 { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0; }
        .card-header-badge { background: var(--accent-muted); color: var(--accent); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .card-header-count { color: var(--text-muted); font-size: 13px; }
        
        .chart-container { margin: -8px -8px 16px -8px; }
        .area-chart { width: 100%; height: 200px; }
        .area-fill { animation: areaFadeIn 1s ease-out both; animation-delay: 0.5s; }
        .area-line { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: drawLine 1.5s ease-out forwards; animation-delay: 0.3s; }
        @keyframes drawLine { to { stroke-dashoffset: 0; } }
        @keyframes areaFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .data-point circle { opacity: 0; animation: fadeIn 0.3s ease-out forwards; }
        .data-point:nth-child(1) circle { animation-delay: 0.6s; }
        .data-point:nth-child(2) circle { animation-delay: 0.7s; }
        .data-point:nth-child(3) circle { animation-delay: 0.8s; }
        .data-point:nth-child(4) circle { animation-delay: 0.9s; }
        .data-point:nth-child(5) circle { animation-delay: 1.0s; }
        .data-point:nth-child(6) circle { animation-delay: 1.1s; }
        .data-point:nth-child(7) circle { animation-delay: 1.2s; }
        .chart-legend { display: flex; gap: 16px; }
        .legend-item { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-secondary); }
        .legend-dot { width: 8px; height: 8px; border-radius: 50%; }
        
        .ring-card { display: flex; flex-direction: column; align-items: center; }
        .ring-card .card-header { width: 100%; }
        .ring-container { position: relative; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; }
        .ring-center { position: absolute; display: flex; flex-direction: column; align-items: center; }
        .ring-value { font-size: 32px; font-weight: 700; letter-spacing: -0.02em; color: var(--text-primary); }
        .ring-label { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
        .ring-stats { display: flex; align-items: center; justify-content: center; gap: 24px; width: 100%; }
        .ring-stat { display: flex; flex-direction: column; align-items: center; }
        .ring-stat-value { font-size: 20px; font-weight: 600; color: var(--text-primary); }
        .ring-stat-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
        .ring-stat-divider { width: 1px; height: 32px; background: var(--border); }
        
        .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .summary-item { display: flex; align-items: center; gap: 12px; padding: 14px; background: var(--bg-tertiary); border-radius: 12px; transition: background 0.15s ease; }
        .summary-item:hover { background: var(--bg-hover); }
        .summary-item-icon { font-size: 20px; }
        .summary-item-content { display: flex; flex-direction: column; }
        .summary-item-value { font-size: 18px; font-weight: 600; color: var(--text-primary); line-height: 1.2; }
        .summary-item-label { font-size: 11px; color: var(--text-muted); }
        
        .projects-card { position: relative; z-index: 1; }
        .projects-list { display: flex; flex-direction: column; gap: 12px; }
        .project-card { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--bg-tertiary); border-radius: 12px; border: 1px solid transparent; animation: fadeInUp 0.4s ease-out both; transition: border-color 0.15s ease, background 0.15s ease; }
        .project-card:hover { border-color: var(--border); background: var(--bg-hover); }
        .project-card-left { display: flex; align-items: center; gap: 14px; }
        .project-icon { font-size: 24px; }
        .project-info { display: flex; flex-direction: column; }
        .project-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
        .project-count { font-size: 12px; color: var(--text-muted); }
        .project-card-right { display: flex; align-items: center; gap: 16px; }
        .project-percent { font-size: 16px; font-weight: 600; color: var(--accent); min-width: 48px; text-align: right; }
        .project-bar-container { width: 100px; height: 6px; background: var(--bg-elevated); border-radius: 3px; overflow: hidden; }
        .project-bar { height: 100%; background: linear-gradient(90deg, var(--accent) 0%, var(--accent-hover) 100%); border-radius: 3px; width: 0; transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
        
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        
        @media (max-width: 600px) {
          .stats-view { padding: 20px; }
          .stats-header h1 { font-size: 24px; }
          .metric-value { font-size: 32px; }
          .dashboard-card { padding: 20px; }
          .summary-grid { grid-template-columns: 1fr; }
          .project-bar-container { width: 60px; }
        }
      `}</style>
    </div>
  )
}
