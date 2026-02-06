import React, { useMemo } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { addWeeks, format, startOfWeek, subWeeks } from 'date-fns'

function fmtISK(n) {
  const x = Number(n || 0)
  return x.toLocaleString('is-IS') + ' kr'
}

function weekKey(d) {
  return format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd')
}

export default function SavingsTimelineChart({
  events = [],
  budgetGoal = 0,
  budgetSaved = 0,
  weeklyTarget = 0,
  language = 'is',
  weeks = 8,
}) {
  const data = useMemo(() => {
    const now = new Date()
    const start = subWeeks(startOfWeek(now, { weekStartsOn: 1 }), weeks - 1)

    const buckets = new Map()
    for (let i = 0; i < weeks; i++) {
      const d = addWeeks(start, i)
      buckets.set(weekKey(d), {
        week: weekKey(d),
        label: format(d, 'd/M'),
        saved: 0,
        cumulative: 0,
      })
    }

    for (const e of events || []) {
      const created = new Date(e.createdAt || Date.now())
      const k = weekKey(created)
      const b = buckets.get(k)
      if (!b) continue
      b.saved += Number(e.amount || 0)
    }

    // cumulative (from earliest bucket)
    let running = 0
    const out = Array.from(buckets.values()).sort((a, b) => a.week.localeCompare(b.week))
    for (const row of out) {
      running += row.saved
      row.cumulative = running
    }

    // trend: compare last week vs previous
    const last = out[out.length - 1]?.saved || 0
    const prev = out[out.length - 2]?.saved || 0
    return { out, last, prev }
  }, [events, weeks])

  const trendUp = data.last >= data.prev
  const TrendIcon = trendUp ? TrendingUp : TrendingDown

  const projectionWeeks = useMemo(() => {
    const remaining = Math.max(0, Number(budgetGoal || 0) - Number(budgetSaved || 0))
    const w = Number(weeklyTarget || 0)
    if (!w || w <= 0) return null
    return Math.ceil(remaining / w)
  }, [budgetGoal, budgetSaved, weeklyTarget])

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-[var(--text-primary)]">
            {language === 'is' ? 'Sparnaðarsaga' : 'Savings history'}
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-0.5">
            {language === 'is' ? `Síðustu ${weeks} vikur` : `Last ${weeks} weeks`}
          </div>
        </div>
        <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg border ${
          trendUp
            ? 'bg-green-500/10 text-green-400 border-green-500/20'
            : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
        }`}>
          <TrendIcon size={14} />
          <span>
            {language === 'is'
              ? `${Math.abs(data.last - data.prev).toLocaleString('is-IS')} kr ${trendUp ? 'betra' : 'lægra'} en síðasta vika`
              : `${fmtISK(Math.abs(data.last - data.prev))} ${trendUp ? 'better' : 'lower'} than last week`}
          </span>
        </div>
      </div>

      <div className="mt-4 h-44">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data.out} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: 'rgba(148,163,184,0.8)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(148,163,184,0.8)', fontSize: 11 }} axisLine={false} tickLine={false} width={44} />
            <Tooltip
              contentStyle={{
                background: 'rgba(15,23,42,0.96)',
                border: '1px solid rgba(148,163,184,0.2)',
                borderRadius: 10,
                color: 'white',
                fontSize: 12,
              }}
              formatter={(value, name) => {
                const label = name === 'saved'
                  ? (language === 'is' ? 'Sparað í viku' : 'Saved (week)')
                  : (language === 'is' ? 'Samtals (gluggi)' : 'Cumulative (window)')
                return [fmtISK(value), label]
              }}
              labelFormatter={(label) => (language === 'is' ? `Vika ${label}` : `Week ${label}`)}
            />
            <Bar dataKey="saved" fill="rgba(59,130,246,0.55)" radius={[8, 8, 0, 0]} />
            <Line dataKey="cumulative" type="monotone" stroke="rgba(34,197,94,0.9)" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-[var(--bg-tertiary)]">
          <div className="text-[10px] text-[var(--text-muted)]">
            {language === 'is' ? 'Þessi vika (sparað)' : 'This week (saved)'}
          </div>
          <div className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">
            {fmtISK(data.last)}
          </div>
        </div>
        <div className="p-3 rounded-lg bg-[var(--bg-tertiary)]">
          <div className="text-[10px] text-[var(--text-muted)]">
            {language === 'is' ? 'Áætlun (vikur eftir)' : 'Projection (weeks left)'}
          </div>
          <div className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">
            {projectionWeeks ?? '—'}
          </div>
        </div>
      </div>
    </div>
  )
}
