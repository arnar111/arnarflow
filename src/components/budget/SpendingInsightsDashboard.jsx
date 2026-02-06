import React, { useMemo } from 'react'
import { ArrowUpRight, ArrowDownRight, Sparkles, Repeat, TrendingUp } from 'lucide-react'

const CATEGORY_RULES = [
  { pattern: /wolt|dominos|pizza|subway|kfc|mcdonalds|burger/i, category: 'food-delivery' },
  { pattern: /spotify|netflix|hbo|max|disney|youtube|viaplay/i, category: 'entertainment' },
  { pattern: /síminn|nova|vodafone|hringdu/i, category: 'telecom' },
  { pattern: /n1|olís|orkan|olis|costco.*gas/i, category: 'fuel' },
  { pattern: /hagkaup|bónus|krónan|nettó|costco|ikea/i, category: 'groceries' },
  { pattern: /starbucks|te og kaffi|kaffitár|reykjavik roasters|kaffi/i, category: 'coffee' },
]

const CATEGORY_LABELS = {
  'food-delivery': { is: 'Matur/Delivery', en: 'Food/Delivery' },
  entertainment: { is: 'Afþreying', en: 'Entertainment' },
  telecom: { is: 'Fjarskipti', en: 'Telecom' },
  fuel: { is: 'Eldsneyti', en: 'Fuel' },
  groceries: { is: 'Matvörur', en: 'Groceries' },
  coffee: { is: 'Kaffi', en: 'Coffee' },
  other: { is: 'Annað', en: 'Other' },
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

function startOfWeekLocal(d) {
  const x = new Date(d)
  const day = (x.getDay() + 6) % 7 // Monday=0
  const out = new Date(x)
  out.setHours(0, 0, 0, 0)
  out.setDate(out.getDate() - day)
  return out
}

export default function SpendingInsightsDashboard({
  transactions = [],
  receipts = [],
  onAddSubscriptionCandidate,
  language = 'is',
}) {
  const insights = useMemo(() => {
    const combined = [
      ...(transactions || []).map(t => ({
        id: t.id,
        source: 'bank',
        merchant: t.merchant || t.description || '—',
        amount: Math.abs(Number(t.amount || 0)),
        date: new Date(t.date || t.createdAt || Date.now()),
      })),
      ...(receipts || []).map(r => ({
        id: r.id,
        source: 'wolt',
        merchant: r.restaurant || r.merchant || 'Wolt',
        amount: Math.abs(Number(r.total || r.amount || 0)),
        date: new Date(r.date || r.createdAt || Date.now()),
      })),
    ].filter(x => x.amount > 0 && x.date.toString() !== 'Invalid Date')

    const now = new Date()
    const thisWeekStart = startOfWeekLocal(now)
    const lastWeekStart = new Date(thisWeekStart)
    lastWeekStart.setDate(lastWeekStart.getDate() - 7)

    const isInRange = (d, start, end) => d.getTime() >= start.getTime() && d.getTime() < end.getTime()

    const thisWeek = combined.filter(t => isInRange(t.date, thisWeekStart, now))
    const lastWeek = combined.filter(t => isInRange(t.date, lastWeekStart, thisWeekStart))

    const sum = (arr) => arr.reduce((s, t) => s + (t.amount || 0), 0)
    const thisWeekTotal = sum(thisWeek)
    const lastWeekTotal = sum(lastWeek)
    const delta = thisWeekTotal - lastWeekTotal

    const byCategory = (arr) => {
      const m = new Map()
      for (const t of arr) {
        const c = categorize(t)
        m.set(c, (m.get(c) || 0) + (t.amount || 0))
      }
      return Array.from(m.entries()).map(([category, total]) => ({ category, total }))
        .sort((a, b) => b.total - a.total)
    }

    const thisByCat = byCategory(thisWeek)
    const lastByCat = new Map(byCategory(lastWeek).map(x => [x.category, x.total]))
    const catDeltas = thisByCat.map(x => ({
      category: x.category,
      thisWeek: x.total,
      lastWeek: lastByCat.get(x.category) || 0,
      delta: x.total - (lastByCat.get(x.category) || 0),
    })).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))

    // top merchants (this week)
    const merchantTotals = new Map()
    for (const t of thisWeek) {
      const k = normalizeMerchant(t.merchant)
      if (!k) continue
      merchantTotals.set(k, (merchantTotals.get(k) || 0) + t.amount)
    }
    const topMerchants = Array.from(merchantTotals.entries())
      .map(([merchant, total]) => ({ merchant, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)

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
        const amountDiff = Math.abs((b.amount || 0) - (a.amount || 0))
        const amountClose = (a.amount || 0) > 0 && amountDiff / (a.amount || 0) < 0.08
        if (days >= 26 && days <= 35 && amountClose) {
          recurring.push({
            merchant: mKey,
            amount: Math.round((a.amount + b.amount) / 2),
            intervalDays: Math.round(days),
          })
          break
        }
      }
    }
    recurring.sort((a, b) => (b.amount || 0) - (a.amount || 0))

    // gentle aha insights
    const aha = []
    const food = thisByCat.find(x => x.category === 'food-delivery')?.total || 0
    if (food > 0) {
      const orders = (receipts || []).filter(r => {
        const d = new Date(r.date || r.createdAt || 0)
        return d >= thisWeekStart
      }).length
      if (orders >= 3) {
        aha.push(language === 'is'
          ? `Wolt var stórt í þessari viku: ${orders} pantanir (${fmtISK(food)}). Ein pöntun minna gæti sparað ~2–3 þús.`
          : `Wolt was big this week: ${orders} orders (${fmtISK(food)}). One fewer order could save ~2–3k.`
        )
      }
    }

    const coffee = thisByCat.find(x => x.category === 'coffee')?.total || 0
    if (coffee > 2500) {
      aha.push(language === 'is'
        ? `Kaffi úti er komið í ${fmtISK(coffee)}. Prófaðu “heimakaffi” 3 daga og settu mismuninn í sparnað.`
        : `Coffee shops are at ${fmtISK(coffee)}. Try “home coffee” for 3 days and move the difference to savings.`
      )
    }

    return {
      thisWeekTotal,
      lastWeekTotal,
      delta,
      catDeltas,
      topMerchants,
      recurring: recurring.slice(0, 5),
      aha,
    }
  }, [transactions, receipts, language])

  const deltaUp = insights.delta > 0

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-[var(--accent)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {language === 'is' ? 'Innsýn (spending)' : 'Spending insights'}
          </span>
        </div>
      </div>

      {/* Week over week */}
      <div className="mt-3 p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] text-[var(--text-muted)]">
              {language === 'is' ? 'Þessi vika vs síðasta vika' : 'This week vs last week'}
            </div>
            <div className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">
              {fmtISK(insights.thisWeekTotal)}
              <span className="text-[10px] text-[var(--text-muted)]"> / {fmtISK(insights.lastWeekTotal)}</span>
            </div>
          </div>
          <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg border ${
            deltaUp
              ? 'bg-red-500/10 text-red-400 border-red-500/20'
              : 'bg-green-500/10 text-green-400 border-green-500/20'
          }`}>
            {deltaUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span>{fmtISK(Math.abs(insights.delta))}</span>
          </div>
        </div>
      </div>

      {/* Biggest category changes */}
      <div className="mt-4">
        <div className="text-xs text-[var(--text-muted)]">
          {language === 'is' ? 'Stærstu breytingar (flokkar)' : 'Biggest changes (categories)'}
        </div>
        <div className="mt-2 space-y-2">
          {insights.catDeltas.slice(0, 4).map((row) => {
            const label = CATEGORY_LABELS[row.category]?.[language === 'is' ? 'is' : 'en'] || row.category
            const up = row.delta > 0
            return (
              <div key={row.category} className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-tertiary)]">
                <div className="text-xs text-[var(--text-secondary)]">{label}</div>
                <div className={`text-xs font-medium ${up ? 'text-red-400' : 'text-green-400'}`}>
                  {up ? '+' : '−'}{fmtISK(Math.abs(row.delta))}
                </div>
              </div>
            )
          })}
          {insights.catDeltas.length === 0 && (
            <div className="text-xs text-[var(--text-muted)] py-2">
              {language === 'is' ? 'Engin gögn enn — flyttu inn færslur til að fá innsýn.' : 'No data yet — import transactions to see insights.'}
            </div>
          )}
        </div>
      </div>

      {/* Aha insights */}
      {insights.aha.length > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-[var(--accent)]/10 to-purple-500/10 border border-[var(--accent)]/20">
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <Sparkles size={14} className="text-yellow-400" />
            <span>{language === 'is' ? 'Aha!' : 'Aha!'} </span>
          </div>
          <ul className="mt-2 space-y-1">
            {insights.aha.map((t, idx) => (
              <li key={idx} className="text-xs text-[var(--text-primary)] leading-relaxed">• {t}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Recurring candidates */}
      {insights.recurring.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-[var(--text-muted)] flex items-center gap-2">
              <Repeat size={14} className="text-[var(--text-muted)]" />
              <span>{language === 'is' ? 'Líklegar endurtekningar (áskriftir?)' : 'Likely recurring (subscriptions?)'}</span>
            </div>
          </div>
          <div className="mt-2 space-y-2">
            {insights.recurring.map((r) => (
              <div key={r.merchant} className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-tertiary)]">
                <div className="min-w-0">
                  <div className="text-xs text-[var(--text-primary)] truncate">{r.merchant}</div>
                  <div className="text-[10px] text-[var(--text-muted)]">~{r.intervalDays} {language === 'is' ? 'dagar' : 'days'} · ~{fmtISK(r.amount)}</div>
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
                  className="px-2 py-1 rounded-lg bg-[var(--accent)] text-white text-[10px] hover:opacity-90 transition-all"
                >
                  {language === 'is' ? 'Bæta við' : 'Add'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top merchants */}
      {insights.topMerchants.length > 0 && (
        <div className="mt-4">
          <div className="text-xs text-[var(--text-muted)]">
            {language === 'is' ? 'Topp staðir (þessi vika)' : 'Top merchants (this week)'}
          </div>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {insights.topMerchants.slice(0, 4).map((m) => (
              <div key={m.merchant} className="p-2 rounded-lg bg-[var(--bg-tertiary)]">
                <div className="text-xs text-[var(--text-primary)] truncate">{m.merchant}</div>
                <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{fmtISK(m.total)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
