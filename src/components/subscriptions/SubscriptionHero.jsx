import React, { useMemo } from 'react'
import { Repeat, TrendingDown, AlertCircle } from 'lucide-react'

export default function SubscriptionHero({ subscriptions = [], language = 'is' }) {
  const stats = useMemo(() => {
    const active = subscriptions.filter(s => s.status === 'active' || !s.status)
    const cancelled = subscriptions.filter(s => s.status === 'cancelled')
    const monthly = active.reduce((sum, s) => {
      const amt = Number(s.amount || s.avgAmount || s.lastPaymentAmount || 0)
      const cycle = s.billingCycle || s.frequency || 'monthly'
      if (cycle === 'yearly') return sum + Math.round(amt / 12)
      if (cycle === 'quarterly') return sum + Math.round(amt / 3)
      if (cycle === 'weekly') return sum + Math.round(amt * 4.33)
      return sum + amt
    }, 0)
    const yearly = monthly * 12
    const essential = active.filter(s => s.essential).reduce((sum, s) => sum + Number(s.amount || s.avgAmount || s.lastPaymentAmount || 0), 0)
    const cancelable = active.filter(s => s.cancelCandidate).reduce((sum, s) => sum + Number(s.amount || s.avgAmount || s.lastPaymentAmount || 0), 0)
    const unreviewed = active.filter(s => !s.essential && !s.cancelCandidate).length

    return { monthly, yearly, active: active.length, cancelled: cancelled.length, essential, cancelable, unreviewed }
  }, [subscriptions])

  const is = language === 'is'

  return (
    <div className="bg-gradient-to-br from-[var(--accent)]/10 via-[var(--bg-secondary)] to-purple-500/10 border border-[var(--accent)]/20 rounded-2xl p-6">
      {/* Title */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-[var(--accent)]/20">
          <Repeat size={20} className="text-[var(--accent)]" />
        </div>
        <h2 className="text-lg font-bold text-[var(--text-primary)]">
          {is ? 'Áskriftir' : 'Subscriptions'}
        </h2>
      </div>

      {/* Big number */}
      <div className="text-center mb-4">
        <div className="text-4xl font-black text-[var(--text-primary)] tracking-tight">
          {stats.monthly.toLocaleString('is-IS')}
          <span className="text-lg font-normal text-[var(--text-muted)] ml-1">kr/mán</span>
        </div>
        <div className="text-sm text-[var(--text-muted)] mt-1">
          {stats.yearly.toLocaleString('is-IS')} kr/ár
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 rounded-xl bg-[var(--bg-tertiary)]">
          <div className="text-lg font-bold text-[var(--text-primary)]">{stats.active}</div>
          <div className="text-[10px] text-[var(--text-muted)]">{is ? 'Virkar' : 'Active'}</div>
        </div>
        <div className="text-center p-3 rounded-xl bg-green-500/10">
          <div className="text-lg font-bold text-green-400">
            {stats.essential.toLocaleString('is-IS')}
          </div>
          <div className="text-[10px] text-green-400/70">{is ? 'Nauðsynlegt' : 'Essential'}</div>
        </div>
        <div className="text-center p-3 rounded-xl bg-red-500/10">
          <div className="text-lg font-bold text-red-400">
            {stats.cancelable.toLocaleString('is-IS')}
          </div>
          <div className="text-[10px] text-red-400/70">{is ? 'Hætta?' : 'Cut?'}</div>
        </div>
      </div>

      {/* Savings opportunity */}
      {stats.cancelable > 0 && (
        <div className="mt-4 p-3 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center gap-3">
          <TrendingDown size={18} className="text-[var(--accent)] flex-shrink-0" />
          <div>
            <div className="text-sm font-medium text-[var(--accent)]">
              {is ? 'Sparnaðartækifæri' : 'Savings opportunity'}
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              {is
                ? `Hætta merktu áskriftunum og sparaðu ${stats.cancelable.toLocaleString('is-IS')} kr/mán (${(stats.cancelable * 12).toLocaleString('is-IS')} kr/ár)`
                : `Cancel marked subs to save ${stats.cancelable.toLocaleString('is-IS')} ISK/mo (${(stats.cancelable * 12).toLocaleString('is-IS')} ISK/yr)`}
            </div>
          </div>
        </div>
      )}

      {/* Unreviewed callout */}
      {stats.unreviewed > 0 && stats.cancelable === 0 && (
        <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
          <AlertCircle size={18} className="text-amber-400 flex-shrink-0" />
          <div className="text-xs text-[var(--text-muted)]">
            {is
              ? `${stats.unreviewed} áskrift${stats.unreviewed > 1 ? 'ir' : ''} ekki yfirfarnar — merktu sem nauðsynlegt eða hætta?`
              : `${stats.unreviewed} subscription${stats.unreviewed > 1 ? 's' : ''} not reviewed — mark as essential or cancel?`}
          </div>
        </div>
      )}
    </div>
  )
}
