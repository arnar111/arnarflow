import React, { useMemo, useState } from 'react'
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  HelpCircle,
  TrendingDown,
  Sparkles
} from 'lucide-react'

const COMMON_SUBSCRIPTIONS = [
  { name: 'ChatGPT Plus', amount: 3500, category: 'AI' },
  { name: 'Claude Pro', amount: 3500, category: 'AI' },
  { name: 'Spotify', amount: 1490, category: 'Entertainment' },
  { name: 'Netflix', amount: 1990, category: 'Entertainment' },
  { name: 'YouTube Premium', amount: 1790, category: 'Entertainment' },
  { name: 'Síminn', amount: 4990, category: 'Telecom' },
  { name: 'Nova', amount: 4990, category: 'Telecom' },
  { name: 'Vodafone', amount: 4990, category: 'Telecom' },
  { name: 'Líkn', amount: 3990, category: 'Health' },
  { name: 'World Class', amount: 9900, category: 'Health' },
  { name: 'GitHub Copilot', amount: 1800, category: 'Dev' },
  { name: 'Netlify', amount: 0, category: 'Dev' },
  { name: 'Firebase', amount: 0, category: 'Dev' },
  { name: 'Cursor', amount: 3500, category: 'Dev' },
]

export default function SubscriptionManager({
  subscriptions = [],
  onAdd,
  onUpdate,
  onDelete,
  language = 'is'
}) {
  const [showAdd, setShowAdd] = useState(false)
  const [newSub, setNewSub] = useState({ name: '', amount: '', category: 'Other' })

  const stats = useMemo(() => {
    const total = subscriptions.reduce((sum, s) => sum + (s.amount || 0), 0)
    const essential = subscriptions.filter(s => s.essential).reduce((sum, s) => sum + (s.amount || 0), 0)
    const cancelable = subscriptions.filter(s => s.cancelCandidate).reduce((sum, s) => sum + (s.amount || 0), 0)
    const unreviewed = subscriptions.filter(s => !s.essential && !s.cancelCandidate).length
    return { total, essential, cancelable, unreviewed }
  }, [subscriptions])

  const handleAddSubscription = () => {
    if (!newSub.name || !newSub.amount) return
    onAdd?.({
      id: Date.now().toString(),
      name: newSub.name,
      amount: Number(newSub.amount),
      category: newSub.category,
      essential: false,
      cancelCandidate: false,
      createdAt: new Date().toISOString()
    })
    setNewSub({ name: '', amount: '', category: 'Other' })
    setShowAdd(false)
  }

  const handleQuickAdd = (sub) => {
    onAdd?.({
      id: Date.now().toString(),
      name: sub.name,
      amount: sub.amount,
      category: sub.category,
      essential: false,
      cancelCandidate: false,
      createdAt: new Date().toISOString()
    })
  }

  const existingNames = new Set(subscriptions.map(s => s.name.toLowerCase()))
  const suggestions = COMMON_SUBSCRIPTIONS.filter(s => !existingNames.has(s.name.toLowerCase()))

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard size={18} className="text-[var(--accent)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {language === 'is' ? 'Áskriftir & endurtekin útgjöld' : 'Subscriptions & recurring'}
          </span>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-2 mt-3">
        <div className="p-2 rounded-lg bg-[var(--bg-tertiary)] text-center">
          <div className="text-lg font-semibold text-[var(--text-primary)]">
            {stats.total.toLocaleString('is-IS')}
          </div>
          <div className="text-[10px] text-[var(--text-muted)]">
            {language === 'is' ? 'kr/mán samtals' : 'ISK/mo total'}
          </div>
        </div>
        <div className="p-2 rounded-lg bg-green-500/10 text-center">
          <div className="text-lg font-semibold text-green-400">
            {stats.essential.toLocaleString('is-IS')}
          </div>
          <div className="text-[10px] text-green-400/70">
            {language === 'is' ? 'nauðsynlegt' : 'essential'}
          </div>
        </div>
        <div className="p-2 rounded-lg bg-red-500/10 text-center">
          <div className="text-lg font-semibold text-red-400">
            {stats.cancelable.toLocaleString('is-IS')}
          </div>
          <div className="text-[10px] text-red-400/70">
            {language === 'is' ? 'hætta?' : 'cancel?'}
          </div>
        </div>
      </div>

      {/* What-if slider */}
      {stats.cancelable > 0 && (
        <div className="mt-3 p-3 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20">
          <div className="flex items-center gap-2 text-xs text-[var(--accent)]">
            <TrendingDown size={14} />
            <span>
              {language === 'is' 
                ? `Ef þú hættir merktu áskriftunum sparar þú ${stats.cancelable.toLocaleString('is-IS')} kr/mán` 
                : `Cancelling marked subscriptions saves ${stats.cancelable.toLocaleString('is-IS')} ISK/mo`}
            </span>
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-1">
            = {(stats.cancelable * 12).toLocaleString('is-IS')} kr/ár
          </div>
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <div className="mt-3 p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] space-y-2">
          <input
            value={newSub.name}
            onChange={(e) => setNewSub({ ...newSub, name: e.target.value })}
            placeholder={language === 'is' ? 'Nafn áskriftar' : 'Subscription name'}
            className="w-full px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)]"
          />
          <div className="flex gap-2">
            <input
              value={newSub.amount}
              onChange={(e) => setNewSub({ ...newSub, amount: e.target.value })}
              type="number"
              placeholder={language === 'is' ? 'kr/mán' : 'ISK/mo'}
              className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)]"
            />
            <button
              onClick={handleAddSubscription}
              className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm hover:opacity-90"
            >
              {language === 'is' ? 'Bæta við' : 'Add'}
            </button>
          </div>
          
          {/* Quick add suggestions */}
          {suggestions.length > 0 && (
            <div className="pt-2 border-t border-[var(--border)]">
              <div className="text-[10px] text-[var(--text-muted)] mb-1">
                {language === 'is' ? 'Flýtival:' : 'Quick add:'}
              </div>
              <div className="flex flex-wrap gap-1">
                {suggestions.slice(0, 6).map((sub, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickAdd(sub)}
                    className="px-2 py-1 rounded text-[10px] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-all"
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subscriptions list */}
      <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
        {subscriptions.length === 0 ? (
          <div className="text-center py-4 text-sm text-[var(--text-muted)]">
            {language === 'is' ? 'Engar áskriftir skráðar' : 'No subscriptions tracked'}
            <button
              onClick={() => setShowAdd(true)}
              className="block mx-auto mt-2 text-[var(--accent)] hover:underline text-xs"
            >
              {language === 'is' ? '+ Bæta við fyrstu' : '+ Add your first'}
            </button>
          </div>
        ) : (
          subscriptions.map((sub) => (
            <div 
              key={sub.id} 
              className={`p-3 rounded-lg border transition-all ${
                sub.essential 
                  ? 'bg-green-500/5 border-green-500/20' 
                  : sub.cancelCandidate 
                    ? 'bg-red-500/5 border-red-500/20'
                    : 'bg-[var(--bg-tertiary)] border-[var(--border)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-[var(--text-primary)]">{sub.name}</div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {(sub.amount || 0).toLocaleString('is-IS')} kr/mán
                    {sub.category && ` · ${sub.category}`}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onUpdate?.(sub.id, { 
                      essential: !sub.essential, 
                      cancelCandidate: false 
                    })}
                    className={`p-1.5 rounded transition-all ${
                      sub.essential 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'text-[var(--text-muted)] hover:text-green-400 hover:bg-green-500/10'
                    }`}
                    title={language === 'is' ? 'Nauðsynlegt' : 'Essential'}
                  >
                    <CheckCircle2 size={16} />
                  </button>
                  <button
                    onClick={() => onUpdate?.(sub.id, { 
                      cancelCandidate: !sub.cancelCandidate, 
                      essential: false 
                    })}
                    className={`p-1.5 rounded transition-all ${
                      sub.cancelCandidate 
                        ? 'bg-red-500/20 text-red-400' 
                        : 'text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10'
                    }`}
                    title={language === 'is' ? 'Hætta?' : 'Cancel?'}
                  >
                    <XCircle size={16} />
                  </button>
                  <button
                    onClick={() => onDelete?.(sub.id)}
                    className="p-1.5 rounded text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title={language === 'is' ? 'Eyða' : 'Delete'}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {stats.unreviewed > 0 && (
        <div className="mt-3 p-2 rounded-lg bg-yellow-500/10 text-xs text-yellow-400 flex items-center gap-2">
          <HelpCircle size={14} />
          <span>
            {language === 'is' 
              ? `${stats.unreviewed} áskriftir óyfirfarnar — merktu sem nauðsynlegt eða til að hætta` 
              : `${stats.unreviewed} subscriptions unreviewed — mark as essential or cancel candidate`}
          </span>
        </div>
      )}
    </div>
  )
}
