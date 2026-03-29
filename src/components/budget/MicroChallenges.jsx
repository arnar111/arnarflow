import React, { useMemo } from 'react'
import {
  Flame,
  Trophy,
  Check,
  Lock,
  ChefHat,
  Coffee,
  ShoppingBag,
  Target,
  Sparkles,
  Shield,
} from 'lucide-react'

const TIER_COLORS = {
  bronze: { bg: 'bg-orange-900/20', border: 'border-orange-700/30', text: 'text-orange-400' },
  silver: { bg: 'bg-slate-500/20', border: 'border-slate-400/30', text: 'text-slate-300' },
  gold: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', text: 'text-yellow-400' },
}

function toISODateLocal(d) {
  const x = new Date(d)
  const yyyy = x.getFullYear()
  const mm = String(x.getMonth() + 1).padStart(2, '0')
  const dd = String(x.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function diffDaysLocal(fromDate, toDate) {
  const from = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate())
  const to = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate())
  return Math.floor((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000))
}

function startOfWeekLocal(d) {
  const x = new Date(d)
  const day = (x.getDay() + 6) % 7 // Monday=0
  const out = new Date(x)
  out.setHours(0, 0, 0, 0)
  out.setDate(out.getDate() - day)
  return out
}

function buildDynamicChallenges({
  receipts,
  transactions,
  subscriptions,
  savingsEvents,
  weeklyTarget,
  language,
}) {
  const now = new Date()
  const thisWeekStart = startOfWeekLocal(now)

  const woltThisWeek = (receipts || []).filter(r => {
    const d = new Date(r.date || r.createdAt || 0)
    return d >= thisWeekStart
  })
  const woltOrders = woltThisWeek.length

  const lastWolt = (receipts || [])
    .map(r => new Date(r.date || r.createdAt || 0))
    .filter(d => d.toString() !== 'Invalid Date')
    .sort((a, b) => b.getTime() - a.getTime())[0]

  const woltNoDays = lastWolt ? Math.max(0, diffDaysLocal(lastWolt, now)) : 7

  const coffeeTx = (transactions || []).filter(t => {
    const m = String(t.merchant || t.description || '').toLowerCase()
    return /starbucks|te og kaffi|kaffitár|reykjavik roasters|kaffi/i.test(m)
  })
  const lastCoffee = coffeeTx
    .map(t => new Date(t.date || t.createdAt || 0))
    .filter(d => d.toString() !== 'Invalid Date')
    .sort((a, b) => b.getTime() - a.getTime())[0]
  const coffeeNoDays = lastCoffee ? Math.max(0, diffDaysLocal(lastCoffee, now)) : 7

  const cancelCandidates = (subscriptions || []).filter(s => s.cancelCandidate)
  const cancelableTotal = cancelCandidates.reduce((s, x) => s + Number(x.amount || 0), 0)

  const transferThisWeek = (savingsEvents || []).some(e => {
    if (e.type !== 'transfer') return false
    const d = new Date(e.createdAt || 0)
    return d >= thisWeekStart
  })

  const base = []

  // 1) Wolt-aware challenge
  base.push({
    id: 'dyn-no-wolt-3',
    icon: ShoppingBag,
    title: language === 'is' ? '3 dagar án Wolt' : '3 days without Wolt',
    description: language === 'is'
      ? `Núna: ${woltOrders} pantanir í þessari viku. Haltu í 3 daga án Wolt.`
      : `Now: ${woltOrders} orders this week. Go 3 days without Wolt.`,
    target: 3,
    unit: language === 'is' ? 'dagar' : 'days',
    reward: 7500,
    badge: '🍳',
    tier: 'bronze',
    autoProgress: Math.min(3, woltNoDays),
    autoHint: language === 'is' ? 'Reiknað út frá Wolt kvittunum' : 'Calculated from Wolt receipts',
  })

  // 2) Coffee-aware challenge
  base.push({
    id: 'dyn-home-coffee-4',
    icon: Coffee,
    title: language === 'is' ? 'Heimakaffi 4 dagar' : 'Home coffee 4 days',
    description: language === 'is'
      ? 'Lítið “win”: 4 dagar án kaffihúss. Settu sparnaðinn í markmið.'
      : 'A small win: 4 days without coffee shops. Move the savings to your goal.',
    target: 4,
    unit: language === 'is' ? 'dagar' : 'days',
    reward: 4000,
    badge: '☕',
    tier: 'bronze',
    autoProgress: Math.min(4, coffeeNoDays),
    autoHint: language === 'is' ? 'Byggt á færslum (kaffi)' : 'Based on transactions (coffee)',
  })

  // 3) Weekly transfer (streak-friendly)
  base.push({
    id: 'dyn-weekly-transfer',
    icon: Target,
    title: language === 'is' ? 'Vikuleg millifærsla' : 'Weekly transfer',
    description: language === 'is'
      ? `Staðfestu að þú færðir ${Number(weeklyTarget || 0).toLocaleString('is-IS')} kr í sparnað í þessari viku.`
      : `Confirm you moved ${Number(weeklyTarget || 0).toLocaleString('is-IS')} ISK to savings this week.`,
    target: 1,
    unit: language === 'is' ? 'vika' : 'week',
    reward: 0,
    badge: '🚴',
    tier: 'silver',
    autoProgress: transferThisWeek ? 1 : 0,
    autoHint: language === 'is' ? 'Greint úr sparnaðar-atburðum' : 'Detected from savings events',
  })

  // 4) Subscription cleanup (relevant only if there are candidates)
  base.push({
    id: 'dyn-sub-cleanup',
    icon: Sparkles,
    title: language === 'is' ? 'Áskriftahreinsun' : 'Subscription cleanup',
    description: language === 'is'
      ? (cancelCandidates.length > 0
        ? `Þú ert með ${cancelCandidates.length} merktar til uppsagnar (~${cancelableTotal.toLocaleString('is-IS')} kr/mán). Segðu upp einni.`
        : 'Farðu yfir áskriftir og merktu óþarfa (ef einhverjar).')
      : (cancelCandidates.length > 0
        ? `You have ${cancelCandidates.length} marked to cancel (~${cancelableTotal.toLocaleString('is-IS')} ISK/mo). Cancel one.`
        : 'Review subscriptions and mark any you don’t need.'),
    target: 1,
    unit: language === 'is' ? 'skref' : 'step',
    reward: 0,
    badge: '🧹',
    tier: 'bronze',
  })

  // 5) Always-available: cooking (manual)
  base.push({
    id: 'dyn-home-cook-5',
    icon: ChefHat,
    title: language === 'is' ? '5 heimaeldaðar máltíðir' : '5 home-cooked meals',
    description: language === 'is' ? 'Eldaðu heima 5 sinnum (handvirkt).' : 'Cook at home 5 times (manual).',
    target: 5,
    unit: language === 'is' ? 'máltíðir' : 'meals',
    reward: 10000,
    badge: '👨‍🍳',
    tier: 'bronze',
  })

  return base
}

export default function MicroChallenges({
  challengeProgress = {},
  completedChallenges = [],
  streakDays = 0,
  streakShields = 2,
  lastShieldUsedAt = null,
  receipts = [],
  transactions = [],
  subscriptions = [],
  savingsEvents = [],
  weeklyTarget = 0,
  onUpdateProgress,
  onCompleteChallenge,
  language = 'is',
}) {
  const challenges = useMemo(() => {
    const dyn = buildDynamicChallenges({
      receipts,
      transactions,
      subscriptions,
      savingsEvents,
      weeklyTarget,
      language,
    })

    return dyn.map((ch) => {
      const manualProgress = challengeProgress[ch.id] || 0
      const autoProgress = Number.isFinite(ch.autoProgress) ? ch.autoProgress : null
      const progress = autoProgress != null ? Math.max(manualProgress, autoProgress) : manualProgress
      const isCompleted = completedChallenges.includes(ch.id)
      const isLocked = ch.requires && !completedChallenges.includes(ch.requires)
      const progressPercent = Math.min(100, (progress / ch.target) * 100)

      return { ...ch, progress, progressPercent, isCompleted, isLocked, autoProgress }
    })
  }, [challengeProgress, completedChallenges, receipts, transactions, subscriptions, savingsEvents, weeklyTarget, language])

  const totalBadges = completedChallenges.length
  const totalSaved = challenges
    .filter(ch => ch.isCompleted)
    .reduce((sum, ch) => sum + (ch.reward || 0), 0)

  const handleIncrement = (challenge) => {
    if (challenge.isLocked || challenge.isCompleted) return

    const newProgress = (challengeProgress[challenge.id] || 0) + 1
    onUpdateProgress?.(challenge.id, newProgress)

    if (newProgress >= challenge.target) {
      onCompleteChallenge?.(challenge.id, challenge.reward)
    }
  }

  const shieldsLabel = language === 'is' ? 'skjöldur' : 'shields'

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4">
      {/* Header with streak + shields */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Flame size={18} className="text-orange-400" />
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {language === 'is' ? 'Áskoranir' : 'Micro Challenges'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-500/10 text-orange-400">
            <Flame size={14} />
            <span className="text-xs font-bold">{streakDays || 0}</span>
            <span className="text-[10px]">{language === 'is' ? 'dagar' : 'days'}</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Shield size={14} />
            <span className="text-xs font-bold">{streakShields ?? 0}</span>
            <span className="text-[10px]">{shieldsLabel}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <Trophy size={14} className="text-yellow-400" />
            <span>{totalBadges}</span>
          </div>
        </div>
      </div>

      {lastShieldUsedAt && (
        <div className="mt-2 text-[10px] text-[var(--text-muted)]">
          {language === 'is'
            ? `Skjöldur notaður: ${lastShieldUsedAt}`
            : `Shield used: ${lastShieldUsedAt}`}
        </div>
      )}

      {/* Stats banner */}
      {totalSaved > 0 && (
        <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-[var(--accent)]/10 to-purple-500/10 border border-[var(--accent)]/20">
          <div className="text-xs text-[var(--text-muted)]">
            {language === 'is' ? 'Sparað með áskorunum:' : 'Saved through challenges:'}
          </div>
          <div className="text-xl font-bold text-[var(--accent)]">
            {totalSaved.toLocaleString('is-IS')} kr
          </div>
        </div>
      )}

      {/* Challenges list */}
      <div className="mt-4 space-y-2">
        {challenges.map((challenge) => {
          const Icon = challenge.icon
          const tier = TIER_COLORS[challenge.tier] || TIER_COLORS.bronze

          return (
            <div
              key={challenge.id}
              className={`p-3 rounded-lg border transition-all ${
                challenge.isCompleted
                  ? 'bg-green-500/10 border-green-500/20'
                  : challenge.isLocked
                    ? 'bg-[var(--bg-tertiary)] border-[var(--border)] opacity-50'
                    : `${tier.bg} ${tier.border}`
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  challenge.isCompleted
                    ? 'bg-green-500/20'
                    : challenge.isLocked
                      ? 'bg-[var(--bg-secondary)]'
                      : 'bg-[var(--bg-tertiary)]'
                }`}>
                  {challenge.isCompleted ? (
                    <Check size={18} className="text-green-400" />
                  ) : challenge.isLocked ? (
                    <Lock size={18} className="text-[var(--text-muted)]" />
                  ) : (
                    <Icon size={18} className={tier.text} />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${
                      challenge.isCompleted ? 'text-green-400' : 'text-[var(--text-primary)]'
                    }`}>
                      {challenge.title}
                    </span>
                    {challenge.isCompleted && <span className="text-lg">{challenge.badge}</span>}
                  </div>

                  <div className="text-xs text-[var(--text-muted)] mt-0.5">
                    {challenge.description}
                  </div>

                  {!challenge.isCompleted && !challenge.isLocked && (
                    <>
                      <div className="mt-2 h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            challenge.progressPercent >= 100 ? 'bg-green-500' : 'bg-[var(--accent)]'
                          }`}
                          style={{ width: `${challenge.progressPercent}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-[var(--text-muted)]">
                          {challenge.progress}/{challenge.target} {challenge.unit}
                          {Number.isFinite(challenge.autoProgress) && challenge.autoProgress > 0 && (
                            <span className="ml-2 text-[10px] text-sky-400">• auto</span>
                          )}
                        </span>
                        {challenge.reward > 0 && (
                          <span className="text-[10px] text-[var(--accent)]">
                            +{challenge.reward.toLocaleString('is-IS')} kr
                          </span>
                        )}
                      </div>
                      {challenge.autoHint && (
                        <div className="text-[10px] text-[var(--text-muted)] mt-1">
                          {challenge.autoHint}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {!challenge.isCompleted && !challenge.isLocked && (
                  <button
                    onClick={() => handleIncrement(challenge)}
                    className="px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs hover:opacity-90 transition-all"
                    title={language === 'is' ? 'Handvirkt +1 (ef auto missir)' : 'Manual +1 (if auto misses)'}
                  >
                    +1
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Badges earned */}
      {totalBadges > 0 && (
        <div className="mt-4 pt-4 border-t border-[var(--border)]">
          <div className="text-xs text-[var(--text-muted)] mb-2">
            {language === 'is' ? 'Unnin merki:' : 'Badges earned:'}
          </div>
          <div className="flex flex-wrap gap-2">
            {challenges.filter(ch => ch.isCompleted).map(ch => (
              <div
                key={ch.id}
                className="w-10 h-10 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center text-xl"
                title={ch.title}
              >
                {ch.badge}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
