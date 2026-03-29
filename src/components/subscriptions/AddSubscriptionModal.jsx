import React, { useState, useMemo } from 'react'
import { X, Plus, Search, Zap } from 'lucide-react'
import { CATEGORIES, KNOWN_SUBSCRIPTIONS, BILLING_CYCLES } from './constants'

export default function AddSubscriptionModal({ onClose, onSave, editSub = null, language = 'is' }) {
  const is = language === 'is'
  const isEditing = !!editSub

  const [name, setName] = useState(editSub?.name || '')
  const [amount, setAmount] = useState(editSub?.amount?.toString() || '')
  const [category, setCategory] = useState(editSub?.category || 'other')
  const [billingCycle, setBillingCycle] = useState(editSub?.billingCycle || 'monthly')
  const [essential, setEssential] = useState(editSub?.essential || false)
  const [cancelCandidate, setCancelCandidate] = useState(editSub?.cancelCandidate || false)
  const [notes, setNotes] = useState(editSub?.notes || '')
  const [quickSearch, setQuickSearch] = useState('')
  const [showQuickAdd, setShowQuickAdd] = useState(!isEditing)
  const [showNameAutocomplete, setShowNameAutocomplete] = useState(false)

  // Autocomplete for name field
  const nameSuggestions = useMemo(() => {
    if (!name || name.length < 2) return []
    const term = name.toLowerCase()
    return KNOWN_SUBSCRIPTIONS.filter(k =>
      k.name.toLowerCase().includes(term) ||
      k.name.toLowerCase().startsWith(term)
    ).slice(0, 5)
  }, [name])

  const handleNameSuggestion = (known) => {
    setName(known.name)
    if (!amount) setAmount(known.defaultAmount.toString())
    if (category === 'other') setCategory(known.category)
    setShowNameAutocomplete(false)
  }

  const filteredKnown = useMemo(() => {
    if (!quickSearch) return KNOWN_SUBSCRIPTIONS
    return KNOWN_SUBSCRIPTIONS.filter(k =>
      k.name.toLowerCase().includes(quickSearch.toLowerCase())
    )
  }, [quickSearch])

  const handleQuickAdd = (known) => {
    setName(known.name)
    setAmount(known.defaultAmount.toString())
    setCategory(known.category)
    setShowQuickAdd(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !amount) return

    const sub = {
      ...(editSub || {}),
      id: editSub?.id || Date.now().toString(),
      name: name.trim(),
      amount: Number(amount),
      category,
      billingCycle,
      essential,
      cancelCandidate: essential ? false : cancelCandidate,
      notes: notes.trim(),
      status: editSub?.status || 'active',
    }

    onSave(sub)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">
            {isEditing
              ? (is ? 'Breyta áskrift' : 'Edit Subscription')
              : (is ? 'Bæta við áskrift' : 'Add Subscription')}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Add from Known Subscriptions */}
        {showQuickAdd && !isEditing && (
          <div className="p-5 border-b border-[var(--border)]">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={14} className="text-[var(--accent)]" />
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {is ? 'Flýtival' : 'Quick Add'}
              </span>
            </div>
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                value={quickSearch}
                onChange={e => setQuickSearch(e.target.value)}
                placeholder={is ? 'Leita...' : 'Search...'}
                className="w-full pl-8 pr-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
              />
            </div>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {filteredKnown.map((k, i) => {
                const cat = CATEGORIES[k.category]
                return (
                  <button
                    key={i}
                    onClick={() => handleQuickAdd(k)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all hover:scale-105 ${cat?.bg || 'bg-gray-500/10'} ${cat?.text || 'text-gray-400'} border-transparent hover:border-[var(--accent)]/30`}
                  >
                    {k.name}
                    <span className="text-[10px] opacity-60">{k.defaultAmount.toLocaleString('is-IS')}</span>
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => setShowQuickAdd(false)}
              className="mt-3 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              {is ? 'Eða fylla út handvirkt ↓' : 'Or fill in manually ↓'}
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Name with autocomplete */}
          <div className="relative">
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              {is ? 'Nafn' : 'Name'}
            </label>
            <input
              value={name}
              onChange={e => {
                setName(e.target.value)
                setShowNameAutocomplete(e.target.value.length >= 2)
              }}
              onBlur={() => setTimeout(() => setShowNameAutocomplete(false), 150)}
              onFocus={() => setShowNameAutocomplete(name.length >= 2 && nameSuggestions.length > 0)}
              placeholder={is ? 'T.d. Netflix, Síminn...' : 'e.g. Netflix, Síminn...'}
              className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              required
              autoFocus={!showQuickAdd}
            />
            {/* Autocomplete dropdown */}
            {showNameAutocomplete && nameSuggestions.length > 0 && (
              <div className="absolute z-10 left-0 right-0 top-full mt-1 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-xl shadow-lg overflow-hidden">
                {nameSuggestions.map((k, i) => {
                  const cat = CATEGORIES[k.category]
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleNameSuggestion(k)}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-[var(--accent)]/10 transition-colors text-left"
                    >
                      <span className="text-sm text-[var(--text-primary)]">{k.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--text-muted)]">{k.defaultAmount.toLocaleString('is-IS')} kr</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${cat?.bg} ${cat?.text}`}>
                          {is ? cat?.is : cat?.en}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Amount + Billing Cycle */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                {is ? 'Upphæð (kr)' : 'Amount (ISK)'}
              </label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                {is ? 'Tímabil' : 'Billing Cycle'}
              </label>
              <select
                value={billingCycle}
                onChange={e => setBillingCycle(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              >
                {BILLING_CYCLES.map(c => (
                  <option key={c.value} value={c.value}>
                    {is ? c.is : c.en}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              {is ? 'Flokkur' : 'Category'}
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            >
              {Object.entries(CATEGORIES).map(([key, cat]) => (
                <option key={key} value={key}>
                  {is ? cat.is : cat.en}
                </option>
              ))}
            </select>
          </div>

          {/* Status toggles */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={essential}
                onChange={e => {
                  setEssential(e.target.checked)
                  if (e.target.checked) setCancelCandidate(false)
                }}
                className="w-4 h-4 rounded border-[var(--border)] accent-green-500"
              />
              <span className="text-sm text-green-400">
                {is ? 'Nauðsynlegt' : 'Essential'}
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={cancelCandidate}
                onChange={e => {
                  setCancelCandidate(e.target.checked)
                  if (e.target.checked) setEssential(false)
                }}
                className="w-4 h-4 rounded border-[var(--border)] accent-red-500"
              />
              <span className="text-sm text-red-400">
                {is ? 'Hætta?' : 'Cancel candidate?'}
              </span>
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              {is ? 'Athugasemdir' : 'Notes'}
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={is ? 'Valfrjálst...' : 'Optional...'}
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] transition-all"
            >
              {is ? 'Hætta við' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !amount}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={16} />
              {isEditing
                ? (is ? 'Vista breytingar' : 'Save changes')
                : (is ? 'Bæta við' : 'Add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
