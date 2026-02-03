import React, { useMemo, useState } from 'react'
import useStore from '../store/useStore'
import { useTranslation } from '../i18n/useTranslation'
import { PiggyBank, Plus, Target, CheckCircle2 } from 'lucide-react'

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n))
}

export default function BudgetSaver() {
  const { language } = useTranslation()

  const {
    budgetGoal,
    budgetWeeklyTarget,
    budgetSaved,
    addBudgetSaved,
    setBudgetGoal,
    setBudgetWeeklyTarget,
    budgetReceipts,
    budgetTransactions,
    importBudgetSync,
    resetBudgetData,
  } = useStore()

  const [addAmount, setAddAmount] = useState('')

  const progress = useMemo(() => {
    if (!budgetGoal) return 0
    return clamp((budgetSaved / budgetGoal) * 100, 0, 100)
  }, [budgetGoal, budgetSaved])

  const remaining = Math.max(0, (budgetGoal || 0) - (budgetSaved || 0))
  const weeksLeft = budgetWeeklyTarget > 0 ? Math.ceil(remaining / budgetWeeklyTarget) : null

  const title = language === 'is' ? 'Budget Saver' : 'Budget Saver'
  const subtitle = language === 'is'
    ? 'Einfalt sparnaðarborð: markmið, staða, og vikuleg áætlun.'
    : 'Simple savings dashboard: goal, progress, and weekly plan.'

  const [importStatus, setImportStatus] = useState(null)

  const importNow = async () => {
    try {
      setImportStatus({ state: 'loading' })
      const res = await fetch('/budget-sync.json?t=' + Date.now())
      if (!res.ok) throw new Error('budget-sync.json fannst ekki')
      const json = await res.json()
      importBudgetSync(json)
      setImportStatus({ state: 'done', receipts: json?.counts?.woltReceipts ?? (json?.receipts?.length || 0), tx: json?.counts?.indo ?? (json?.transactions?.length || 0) })
      setTimeout(() => setImportStatus(null), 4000)
    } catch (e) {
      setImportStatus({ state: 'error', message: e?.message || 'Villa' })
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
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
        </div>

        {/* Goal card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4">
            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <Target size={16} />
              <span>{language === 'is' ? 'Markmið' : 'Goal'}</span>
            </div>
            <div className="mt-3">
              <label className="text-xs text-[var(--text-muted)]">{language === 'is' ? 'Markmið (kr.)' : 'Goal (ISK)'}</label>
              <input
                value={budgetGoal}
                onChange={(e) => setBudgetGoal(Number(e.target.value || 0))}
                type="number"
                className="mt-1 w-full px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)]"
              />
            </div>
            <div className="mt-3">
              <label className="text-xs text-[var(--text-muted)]">{language === 'is' ? 'Vikulegt markmið (kr.)' : 'Weekly target (ISK)'}</label>
              <input
                value={budgetWeeklyTarget}
                onChange={(e) => setBudgetWeeklyTarget(Number(e.target.value || 0))}
                type="number"
                className="mt-1 w-full px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)]"
              />
            </div>
          </div>

          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4 md:col-span-2">
            <div className="flex items-center justify-between">
              <div className="text-sm text-[var(--text-muted)]">
                {language === 'is' ? 'Staða' : 'Progress'}
              </div>
              <div className="text-xs text-[var(--text-muted)] font-mono">{progress.toFixed(1)}%</div>
            </div>

            <div className="mt-3 h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${progress}%`, backgroundColor: 'var(--accent)' }}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div>
                <div className="text-xs text-[var(--text-muted)]">{language === 'is' ? 'Sparað' : 'Saved'}</div>
                <div className="text-lg font-semibold text-[var(--text-primary)]">{(budgetSaved || 0).toLocaleString('is-IS')} kr.</div>
              </div>
              <div>
                <div className="text-xs text-[var(--text-muted)]">{language === 'is' ? 'Eftir' : 'Remaining'}</div>
                <div className="text-lg font-semibold text-[var(--text-primary)]">{remaining.toLocaleString('is-IS')} kr.</div>
              </div>
              <div>
                <div className="text-xs text-[var(--text-muted)]">{language === 'is' ? 'Vikur eftir (áætlun)' : 'Weeks left (est.)'}</div>
                <div className="text-lg font-semibold text-[var(--text-primary)]">{weeksLeft ?? '—'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--text-muted)]">{language === 'is' ? 'Vikulegt markmið' : 'Weekly target'}</div>
                <div className="text-lg font-semibold text-[var(--text-primary)]">{(budgetWeeklyTarget || 0).toLocaleString('is-IS')} kr.</div>
              </div>
            </div>

            {/* Add saved */}
            <div className="mt-5 flex flex-col md:flex-row gap-2">
              <input
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                type="number"
                placeholder={language === 'is' ? 'Bæta við sparnaði (kr.)' : 'Add to savings (ISK)'}
                className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)]"
              />
              <button
                onClick={() => {
                  const n = Number(addAmount || 0)
                  if (!n) return
                  addBudgetSaved(n)
                  setAddAmount('')
                }}
                className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                {language === 'is' ? 'Bæta við' : 'Add'}
              </button>
            </div>

            {progress >= 100 && (
              <div className="mt-4 p-3 rounded-lg bg-green-500/10 text-green-400 flex items-center gap-2">
                <CheckCircle2 size={18} />
                <span className="text-sm">{language === 'is' ? 'Markmiði náð!' : 'Goal reached!'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Import + Data */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4 mt-4">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-medium text-[var(--text-primary)]">
              {language === 'is' ? 'Gagnainnlestur (Wolt + indó)' : 'Data import (Wolt + bank)'}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={importNow}
                className="px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-all text-xs"
              >
                {language === 'is' ? 'Sækja & flytja inn' : 'Fetch & import'}
              </button>
              <button
                onClick={resetBudgetData}
                className="px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/20 transition-all text-xs"
                title={language === 'is' ? 'Eyða importuðum gögnum (local)' : 'Clear imported local data'}
              >
                {language === 'is' ? 'Hreinsa' : 'Clear'}
              </button>
            </div>
          </div>

          {importStatus?.state === 'loading' && (
            <div className="mt-3 text-sm text-[var(--text-secondary)]">{language === 'is' ? 'Sæki...' : 'Fetching...'}</div>
          )}
          {importStatus?.state === 'done' && (
            <div className="mt-3 text-sm text-green-400">
              {language === 'is'
                ? `Flutti inn: ${importStatus.receipts} Wolt kvittanir + ${importStatus.tx} bankafærslur.`
                : `Imported: ${importStatus.receipts} Wolt receipts + ${importStatus.tx} bank transactions.`}
            </div>
          )}
          {importStatus?.state === 'error' && (
            <div className="mt-3 text-sm text-red-400">{importStatus.message}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)]">
              <div className="text-xs text-[var(--text-muted)]">{language === 'is' ? 'Wolt kvittanir (importað)' : 'Wolt receipts (imported)'}</div>
              <div className="text-lg font-semibold text-[var(--text-primary)]">{(budgetReceipts || []).length}</div>
            </div>
            <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)]">
              <div className="text-xs text-[var(--text-muted)]">{language === 'is' ? 'Bankafærslur (importað)' : 'Bank transactions (imported)'}</div>
              <div className="text-lg font-semibold text-[var(--text-primary)]">{(budgetTransactions || []).length}</div>
            </div>
            <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)]">
              <div className="text-xs text-[var(--text-muted)]">{language === 'is' ? 'Næst' : 'Next'} </div>
              <div className="text-sm text-[var(--text-secondary)]">
                {language === 'is' ? 'Næst bætum við kvittun-attachment UI og vikulegri samantekt.' : 'Next we add receipt attachments UI and weekly summaries.'}
              </div>
            </div>
          </div>
        </div>

        {/* Next actions */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4 mt-4">
          <div className="text-sm font-medium text-[var(--text-primary)]">
            {language === 'is' ? 'Næstu skref (hugmyndir)' : 'Next steps (ideas)'}
          </div>
          <ul className="mt-3 text-sm text-[var(--text-secondary)] list-disc pl-5 space-y-1">
            <li>{language === 'is' ? 'Takmarka Wolt/pantanir og setja 2–3 “default” heimamáltíðir sem eru fljótlegar.' : 'Limit delivery and set 2–3 default home meals that are quick.'}</li>
            <li>{language === 'is' ? 'Farðu yfir áskriftir 1× í mánuði og merktu “must keep” vs “nice to have”.' : 'Review subscriptions monthly and mark must-keep vs nice-to-have.'}</li>
            <li>{language === 'is' ? 'Flytja 10.000 kr á “tölvusjóð” í byrjun hverrar viku (sjálfvirkt ef hægt).' : 'Move 10,000 ISK into the “computer fund” at the start of each week (automate if possible).'}
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
