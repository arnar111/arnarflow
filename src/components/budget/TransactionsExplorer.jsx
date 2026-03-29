import React, { useMemo, useState } from 'react'
import {
  ArrowUpDown,
  BadgeInfo,
  CalendarDays,
  Coffee,
  CreditCard,
  Home,
  MoreHorizontal,
  Search,
  ShoppingBag,
  Smartphone,
  Car,
  Tag,
  Wallet,
} from 'lucide-react'

// Auto-categorization based on merchant name
const CATEGORY_RULES = [
  { pattern: /wolt|dominos|pizza|subway|kfc|mcdonalds|burger/i, category: 'food-delivery', icon: ShoppingBag },
  { pattern: /spotify|netflix|hbo|disney|youtube|viaplay/i, category: 'entertainment', icon: Smartphone },
  { pattern: /síminn|nova|vodafone|hringdu/i, category: 'telecom', icon: Smartphone },
  { pattern: /n1|olís|orkan|olis|costco.*gas/i, category: 'fuel', icon: Car },
  { pattern: /hagkaup|bónus|krónan|nettó|costco|ikea/i, category: 'groceries', icon: Home },
  { pattern: /starbucks|te og kaffi|kaffitár|reykjavik roasters|kaffi/i, category: 'coffee', icon: Coffee },
  { pattern: /gym|world class|líkn|sports/i, category: 'health', icon: Home },
]

const CATEGORY_COLORS = {
  // keep in sync with SpendingInsightsDashboard for a cohesive look
  'food-delivery': '#F59E0B',
  entertainment: '#A855F7',
  telecom: '#3B82F6',
  fuel: '#EF4444',
  groceries: '#22C55E',
  coffee: '#F97316',
  other: '#6B7280',
  subscription: '#6366F1',
  health: '#EC4899',
}

const CATEGORIES = {
  'food-delivery': { name: 'Matur/Delivery', nameEn: 'Food/Delivery', icon: ShoppingBag },
  entertainment: { name: 'Afþreying', nameEn: 'Entertainment', icon: Smartphone },
  telecom: { name: 'Fjarskipti', nameEn: 'Telecom', icon: Smartphone },
  fuel: { name: 'Eldsneyti', nameEn: 'Fuel', icon: Car },
  groceries: { name: 'Matvörur', nameEn: 'Groceries', icon: Home },
  coffee: { name: 'Kaffi', nameEn: 'Coffee', icon: Coffee },
  health: { name: 'Heilsa', nameEn: 'Health', icon: Home },
  subscription: { name: 'Áskrift', nameEn: 'Subscription', icon: CreditCard },
  other: { name: 'Annað', nameEn: 'Other', icon: MoreHorizontal },
}

function categorizeTransaction(tx, userOverrides = {}) {
  if (userOverrides[tx.id]) return userOverrides[tx.id]

  const merchant = (tx.merchant || tx.title || tx.description || '').toLowerCase()

  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(merchant)) return rule.category
  }

  if (tx.isRecurring) return 'subscription'
  return 'other'
}

function fmtISK(n) {
  const v = Math.abs(Number(n || 0))
  return v.toLocaleString('is-IS') + ' kr'
}

function signedAmountForDisplay(tx) {
  // Receipts (Wolt) are always spending
  if (tx.source === 'wolt') return -Math.abs(Number(tx.amount || 0))
  const n = Number(tx.amount || 0)
  return n
}

function alpha(hex, a) {
  // '#RRGGBB' -> rgba
  const h = String(hex || '#6B7280').replace('#', '')
  const r = parseInt(h.slice(0, 2), 16) || 0
  const g = parseInt(h.slice(2, 4), 16) || 0
  const b = parseInt(h.slice(4, 6), 16) || 0
  return `rgba(${r},${g},${b},${a})`
}

export default function TransactionsExplorer({
  transactions = [],
  receipts = [],
  categoryOverrides = {},
  onUpdateCategory,
  language = 'is',
}) {
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState(null)
  const [sortBy, setSortBy] = useState('date') // date, amount, merchant
  const [sortDir, setSortDir] = useState('desc')

  const isIS = language === 'is'

  // Combine and categorize all transactions
  const allTransactions = useMemo(() => {
    const combined = [
      ...transactions.map(t => ({
        ...t,
        source: 'bank',
        merchant: t.merchant || t.title || t.description || 'Óþekkt',
        amount: t.amount ?? t.amountISK ?? 0,
      })),
      ...receipts.map(r => ({
        ...r,
        source: 'wolt',
        merchant: r.restaurant || r.merchant || r.vendor || r.title || 'Wolt',
        amount: r.total || r.amount || r.amountISK || 0,
      })),
    ]

    return combined
      .map(tx => {
        const dateObj = new Date(tx.date || tx.createdAt)
        const sortDate = dateObj.toString() === 'Invalid Date' ? 0 : dateObj.getTime()
        return {
          ...tx,
          category: categorizeTransaction(tx, categoryOverrides),
          displayDate: dateObj.toLocaleDateString('is-IS'),
          sortDate,
        }
      })
      .filter(tx => tx.sortDate)
  }, [transactions, receipts, categoryOverrides])

  const filteredTransactions = useMemo(() => {
    let result = [...allTransactions]

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(tx =>
        (tx.merchant || '').toLowerCase().includes(q) ||
        (tx.title || '').toLowerCase().includes(q) ||
        (tx.description || '').toLowerCase().includes(q)
      )
    }

    if (filterCategory) {
      result = result.filter(tx => tx.category === filterCategory)
    }

    result.sort((a, b) => {
      let cmp = 0
      if (sortBy === 'date') cmp = a.sortDate - b.sortDate
      else if (sortBy === 'amount') cmp = Math.abs(a.amount || 0) - Math.abs(b.amount || 0)
      else if (sortBy === 'merchant') cmp = (a.merchant || '').localeCompare(b.merchant || '')
      return sortDir === 'desc' ? -cmp : cmp
    })

    return result
  }, [allTransactions, search, filterCategory, sortBy, sortDir])

  const categoryStats = useMemo(() => {
    const stats = {}
    for (const tx of allTransactions) {
      const c = tx.category
      if (!stats[c]) stats[c] = { count: 0, total: 0 }
      stats[c].count++
      stats[c].total += Math.abs(Number(tx.amount || 0))
    }
    return stats
  }, [allTransactions])

  const dailyTotals = useMemo(() => {
    const map = new Map()
    for (const tx of filteredTransactions) {
      const key = tx.displayDate
      const signed = signedAmountForDisplay(tx)
      const prev = map.get(key) || { spend: 0, income: 0 }
      if (signed < 0) prev.spend += Math.abs(signed)
      else prev.income += signed
      map.set(key, prev)
    }
    return map
  }, [filteredTransactions])

  const toggleSort = (field) => {
    if (sortBy === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else {
      setSortBy(field)
      setSortDir('desc')
    }
  }

  const visible = filteredTransactions.slice(0, 60)

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag size={18} className="text-[var(--accent)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {isIS ? 'Færslur' : 'Transactions'}
          </span>
        </div>
        <div className="text-xs text-[var(--text-muted)]">
          {allTransactions.length} {isIS ? 'færslur' : 'transactions'}
        </div>
      </div>

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2 mt-3">
        <button
          onClick={() => setFilterCategory(null)}
          className={`px-2 py-1 rounded-lg text-xs transition-all ${
            !filterCategory
              ? 'bg-[var(--accent)] text-white'
              : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
          }`}
        >
          {isIS ? 'Allt' : 'All'}
        </button>
        {Object.entries(CATEGORIES).map(([key, cat]) => {
          const stats = categoryStats[key]
          if (!stats) return null
          const Icon = cat.icon
          const color = CATEGORY_COLORS[key] || CATEGORY_COLORS.other
          const active = filterCategory === key
          return (
            <button
              key={key}
              onClick={() => setFilterCategory(active ? null : key)}
              className="px-2 py-1 rounded-lg text-xs transition-all flex items-center gap-1 border"
              style={active
                ? {
                  backgroundColor: alpha(color, 0.12),
                  color,
                  borderColor: alpha(color, 0.22),
                }
                : {
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)',
                  borderColor: 'var(--border)',
                }
              }
            >
              <Icon size={12} />
              <span>{isIS ? cat.name : cat.nameEn}</span>
              <span className="opacity-60">({stats.count})</span>
            </button>
          )
        })}
      </div>

      {/* Search + sort bar */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-12 gap-2">
        <div className="sm:col-span-7 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isIS ? 'Leita í færslum (staður, lýsing...)' : 'Search transactions...'}
            className="w-full pl-8 pr-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-sm text-[var(--text-primary)]"
          />
        </div>
        <button
          onClick={() => toggleSort('date')}
          className={`sm:col-span-2 px-3 py-2 rounded-lg text-xs flex items-center justify-center gap-1 border ${
            sortBy === 'date'
              ? 'bg-[var(--accent)]/15 text-[var(--accent)] border-[var(--accent)]/25'
              : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border)]'
          }`}
        >
          <ArrowUpDown size={12} />
          {isIS ? 'Dags.' : 'Date'}
        </button>
        <button
          onClick={() => toggleSort('amount')}
          className={`sm:col-span-3 px-3 py-2 rounded-lg text-xs flex items-center justify-center gap-1 border ${
            sortBy === 'amount'
              ? 'bg-[var(--accent)]/15 text-[var(--accent)] border-[var(--accent)]/25'
              : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border)]'
          }`}
        >
          <ArrowUpDown size={12} />
          {isIS ? 'Upphæð' : 'Amount'}
        </button>
      </div>

      {/* Category total */}
      {filterCategory && categoryStats[filterCategory] && (
        <div
          className="mt-3 p-3 rounded-xl border"
          style={{
            backgroundColor: alpha(CATEGORY_COLORS[filterCategory] || CATEGORY_COLORS.other, 0.10),
            borderColor: alpha(CATEGORY_COLORS[filterCategory] || CATEGORY_COLORS.other, 0.20),
          }}
        >
          <div className="text-xs text-[var(--text-muted)]">
            {isIS ? 'Samtals í flokki:' : 'Category total:'}
          </div>
          <div className="text-lg font-bold" style={{ color: CATEGORY_COLORS[filterCategory] || CATEGORY_COLORS.other }}>
            {categoryStats[filterCategory].total.toLocaleString('is-IS')} kr
          </div>
        </div>
      )}

      {/* Transactions list */}
      <div className="mt-3 space-y-1 max-h-96 overflow-y-auto pr-1">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-10">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border)] flex items-center justify-center">
              <Wallet className="text-[var(--text-muted)]" size={22} />
            </div>
            <div className="mt-3 text-sm text-[var(--text-primary)] font-medium">
              {isIS ? 'Engar færslur enn' : 'No transactions yet'}
            </div>
            <div className="mt-1 text-xs text-[var(--text-muted)] max-w-sm mx-auto">
              {isIS
                ? 'Flyttu inn bankafærslur og Wolt kvittanir til að sjá flokka, leit og daglega samantekt.'
                : 'Import bank transactions and Wolt receipts to see categories, search and daily summaries.'}
            </div>
          </div>
        ) : (
          (() => {
            let lastDate = null
            return visible.map((tx, i) => {
              const cat = CATEGORIES[tx.category] || CATEGORIES.other
              const Icon = cat.icon
              const color = CATEGORY_COLORS[tx.category] || CATEGORY_COLORS.other
              const signed = signedAmountForDisplay(tx)
              const isIncome = signed > 0
              const showHeader = tx.displayDate !== lastDate
              if (showHeader) lastDate = tx.displayDate
              const day = dailyTotals.get(tx.displayDate) || { spend: 0, income: 0 }

              return (
                <React.Fragment key={tx.id || `${tx.source}-${i}`}>
                  {showHeader && (
                    <div className="sticky top-0 z-10 -mx-1 px-1 py-2 bg-[var(--bg-secondary)]">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                          <CalendarDays size={12} className="text-[var(--text-muted)]" />
                          <span className="font-medium text-[var(--text-primary)]">{tx.displayDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                          {day.income > 0 && (
                            <span className="px-2 py-1 rounded-lg border bg-green-500/10 text-green-400 border-green-500/20">
                              +{fmtISK(day.income)}
                            </span>
                          )}
                          {day.spend > 0 && (
                            <span className="px-2 py-1 rounded-lg border bg-red-500/10 text-red-400 border-red-500/20">
                              −{fmtISK(day.spend)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--bg-tertiary)] transition-all group border border-transparent hover:border-[var(--border)]">
                    {/* Icon */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center border"
                      style={{
                        backgroundColor: alpha(color, 0.12),
                        borderColor: alpha(color, 0.22),
                        color,
                      }}
                    >
                      <Icon size={16} />
                    </div>

                    {/* Main */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="text-sm text-[var(--text-primary)] truncate">{tx.merchant || tx.description || 'Óþekkt'}</div>
                        <span
                          className="shrink-0 px-2 py-0.5 rounded-full text-[10px] border"
                          style={{
                            backgroundColor: alpha(color, 0.10),
                            borderColor: alpha(color, 0.20),
                            color,
                          }}
                          title={isIS ? 'Flokkur' : 'Category'}
                        >
                          {isIS ? cat.name : cat.nameEn}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
                        <span className="uppercase tracking-wide">{tx.source}</span>
                        <span className="opacity-40">•</span>
                        <span className="flex items-center gap-1">
                          <BadgeInfo size={11} className="opacity-70" />
                          <span>{isIS ? 'Breyta flokki' : 'Edit category'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className={`text-sm font-semibold tabular-nums ${isIncome ? 'text-green-400' : 'text-red-400'}`}>
                      {isIncome ? '+' : '−'}{fmtISK(signed)}
                    </div>

                    {/* Override selector (shown on hover, but stays accessible) */}
                    <div className="opacity-0 group-hover:opacity-100 transition-all">
                      <select
                        value={tx.category}
                        onChange={(e) => onUpdateCategory?.(tx.id, e.target.value)}
                        className="text-[10px] px-2 py-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)]"
                        title={isIS ? 'Velja flokk' : 'Select category'}
                      >
                        {Object.entries(CATEGORIES).map(([key, c]) => (
                          <option key={key} value={key}>
                            {isIS ? c.name : c.nameEn}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </React.Fragment>
              )
            })
          })()
        )}

        {filteredTransactions.length > visible.length && (
          <div className="text-center py-2 text-xs text-[var(--text-muted)]">
            + {filteredTransactions.length - visible.length} {isIS ? 'til viðbótar' : 'more'}
          </div>
        )}
      </div>

      {/* tiny footer hint */}
      {filteredTransactions.length > 0 && (
        <div className="mt-3 text-[10px] text-[var(--text-muted)] flex items-center gap-2">
          <CreditCard size={12} className="opacity-70" />
          <span>
            {isIS
              ? 'Ábending: Notaðu leitina + flokka til að finna „leka“ í eyðslu.'
              : 'Tip: Use search + categories to find spending leaks.'}
          </span>
        </div>
      )}
    </div>
  )
}
