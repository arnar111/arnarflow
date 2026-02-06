import React, { useMemo } from 'react'
import { TrendingUp, TrendingDown, Minus, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react'

/**
 * Savings Score (0-100) based on:
 * - Progress toward goal
 * - Subscription control (recurring spending)
 * - Weekly target adherence
 * - Emergency fund progress
 */
export default function SavingsScore({ 
  budgetSaved = 0, 
  budgetGoal = 300000, 
  budgetWeeklyTarget = 10000,
  subscriptions = [],
  transactions = [],
  language = 'is'
}) {
  const score = useMemo(() => {
    let points = 0
    const breakdown = []

    // 1. Goal progress (0-35 points)
    const goalProgress = budgetGoal > 0 ? (budgetSaved / budgetGoal) : 0
    const goalPoints = Math.min(35, Math.round(goalProgress * 35))
    points += goalPoints
    breakdown.push({
      label: language === 'is' ? 'Framvinda að markmiði' : 'Goal progress',
      points: goalPoints,
      max: 35,
      status: goalProgress >= 0.5 ? 'good' : goalProgress >= 0.2 ? 'medium' : 'low'
    })

    // 2. Weekly savings rate (0-25 points)
    // Calculate if they've been saving at target rate
    const weeksActive = Math.max(1, Math.ceil(budgetSaved / Math.max(1, budgetWeeklyTarget)))
    const expectedSaved = weeksActive * budgetWeeklyTarget
    const savingsRate = expectedSaved > 0 ? budgetSaved / expectedSaved : 0
    const weeklyPoints = Math.min(25, Math.round(savingsRate * 25))
    points += weeklyPoints
    breakdown.push({
      label: language === 'is' ? 'Vikuleg sparnaðarhraði' : 'Weekly savings rate',
      points: weeklyPoints,
      max: 25,
      status: savingsRate >= 0.9 ? 'good' : savingsRate >= 0.5 ? 'medium' : 'low'
    })

    // 3. Subscription control (0-25 points)
    const essentialSubs = subscriptions.filter(s => s.essential).length
    const cancelSubs = subscriptions.filter(s => s.cancelCandidate).length
    const totalSubs = subscriptions.length
    // Points for marking subscriptions and having fewer cancel candidates
    let subPoints = 0
    if (totalSubs > 0) {
      const reviewed = subscriptions.filter(s => s.essential || s.cancelCandidate).length
      const reviewRate = reviewed / totalSubs
      subPoints = Math.round(reviewRate * 15)
      // Bonus for actually cancelling (cancel candidates = 0)
      if (cancelSubs === 0 && totalSubs > 0) subPoints += 10
      else if (cancelSubs <= 2) subPoints += 5
    } else {
      subPoints = 20 // No subscriptions tracked = neutral
    }
    subPoints = Math.min(25, subPoints)
    points += subPoints
    breakdown.push({
      label: language === 'is' ? 'Áskriftastýring' : 'Subscription control',
      points: subPoints,
      max: 25,
      status: subPoints >= 20 ? 'good' : subPoints >= 10 ? 'medium' : 'low'
    })

    // 4. Spending awareness (0-15 points)
    // Based on having imported data to track
    const hasData = transactions.length > 0
    const awarenessPoints = hasData ? 15 : 5
    points += awarenessPoints
    breakdown.push({
      label: language === 'is' ? 'Útgjaldavitund' : 'Spending awareness',
      points: awarenessPoints,
      max: 15,
      status: hasData ? 'good' : 'low'
    })

    return { total: Math.min(100, points), breakdown }
  }, [budgetSaved, budgetGoal, budgetWeeklyTarget, subscriptions, transactions, language])

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    if (score >= 40) return 'text-orange-400'
    return 'text-red-400'
  }

  const getScoreLabel = (score) => {
    if (score >= 80) return language === 'is' ? 'Frábært!' : 'Excellent!'
    if (score >= 60) return language === 'is' ? 'Gott' : 'Good'
    if (score >= 40) return language === 'is' ? 'Í lagi' : 'Okay'
    return language === 'is' ? 'Þarf athygli' : 'Needs attention'
  }

  const getStatusIcon = (status) => {
    if (status === 'good') return <CheckCircle2 size={14} className="text-green-400" />
    if (status === 'medium') return <Minus size={14} className="text-yellow-400" />
    return <AlertTriangle size={14} className="text-orange-400" />
  }

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-[var(--accent)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {language === 'is' ? 'Sparnaðarskor' : 'Savings Score'}
          </span>
        </div>
        <div className={`text-2xl font-bold ${getScoreColor(score.total)}`}>
          {score.total}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 h-3 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all ${
              score.total >= 80 ? 'bg-green-500' :
              score.total >= 60 ? 'bg-yellow-500' :
              score.total >= 40 ? 'bg-orange-500' : 'bg-red-500'
            }`}
            style={{ width: `${score.total}%` }}
          />
        </div>
        <span className={`text-xs font-medium ${getScoreColor(score.total)}`}>
          {getScoreLabel(score.total)}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {score.breakdown.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              {getStatusIcon(item.status)}
              <span>{item.label}</span>
            </div>
            <span className="text-[var(--text-muted)] font-mono">
              {item.points}/{item.max}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
