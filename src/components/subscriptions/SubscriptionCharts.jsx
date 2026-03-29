import React, { useMemo } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { CATEGORIES } from './constants'

function CategoryDonut({ subscriptions = [], language = 'is' }) {
  const data = useMemo(() => {
    const byCategory = {}
    for (const sub of subscriptions.filter(s => s.status === 'active' || !s.status)) {
      const cat = sub.category || 'other'
      byCategory[cat] = (byCategory[cat] || 0) + (sub.amount || 0)
    }
    return Object.entries(byCategory)
      .map(([key, value]) => ({
        name: CATEGORIES[key]?.[language === 'is' ? 'is' : 'en'] || key,
        value,
        color: CATEGORIES[key]?.color || '#6B7280',
      }))
      .sort((a, b) => b.value - a.value)
  }, [subscriptions, language])

  const total = data.reduce((s, d) => s + d.value, 0)

  if (data.length === 0) {
    return (
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4">
        <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">
          {language === 'is' ? 'Eftir flokkum' : 'By Category'}
        </h3>
        <div className="flex items-center justify-center h-[200px] text-sm text-[var(--text-muted)]">
          {language === 'is' ? 'Engin gögn' : 'No data'}
        </div>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.[0]) return null
    const d = payload[0].payload
    const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : 0
    return (
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 shadow-xl">
        <div className="text-sm font-medium text-[var(--text-primary)]">{d.name}</div>
        <div className="text-xs text-[var(--text-muted)]">
          {d.value.toLocaleString('is-IS')} kr ({pct}%)
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4">
      <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">
        {language === 'is' ? 'Eftir flokkum' : 'By Category'}
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      {/* Center label */}
      <div className="text-center -mt-[125px] mb-[105px] pointer-events-none">
        <div className="text-lg font-bold text-[var(--text-primary)]">
          {total.toLocaleString('is-IS')}
        </div>
        <div className="text-[10px] text-[var(--text-muted)]">kr/mán</div>
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-2 mt-3 justify-center">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
            <span>{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MonthlyTrendChart({ subscriptions = [], language = 'is' }) {
  const data = useMemo(() => {
    const months = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      const label = d.toLocaleDateString(language === 'is' ? 'is-IS' : 'en-US', { month: 'short' })
      // Count subscriptions active at that time
      const total = subscriptions
        .filter(s => {
          if (s.status === 'cancelled') return false
          const start = s.startDate || s.createdAt
          if (start && new Date(start) > endOfMonth) return false
          return true
        })
        .reduce((sum, s) => {
          const amt = s.amount || 0
          if (s.billingCycle === 'yearly') return sum + Math.round(amt / 12)
          if (s.billingCycle === 'quarterly') return sum + Math.round(amt / 3)
          if (s.billingCycle === 'weekly') return sum + Math.round(amt * 4.33)
          return sum + amt
        }, 0)
      months.push({ month: label, total })
    }
    return months
  }, [subscriptions, language])

  const hasData = data.some(d => d.total > 0)

  if (!hasData) {
    return (
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4">
        <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">
          {language === 'is' ? 'Þróun (6 mánuðir)' : 'Trend (6 months)'}
        </h3>
        <div className="flex items-center justify-center h-[200px] text-sm text-[var(--text-muted)]">
          {language === 'is' ? 'Engin gögn' : 'No data'}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4">
      <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">
        {language === 'is' ? 'Þróun (6 mánuðir)' : 'Trend (6 months)'}
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => [`${value.toLocaleString('is-IS')} kr`, language === 'is' ? 'Samtals' : 'Total']}
            contentStyle={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
            }}
            labelStyle={{ color: 'var(--text-muted)' }}
          />
          <Bar dataKey="total" fill="var(--accent)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export { CategoryDonut, MonthlyTrendChart }
