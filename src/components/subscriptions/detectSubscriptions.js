import { KNOWN_SUBSCRIPTIONS, isMonthlyInterval } from './constants'

// Income patterns — these are NOT subscriptions/expenses
const INCOME_PATTERNS = [
  /\btakk\b/i,           // Employer salary
  /\btr\b/i,             // Tryggingastofnun
  /tryggingastofnun/i,   // Full name
  /\blaun\b/i,           // Generic salary keyword
]

// Exclusion patterns — recurring payments that are NOT subscriptions
const EXCLUDE_PATTERNS = [
  /\batm\b/i,            // ATM withdrawals
  /\bland[s]?bank/i,     // Loan payments (Landsbankinn)
  /\balp\b/i,            // Loan payments (ALP)
  /\bnúnú\s*lán/i,      // Loan payments (NúNú Lán)
  /\bbpo\s*innheimt/i,   // Bill collection
  /arion\s*atm/i,        // ATM
  /indó\s*sparisjóður/i, // Bank transfers
  /\barnar\s*kjartansson/i, // Self transfers
  /stefán\s*freyr/i,     // Landlord rent (not a subscription to detect)
]

function normalizeMerchant(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/\d+/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[_.,-]/g, ' ')
    .trim()
}

// Get display name from transaction (handles different field names)
function getTxName(tx) {
  return tx.merchant || tx.title || tx.description || ''
}

function isIncomeTransaction(tx) {
  const text = `${getTxName(tx)} ${tx.description || ''}`.toLowerCase()
  return INCOME_PATTERNS.some(p => p.test(text))
}

/**
 * Detect recurring subscriptions from bank transaction data.
 * 
 * @param {Array} transactions - Bank transactions [{id, merchant, description, amount, date}]
 * @param {Array} dismissedKeys - Merchant keys previously dismissed by user
 * @returns {Array} Detected subscription candidates
 */
export function detectSubscriptions(transactions = [], dismissedKeys = []) {
  const dismissed = new Set(dismissedKeys)

  // Step 1: Group by normalized merchant name, excluding income
  const groups = {}
  for (const tx of transactions) {
    // Skip income transactions
    if (isIncomeTransaction(tx)) continue
    // Note: amounts may be positive (absolute) in some data sources — don't filter by sign
    // Instead, skip credit_transfer type which are usually income/transfers
    if (tx.type === 'credit_transfer') continue

    const name = getTxName(tx)
    // Skip excluded merchants (loans, ATM, bank transfers, etc.)
    if (EXCLUDE_PATTERNS.some(p => p.test(name))) continue
    const key = normalizeMerchant(name)
    if (!key || key.length < 2) continue
    if (!groups[key]) groups[key] = []
    groups[key].push({ ...tx, _resolvedName: name })
  }

  const candidates = []

  for (const [merchantKey, txs] of Object.entries(groups)) {
    if (dismissed.has(merchantKey)) continue

    // Check if this matches a known subscription pattern
    const knownMatchEarly = KNOWN_SUBSCRIPTIONS.find(k => k.pattern.test(merchantKey))

    // For unknown merchants, require at least 2 transactions
    // For known subscription patterns, allow even 1 transaction
    if (txs.length < 2 && !knownMatchEarly) continue

    // Sort by date ascending
    const sorted = [...txs].sort((a, b) => new Date(a.date) - new Date(b.date))

    // Calculate intervals between consecutive transactions
    const intervals = []
    for (let i = 1; i < sorted.length; i++) {
      const daysDiff = (new Date(sorted[i].date) - new Date(sorted[i - 1].date)) / (1000 * 60 * 60 * 24)
      intervals.push(daysDiff)
    }

    // Check if intervals suggest monthly recurrence
    const monthlyCount = intervals.filter(isMonthlyInterval).length
    const isRecurring = intervals.length > 0 && monthlyCount >= Math.floor(intervals.length * 0.6)

    // For known subscriptions with only 1 transaction, skip recurrence check
    if (!isRecurring && txs.length < 3 && !knownMatchEarly) continue

    // Amount consistency
    const amounts = sorted.map(t => Math.abs(t.amount))
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length
    const latestAmount = amounts[amounts.length - 1]
    const amountConsistent = amounts.every(a => Math.abs(a - avgAmount) / avgAmount < 0.15) // 15% tolerance

    // Match against known subscriptions (reuse early match)
    const knownMatch = knownMatchEarly

    // Calculate confidence
    let confidence = 'low'
    if (txs.length >= 3 && isRecurring && amountConsistent) confidence = 'high'
    else if (txs.length >= 2 && (isRecurring || knownMatch)) confidence = 'medium'
    else if (knownMatch) confidence = 'medium'

    if (confidence === 'low' && !knownMatch) continue // Skip low confidence unknowns

    candidates.push({
      merchantKey,
      name: knownMatch?.name || sorted[0]._resolvedName || merchantKey,
      category: knownMatch?.category || sorted[0].category || 'other',
      amount: latestAmount || knownMatch?.defaultAmount || 0,
      avgAmount: Math.round(avgAmount) || latestAmount || knownMatch?.defaultAmount || 0,
      confidence,
      transactionCount: txs.length,
      firstSeen: sorted[0].date,
      lastSeen: sorted[sorted.length - 1].date,
      amountConsistent,
      priceHistory: sorted.map(t => ({ date: t.date, amount: Math.abs(t.amount) })),
    })
  }

  // Sort: high confidence first, then by amount descending
  return candidates.sort((a, b) => {
    const confOrder = { high: 0, medium: 1, low: 2 }
    if (confOrder[a.confidence] !== confOrder[b.confidence]) {
      return confOrder[a.confidence] - confOrder[b.confidence]
    }
    return b.amount - a.amount
  })
}
