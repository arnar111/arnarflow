import React, { useMemo, useState } from 'react'
import {
  Lightbulb,
  ChefHat,
  Bike,
  Coffee,
  ShoppingBag,
  Check,
  Trophy,
  Flame,
} from 'lucide-react'

const DEFAULT_MEALS = [
  {
    id: 'pasta-tomato',
    name: 'Pasta með tómatsósu',
    nameEn: 'Pasta with tomato sauce',
    time: '15 mín',
    cost: 400,
    ingredients: ['Pasta', 'Mutti tómatar', 'Hvítlaukur', 'Ólífuolía'],
  },
  {
    id: 'egg-rice',
    name: 'Egg-steiktur hrísgrjónahrúgur',
    nameEn: 'Egg fried rice',
    time: '10 mín',
    cost: 300,
    ingredients: ['Hrísgrjón', 'Egg', 'Sojasósa', 'Grænmeti'],
  },
  {
    id: 'air-fryer-chicken',
    name: 'Air fryer kjúklingur',
    nameEn: 'Air fryer chicken',
    time: '25 mín',
    cost: 600,
    ingredients: ['Kjúklingabringur', 'Krydd', 'Grænmeti'],
  },
]

function startOfWeekLocal(d) {
  const x = new Date(d)
  const day = (x.getDay() + 6) % 7 // Monday=0
  const out = new Date(x)
  out.setHours(0, 0, 0, 0)
  out.setDate(out.getDate() - day)
  return out
}

function getWeekId(d) {
  const start = startOfWeekLocal(d)
  const yyyy = start.getFullYear()
  const mm = String(start.getMonth() + 1).padStart(2, '0')
  const dd = String(start.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}` // week starting date
}

export default function WeeklyCoach({
  budgetWeeklyTarget = 10000,
  woltOrdersThisWeek = 0,
  subscriptionsCancelable = 0,
  coachCompleted = [],
  onComplete,
  language = 'is',
}) {
  const [showMeals, setShowMeals] = useState(false)

  const weekId = useMemo(() => getWeekId(new Date()), [])

  const completedSet = useMemo(() => {
    const set = new Set()
    for (const c of coachCompleted || []) {
      if (c?.weekId && c.weekId !== weekId) continue
      // for older records without weekId: treat as done forever
      if (!c?.id) continue
      set.add(c.id)
    }
    return set
  }, [coachCompleted, weekId])

  const actions = useMemo(() => {
    const list = []

    if (woltOrdersThisWeek > 2) {
      list.push({
        id: 'cut-wolt',
        icon: ShoppingBag,
        color: 'orange',
        title: language === 'is' ? 'Draga úr Wolt' : 'Cut Wolt orders',
        description: language === 'is'
          ? `${woltOrdersThisWeek} pantanir í þessari viku. Prófaðu að skera niður í 2.`
          : `${woltOrdersThisWeek} orders this week. Try cutting to 2.`,
        savings: (woltOrdersThisWeek - 2) * 2500,
        actionLabel: language === 'is' ? 'Eldaði heima' : 'Cooked at home',
      })
    }

    list.push({
      id: 'home-meal',
      icon: ChefHat,
      color: 'green',
      title: language === 'is' ? 'Elda heima í dag' : 'Cook at home today',
      description: language === 'is'
        ? 'Veldu fljótlega uppskrift og sparaðu ~2.000 kr'
        : 'Pick a quick recipe and save ~2,000 ISK',
      savings: 2000,
      actionLabel: language === 'is' ? 'Gerði það!' : 'Did it!',
      showMeals: true,
    })

    if (subscriptionsCancelable > 0) {
      list.push({
        id: 'cancel-sub',
        icon: Coffee,
        color: 'red',
        title: language === 'is' ? 'Segja upp áskrift' : 'Cancel a subscription',
        description: language === 'is'
          ? `Þú hefur ${subscriptionsCancelable.toLocaleString('is-IS')} kr/mán merktar til uppsagnar`
          : `You have ${subscriptionsCancelable.toLocaleString('is-IS')} ISK/mo marked for cancellation`,
        savings: subscriptionsCancelable,
        actionLabel: language === 'is' ? 'Sagði upp' : 'Cancelled',
      })
    }

    list.push({
      id: 'weekly-transfer',
      icon: Bike,
      color: 'blue',
      title: language === 'is' ? 'Vikuleg millifærsla' : 'Weekly transfer',
      description: language === 'is'
        ? `Færðu ${budgetWeeklyTarget.toLocaleString('is-IS')} kr á sparnaðarreikning`
        : `Move ${budgetWeeklyTarget.toLocaleString('is-IS')} ISK to savings account`,
      savings: budgetWeeklyTarget,
      actionLabel: language === 'is' ? 'Flutti!' : 'Transferred!',
    })

    return list
  }, [woltOrdersThisWeek, subscriptionsCancelable, budgetWeeklyTarget, language])

  const totalPotentialSavings = actions.reduce((sum, a) => sum + (a.savings || 0), 0)
  const completedSavings = actions
    .filter(a => completedSet.has(a.id))
    .reduce((sum, a) => sum + (a.savings || 0), 0)

  const colorClasses = {
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  }

  const handleComplete = (action) => {
    onComplete?.({ ...action, weekId })
  }

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb size={18} className="text-[var(--accent)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {language === 'is' ? 'Vikulegur þjálfari' : 'Weekly Coach'}
          </span>
        </div>
        {completedSet.size > 0 && (
          <div className="flex items-center gap-1 text-xs text-[var(--accent)]">
            <Flame size={14} />
            <span>{completedSet.size}/{actions.length}</span>
          </div>
        )}
      </div>

      <div className="mt-1 text-[10px] text-[var(--text-muted)]">
        {language === 'is' ? `Vika: ${weekId}` : `Week: ${weekId}`}
      </div>

      {/* Potential savings banner */}
      <div className="mt-3 p-3 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20">
        <div className="text-xs text-[var(--text-muted)]">
          {language === 'is' ? 'Mögulegt að spara þessa viku:' : 'Potential savings this week:'}
        </div>
        <div className="text-xl font-bold text-[var(--accent)]">
          {totalPotentialSavings.toLocaleString('is-IS')} kr
        </div>
        {completedSavings > 0 && (
          <div className="text-xs text-green-400 mt-1">
            ✓ {language === 'is' ? 'Náðist:' : 'Achieved:'} {completedSavings.toLocaleString('is-IS')} kr
          </div>
        )}
      </div>

      <div className="mt-3 space-y-2">
        {actions.map((action) => {
          const isCompleted = completedSet.has(action.id)
          const Icon = action.icon

          return (
            <div
              key={action.id}
              className={`p-3 rounded-lg border transition-all ${
                isCompleted
                  ? 'bg-green-500/10 border-green-500/20'
                  : `${colorClasses[action.color] || colorClasses.blue}`
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-500/20' : 'bg-[var(--bg-tertiary)]'}`}>
                  {isCompleted ? (
                    <Check size={16} className="text-green-400" />
                  ) : (
                    <Icon size={16} />
                  )}
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-medium ${isCompleted ? 'text-green-400 line-through' : 'text-[var(--text-primary)]'}`}>
                    {action.title}
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">
                    {action.description}
                  </div>
                  {action.savings && !isCompleted && (
                    <div className="text-xs text-[var(--accent)] mt-1">
                      +{action.savings.toLocaleString('is-IS')} kr
                    </div>
                  )}
                </div>

                {!isCompleted && (
                  <button
                    onClick={() => {
                      if (action.showMeals) setShowMeals(!showMeals)
                      else handleComplete(action)
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs hover:opacity-90 transition-all"
                  >
                    {action.showMeals && !showMeals
                      ? (language === 'is' ? 'Sýna uppskriftir' : 'Show recipes')
                      : action.actionLabel}
                  </button>
                )}
              </div>

              {action.showMeals && showMeals && !isCompleted && (
                <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-2">
                  <div className="text-xs text-[var(--text-muted)]">
                    {language === 'is' ? 'Fljótlegar uppskriftir:' : 'Quick recipes:'}
                  </div>
                  {DEFAULT_MEALS.map((meal) => (
                    <div
                      key={meal.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-tertiary)] text-xs"
                    >
                      <div>
                        <div className="text-[var(--text-primary)] font-medium">
                          {language === 'is' ? meal.name : meal.nameEn}
                        </div>
                        <div className="text-[var(--text-muted)]">
                          {meal.time} · ~{meal.cost} kr
                        </div>
                      </div>
                      <button
                        onClick={() => handleComplete(action)}
                        className="px-2 py-1 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all"
                        title={language === 'is' ? 'Merkja sem klárað' : 'Mark as done'}
                      >
                        <Check size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {completedSet.size === actions.length && actions.length > 0 && (
        <div className="mt-3 p-4 rounded-lg bg-gradient-to-r from-[var(--accent)]/20 to-purple-500/20 border border-[var(--accent)]/30 text-center">
          <Trophy size={24} className="mx-auto text-yellow-400 mb-2" />
          <div className="text-sm font-medium text-[var(--text-primary)]">
            {language === 'is' ? 'Öll markmið náð!' : 'All goals achieved!'}
          </div>
          <div className="text-xs text-[var(--accent)] mt-1">
            +{completedSavings.toLocaleString('is-IS')} kr {language === 'is' ? 'í viku' : 'this week'}
          </div>
        </div>
      )}
    </div>
  )
}
