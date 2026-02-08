import React, { useEffect, useMemo, useState, Suspense } from 'react'
import useStore from '../store/useStore'
import { useTranslation } from '../i18n/useTranslation'
import { PiggyBank, Plus, CheckCircle2, ChevronDown, ChevronUp, Settings2 } from 'lucide-react'

import Confetti from './Confetti'

// Budget components
import SavingsScore from './budget/SavingsScore'
import SubscriptionManager from './budget/SubscriptionManager'
import WeeklyCoach from './budget/WeeklyCoach'
import TransactionsExplorer from './budget/TransactionsExplorer'
import MicroChallenges from './budget/MicroChallenges'
import SavingsTimelineChart from './budget/SavingsTimelineChart'
import SpendingInsightsDashboard from './budget/SpendingInsightsDashboard'
import GoalMilestones, { MILESTONES } from './budget/GoalMilestones'

const SubscriptionsTab = React.lazy(() => import('./SubscriptionsView'))

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n))
}

export default function BudgetSaver() {
  const { language } = useTranslation()

  const budgetGoal = useStore(state => state.budgetGoal)
  const budgetWeeklyTarget = useStore(state => state.budgetWeeklyTarget)
  const budgetSaved = useStore(state => state.budgetSaved)
  const addBudgetSaved = useStore(state => state.addBudgetSaved)
  const setBudgetGoal = useStore(state => state.setBudgetGoal)
  const setBudgetWeeklyTarget = useStore(state => state.setBudgetWeeklyTarget)
  const budgetSavingsEvents = useStore(state => state.budgetSavingsEvents)
  const budgetUnlockedMilestones = useStore(state => state.budgetUnlockedMilestones)
  const unlockBudgetMilestone = useStore(state => state.unlockBudgetMilestone)
  const budgetStreakDays = useStore(state => state.budgetStreakDays)
  const budgetStreakShields = useStore(state => state.budgetStreakShields)
  const budgetStreakLastShieldUsedAt = useStore(state => state.budgetStreakLastShieldUsedAt)
  const budgetReceipts = useStore(state => state.budgetReceipts)
  const budgetTransactions = useStore(state => state.budgetTransactions)
  const budgetEmailReceipts = useStore(state => state.budgetEmailReceipts)
  const importBudgetSync = useStore(state => state.importBudgetSync)
  const resetBudgetData = useStore(state => state.resetBudgetData)
  const budgetSubscriptions = useStore(state => state.budgetSubscriptions)
  const addBudgetSubscription = useStore(state => state.addBudgetSubscription)
  const updateBudgetSubscription = useStore(state => state.updateBudgetSubscription)
  const deleteBudgetSubscription = useStore(state => state.deleteBudgetSubscription)
  const budgetCoachCompleted = useStore(state => state.budgetCoachCompleted)
  const completeBudgetCoachAction = useStore(state => state.completeBudgetCoachAction)
  const budgetChallengeProgress = useStore(state => state.budgetChallengeProgress)
  const budgetCompletedChallenges = useStore(state => state.budgetCompletedChallenges)
  const updateChallengeProgress = useStore(state => state.updateChallengeProgress)
  const completeChallenge = useStore(state => state.completeChallenge)
  const budgetCategoryOverrides = useStore(state => state.budgetCategoryOverrides)
  const updateTransactionCategory = useStore(state => state.updateTransactionCategory)

  const [addAmount, setAddAmount] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [activeTab, setActiveTab] = useState('coach') // coach, insights, challenges, transactions

  const [confettiActive, setConfettiActive] = useState(false)

  const progress = useMemo(() => {
    if (!budgetGoal) return 0
    return clamp((budgetSaved / budgetGoal) * 100, 0, 100)
  }, [budgetGoal, budgetSaved])

  const remaining = Math.max(0, (budgetGoal || 0) - (budgetSaved || 0))
  const weeksLeft = budgetWeeklyTarget > 0 ? Math.ceil(remaining / budgetWeeklyTarget) : null

  // Milestone unlock + celebration
  useEffect(() => {
    const unlocked = new Set(budgetUnlockedMilestones || [])
    const newly = []
    for (const m of MILESTONES) {
      if (progress >= m && !unlocked.has(m)) newly.push(m)
    }
    if (newly.length === 0) return

    // unlock all reached milestones; celebrate once (confetti)
    newly.forEach((m) => unlockBudgetMilestone?.(m))
    setConfettiActive(true)
  }, [progress, budgetUnlockedMilestones, unlockBudgetMilestone])

  const title = language === 'is' ? 'Sparnaður' : 'Budget Saver'
  const subtitle = language === 'is'
    ? 'Sparnaðarþjálfari með áskorunum, innsýn og markmiðum.'
    : 'Savings coach with challenges, insights, and goals.'

  const importNow = useStore(state => state.importNow)
  const importStatus = useStore(state => state.budgetImportStatus)

  // Calculate Wolt orders this week from receipts
  const woltOrdersThisWeek = useMemo(() => {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    return (budgetReceipts || []).filter(r => {
      const date = new Date(r.date || r.createdAt)
      return date.getTime() > oneWeekAgo
    }).length
  }, [budgetReceipts])

  // Calculate cancelable subscriptions amount
  const subscriptionsCancelable = useMemo(() => {
    return (budgetSubscriptions || [])
      .filter(s => s.cancelCandidate)
      .reduce((sum, s) => sum + (s.amount || 0), 0)
  }, [budgetSubscriptions])

  const tabs = [
    { id: 'coach', label: language === 'is' ? 'Þjálfari' : 'Coach' },
    { id: 'insights', label: language === 'is' ? 'Innsýn' : 'Insights' },
    { id: 'subscriptions', label: language === 'is' ? 'Áskriftir' : 'Subscriptions' },
    { id: 'challenges', label: language === 'is' ? 'Áskoranir' : 'Challenges' },
    { id: 'transactions', label: language === 'is' ? 'Færslur' : 'Transactions' },
  ]

  return (
    <div className="p-6 overflow-hidden">
      <Confetti active={confettiActive} onComplete={() => setConfettiActive(false)} />

      <div className="max-w-7xl mx-auto relative z-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--text-primary)] flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center">
                <PiggyBank size={20} className="text-[var(--accent)]" />
              </span>
              {title}
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-2">{subtitle}</p>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-all ${
              showSettings
                ? 'bg-[var(--accent)]/20 text-[var(--accent)]'
                : 'text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)]'
            }`}
          >
            <Settings2 size={18} />
          </button>
        </div>

        {/* Main Grid - 3 columns on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-6">
          {/* Column 1 */}
          <div className="lg:col-span-3 space-y-4">
            <SavingsScore
              budgetSaved={budgetSaved}
              budgetGoal={budgetGoal}
              budgetWeeklyTarget={budgetWeeklyTarget}
              subscriptions={budgetSubscriptions || []}
              transactions={budgetTransactions || []}
              language={language}
            />

            {/* Quick Progress */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4 overflow-hidden relative z-10">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-muted)]">
                  {language === 'is' ? 'Framvinda' : 'Progress'}
                </span>
                <span className="font-mono text-[var(--text-primary)]">{progress.toFixed(1)}%</span>
              </div>
              <div className="mt-2 h-3 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all bg-[var(--accent)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                <div>
                  <div className="text-lg font-bold text-[var(--accent)]">
                    {(budgetSaved || 0).toLocaleString('is-IS')}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">
                    {language === 'is' ? 'sparað' : 'saved'}
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold text-[var(--text-primary)]">
                    {remaining.toLocaleString('is-IS')}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">
                    {language === 'is' ? 'eftir' : 'remaining'}
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold text-[var(--text-primary)]">
                    {weeksLeft ?? '—'}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">
                    {language === 'is' ? 'vikur' : 'weeks'}
                  </div>
                </div>
              </div>

              {/* Quick add */}
              <div className="mt-4 flex gap-2">
                <input
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  type="number"
                  placeholder={language === 'is' ? 'Bæta við (kr)' : 'Add (ISK)'}
                  className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-sm text-[var(--text-primary)]"
                />
                <button
                  onClick={() => {
                    const n = Number(addAmount || 0)
                    if (!n) return
                    addBudgetSaved(n, { type: 'manual' })
                    setAddAmount('')
                  }}
                  className="px-3 py-2 rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-all"
                  title={language === 'is' ? 'Skrá sparnað' : 'Log savings'}
                >
                  <Plus size={16} />
                </button>
              </div>

              {progress >= 100 && (
                <div className="mt-3 p-2 rounded-lg bg-green-500/10 text-green-400 flex items-center gap-2 text-sm">
                  <CheckCircle2 size={16} />
                  <span>{language === 'is' ? 'Markmiði náð!' : 'Goal reached!'}</span>
                </div>
              )}
            </div>

            <GoalMilestones
              progressPercent={progress}
              unlocked={budgetUnlockedMilestones || []}
              language={language}
            />

            <SubscriptionManager
              subscriptions={budgetSubscriptions || []}
              onAdd={addBudgetSubscription}
              onUpdate={updateBudgetSubscription}
              onDelete={deleteBudgetSubscription}
              language={language}
            />
          </div>

          {/* Column 2 */}
          <div className="lg:col-span-9 space-y-4">
            {/* Tab navigation */}
            <div className="flex items-center gap-1 p-1 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-[var(--accent)] text-white'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {activeTab === 'coach' && (
                <>
                  <WeeklyCoach
                    budgetWeeklyTarget={budgetWeeklyTarget}
                    woltOrdersThisWeek={woltOrdersThisWeek}
                    subscriptionsCancelable={subscriptionsCancelable}
                    coachCompleted={budgetCoachCompleted || []}
                    onComplete={(action) => {
                      // Persist completion + record savings event.
                      const type = action.id === 'weekly-transfer' ? 'transfer' : 'coach'
                      completeBudgetCoachAction?.(action.id, action.savings, { type })
                    }}
                    language={language}
                  />

                  <SavingsTimelineChart
                    events={budgetSavingsEvents || []}
                    budgetGoal={budgetGoal}
                    budgetSaved={budgetSaved}
                    weeklyTarget={budgetWeeklyTarget}
                    language={language}
                  />
                </>
              )}

              {activeTab === 'insights' && (
                <>
                  <SpendingInsightsDashboard
                    transactions={budgetTransactions || []}
                    receipts={budgetReceipts || []}
                    onAddSubscriptionCandidate={addBudgetSubscription}
                    language={language}
                  />
                  <MicroChallenges
                    challengeProgress={budgetChallengeProgress || {}}
                    completedChallenges={budgetCompletedChallenges || []}
                    streakDays={budgetStreakDays || 0}
                    streakShields={budgetStreakShields ?? 0}
                    lastShieldUsedAt={budgetStreakLastShieldUsedAt}
                    receipts={budgetReceipts || []}
                    transactions={budgetTransactions || []}
                    subscriptions={budgetSubscriptions || []}
                    savingsEvents={budgetSavingsEvents || []}
                    weeklyTarget={budgetWeeklyTarget}
                    onUpdateProgress={updateChallengeProgress}
                    onCompleteChallenge={(id, reward) => completeChallenge?.(id, reward, { type: 'challenge' })}
                    language={language}
                  />
                </>
              )}

              {activeTab === 'subscriptions' && (
                <div className="lg:col-span-2">
                  <Suspense fallback={<div className="p-8 text-center text-[var(--text-muted)]">Hleð áskriftum...</div>}>
                    <SubscriptionsTab />
                  </Suspense>
                </div>
              )}

              {activeTab === 'challenges' && (
                <div className="lg:col-span-2">
                  <MicroChallenges
                    challengeProgress={budgetChallengeProgress || {}}
                    completedChallenges={budgetCompletedChallenges || []}
                    streakDays={budgetStreakDays || 0}
                    streakShields={budgetStreakShields ?? 0}
                    lastShieldUsedAt={budgetStreakLastShieldUsedAt}
                    receipts={budgetReceipts || []}
                    transactions={budgetTransactions || []}
                    subscriptions={budgetSubscriptions || []}
                    savingsEvents={budgetSavingsEvents || []}
                    weeklyTarget={budgetWeeklyTarget}
                    onUpdateProgress={updateChallengeProgress}
                    onCompleteChallenge={(id, reward) => completeChallenge?.(id, reward, { type: 'challenge' })}
                    language={language}
                  />
                </div>
              )}

              {activeTab === 'transactions' && (
                <div className="lg:col-span-2">
                  <TransactionsExplorer
                    transactions={budgetTransactions || []}
                    receipts={budgetReceipts || []}
                    categoryOverrides={budgetCategoryOverrides || {}}
                    onUpdateCategory={updateTransactionCategory}
                    language={language}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-4 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4">
            <div className="text-sm font-medium text-[var(--text-primary)] mb-3">
              {language === 'is' ? 'Stillingar' : 'Settings'}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[var(--text-muted)]">
                  {language === 'is' ? 'Sparnaðarmarkmið (kr)' : 'Savings goal (ISK)'}
                </label>
                <input
                  value={budgetGoal}
                  onChange={(e) => setBudgetGoal(Number(e.target.value || 0))}
                  type="number"
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)]">
                  {language === 'is' ? 'Vikulegt markmið (kr)' : 'Weekly target (ISK)'}
                </label>
                <input
                  value={budgetWeeklyTarget}
                  onChange={(e) => setBudgetWeeklyTarget(Number(e.target.value || 0))}
                  type="number"
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Data Import Section */}
        <div className="mt-4 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl overflow-hidden">
          <button
            onClick={() => setShowImport(!showImport)}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-[var(--bg-tertiary)]/50 transition-all"
          >
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {language === 'is' ? 'Gagnainnlestur (Wolt + banki + email)' : 'Data import (Wolt + bank + email)'}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-muted)]">
                {(budgetReceipts?.length || 0) + (budgetTransactions?.length || 0)} {language === 'is' ? 'færslur' : 'records'}
              </span>
              {showImport ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </button>

          {showImport && (
            <div className="p-4 pt-0 border-t border-[var(--border)]">
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={importNow}
                  className="px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-all text-xs"
                >
                  {language === 'is' ? 'Sækja & flytja inn' : 'Fetch & import'}
                </button>
                <button
                  onClick={resetBudgetData}
                  className="px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/20 transition-all text-xs"
                >
                  {language === 'is' ? 'Hreinsa' : 'Clear'}
                </button>
              </div>

              {importStatus?.state === 'loading' && (
                <div className="mt-3 text-sm text-[var(--text-secondary)]">
                  {language === 'is' ? 'Sæki...' : 'Fetching...'}
                </div>
              )}
              {importStatus?.state === 'done' && (
                <div className="mt-3 text-sm text-green-400">
                  {language === 'is'
                    ? `Flutti inn: ${importStatus.receipts} Wolt + ${importStatus.tx} banka + ${importStatus.email} email${importStatus.subs ? ` + ${importStatus.subs} áskriftir` : ''}`
                    : `Imported: ${importStatus.receipts} Wolt + ${importStatus.tx} bank + ${importStatus.email} email${importStatus.subs ? ` + ${importStatus.subs} subscriptions` : ''}`}
                </div>
              )}
              {importStatus?.state === 'error' && (
                <div className="mt-3 text-sm text-red-400">{importStatus.message}</div>
              )}

              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] text-center">
                  <div className="text-lg font-semibold text-[var(--text-primary)]">
                    {(budgetReceipts || []).length}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">Wolt</div>
                </div>
                <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] text-center">
                  <div className="text-lg font-semibold text-[var(--text-primary)]">
                    {(budgetTransactions || []).length}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">
                    {language === 'is' ? 'Banki' : 'Bank'}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] text-center">
                  <div className="text-lg font-semibold text-[var(--text-primary)]">
                    {(budgetEmailReceipts || []).length}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">Email</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
