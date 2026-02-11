import React, { useMemo } from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Repeat,
  Sparkles,
  Store,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'

const CATEGORY_RULES = [
  { pattern: /wolt|dominos|pizza|subway|kfc|mcdonalds|burger/i, category: 'food-delivery' },
  { pattern: /spotify|netflix|hbo|max|disney|youtube|viaplay/i, category: 'entertainment' },
  { pattern: /síminn|nova|vodafone|hringdu/i, category: 'telecom' },
  { pattern: /n1|olís|orkan|olis|costco.*gas/i, category: 'fuel' },
  { pattern: /hagkaup|bónus|krónan|nettó|costco|ikea/i, category: 'groceries' },
  { pattern: /starbucks|te og kaffi|kaffitár|reykjavik roasters|kaffi/i, category: 'coffee' },
]

const CATEGORY_META = {
  'food-delivery': { labelIs: 'Matur / Delivery', labelEn: 'Food / Delivery', color: '#F59E0B' },
  entertainment: { labelIs: 'Afþreying', labelEn: 'Entertainment', color: '#A855F7' },
  telecom: { labelIs: 'Fjarskipti', labelEn: 'Telecom', color: '#3B82F6' },
  fuel: { labelIs: 'Eldsneyti', labelEn: 'Fuel', color: '#EF4444' },
  groceries: { labelIs: 'Matvörur', labelEn: 'Groceries', color: '#22C55E' },
  coffee: { labelIs: 'Kaffi', labelEn: 'Coffee', color: '#F97316' },
  other: { labelIs: 'Annað', labelEn: 'Other', color: '#6B7280' },
}

function normalizeMerchant(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/\d+/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[\-_.]/g, ' ')
    .trim()
}

function categorize(tx) {
  const m = normalizeMerchant(tx.merchant || tx.description)
  for (const r of CATEGORY_RULES) {
    if (r.pattern.test(m)) return r.category
  }
  return 'other'
}

function fmtISK(n) {
  return Number(n || 0).toLocaleString('is-IS') + ' kr'
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n))
}

function startOfDayLocal(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function startOfWeekLocal(d) {
  const x = new Date(d)
  const day = (x.getDay() + 6) % 7 // Monday=0
  const out = startOfDayLocal(x)
  out.setDate(out.getDate() - day)
  return out
}

function isoWeekNumber(d) {
  // https://en.wikipedia.org/wiki/ISO_week_date
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7)
}

function Donut({ items, size = 140, stroke = 16 }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const total = items.reduce((s, x) => s + (x.value || 0), 0) || 1
  let offset = 0

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
      <defs>
        <filter id="donutGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.35 0"
          />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={stroke}
      />

      <g transform={`rotate(-90 ${size / 2} ${size / 2})`} filter="url(#donutGlow)">
        {items.map((seg, idx) => {
          const len = (c * (seg.value || 0)) / total
          const dasharray = `${Math.max(0, len)} ${c}`
          const dashoffset = -offset
          offset += len
          return (
            <circle
              key={seg.key || idx}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={dasharray}
              strokeDashoffset={dashoffset}
              opacity={seg.value > 0 ? 1 : 0}
            />
          )
        })}
      </g>

      {/* Inner cutout */}
      <circle cx={size / 2} cy={size / 2} r={r - stroke / 2 - 2} fill="var(--bg-secondary)" />
    </svg>
  )
}

function BarChart({ values, height = 68 }) {
  const max = Math.max(1, ...values.map(v => v.value || 0))
  const w = 220
  const h = height
  const pad = 10
  const barW = (w - pad * 2) / values.length

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} className="block">
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.95" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.18" />
        </linearGradient>
      </defs>

      {/* baseline */}
      <line x1={pad} y1={h - 12} x2={w - pad} y2={h - 12} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

      {values.map((v, i) => {
        const barH = clamp(((v.value || 0) / max) * (h - 22), 2, h - 22)
        const x = pad + i * barW + 2
        const y = h - 12 - barH
        return (
          <g key={v.key || i}>
            <rect
              x={x}
              y={y}
              width={Math.max(6, barW - 6)}
              height={barH}
              rx="8"
              fill="url(#barGrad)"
            />
          </g>
        )
      })}
    </svg>
  )
}

function MiniWeekdayBars({ values }) {
  const max = Math.max(1, ...values.map(v => v.value || 0))
  return (
    <div className="grid grid-cols-7 gap-1.5 items-end">
      {values.map((v, idx) => {
        const pct = (v.value || 0) / max
        const h = Math.round(14 + pct * 22)
        return (
          <div key={v.key || idx} className="flex flex-col items-center gap-1">
            <div
              className="w-5 rounded-md border border-[var(--border)]"
              style={{
                height: `${h}px`,
                background: `linear-gradient(180deg, var(--accent) ${0}%, rgba(255,255,255,0.06) 120%)`,
                opacity: 0.45 + pct * 0.55,
              }}
              title={`${v.label}: ${fmtISK(v.value)}`}
            />
            <div className="text-[10px] text-[var(--text-muted)]">{v.short}</div>
          </div>
        )
      })}
    </div>
  )
}

export default function SpendingInsightsDashboard({
  transactions = [],
  receipts = [],
  onAddSubscriptionCandidate,
  language = 'is',
}) {
  const data = useMemo(() => {
    const combined = [
      ...(transactions || []).map(t => ({
        id: t.id,
        source: 'bank',
        merchant: t.merchant || t.description || t.title || '—',
        // bank may have +/-; for spending insights we use absolute when counting outflow
        rawAmount: Number(t.amount ?? t.amountISK ?? 0),
        amountOut: Math.abs(Number(t.amount ?? t.amountISK ?? 0)),
        date: new Date(t.date || t.createdAt || Date.now()),
      })),
      ...(receipts || []).map(r => ({
        id: r.id,
        source: 'wolt',
        merchant: r.restaurant || r.merchant || 'Wolt',
        rawAmount: -Math.abs(Number(r.total || r.amount || r.amountISK || 0)),
        amountOut: Math.abs(Number(r.total || r.amount || r.amountISK || 0)),
        date: new Date(r.date || r.createdAt || Date.now()),
      })),
    ].filter(x => x.amountOut > 0 && x.date.toString() !== 'Invalid Date')

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1)

    const inRange = (d, start, end) => d.getTime() >= start.getTime() && d.getTime() < end.getTime()

    const thisMonth = combined.filter(t => inRange(t.date, monthStart, now))
    const lastMonth = combined.filter(t => inRange(t.date, prevMonthStart, prevMonthEnd))

    const sum = (arr) => arr.reduce((s, t) => s + (t.amountOut || 0), 0)
    const thisMonthTotal = sum(thisMonth)
    const lastMonthTotal = sum(lastMonth)
    const momDelta = thisMonthTotal - lastMonthTotal
    const momPct = lastMonthTotal > 0 ? (momDelta / lastMonthTotal) * 100 : null

    const byCategory = (arr) => {
      const m = new Map()
      for (const t of arr) {
        const c = categorize(t)
        m.set(c, (m.get(c) || 0) + (t.amountOut || 0))
      }
      return Array.from(m.entries())
        .map(([category, total]) => ({ category, total }))
        .sort((a, b) => b.total - a.total)
    }

    const catThis = byCategory(thisMonth)

    // weekly totals (last 6 weeks)
    const weeks = []
    const startWeek = startOfWeekLocal(now)
    for (let i = 5; i >= 0; i--) {
      const ws = new Date(startWeek)
      ws.setDate(ws.getDate() - i * 7)
      const we = new Date(ws)
      we.setDate(we.getDate() + 7)
      const arr = combined.filter(t => inRange(t.date, ws, we))
      weeks.push({
        key: ws.toISOString(),
        start: ws,
        total: sum(arr),
        label: `V${isoWeekNumber(ws)}`,
      })
    }

    // top merchants (this month)
    const merchantTotals = new Map()
    for (const t of thisMonth) {
      const k = normalizeMerchant(t.merchant)
      if (!k) continue
      merchantTotals.set(k, (merchantTotals.get(k) || 0) + (t.amountOut || 0))
    }
    const topMerchants = Array.from(merchantTotals.entries())
      .map(([merchant, total]) => ({ merchant, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6)

    // day-of-week (this month)
    // Monday=0
    const dow = Array.from({ length: 7 }).map((_, i) => ({ idx: i, total: 0 }))
    for (const t of thisMonth) {
      const day = (t.date.getDay() + 6) % 7
      dow[day].total += t.amountOut || 0
    }
    const DOW = [
      { short: 'M', labelIs: 'Mán', labelEn: 'Mon' },
      { short: 'Þ', labelIs: 'Þri', labelEn: 'Tue' },
      { short: 'M', labelIs: 'Mið', labelEn: 'Wed' },
      { short: 'F', labelIs: 'Fim', labelEn: 'Thu' },
      { short: 'F', labelIs: 'Fös', labelEn: 'Fri' },
      { short: 'L', labelIs: 'Lau', labelEn: 'Sat' },
      { short: 'S', labelIs: 'Sun', labelEn: 'Sun' },
    ]
    const dowSeries = dow.map((d) => ({
      key: String(d.idx),
      value: d.total,
      short: DOW[d.idx].short,
      label: language === 'is' ? DOW[d.idx].labelIs : DOW[d.idx].labelEn,
    }))

    // recurring candidates: same merchant with 2+ charges ~monthly-ish
    const byMerchant = new Map()
    for (const t of combined) {
      const k = normalizeMerchant(t.merchant)
      if (!k) continue
      const list = byMerchant.get(k) || []
      list.push(t)
      byMerchant.set(k, list)
    }
    const recurring = []
    for (const [mKey, list] of byMerchant.entries()) {
      if (list.length < 2) continue
      const sorted = [...list].sort((a, b) => a.date.getTime() - b.date.getTime())
      for (let i = 1; i < sorted.length; i++) {
        const a = sorted[i - 1]
        const b = sorted[i]
        const days = Math.abs((b.date.getTime() - a.date.getTime()) / (24 * 60 * 60 * 1000))
        const amountDiff = Math.abs((b.amountOut || 0) - (a.amountOut || 0))
        const amountClose = (a.amountOut || 0) > 0 && amountDiff / (a.amountOut || 0) < 0.08
        if (days >= 26 && days <= 35 && amountClose) {
          recurring.push({
            merchant: mKey,
            amount: Math.round((a.amountOut + b.amountOut) / 2),
            intervalDays: Math.round(days),
          })
          break
        }
      }
    }
    recurring.sort((a, b) => (b.amount || 0) - (a.amount || 0))

    // gentle aha
    const aha = []
    const food = catThis.find(x => x.category === 'food-delivery')?.total || 0
    if (food > 0) {
      const orders = (receipts || []).filter(r => {
        const d = new Date(r.date || r.createdAt || 0)
        return d >= monthStart
      }).length
      if (orders >= 6) {
        aha.push(language === 'is'
          ? `Wolt er stór hluti þessa mánaðar: ${orders} pantanir (${fmtISK(food)}). Ein pöntun minna/viku getur skilað góðum sparnaði.`
          : `Wolt is a big slice this month: ${orders} orders (${fmtISK(food)}). One fewer order per week can move the needle.`
        )
      }
    }

    return {
      combinedCount: combined.length,
      thisMonthTotal,
      lastMonthTotal,
      momDelta,
      momPct,
      catThis,
      weeks,
      topMerchants,
      dowSeries,
      recurring: recurring.slice(0, 5),
      aha,
    }
  }, [transactions, receipts, language])

  const isIS = language === 'is'
  const momUp = data.momDelta > 0
  const momPctText = data.momPct == null
    ? (isIS ? '—' : '—')
    : `${Math.abs(data.momPct).toFixed(0)}%`

  const donutItems = (data.catThis.length ? data.catThis : [{ category: 'other', total: 1 }]).map((x) => ({
    key: x.category,
    value: x.total,
    color: CATEGORY_META[x.category]?.color || CATEGORY_META.other.color,
  }))

  const maxMerchant = Math.max(1, ...data.topMerchants.map(m => m.total || 0))

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4 overflow-hidden relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(600px 200px at 10% 0%, rgba(59,130,246,0.16), transparent 60%), radial-gradient(600px 200px at 90% 20%, rgba(168,85,247,0.14), transparent 55%)',
        }}
      />

      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-[var(--accent)]" />
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {isIS ? 'Innsýn' : 'Insights'}
            </span>
          </div>
          <div className="text-[10px] text-[var(--text-muted)]">
            {data.combinedCount} {isIS ? 'færslur' : 'records'}
          </div>
        </div>

        {/* KPI row */}
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] overflow-hidden">
            <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-2">
              <CalendarDays size={12} />
              <span>{isIS ? 'Eyðsla í þessum mánuði' : 'Spending this month'}</span>
            </div>
            <div className="mt-1 text-base font-semibold text-[var(--text-primary)] truncate">
              {fmtISK(data.thisMonthTotal)}
            </div>
            <div className="mt-1 text-[10px] text-[var(--text-muted)]">
              {isIS ? 'Síðasti mánuður:' : 'Last month:'} {fmtISK(data.lastMonthTotal)}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] overflow-hidden">
            <div className="text-[10px] text-[var(--text-muted)]">
              {isIS ? 'Mánuður vs mánuður' : 'Month over month'}
            </div>
            <div className={`mt-1 inline-flex max-w-full flex-wrap items-center gap-1 text-[11px] leading-tight px-2 py-0.5 rounded-lg border ${
              momUp
                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                : 'bg-green-500/10 text-green-400 border-green-500/20'
            }`}>
              {momUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              <span className="font-medium whitespace-nowrap">{fmtISK(Math.abs(data.momDelta))}</span>
              <span className="opacity-80 whitespace-nowrap">({momPctText})</span>
            </div>
            <div className="mt-2 text-[10px] text-[var(--text-muted)] flex items-center gap-2">
              {momUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>
                {isIS
                  ? (momUp ? 'Meiri eyðsla' : 'Minni eyðsla')
                  : (momUp ? 'Higher spending' : 'Lower spending')}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] overflow-hidden">
            <div className="text-[10px] text-[var(--text-muted)]">
              {isIS ? 'Mest eytt á' : 'Top category'}
            </div>
            <div className="mt-1 text-sm font-semibold text-[var(--text-primary)] truncate">
              {(() => {
                const top = data.catThis[0]
                if (!top) return isIS ? '—' : '—'
                const meta = CATEGORY_META[top.category] || CATEGORY_META.other
                return `${isIS ? meta.labelIs : meta.labelEn}`
              })()}
            </div>
            <div className="mt-1 text-[10px] text-[var(--text-muted)] truncate">
              {data.catThis[0] ? fmtISK(data.catThis[0].total) : ''}
            </div>
          </div>
        </div>

        {/* Main visuals */}
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-3">
          {/* Donut */}
          <div className="md:col-span-2 xl:col-span-5 p-4 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border)] overflow-hidden">
            <div className="flex items-center justify-between gap-2 flex-wrap min-w-0">
              <div className="text-xs text-[var(--text-muted)] truncate">{isIS ? 'Flokkar (mánuður)' : 'Categories (month)'}</div>
              <div className="text-[10px] text-[var(--text-muted)] whitespace-nowrap">
                {isIS ? 'Samtals' : 'Total'}: <span className="text-[var(--text-secondary)]">{fmtISK(data.thisMonthTotal)}</span>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-4">
              <div className="shrink-0">
                <div className="relative">
                  <Donut items={donutItems} size={128} stroke={14} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-[10px] text-[var(--text-muted)]">{isIS ? 'Mánuður' : 'Month'}</div>
                      <div className="text-xs font-semibold text-[var(--text-primary)] max-w-[110px] truncate">{fmtISK(data.thisMonthTotal)}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                {(data.catThis.length ? data.catThis : [{ category: 'other', total: 0 }]).slice(0, 6).map((x) => {
                  const meta = CATEGORY_META[x.category] || CATEGORY_META.other
                  const pct = data.thisMonthTotal > 0 ? (x.total / data.thisMonthTotal) * 100 : 0
                  return (
                    <div key={x.category} className="min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: meta.color, boxShadow: `0 0 0 3px rgba(255,255,255,0.04)` }}
                          />
                          <div className="text-xs text-[var(--text-secondary)] truncate">{isIS ? meta.labelIs : meta.labelEn}</div>
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)] shrink-0">{pct.toFixed(0)}%</div>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-black/10 border border-[var(--border)] overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${clamp(pct, 0, 100)}%`,
                            background: `linear-gradient(90deg, ${meta.color}, rgba(255,255,255,0.06))`,
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Weekly trend */}
          <div className="md:col-span-2 xl:col-span-4 p-4 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border)] overflow-hidden">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="text-xs text-[var(--text-muted)]">{isIS ? 'Vikuleg þróun' : 'Weekly trend'}</div>
              <div className="text-[10px] text-[var(--text-muted)] whitespace-nowrap">{isIS ? 'Síðustu 6 vikur' : 'Last 6 weeks'}</div>
            </div>

            <div className="mt-2">
              <BarChart values={data.weeks.map(w => ({ key: w.key, value: w.total }))} />
            </div>
            <div className="mt-2 grid grid-cols-6 gap-1">
              {data.weeks.map((w) => (
                <div key={w.key} className="text-[10px] text-[var(--text-muted)] text-center">
                  {w.label}
                </div>
              ))}
            </div>
            <div className="mt-3 text-[10px] text-[var(--text-muted)]">
              {isIS ? 'Ábending:' : 'Tip:'} <span className="text-[var(--text-secondary)]">{isIS ? 'leitaðu að toppum og reyndu að slétta toppana.' : 'look for spikes and try smoothing them.'}</span>
            </div>
          </div>

          {/* Day of week */}
          <div className="md:col-span-2 xl:col-span-3 p-4 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border)] overflow-hidden">
            <div className="text-xs text-[var(--text-muted)]">{isIS ? 'Dagur vikunnar' : 'Day of week'}</div>
            <div className="mt-3">
              <MiniWeekdayBars values={data.dowSeries} />
            </div>
            <div className="mt-3 text-[10px] text-[var(--text-muted)]">
              {isIS ? 'Hvenær ertu líklegast/ur til að eyða?' : 'When do you tend to spend?'}
            </div>
          </div>
        </div>

        {/* Merchants + recurring */}
        <div className="mt-3 grid grid-cols-1 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-7 p-4 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store size={14} className="text-[var(--text-muted)]" />
                <div className="text-xs text-[var(--text-muted)]">{isIS ? 'Topp staðir (mánuður)' : 'Top merchants (month)'}</div>
              </div>
              <div className="text-[10px] text-[var(--text-muted)]">
                {isIS ? 'Top 6' : 'Top 6'}
              </div>
            </div>

            {data.topMerchants.length === 0 ? (
              <div className="mt-3 text-xs text-[var(--text-muted)]">
                {isIS ? 'Engin gögn enn — flyttu inn færslur til að fá innsýn.' : 'No data yet — import transactions to see insights.'}
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {data.topMerchants.map((m, idx) => {
                  const pct = (m.total || 0) / maxMerchant
                  return (
                    <div key={m.merchant} className="flex items-center gap-3">
                      <div className="w-6 text-[10px] text-[var(--text-muted)]">#{idx + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-xs text-[var(--text-secondary)] truncate">{m.merchant}</div>
                          <div className="text-[10px] text-[var(--text-muted)] shrink-0">{fmtISK(m.total)}</div>
                        </div>
                        <div className="mt-1 h-2 rounded-full bg-black/10 border border-[var(--border)] overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${clamp(pct * 100, 0, 100)}%`,
                              background: 'linear-gradient(90deg, rgba(255,255,255,0.04), var(--accent))',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="lg:col-span-5 space-y-3">
            {/* Aha */}
            {data.aha.length > 0 && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[var(--accent)]/12 to-purple-500/10 border border-[var(--accent)]/20">
                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                  <Sparkles size={14} className="text-yellow-400" />
                  <span>{isIS ? 'Aha!' : 'Aha!'}</span>
                </div>
                <ul className="mt-2 space-y-1">
                  {data.aha.map((t, idx) => (
                    <li key={idx} className="text-xs text-[var(--text-primary)] leading-relaxed">• {t}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recurring candidates */}
            {data.recurring.length > 0 && (
              <div className="p-4 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border)]">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-[var(--text-muted)] flex items-center gap-2">
                    <Repeat size={14} className="text-[var(--text-muted)]" />
                    <span>{isIS ? 'Líklegar endurtekningar' : 'Likely recurring'}</span>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  {data.recurring.map((r) => (
                    <div key={r.merchant} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] overflow-hidden">
                      <div className="min-w-0 w-full">
                        <div className="text-xs text-[var(--text-primary)] truncate">{r.merchant}</div>
                        <div className="text-[10px] text-[var(--text-muted)]">
                          ~{r.intervalDays} {isIS ? 'dagar' : 'days'} · ~{fmtISK(r.amount)}
                        </div>
                      </div>
                      <button
                        onClick={() => onAddSubscriptionCandidate?.({
                          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                          name: r.merchant,
                          amount: r.amount,
                          frequency: 'monthly',
                          essential: false,
                          cancelCandidate: true,
                          createdAt: new Date().toISOString(),
                        })}
                        className="px-2.5 py-1.5 rounded-lg bg-[var(--accent)] text-white text-[10px] hover:opacity-90 transition-all shrink-0 w-full sm:w-auto"
                      >
                        {isIS ? 'Bæta við' : 'Add'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.combinedCount === 0 && (
              <div className="p-4 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-xs text-[var(--text-muted)]">
                {isIS ? 'Engin gögn enn — flyttu inn Wolt og bankafærslur til að sjá fallega innsýn.' : 'No data yet — import Wolt and bank transactions to see insights.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
