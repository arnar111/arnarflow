import React, { useMemo } from 'react'
import { Award, CheckCircle2 } from 'lucide-react'

const MILESTONES = [10, 25, 50, 75, 90, 100]

const BADGES = {
  10: { emoji: '🌱', tier: 'starter' },
  25: { emoji: '🟦', tier: 'builder' },
  50: { emoji: '🟩', tier: 'halfway' },
  75: { emoji: '🟨', tier: 'closer' },
  90: { emoji: '🟧', tier: 'almost' },
  100: { emoji: '🏆', tier: 'complete' },
}

export default function GoalMilestones({
  progressPercent = 0,
  unlocked = [],
  language = 'is',
}) {
  const unlockedSet = useMemo(() => new Set(unlocked || []), [unlocked])

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award size={18} className="text-[var(--accent)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {language === 'is' ? 'Áfangar' : 'Milestones'}
          </span>
        </div>
        <div className="text-xs text-[var(--text-muted)]">
          {Math.min(100, Math.max(0, progressPercent)).toFixed(1)}%
        </div>
      </div>

      {/* milestone track */}
      <div className="mt-3">
        <div className="relative h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-[var(--accent)] rounded-full transition-all"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
          {MILESTONES.map((m) => (
            <div
              key={m}
              className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)]"
              style={{ left: `calc(${m}% - 4px)` }}
            />
          ))}
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {MILESTONES.map((m) => {
            const isUnlocked = unlockedSet.has(m)
            const badge = BADGES[m]
            return (
              <div
                key={m}
                className={`p-2 rounded-lg border text-center transition-all ${
                  isUnlocked
                    ? 'bg-green-500/10 border-green-500/20'
                    : 'bg-[var(--bg-tertiary)] border-[var(--border)]'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <span className="text-lg">{badge?.emoji || '⭐'}</span>
                  {isUnlocked && <CheckCircle2 size={14} className="text-green-400" />}
                </div>
                <div className={`text-[10px] mt-1 ${isUnlocked ? 'text-green-400' : 'text-[var(--text-muted)]'}`}>
                  {m}%
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-3 text-[11px] text-[var(--text-muted)] leading-relaxed">
          {language === 'is'
            ? 'Lítil skref telja. Áfangar kveikja á konfetti og bæta við merkjum — án pressu.'
            : 'Small steps count. Milestones trigger confetti and badges — without pressure.'}
        </div>
      </div>
    </div>
  )
}

export { MILESTONES }
