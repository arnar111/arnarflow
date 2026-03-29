import React, { useMemo, useState, useCallback } from 'react'
import useStore from '../store/useStore'
import { useTranslation } from '../i18n/useTranslation'
import { Plus, Search, Sparkles, ChevronDown, ChevronRight, Shield, XCircle, Edit3, Trash2, CheckCircle } from 'lucide-react'
import SubscriptionHero from './subscriptions/SubscriptionHero'
import { CategoryDonut, MonthlyTrendChart } from './subscriptions/SubscriptionCharts'
import AddSubscriptionModal from './subscriptions/AddSubscriptionModal'
import CategoryBadge from './subscriptions/CategoryBadge'
import { CATEGORIES } from './subscriptions/constants'
import { detectSubscriptions } from './subscriptions/detectSubscriptions'

export default function SubscriptionsView() {
  const { language } = useTranslation()
  const is = language === 'is'

  // Store connections — use new subscriptions slice
  const subscriptionsRaw = useStore(s => s.subscriptions || [])
  const transactions = useStore(s => s.budgetTransactions || [])
  const dismissedDetections = useStore(s => s.dismissedDetections || [])

  // Actions
  const addSubscription = useStore(s => s.addSubscription)
  const updateSubscription = useStore(s => s.updateSubscription)
  const deleteSubscription = useStore(s => s.deleteSubscription)
  const dismissDetection = useStore(s => s.dismissDetection)
  const confirmDetection = useStore(s => s.confirmDetection)

  // Ensure all subscriptions have an amount field
  const subscriptions = useMemo(() => {
    const list = (subscriptionsRaw || []).map(s => ({
      ...s,
      amount: Number(s.amount || s.avgAmount || s.lastPaymentAmount || 0),
      status: s.status || 'active',
      billingCycle: s.billingCycle || s.frequency || 'monthly'
    }))
    return list
  }, [subscriptionsRaw])

  // UI state
  const [search, setSearch] = useState('')
  const [collapsedCategories, setCollapsedCategories] = useState(new Set())
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editSub, setEditSub] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  // Group subscriptions by category
  const grouped = useMemo(() => {
    const active = subscriptions.filter(s => s.status !== 'cancelled')
    const filtered = search
      ? active.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()))
      : active

    const groups = {}
    for (const sub of filtered) {
      const cat = sub.category || 'other'
      if (!groups[cat]) groups[cat] = { subs: [], total: 0 }
      const amt = Number(sub.amount || sub.avgAmount || sub.lastPaymentAmount || 0)
      groups[cat].subs.push({ ...sub, amount: amt })
      groups[cat].total += amt
    }

    return Object.entries(groups).sort((a, b) => b[1].total - a[1].total)
  }, [subscriptions, search])

  // Auto-detect candidates
  const detected = useMemo(() => {
    if (transactions.length === 0) return []
    const results = detectSubscriptions(transactions, dismissedDetections)
    
    return results.map(d => ({
      ...d,
      amount: Number(d.amount || d.avgAmount || 0)
    })).filter(d => !subscriptions.some(s =>
        s.name?.toLowerCase() === d.name?.toLowerCase() ||
        s.merchantPattern === d.merchantKey
      ))
  }, [transactions, subscriptions, dismissedDetections])

  const toggleCategory = useCallback((cat) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })
  }, [])

  const handleSave = useCallback((sub) => {
    if (editSub) {
      updateSubscription(sub.id, sub)
    } else {
      addSubscription(sub)
    }
    setEditSub(null)
  }, [editSub, updateSubscription, addSubscription])

  const handleDelete = useCallback((id) => {
    deleteSubscription(id)
    setConfirmDelete(null)
  }, [deleteSubscription])

  const handleToggleEssential = useCallback((sub) => {
    updateSubscription(sub.id, {
      essential: !sub.essential,
      cancelCandidate: !sub.essential ? false : sub.cancelCandidate
    })
  }, [updateSubscription])

  const handleToggleCancel = useCallback((sub) => {
    updateSubscription(sub.id, {
      cancelCandidate: !sub.cancelCandidate,
      essential: !sub.cancelCandidate ? false : sub.essential
    })
  }, [updateSubscription])

  const handleConfirmDetection = useCallback((detection) => {
    confirmDetection(detection)
  }, [confirmDetection])

  const handleDismissDetection = useCallback((merchantKey) => {
    dismissDetection(merchantKey)
  }, [dismissDetection])

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Hero */}
      <SubscriptionHero subscriptions={subscriptions} language={language} />

      {/* Charts row */}
      {subscriptions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CategoryDonut subscriptions={subscriptions} language={language} />
          <MonthlyTrendChart subscriptions={subscriptions} language={language} />
        </div>
      )}

      {/* Auto-detected */}
      {detected.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-yellow-400" />
            <span className="text-sm font-medium text-yellow-400">
              {is
                ? `Fundust ${detected.length} mögulega${detected.length === 1 ? '' : 'r'} áskrift${detected.length === 1 ? '' : 'ir'}`
                : `Found ${detected.length} possible subscription${detected.length === 1 ? '' : 's'}`}
            </span>
          </div>
          <div className="space-y-2">
            {detected.slice(0, 5).map((d, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-tertiary)] group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: (CATEGORIES[d.category]?.color || '#6B7280') + '20', color: CATEGORIES[d.category]?.color || '#6B7280' }}>
                    {d.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-[var(--text-primary)]">{d.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--text-muted)]">
                        {d.amount.toLocaleString('is-IS')} kr/mán
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        d.confidence === 'high' ? 'bg-green-500/20 text-green-400' :
                        d.confidence === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {d.confidence === 'high' ? '●●●' : d.confidence === 'medium' ? '●●○' : '●○○'}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {d.transactionCount}x
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleConfirmDetection(d)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-all"
                  >
                    <CheckCircle size={12} />
                    {is ? 'Staðfesta' : 'Confirm'}
                  </button>
                  <button
                    onClick={() => handleDismissDetection(d.merchantKey)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]/80 transition-all border border-[var(--border)]"
                  >
                    <XCircle size={12} />
                    {is ? 'Hunsa' : 'Dismiss'}
                  </button>
                </div>
              </div>
            ))}
            {detected.length > 5 && (
              <div className="text-center pt-1">
                <span className="text-xs text-[var(--text-muted)]">
                  +{detected.length - 5} {is ? 'í viðbót' : 'more'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search + Add */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={is ? 'Leita í áskriftum...' : 'Search subscriptions...'}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>
        <button
          onClick={() => { setEditSub(null); setAddModalOpen(true) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-all"
        >
          <Plus size={16} />
          {is ? 'Bæta við' : 'Add'}
        </button>
      </div>

      {/* Grouped subscription list */}
      {grouped.length > 0 ? (
        <div className="space-y-3">
          {grouped.map(([category, { subs, total }]) => {
            const cat = CATEGORIES[category] || CATEGORIES.other
            const Icon = cat.icon
            const isCollapsed = collapsedCategories.has(category)

            return (
              <div key={category} className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl overflow-hidden transition-all">
                {/* Category header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-4 hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${cat.bg}`}>
                      <Icon size={16} className={cat.text} />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-[var(--text-primary)]">
                        {cat[is ? 'is' : 'en']}
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        {subs.length} {is ? 'áskrift' : 'subscription'}{subs.length !== 1 ? (is ? 'ir' : 's') : ''}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-semibold text-[var(--text-primary)]">
                        {total.toLocaleString('is-IS')} kr
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)]">/mán</div>
                    </div>
                    {isCollapsed
                      ? <ChevronRight size={16} className="text-[var(--text-muted)]" />
                      : <ChevronDown size={16} className="text-[var(--text-muted)]" />}
                  </div>
                </button>

                {/* Subscription items */}
                {!isCollapsed && (
                  <div className="border-t border-[var(--border)] divide-y divide-[var(--border)]">
                    {subs.sort((a, b) => (b.amount || 0) - (a.amount || 0)).map(sub => (
                      <div key={sub.id} className="flex items-center justify-between p-4 hover:bg-[var(--bg-tertiary)] transition-colors group">
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                            style={{
                              backgroundColor: (cat.color || '#6B7280') + '20',
                              color: cat.color || '#6B7280'
                            }}
                          >
                            {sub.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-[var(--text-primary)]">{sub.name}</span>
                              <span className="text-xs text-[var(--text-muted)]">({(Number(sub.amount || sub.avgAmount || 0)).toLocaleString('is-IS')} kr)</span>
                              {sub.essential && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 flex items-center gap-0.5">
                                  <Shield size={8} />
                                  {is ? 'Nauðs.' : 'Essential'}
                                </span>
                              )}
                              {sub.cancelCandidate && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 flex items-center gap-0.5">
                                  <XCircle size={8} />
                                  {is ? 'Hætta?' : 'Cancel?'}
                                </span>
                              )}
                              {sub.autoDetected && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                                  <Sparkles size={8} className="inline mr-0.5" />
                                  Auto
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {sub.billingCycle && sub.billingCycle !== 'monthly' && (
                                <span className="text-[10px] text-[var(--text-muted)]">
                                  {is
                                    ? (sub.billingCycle === 'yearly' ? 'Árlega' : sub.billingCycle === 'weekly' ? 'Vikulega' : 'Ársfjórðungslega')
                                    : sub.billingCycle}
                                </span>
                              )}
                              {sub.notes && (
                                <span className="text-[10px] text-[var(--text-muted)] truncate max-w-[120px]" title={sub.notes}>
                                  {sub.notes}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Action buttons (visible on hover) */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleToggleEssential(sub) }}
                              className={`p-1.5 rounded-lg transition-all ${sub.essential ? 'bg-green-500/20 text-green-400' : 'text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)]'}`}
                              title={is ? 'Nauðsynlegt' : 'Essential'}
                            >
                              <Shield size={14} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleToggleCancel(sub) }}
                              className={`p-1.5 rounded-lg transition-all ${sub.cancelCandidate ? 'bg-red-500/20 text-red-400' : 'text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)]'}`}
                              title={is ? 'Hætta?' : 'Cancel?'}
                            >
                              <XCircle size={14} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setEditSub(sub); setAddModalOpen(true) }}
                              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] transition-all"
                              title={is ? 'Breyta' : 'Edit'}
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setConfirmDelete(sub.id) }}
                              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-400 transition-all"
                              title={is ? 'Eyða' : 'Delete'}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          {/* Amount */}
                          <div className="text-right min-w-[80px]">
                            <div className="text-sm font-medium text-[var(--text-primary)]">
                              {Number(sub.amount || sub.avgAmount || 0).toLocaleString('is-IS')} kr
                            </div>
                            <div className="text-[10px] text-[var(--text-muted)]">
                              {is ? '/mán' : '/mo'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center">
            <Plus size={24} className="text-[var(--text-muted)]" />
          </div>
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
            {is ? 'Engar áskriftir enn' : 'No subscriptions yet'}
          </h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            {is
              ? 'Bættu við áskriftunum þínum til að fylgjast með kostnaði.'
              : 'Add your subscriptions to track costs.'}
          </p>
          <button
            onClick={() => { setEditSub(null); setAddModalOpen(true) }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-all"
          >
            <Plus size={16} />
            {is ? 'Bæta við fyrstu áskriftinni' : 'Add your first subscription'}
          </button>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDelete(null)}>
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
              {is ? 'Eyða áskrift?' : 'Delete subscription?'}
            </h3>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              {is ? 'Þetta er ekki hægt að afturkalla.' : 'This cannot be undone.'}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-xl text-sm text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] transition-all"
              >
                {is ? 'Hætta við' : 'Cancel'}
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-all"
              >
                {is ? 'Eyða' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {addModalOpen && (
        <AddSubscriptionModal
          onClose={() => { setAddModalOpen(false); setEditSub(null) }}
          onSave={handleSave}
          editSub={editSub}
          language={language}
        />
      )}
    </div>
  )
}
