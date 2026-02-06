import React, { useMemo, useState } from 'react'
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Tag,
  ShoppingBag,
  Coffee,
  Car,
  Home,
  Smartphone,
  CreditCard,
  MoreHorizontal,
  Check,
  X
} from 'lucide-react'

// Auto-categorization based on merchant name
const CATEGORY_RULES = [
  { pattern: /wolt|dominos|pizza|subway|kfc|mcdonalds|burger/i, category: 'food-delivery', icon: ShoppingBag, color: 'orange' },
  { pattern: /spotify|netflix|hbo|disney|youtube|viaplay/i, category: 'entertainment', icon: Smartphone, color: 'purple' },
  { pattern: /síminn|nova|vodafone|hringdu/i, category: 'telecom', icon: Smartphone, color: 'blue' },
  { pattern: /n1|olís|orkan|olis|costco.*gas/i, category: 'fuel', icon: Car, color: 'green' },
  { pattern: /hagkaup|bónus|krónan|nettó|costco|ikea/i, category: 'groceries', icon: Home, color: 'teal' },
  { pattern: /starbucks|te og kaffi|kaffitár|reykjavik roasters/i, category: 'coffee', icon: Coffee, color: 'amber' },
  { pattern: /gym|world class|líkn|sports/i, category: 'health', icon: Home, color: 'pink' },
]

const CATEGORIES = {
  'food-delivery': { name: 'Matur/Delivery', nameEn: 'Food/Delivery', icon: ShoppingBag, color: 'orange' },
  'entertainment': { name: 'Afþreying', nameEn: 'Entertainment', icon: Smartphone, color: 'purple' },
  'telecom': { name: 'Fjarskipti', nameEn: 'Telecom', icon: Smartphone, color: 'blue' },
  'fuel': { name: 'Eldsneyti', nameEn: 'Fuel', icon: Car, color: 'green' },
  'groceries': { name: 'Matvörur', nameEn: 'Groceries', icon: Home, color: 'teal' },
  'coffee': { name: 'Kaffi', nameEn: 'Coffee', icon: Coffee, color: 'amber' },
  'health': { name: 'Heilsa', nameEn: 'Health', icon: Home, color: 'pink' },
  'subscription': { name: 'Áskrift', nameEn: 'Subscription', icon: CreditCard, color: 'indigo' },
  'other': { name: 'Annað', nameEn: 'Other', icon: MoreHorizontal, color: 'slate' },
}

function categorizeTransaction(tx, userOverrides = {}) {
  // Check user override first
  if (userOverrides[tx.id]) return userOverrides[tx.id]
  
  const merchant = (tx.merchant || tx.title || tx.description || '').toLowerCase()
  
  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(merchant)) {
      return rule.category
    }
  }
  
  // Check if it looks like a subscription (recurring similar amounts)
  if (tx.isRecurring) return 'subscription'
  
  return 'other'
}

export default function TransactionsExplorer({
  transactions = [],
  receipts = [],
  categoryOverrides = {},
  onUpdateCategory,
  language = 'is'
}) {
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState(null)
  const [sortBy, setSortBy] = useState('date') // date, amount, merchant
  const [sortDir, setSortDir] = useState('desc')
  const [showFilters, setShowFilters] = useState(false)

  // Combine and categorize all transactions
  const allTransactions = useMemo(() => {
    const combined = [
      ...transactions.map(t => ({ 
        ...t, 
        source: 'bank',
        // Map title to merchant for bank transactions
        merchant: t.merchant || t.title || t.description || 'Unknown',
        // Map amountISK to amount
        amount: t.amount ?? t.amountISK ?? 0
      })),
      ...receipts.map(r => ({ 
        ...r, 
        source: 'wolt',
        // Map vendor/title to merchant for receipts
        merchant: r.restaurant || r.merchant || r.vendor || r.title || 'Wolt',
        // Map amountISK/total to amount
        amount: r.total || r.amount || r.amountISK || 0
      }))
    ]
    
    return combined.map(tx => ({
      ...tx,
      category: categorizeTransaction(tx, categoryOverrides),
      displayDate: new Date(tx.date || tx.createdAt).toLocaleDateString('is-IS'),
      sortDate: new Date(tx.date || tx.createdAt).getTime()
    }))
  }, [transactions, receipts, categoryOverrides])

  // Filter and sort
  const filteredTransactions = useMemo(() => {
    let result = [...allTransactions]
    
    // Search filter
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(tx => 
        (tx.merchant || '').toLowerCase().includes(q) ||
        (tx.title || '').toLowerCase().includes(q) ||
        (tx.description || '').toLowerCase().includes(q)
      )
    }
    
    // Category filter
    if (filterCategory) {
      result = result.filter(tx => tx.category === filterCategory)
    }
    
    // Sort
    result.sort((a, b) => {
      let cmp = 0
      if (sortBy === 'date') cmp = a.sortDate - b.sortDate
      else if (sortBy === 'amount') cmp = (a.amount || 0) - (b.amount || 0)
      else if (sortBy === 'merchant') cmp = (a.merchant || '').localeCompare(b.merchant || '')
      return sortDir === 'desc' ? -cmp : cmp
    })
    
    return result
  }, [allTransactions, search, filterCategory, sortBy, sortDir])

  // Category stats
  const categoryStats = useMemo(() => {
    const stats = {}
    for (const tx of allTransactions) {
      if (!stats[tx.category]) {
        stats[tx.category] = { count: 0, total: 0 }
      }
      stats[tx.category].count++
      stats[tx.category].total += Math.abs(tx.amount || 0)
    }
    return stats
  }, [allTransactions])

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDir('desc')
    }
  }

  const colorClasses = {
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    teal: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    pink: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    slate: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  }

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag size={18} className="text-[var(--accent)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {language === 'is' ? 'Færslugreining' : 'Transaction Explorer'}
          </span>
        </div>
        <div className="text-xs text-[var(--text-muted)]">
          {allTransactions.length} {language === 'is' ? 'færslur' : 'transactions'}
        </div>
      </div>

      {/* Category summary */}
      <div className="flex flex-wrap gap-2 mt-3">
        <button
          onClick={() => setFilterCategory(null)}
          className={`px-2 py-1 rounded-lg text-xs transition-all ${
            !filterCategory 
              ? 'bg-[var(--accent)] text-white' 
              : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
          }`}
        >
          {language === 'is' ? 'Allt' : 'All'}
        </button>
        {Object.entries(CATEGORIES).map(([key, cat]) => {
          const stats = categoryStats[key]
          if (!stats) return null
          const Icon = cat.icon
          return (
            <button
              key={key}
              onClick={() => setFilterCategory(filterCategory === key ? null : key)}
              className={`px-2 py-1 rounded-lg text-xs transition-all flex items-center gap-1 ${
                filterCategory === key
                  ? colorClasses[cat.color]
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <Icon size={12} />
              <span>{language === 'is' ? cat.name : cat.nameEn}</span>
              <span className="opacity-60">({stats.count})</span>
            </button>
          )
        })}
      </div>

      {/* Search + sort */}
      <div className="flex gap-2 mt-3">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'is' ? 'Leita...' : 'Search...'}
            className="w-full pl-8 pr-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-sm text-[var(--text-primary)]"
          />
        </div>
        <button
          onClick={() => toggleSort('date')}
          className={`px-3 py-2 rounded-lg text-xs flex items-center gap-1 ${
            sortBy === 'date' ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
          }`}
        >
          <ArrowUpDown size={12} />
          {language === 'is' ? 'Dags' : 'Date'}
        </button>
        <button
          onClick={() => toggleSort('amount')}
          className={`px-3 py-2 rounded-lg text-xs flex items-center gap-1 ${
            sortBy === 'amount' ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
          }`}
        >
          <ArrowUpDown size={12} />
          {language === 'is' ? 'Upphæð' : 'Amount'}
        </button>
      </div>

      {/* Category totals for filtered */}
      {filterCategory && categoryStats[filterCategory] && (
        <div className="mt-3 p-3 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20">
          <div className="text-xs text-[var(--text-muted)]">
            {language === 'is' ? 'Samtals í flokki:' : 'Category total:'}
          </div>
          <div className="text-lg font-bold text-[var(--accent)]">
            {categoryStats[filterCategory].total.toLocaleString('is-IS')} kr
          </div>
        </div>
      )}

      {/* Transactions list */}
      <div className="mt-3 space-y-1 max-h-80 overflow-y-auto">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-sm text-[var(--text-muted)]">
            {language === 'is' ? 'Engar færslur fundust' : 'No transactions found'}
          </div>
        ) : (
          filteredTransactions.slice(0, 50).map((tx, i) => {
            const cat = CATEGORIES[tx.category] || CATEGORIES.other
            const Icon = cat.icon
            return (
              <div 
                key={tx.id || i}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-all group"
              >
                <div className={`p-1.5 rounded-lg ${colorClasses[cat.color]}`}>
                  <Icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-[var(--text-primary)] truncate">
                    {tx.merchant || tx.description || 'Unknown'}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">
                    {tx.displayDate} · {tx.source}
                  </div>
                </div>
                <div className="text-sm font-medium text-[var(--text-primary)]">
                  {Math.abs(tx.amount || 0).toLocaleString('is-IS')} kr
                </div>
                {/* Category override buttons (hidden until hover) */}
                <div className="opacity-0 group-hover:opacity-100 transition-all flex gap-1">
                  <select
                    value={tx.category}
                    onChange={(e) => onUpdateCategory?.(tx.id, e.target.value)}
                    className="text-[10px] px-1 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)]"
                  >
                    {Object.entries(CATEGORIES).map(([key, c]) => (
                      <option key={key} value={key}>
                        {language === 'is' ? c.name : c.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )
          })
        )}
        {filteredTransactions.length > 50 && (
          <div className="text-center py-2 text-xs text-[var(--text-muted)]">
            + {filteredTransactions.length - 50} {language === 'is' ? 'til viðbótar' : 'more'}
          </div>
        )}
      </div>
    </div>
  )
}
