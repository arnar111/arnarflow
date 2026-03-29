import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const APP_VERSION = '7.0.0'

// Project statuses for Projects Kanban
// - ideas: Hugmyndir
// - active: Í vinnslu
// - done: Búið
// - on_hold: Í bið
// - cancelled: Hætt við
const PROJECTS = [
  { id: 'eignamat', name: 'Eignamat', icon: 'Home', color: '#10b981', description: 'AI Property Valuation SaaS', status: 'active' },
  { id: 'takkarena', name: 'Takk Arena', icon: 'Trophy', color: '#f59e0b', description: 'Gamified Sales Tracking', status: 'active' },
  { id: 'betrithu', name: 'Betri Þú', icon: 'Headphones', color: '#a855f7', description: 'Hypnosis Recordings Store', status: 'active' },
  { id: 'kosningagatt', name: 'Kosningagátt', icon: 'Vote', color: '#ef4444', description: 'SMS Campaign Tool', status: 'done' },
  { id: 'arnar', name: 'Portfolio', icon: 'Globe', color: '#06b6d4', description: 'Personal Website', status: 'on_hold' },
]

const HABITS = [
  { id: 'exercise', name: 'Exercise', nameIs: 'Hreyfing', icon: 'Dumbbell', target: 'Move for 15 min (gentle on back)', targetIs: 'Hreyfa sig í 15 mín (varlega á bakið)', type: 'binary' },
  { id: 'clean', name: 'Clean', nameIs: 'Þrifa', icon: 'Sparkles', target: 'Tidy one area', targetIs: 'Þrífa eitt svæði', type: 'binary' },
  { id: 'cook', name: 'Cook', nameIs: 'Elda', icon: 'ChefHat', target: 'Make a healthy meal', targetIs: 'Elda hollt mat', type: 'binary' },
  { id: 'cocopuffs', name: 'Coco Puffs', nameIs: 'Coco Puffs', icon: 'Cat', target: 'Quality time with kitty', targetIs: 'Gæðatími með kettinum', type: 'binary' },
]

const ACCENT_COLORS = {
  blue: '#3b82f6',
  purple: '#a855f7',
  indigo: '#6366f1',
  cyan: '#06b6d4',
  green: '#22c55e',
  orange: '#f97316',
  pink: '#ec4899',
}

// --- Recipes (v5.10.0) ---
const RECIPE_CATEGORIES = ['Aðalréttur', 'Meðlæti', 'Súpa', 'Bakkelsi', 'Sósa', 'Annað']

function recipeId() {
  // Prefer crypto.randomUUID() (Electron/Chromium), fallback to timestamp-based id
  if (typeof crypto !== 'undefined' && crypto?.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function normalizeRecipeShape(input, opts = {}) {
  const r = input || {}
  const nowISO = new Date().toISOString()
  const id = String(r.id || '').trim()

  return {
    id: id || (opts.generateId === false ? '' : recipeId()),
    name: String(r.name || 'Ný uppskrift').trim(),
    description: String(r.description || '').trim(),
    image: String(r.image || '').trim(),
    servings: Number.isFinite(Number(r.servings)) ? Number(r.servings) : 2,
    prepTime: Number.isFinite(Number(r.prepTime)) ? Number(r.prepTime) : 10,
    cookTime: Number.isFinite(Number(r.cookTime)) ? Number(r.cookTime) : 10,
    category: RECIPE_CATEGORIES.includes(r.category) ? r.category : 'Aðalréttur',
    ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
    instructions: Array.isArray(r.instructions) ? r.instructions : [],
    tags: Array.isArray(r.tags) ? r.tags : [],
    favorite: typeof r.favorite === 'boolean' ? r.favorite : false,
    nutrition: {
      pros: Array.isArray(r.nutrition?.pros) ? r.nutrition.pros.slice(0, 3) : [],
      cons: Array.isArray(r.nutrition?.cons) ? r.nutrition.cons.slice(0, 3) : [],
    },
    createdAt: String(r.createdAt || opts.createdAtFallback || nowISO),
  }
}

const SEED_RECIPES = [
  {
    id: recipeId(),
    name: 'Rjómalöguð Mutti tómata-pasta (mascarpone)',
    description: 'Fljótleg tómatasósa með falnum grænmeti (Nutribullet) og mascarpone.',
    image: '',
    servings: 4,
    prepTime: 8,
    cookTime: 12,
    category: 'Aðalréttur',
    ingredients: [
      { name: 'Pasta', amount: '400', unit: 'g' },
      { name: 'Mutti San Marzano tómatar', amount: '1', unit: 'dós' },
      { name: 'Mascarpone', amount: '150', unit: 'g' },
      { name: 'Laukur', amount: '1', unit: 'stk' },
      { name: 'Gulrót', amount: '1', unit: 'stk' },
      { name: 'Paprika', amount: '1/2', unit: 'stk' },
      { name: 'Hvítlaukur', amount: '2', unit: 'geirar' },
      { name: 'Ólífuolía', amount: '1', unit: 'msk' },
      { name: 'Salt', amount: '', unit: '' },
      { name: 'Pipar', amount: '', unit: '' },
    ],
    instructions: [
      'Saxaðu lauk, gulrót og papriku gróft. Steiktu í ólífuolíu 3–4 mín.',
      'Settu grænmetið í Nutribullet/blender með dósinni af Mutti San Marzano og maukaðu slétt.',
      'Helltu aftur á pönnu, kryddaðu (salt/pipar) og láttu malla 6–8 mín.',
      'Sjóðaðu pasta á meðan. Taktu frá smá pastavatn.',
      'Hrærið mascarpone út í sósuna. Þynntu með pastavatni ef þarf. Blandaðu pasta saman við og berðu fram.',
    ],
    tags: ['pasta', 'quick', 'mutti', 'blended-veg'],
    createdAt: new Date().toISOString(),
  },
  {
    id: recipeId(),
    name: 'Air fryer kjúklingur + rjóma-mutti pasta',
    description: 'Kjúklingur í air fryer og mjög fljótleg rjómasósa með Mutti + mascarpone.',
    image: '',
    servings: 2,
    prepTime: 10,
    cookTime: 12,
    category: 'Aðalréttur',
    ingredients: [
      { name: 'Pasta', amount: '250', unit: 'g' },
      { name: 'Kjúklingabringur', amount: '2', unit: 'stk' },
      { name: 'Mutti San Marzano tómatar', amount: '1/2', unit: 'dós' },
      { name: 'Mascarpone', amount: '120', unit: 'g' },
      { name: 'Krydd (paprika/ítalskt)', amount: '1', unit: 'tsk' },
      { name: 'Salt', amount: '', unit: '' },
      { name: 'Pipar', amount: '', unit: '' },
      { name: 'Ólífuolía', amount: '1', unit: 'msk' },
    ],
    instructions: [
      'Kryddaðu kjúkling, smá olía og settu í air fryer: 200°C í 10–12 mín (fer eftir þykkt).',
      'Sjóðaðu pasta á meðan.',
      'Hitaðu Mutti á pönnu, hrærðu mascarpone út í og kryddaðu. Þynntu með pastavatni ef þarf.',
      'Skerðu kjúkling í sneiðar, blandaðu við pasta og sósu.',
    ],
    tags: ['air-fryer', 'pasta', 'quick', 'mutti'],
    createdAt: new Date().toISOString(),
  },
  {
    id: recipeId(),
    name: 'Pasta með air fryer kjötbollum (faldar grænmetisbætur)',
    description: 'Air fryer kjötbollur + tómatasósa með maukuðu grænmeti.',
    image: '',
    servings: 4,
    prepTime: 10,
    cookTime: 15,
    category: 'Aðalréttur',
    ingredients: [
      { name: 'Pasta', amount: '400', unit: 'g' },
      { name: 'Kjötbollur (tilbúnar eða heimagerðar)', amount: '500', unit: 'g' },
      { name: 'Mutti San Marzano tómatar', amount: '1', unit: 'dós' },
      { name: 'Mascarpone', amount: '100', unit: 'g' },
      { name: 'Laukur', amount: '1', unit: 'stk' },
      { name: 'Kúrbítur', amount: '1/2', unit: 'stk' },
      { name: 'Hvítlaukur', amount: '2', unit: 'geirar' },
      { name: 'Ólífuolía', amount: '1', unit: 'msk' },
    ],
    instructions: [
      'Settu kjötbollur í air fryer: 200°C í 10–12 mín (hristu körfu í miðjunni).',
      'Steiktu lauk, hvítlauk og kúrbít 3–4 mín. Maukaðu með Mutti í blender.',
      'Láttu sósu malla 5–7 mín, hrærðu mascarpone út í.',
      'Sjóðaðu pasta, blandaðu sósu og kjötbollum saman við.',
    ],
    tags: ['air-fryer', 'meatballs', 'pasta', 'blended-veg', 'quick'],
    createdAt: new Date().toISOString(),
  },
  {
    id: recipeId(),
    name: 'Mascarpone-„alfredo“ (án parmesan) með hvítlauk',
    description: 'Mjög einföld rjómasósa fyrir pasta – mascarpone, hvítlaukur og pastavatn.',
    image: '',
    servings: 2,
    prepTime: 5,
    cookTime: 10,
    category: 'Sósa',
    ingredients: [
      { name: 'Pasta', amount: '250', unit: 'g' },
      { name: 'Mascarpone', amount: '160', unit: 'g' },
      { name: 'Hvítlaukur', amount: '2', unit: 'geirar' },
      { name: 'Smjör', amount: '1', unit: 'msk' },
      { name: 'Salt', amount: '', unit: '' },
      { name: 'Pipar', amount: '', unit: '' },
    ],
    instructions: [
      'Sjóðaðu pasta og taktu frá 1/2 bolla af pastavatni.',
      'Bræddu smjör, steiktu hvítlauk 30–60 sek.',
      'Hrærið mascarpone út í og þynntu með pastavatni þar til sósan er silkimjúk.',
      'Kryddaðu og blandaðu við pasta.',
    ],
    tags: ['pasta', 'quick', 'no-parmesan'],
    createdAt: new Date().toISOString(),
  },
  {
    id: recipeId(),
    name: 'Mutti tómata- & basil súpa (blandað grænmeti)',
    description: 'Silkimjúk tómatasúpa með falinni gulrót/papriku – 15 mín.',
    image: '',
    servings: 3,
    prepTime: 8,
    cookTime: 12,
    category: 'Súpa',
    ingredients: [
      { name: 'Mutti San Marzano tómatar', amount: '1', unit: 'dós' },
      { name: 'Grænmetissoð', amount: '400', unit: 'ml' },
      { name: 'Gulrót', amount: '1', unit: 'stk' },
      { name: 'Paprika', amount: '1/2', unit: 'stk' },
      { name: 'Laukur', amount: '1/2', unit: 'stk' },
      { name: 'Mascarpone', amount: '80', unit: 'g' },
      { name: 'Basil', amount: '', unit: '' },
      { name: 'Salt', amount: '', unit: '' },
      { name: 'Pipar', amount: '', unit: '' },
    ],
    instructions: [
      'Steiktu lauk, gulrót og papriku 3–4 mín.',
      'Bættu við Mutti + grænmetissoði og láttu malla 8–10 mín.',
      'Blandaðu slétt í blender, hrærðu mascarpone út í, kryddaðu og toppaðu með basil.',
    ],
    tags: ['quick', 'mutti', 'blended-veg', 'soup'],
    createdAt: new Date().toISOString(),
  },
]

// Undo timer for task deletion (not persisted)
let lastDeletedTaskTimer = null

// --- Budget Saver helpers (streaks, dates) ---
function toISODateLocal(d) {
  const x = new Date(d)
  const yyyy = x.getFullYear()
  const mm = String(x.getMonth() + 1).padStart(2, '0')
  const dd = String(x.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function diffDaysLocal(fromISO, toDate) {
  if (!fromISO) return null
  const [y, m, d] = String(fromISO).split('-').map(Number)
  if (!y || !m || !d) return null
  const from = new Date(y, m - 1, d)
  const to = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate())
  const ms = to.getTime() - from.getTime()
  return Math.floor(ms / (24 * 60 * 60 * 1000))
}

function computeNextBudgetStreak(state, now = new Date()) {
  // Duolingo-inspired: encourage consistency, but use shields to reduce anxiety.
  const today = toISODateLocal(now)
  const last = state.budgetStreakLastCheckIn

  // init
  if (!last) {
    return {
      budgetStreakDays: 1,
      budgetStreakLastCheckIn: today,
    }
  }

  if (last === today) return {}

  const gap = diffDaysLocal(last, now)
  if (gap === 1) {
    const nextDays = (state.budgetStreakDays || 0) + 1
    // earn a shield every 7-day streak, max 2 shields
    const shields = state.budgetStreakShields ?? 2
    const earnedShield = nextDays > 0 && nextDays % 7 === 0 && shields < 2
    return {
      budgetStreakDays: nextDays,
      budgetStreakLastCheckIn: today,
      budgetStreakShields: earnedShield ? Math.min(2, shields + 1) : shields,
    }
  }

  // missed days
  const shields = state.budgetStreakShields ?? 2
  if (gap != null && gap > 1 && shields > 0) {
    return {
      budgetStreakLastCheckIn: today,
      budgetStreakShields: shields - 1,
      budgetStreakShieldsUsed: (state.budgetStreakShieldsUsed || 0) + 1,
      budgetStreakLastShieldUsedAt: today,
      // streak stays the same: we "forgive" the miss
    }
  }

  // no shields left: gentle reset
  return {
    budgetStreakDays: 1,
    budgetStreakLastCheckIn: today,
  }
}

// Idea categories/tags
const IDEA_CATEGORIES = [
  { id: 'product', name: 'Product', nameIs: 'Vara', color: '#3b82f6' },
  { id: 'marketing', name: 'Marketing', nameIs: 'Markaðssetning', color: '#22c55e' },
  { id: 'tech', name: 'Tech', nameIs: 'Tækni', color: '#a855f7' },
  { id: 'content', name: 'Content', nameIs: 'Efni', color: '#f59e0b' },
  { id: 'personal', name: 'Personal', nameIs: 'Persónulegt', color: '#ec4899' },
]

// v3.0.0 - Task Tags
const DEFAULT_TAGS = [
  { id: 'urgent', name: 'Urgent', nameIs: 'Brýnt', color: 'red' },
  { id: 'bug', name: 'Bug', nameIs: 'Villa', color: 'orange' },
  { id: 'feature', name: 'Feature', nameIs: 'Eiginleiki', color: 'blue' },
  { id: 'design', name: 'Design', nameIs: 'Hönnun', color: 'purple' },
  { id: 'research', name: 'Research', nameIs: 'Rannsókn', color: 'cyan' },
  { id: 'content', name: 'Content', nameIs: 'Efni', color: 'amber' },
  { id: 'meeting', name: 'Meeting', nameIs: 'Fundur', color: 'green' },
  { id: 'blocked', name: 'Blocked', nameIs: 'Blokkað', color: 'slate' },
]

const useStore = create(
  persist(
    (set, get) => ({
      // App version
      appVersion: APP_VERSION,
      
      // Language - default to Icelandic
      language: 'is',
      setLanguage: (lang) => set({ language: lang }),
      
      // Budget Saver (v5.4.3)
      // Simple persisted savings dashboard state.
      budgetGoal: 300000,
      budgetWeeklyTarget: 10000,
      budgetSaved: 0,

      // Savings history (for charts/insights)
      budgetSavingsEvents: [],

      // Goal milestones (single-goal for now)
      budgetUnlockedMilestones: [],
      unlockBudgetMilestone: (percent) => set((state) => {
        const p = Number(percent)
        if (!p) return {}
        const existing = new Set(state.budgetUnlockedMilestones || [])
        if (existing.has(p)) return {}
        return { budgetUnlockedMilestones: [...existing, p].sort((a, b) => a - b) }
      }),
      resetBudgetMilestones: () => set({ budgetUnlockedMilestones: [] }),

      // Smart streak (Duolingo-ish, but kind)
      budgetStreakDays: 0,
      budgetStreakShields: 2,
      budgetStreakLastCheckIn: null, // YYYY-MM-DD
      budgetStreakShieldsUsed: 0,
      budgetStreakLastShieldUsedAt: null,
      budgetStreakCheckIn: () => set((state) => ({ ...computeNextBudgetStreak(state, new Date()) })),
      budgetStreakReset: () => set({ budgetStreakDays: 0, budgetStreakLastCheckIn: null }),
      budgetStreakRefillShields: () => set({ budgetStreakShields: 2 }),

      setBudgetGoal: (n) => set({ budgetGoal: Number(n || 0) }),
      setBudgetWeeklyTarget: (n) => set({ budgetWeeklyTarget: Number(n || 0) }),
      // Savings are tracked as a total, but we also append events so we can build history/timelines.
      addBudgetSaved: (delta, meta = {}) => set((state) => {
        const amount = Number(delta || 0)
        if (!amount) return {}
        const event = {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          amount,
          type: meta.type || 'manual', // manual | coach | challenge | transfer | milestone
          note: meta.note || null,
          createdAt: new Date().toISOString(),
        }

        // streak check-in (gentle, with shields)
        const nextStreak = computeNextBudgetStreak(state, new Date())

        return {
          budgetSaved: (state.budgetSaved || 0) + amount,
          budgetSavingsEvents: [...(state.budgetSavingsEvents || []), event],
          ...nextStreak,
        }
      }),
      resetBudgetSaved: () => set({ budgetSaved: 0 }),
      resetBudgetSavingsHistory: () => set({ budgetSavingsEvents: [], budgetSaved: 0, budgetUnlockedMilestones: [] }),

      // Budget data imports
      budgetReceipts: [],
      budgetTransactions: [],
      budgetEmailReceipts: [],
      importBudgetSync: (payload) => set((state) => {
        const receipts = Array.isArray(payload?.receipts) ? payload.receipts : []
        const transactions = Array.isArray(payload?.transactions) ? payload.transactions : []
        const emailReceipts = Array.isArray(payload?.emailReceipts) ? payload.emailReceipts : []
        const subscriptionsRaw = Array.isArray(payload?.subscriptions) ? payload.subscriptions : []

        // Map subscriptions to include proper amount field for UI compatibility
        const subscriptions = subscriptionsRaw.map(s => {
          const amt = Number(s.amount || s.avgAmount || s.defaultAmount || 0)
          return {
            ...s,
            amount: amt
          }
        })

        // de-dupe by id
        const existingReceipts = state.budgetReceipts || []
        const existingTx = state.budgetTransactions || []
        const existingReceiptIds = new Set(existingReceipts.map(r => r.id))
        const existingTxIds = new Set(existingTx.map(t => t.id))
        const existingEmailIds = new Set((state.budgetEmailReceipts || []).map(r => r.id))
        
        // Build fuzzy duplicate detector for Wolt + bank transactions
        // Same purchase often appears as both Wolt receipt AND bank transaction
        const txSignatures = new Set(existingTx.map(t => {
          const date = t.date ? t.date.slice(0, 10) : ''
          const merchant = (t.merchant || t.title || t.description || '').toLowerCase()
          const amount = Math.abs(t.amount || 0)
          return `${date}-${merchant}-${amount}`
        }))
        
        // Use a set of names to prevent duplicates from the sync file itself or existing subs
        const existingSubNames = new Set((state.subscriptions || []).map(s => s.name.toLowerCase()))

        // Filter receipts - remove duplicates against existing receipts
        const newReceipts = receipts.filter(r => r && r.id && !existingReceiptIds.has(r.id))
        
        // Filter transactions - remove duplicates against existing transactions
        // AND remove Wolt duplicates (same date + amount ~ Wolt purchase)
        const newTransactions = transactions.filter(t => {
          if (!t || !t.id || existingTxIds.has(t.id)) return false
          
          // Check if this looks like a Wolt transaction we already have as receipt
          const date = t.date ? t.date.slice(0, 10) : ''
          const merchant = (t.merchant || t.title || t.description || '').toLowerCase()
          const amount = Math.abs(t.amount || 0)
          const signature = `${date}-${merchant}-${amount}`
          
          // Skip if exact match with existing transaction
          if (txSignatures.has(signature)) return false
          
          // Check if it's a Wolt transaction (appears as receipt + bank tx)
          const isWoltLike = merchant.includes('wolt') || merchant.includes('pyszne')
          const hasMatchingReceipt = existingReceipts.some(r => {
            const rDate = r.date ? r.date.slice(0, 10) : ''
            const rAmount = Math.abs(r.total || 0)
            return rDate === date && Math.abs(rAmount - amount) < 100 // Within 100kr
          })
          
          if (isWoltLike && hasMatchingReceipt) {
            console.log(`Skipping duplicate Wolt tx: ${t.description} (${amount} kr)`)
            return false
          }
          
          return true
        })
        
        const mergedReceipts = [...existingReceipts, ...newReceipts]
        const mergedTx = [...existingTx, ...newTransactions]
        const mergedEmail = [
          ...(state.budgetEmailReceipts || []),
          ...emailReceipts.filter(r => r && r.id && !existingEmailIds.has(r.id))
        ]
        
        // v5.8.8 - FORCE SYNC everything from the sync file subscriptions array
        // If a sub name already exists, we skip it to avoid duplicates,
        // BUT we must ensure the initial import gets ALL of them.
        const newSubs = subscriptions
          .filter(s => s && s.name && !existingSubNames.has(s.name.toLowerCase()))
          .map(s => ({
            ...s,
            id: s.id || `sync-${Date.now()}-${Math.random()}`,
            status: 'active',
            billingCycle: s.frequency || 'monthly',
            updatedAt: new Date().toISOString()
          }))

        const mergedSubs = [
          ...(state.subscriptions || []),
          ...newSubs
        ]

        console.log(`IMPORT DEBUG: Imported ${newSubs.length} new subs. Total now: ${mergedSubs.length}`)

        return { 
          budgetReceipts: mergedReceipts, 
          budgetTransactions: mergedTx, 
          budgetEmailReceipts: mergedEmail,
          subscriptions: mergedSubs,
          budgetSubscriptions: mergedSubs
        }
      }),
      resetBudgetData: () => set({ budgetReceipts: [], budgetTransactions: [], budgetEmailReceipts: [] }),

      budgetImportStatus: null,
      importNow: async () => {
        try {
          set({ budgetImportStatus: { state: 'loading' } })
          
          let json = null
          if (typeof window !== 'undefined' && window.electronAPI?.readBudgetSyncFile) {
            json = await window.electronAPI.readBudgetSyncFile()
          } else {
            const res = await fetch('/budget-sync.json?t=' + Date.now())
            if (!res.ok) throw new Error('budget-sync.json fannst ekki')
            json = await res.json()
          }

          if (json) {
            get().importBudgetSync(json)
            set({
              budgetImportStatus: {
                state: 'done',
                receipts: json?.counts?.woltReceipts ?? (json?.receipts?.length || 0),
                tx: json?.counts?.indo ?? (json?.transactions?.length || 0),
                email: json?.counts?.emailReceipts ?? (json?.emailReceipts?.length || 0),
                subs: json?.subscriptions?.length || 0,
              }
            })
            setTimeout(() => set({ budgetImportStatus: null }), 4000)
          }
        } catch (e) {
          set({ budgetImportStatus: { state: 'error', message: e?.message || 'Villa' } })
        }
      },

      // Budget Subscriptions (v5.5.2)
      budgetSubscriptions: [],
      addBudgetSubscription: (sub) => set((state) => ({
        budgetSubscriptions: [...(state.budgetSubscriptions || []), sub]
      })),
      updateBudgetSubscription: (id, updates) => set((state) => ({
        budgetSubscriptions: (state.budgetSubscriptions || []).map(s => 
          s.id === id ? { ...s, ...updates } : s
        )
      })),
      deleteBudgetSubscription: (id) => set((state) => ({
        budgetSubscriptions: (state.budgetSubscriptions || []).filter(s => s.id !== id)
      })),

      // === SUBSCRIPTIONS TAB (v5.8.0) ===
      subscriptions: [],
      detectedSubscriptions: [],
      dismissedDetections: [],
      subscriptionViewMode: 'list',

      addSubscription: (sub) => set((state) => ({
        subscriptions: [...(state.subscriptions || []), {
          ...sub,
          id: sub.id || Date.now().toString(),
          status: sub.status || 'active',
          billingCycle: sub.billingCycle || 'monthly',
          essential: sub.essential || false,
          cancelCandidate: sub.cancelCandidate || false,
          priceHistory: sub.priceHistory || [],
          createdAt: sub.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }]
      })),

      updateSubscription: (id, updates) => set((state) => ({
        subscriptions: (state.subscriptions || []).map(s =>
          s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
        )
      })),

      deleteSubscription: (id) => set((state) => ({
        subscriptions: (state.subscriptions || []).filter(s => s.id !== id)
      })),

      dismissDetection: (merchantKey) => set((state) => ({
        dismissedDetections: [...(state.dismissedDetections || []), merchantKey]
      })),

      confirmDetection: (detection) => set((state) => ({
        subscriptions: [...(state.subscriptions || []), {
          id: Date.now().toString(),
          name: detection.name,
          amount: detection.amount,
          category: detection.category,
          status: 'active',
          essential: false,
          cancelCandidate: false,
          billingCycle: 'monthly',
          autoDetected: true,
          confidence: detection.confidence,
          merchantPattern: detection.merchantKey,
          startDate: detection.firstSeen,
          lastPaymentDate: detection.lastSeen,
          lastPaymentAmount: detection.amount,
          priceHistory: detection.priceHistory || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }],
        dismissedDetections: [...(state.dismissedDetections || []), detection.merchantKey]
      })),

      // Budget Coach actions completed (v5.5.2)
      budgetCoachCompleted: [],
      completeBudgetCoachAction: (actionId, savings, meta = {}) => set((state) => {
        const already = (state.budgetCoachCompleted || []).some(x => (
          x.id === actionId && (meta.weekId ? x.weekId === meta.weekId : true)
        ))
        if (already) return {}

        const amount = Number(savings || 0)
        const nextStreak = computeNextBudgetStreak(state, new Date())

        const event = amount ? {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          amount,
          type: meta.type || 'coach',
          note: meta.note || actionId,
          createdAt: new Date().toISOString(),
        } : null

        return {
          budgetCoachCompleted: [...(state.budgetCoachCompleted || []), {
            id: actionId,
            completedAt: new Date().toISOString(),
            savings: amount,
            weekId: meta.weekId || null,
          }],
          ...(amount ? {
            budgetSaved: (state.budgetSaved || 0) + amount,
            budgetSavingsEvents: [...(state.budgetSavingsEvents || []), event],
          } : {}),
          ...nextStreak,
        }
      }),
      resetBudgetCoachWeekly: () => set({ budgetCoachCompleted: [] }),

      // Micro Challenges (v5.5.2)
      budgetChallengeProgress: {},
      budgetCompletedChallenges: [],
      updateChallengeProgress: (challengeId, progress) => set((state) => ({
        budgetChallengeProgress: {
          ...(state.budgetChallengeProgress || {}),
          [challengeId]: progress
        }
      })),
      completeChallenge: (challengeId, reward, meta = {}) => set((state) => {
        if ((state.budgetCompletedChallenges || []).includes(challengeId)) return {}
        const amount = Number(reward || 0)
        const nextStreak = computeNextBudgetStreak(state, new Date())
        const event = amount ? {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          amount,
          type: meta.type || 'challenge',
          note: meta.note || challengeId,
          createdAt: new Date().toISOString(),
        } : null

        return {
          budgetCompletedChallenges: [...(state.budgetCompletedChallenges || []), challengeId],
          ...(amount ? {
            budgetSaved: (state.budgetSaved || 0) + amount,
            budgetSavingsEvents: [...(state.budgetSavingsEvents || []), event],
          } : {}),
          ...nextStreak,
        }
      }),
      // Backwards compatible actions
      incrementStreak: () => set((state) => ({ ...computeNextBudgetStreak(state, new Date()) })),
      resetStreak: () => set({ budgetStreakDays: 0, budgetStreakLastCheckIn: null }),

      // Transaction category overrides (v5.5.2)
      budgetCategoryOverrides: {},
      updateTransactionCategory: (txId, category) => set((state) => ({
        budgetCategoryOverrides: {
          ...(state.budgetCategoryOverrides || {}),
          [txId]: category
        }
      })),

      // Projects
      projects: PROJECTS,
      addProject: (project) => set((state) => ({
        projects: [...state.projects, {
          id: Date.now().toString(),
          ...project
        }]
      })),
      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map(p => p.id === id ? { ...p, ...updates } : p)
      })),
      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter(p => p.id !== id),
        tasks: state.tasks.filter(t => t.projectId !== id)
      })),
      
      // Tasks - enhanced with due dates and dependencies (v5.0.0)
      tasks: [],
      lastDeletedTask: null,
      
      // Seed initial tasks from project analysis
      seedProjectTasks: () => {
        const state = get()
        if (state.tasks.length > 0) return // Don't seed if already has tasks
        
        const initialTasks = [
          // Eignamat tasks
          { id: '1', projectId: 'eignamat', title: 'Add renovation detection features to vision prompt', priority: 'high', createdAt: new Date().toISOString() },
          { id: '2', projectId: 'eignamat', title: 'Add positive features: recent_renovation, modern_kitchen, modern_bathroom', priority: 'high', createdAt: new Date().toISOString() },
          { id: '3', projectId: 'eignamat', title: 'Implement dynamic positive cap based on building age', priority: 'medium', createdAt: new Date().toISOString(), blockedBy: ['2'] },
          { id: '4', projectId: 'eignamat', title: 'Add location premium enhancement for postcodes 101, 107', priority: 'low', createdAt: new Date().toISOString() },
          { id: '5', projectId: 'eignamat', title: 'Re-test valuation accuracy with Hlíðargerði 17 and Mjóahlíð 12', priority: 'medium', createdAt: new Date().toISOString(), blockedBy: ['3'] },
          { id: '6', projectId: 'eignamat', title: 'Add user authentication system', priority: 'high', createdAt: new Date().toISOString() },
          { id: '7', projectId: 'eignamat', title: 'Build pricing/subscription page', priority: 'medium', createdAt: new Date().toISOString(), blockedBy: ['6'] },
          
          // Takk Arena tasks
          { id: '8', projectId: 'takkarena', title: 'Add push notifications for battle challenges', priority: 'medium', createdAt: new Date().toISOString() },
          { id: '9', projectId: 'takkarena', title: 'Implement team competitions (not just 1v1)', priority: 'medium', createdAt: new Date().toISOString() },
          { id: '10', projectId: 'takkarena', title: 'Add achievement badges system', priority: 'low', createdAt: new Date().toISOString() },
          { id: '11', projectId: 'takkarena', title: 'Improve AI Coach prompts for better advice', priority: 'low', createdAt: new Date().toISOString() },
          { id: '12', projectId: 'takkarena', title: 'Add offline mode support for PWA', priority: 'medium', createdAt: new Date().toISOString() },
          
          // Betri Þú tasks  
          { id: '13', projectId: 'betrithu', title: 'Build frontend storefront UI', priority: 'high', createdAt: new Date().toISOString() },
          { id: '14', projectId: 'betrithu', title: 'Integrate Swipe payment gateway', priority: 'high', createdAt: new Date().toISOString() },
          { id: '15', projectId: 'betrithu', title: 'Create audio player component with progress tracking', priority: 'high', createdAt: new Date().toISOString() },
          { id: '16', projectId: 'betrithu', title: 'Add user library/purchased recordings page', priority: 'medium', createdAt: new Date().toISOString(), blockedBy: ['14'] },
          { id: '17', projectId: 'betrithu', title: 'Record more hypnosis sessions (content)', priority: 'medium', createdAt: new Date().toISOString() },
          { id: '18', projectId: 'betrithu', title: 'Set up Swipe webhook for payment confirmations', priority: 'high', createdAt: new Date().toISOString() },
          
          // Kosningagátt tasks
          { id: '19', projectId: 'kosningagatt', title: 'Archive project - election is over', priority: 'low', createdAt: new Date().toISOString() },
          { id: '20', projectId: 'kosningagatt', title: 'Document learnings for future campaigns', priority: 'low', createdAt: new Date().toISOString() },
          
          // Portfolio tasks
          { id: '21', projectId: 'arnar', title: 'Add ArnarFlow to projects section', priority: 'medium', createdAt: new Date().toISOString() },
          { id: '22', projectId: 'arnar', title: 'Update project screenshots', priority: 'low', createdAt: new Date().toISOString() },
          { id: '23', projectId: 'arnar', title: 'Add blog section for dev journey', priority: 'low', createdAt: new Date().toISOString() },
          { id: '24', projectId: 'arnar', title: 'Improve mobile responsiveness', priority: 'medium', createdAt: new Date().toISOString() },
        ]
        
        set({ tasks: initialTasks.map(t => ({ ...t, completed: false, timeSpent: 0, blockedBy: t.blockedBy || [] })) })
      },
      addTask: (task) => set((state) => ({
        tasks: [...state.tasks, {
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          completed: false,
          dueDate: null,
          timeSpent: 0, // in minutes
          blockedBy: [], // v5.0.0 - task dependencies
          aiPriority: null, // v5.0.0 - AI suggested priority
          aiReason: null, // v5.0.0 - AI reasoning for priority
          ...task
        }]
      })),
      toggleTask: (id) => set((state) => ({
        tasks: state.tasks.map(t => 
          t.id === id ? { 
            ...t, 
            completed: !t.completed, 
            completedAt: !t.completed ? new Date().toISOString() : null 
          } : t
        )
      })),
      // FIX 6: Undo for task deletion
      deleteTask: (id) => set((state) => {
        const taskToDelete = state.tasks.find(t => t.id === id) || null

        // Clear previous undo timer
        if (lastDeletedTaskTimer) {
          clearTimeout(lastDeletedTaskTimer)
          lastDeletedTaskTimer = null
        }

        // Auto-clear after 10s
        lastDeletedTaskTimer = setTimeout(() => {
          lastDeletedTaskTimer = null
          set({ lastDeletedTask: null })
        }, 10000)

        return {
          tasks: state.tasks.filter(t => t.id !== id).map(t => ({
            ...t,
            blockedBy: (t.blockedBy || []).filter(bid => bid !== id)
          })),
          lastDeletedTask: taskToDelete,
        }
      }),
      undoDeleteTask: () => set((state) => {
        if (!state.lastDeletedTask) return {}

        if (lastDeletedTaskTimer) {
          clearTimeout(lastDeletedTaskTimer)
          lastDeletedTaskTimer = null
        }

        return {
          tasks: [...state.tasks, state.lastDeletedTask],
          lastDeletedTask: null,
        }
      }),
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
      })),
      addTimeToTask: (id, minutes) => set((state) => ({
        tasks: state.tasks.map(t => 
          t.id === id ? { ...t, timeSpent: (t.timeSpent || 0) + minutes } : t
        )
      })),

      // v5.0.0 - Task Dependencies
      addDependency: (taskId, blockedByTaskId) => set((state) => ({
        tasks: state.tasks.map(t => 
          t.id === taskId 
            ? { ...t, blockedBy: [...new Set([...(t.blockedBy || []), blockedByTaskId])] }
            : t
        )
      })),
      removeDependency: (taskId, blockedByTaskId) => set((state) => ({
        tasks: state.tasks.map(t => 
          t.id === taskId 
            ? { ...t, blockedBy: (t.blockedBy || []).filter(id => id !== blockedByTaskId) }
            : t
        )
      })),
      getBlockingTasks: (taskId) => {
        const state = get()
        const task = state.tasks.find(t => t.id === taskId)
        if (!task || !task.blockedBy || task.blockedBy.length === 0) return []
        return state.tasks.filter(t => task.blockedBy.includes(t.id))
      },
      getBlockedTasks: (taskId) => {
        const state = get()
        return state.tasks.filter(t => (t.blockedBy || []).includes(taskId))
      },
      isTaskBlocked: (taskId) => {
        const state = get()
        const task = state.tasks.find(t => t.id === taskId)
        if (!task || !task.blockedBy || task.blockedBy.length === 0) return false
        // Task is blocked if any blocking task is not completed
        return task.blockedBy.some(bid => {
          const blockingTask = state.tasks.find(t => t.id === bid)
          return blockingTask && !blockingTask.completed
        })
      },

      // v4.1.0 - Task Subtasks/Checklist
      addSubtask: (taskId, subtask) => set((state) => ({
        tasks: state.tasks.map(t => 
          t.id === taskId 
            ? { 
                ...t, 
                subtasks: [...(t.subtasks || []), { 
                  id: Date.now().toString(), 
                  title: subtask,
                  completed: false,
                  createdAt: new Date().toISOString()
                }] 
              }
            : t
        )
      })),
      toggleSubtask: (taskId, subtaskId) => set((state) => ({
        tasks: state.tasks.map(t => 
          t.id === taskId 
            ? { 
                ...t, 
                subtasks: (t.subtasks || []).map(s => 
                  s.id === subtaskId ? { ...s, completed: !s.completed } : s
                )
              }
            : t
        )
      })),
      deleteSubtask: (taskId, subtaskId) => set((state) => ({
        tasks: state.tasks.map(t => 
          t.id === taskId 
            ? { ...t, subtasks: (t.subtasks || []).filter(s => s.id !== subtaskId) }
            : t
        )
      })),
      reorderSubtasks: (taskId, subtaskIds) => set((state) => ({
        tasks: state.tasks.map(t => 
          t.id === taskId 
            ? { 
                ...t, 
                subtasks: subtaskIds.map(id => (t.subtasks || []).find(s => s.id === id)).filter(Boolean)
              }
            : t
        )
      })),

      // v3.0.0 - Task Tags
      tags: DEFAULT_TAGS,
      addTag: (tag) => set((state) => ({
        tags: [...state.tags, { id: Date.now().toString(), ...tag }]
      })),
      updateTag: (id, updates) => set((state) => ({
        tags: state.tags.map(t => t.id === id ? { ...t, ...updates } : t)
      })),
      deleteTag: (id) => set((state) => ({
        tags: state.tags.filter(t => t.id !== id)
      })),
      addTagToTask: (taskId, tagId) => set((state) => ({
        tasks: state.tasks.map(t => 
          t.id === taskId 
            ? { ...t, tags: [...(t.tags || []), tagId].filter((v, i, a) => a.indexOf(v) === i) }
            : t
        )
      })),
      removeTagFromTask: (taskId, tagId) => set((state) => ({
        tasks: state.tasks.map(t => 
          t.id === taskId 
            ? { ...t, tags: (t.tags || []).filter(id => id !== tagId) }
            : t
        )
      })),

      // Ideas Inbox - enhanced with categories and tags
      ideas: [],
      ideaCategories: IDEA_CATEGORIES,
      addIdea: (idea) => set((state) => ({
        ideas: [...state.ideas, {
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          status: 'inbox',
          tags: [],
          category: null,
          projectId: null,
          ...idea
        }]
      })),
      updateIdea: (id, updates) => set((state) => ({
        ideas: state.ideas.map(i => i.id === id ? { ...i, ...updates } : i)
      })),
      deleteIdea: (id) => set((state) => ({
        ideas: state.ideas.filter(i => i.id !== id)
      })),
      addTagToIdea: (id, tag) => set((state) => ({
        ideas: state.ideas.map(i => 
          i.id === id 
            ? { ...i, tags: [...new Set([...(i.tags || []), tag])] }
            : i
        )
      })),
      removeTagFromIdea: (id, tag) => set((state) => ({
        ideas: state.ideas.map(i => 
          i.id === id 
            ? { ...i, tags: (i.tags || []).filter(t => t !== tag) }
            : i
        )
      })),

      // Habits - enhanced with streak tracking
      habits: HABITS,
      habitLogs: {},
      habitStreaks: {}, // { habitId: { current: number, longest: number } }
      setHabitStatus: (habitId, date, status) => set((state) => {
        const key = `${habitId}-${date}`
        const newLogs = { ...state.habitLogs }
        if (status === null) {
          delete newLogs[key]
        } else {
          newLogs[key] = status
        }
        
        // Recalculate streak for this habit
        const newStreaks = { ...state.habitStreaks }
        // We need the helper function available here, but it's outside. 
        // We can just call it since it's in scope.
        // Wait, calculateStreak is defined below. Is it hoisted? Function declarations are hoisted.
        const streak = calculateStreak(habitId, newLogs)
        newStreaks[habitId] = streak
        
        return { habitLogs: newLogs, habitStreaks: newStreaks }
      }),
      toggleHabit: (habitId, date) => set((state) => {
        const key = `${habitId}-${date}`
        const currentStatus = state.habitLogs[key]
        // Toggle logic: done -> null -> done (simple toggle)
        // If it was 'skip', toggle to 'done'? Or 'null'?
        // Let's say toggle is mainly for the main checkbox.
        const newStatus = (currentStatus === 'done' || currentStatus === true) ? null : 'done'
        
        get().setHabitStatus(habitId, date, newStatus)
        return {} // State update handled by setHabitStatus
      }),
      getHabitStreak: (habitId) => {
        const state = get()
        return state.habitStreaks[habitId] || { current: 0, longest: 0 }
      },
      recalculateAllStreaks: () => set((state) => {
        const newStreaks = {}
        state.habits.forEach(habit => {
          newStreaks[habit.id] = calculateStreak(habit.id, state.habitLogs)
        })
        return { habitStreaks: newStreaks }
      }),

      // Recurring Tasks
      recurringTasks: [],
      addRecurringTask: (task) => set((state) => ({
        recurringTasks: [...state.recurringTasks, {
          id: Date.now().toString(),
          ...task
        }]
      })),
      updateRecurringTask: (id, updates) => set((state) => ({
        recurringTasks: state.recurringTasks.map(t => 
          t.id === id ? { ...t, ...updates } : t
        )
      })),
      deleteRecurringTask: (id) => set((state) => ({
        recurringTasks: state.recurringTasks.filter(t => t.id !== id)
      })),
      toggleRecurringTask: (id) => set((state) => ({
        recurringTasks: state.recurringTasks.map(t =>
          t.id === id ? { ...t, enabled: !t.enabled } : t
        )
      })),

      // Notes / Journal
      notes: {},
      addNote: (date, content) => set((state) => ({
        notes: {
          ...state.notes,
          [date]: {
            content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        }
      })),
      updateNote: (date, content) => set((state) => ({
        notes: {
          ...state.notes,
          [date]: {
            ...state.notes[date],
            content,
            updatedAt: new Date().toISOString(),
          }
        }
      })),
      deleteNote: (date) => set((state) => {
        const newNotes = { ...state.notes }
        delete newNotes[date]
        return { notes: newNotes }
      }),

      // Recipes (v5.10.0)
      recipes: SEED_RECIPES,
      addRecipe: (recipe) => set((state) => {
        const normalized = normalizeRecipeShape(recipe)
        return {
          recipes: [
            normalized,
            ...(state.recipes || []),
          ]
        }
      }),
      removeRecipe: (id) => set((state) => ({
        recipes: (state.recipes || []).filter(r => r.id !== id)
      })),
      toggleFavoriteRecipe: (id) => set((state) => ({
        recipes: (state.recipes || []).map(r =>
          r.id === id ? { ...r, favorite: !r.favorite } : r
        )
      })),
      updateRecipe: (id, updates) => set((state) => ({
        recipes: (state.recipes || []).map(r => {
          if (r.id !== id) return r
          const u = updates || {}
          const next = { ...r, ...u }
          // Preserve createdAt unless explicitly overwritten
          if (!Object.prototype.hasOwnProperty.call(u, 'createdAt')) next.createdAt = r.createdAt
          return normalizeRecipeShape(next, { generateId: false, createdAtFallback: r.createdAt })
        })
      })),
      importRecipes: (recipes, opts = {}) => {
        const list = Array.isArray(recipes) ? recipes : []
        const mode = opts.onCollision === 'newId' ? 'newId' : 'update'
        let summary = { imported: 0, updated: 0, skipped: 0 }

        set((state) => {
          const existing = Array.isArray(state.recipes) ? state.recipes : []
          const byId = new Map(existing.filter(Boolean).map(r => [r.id, r]))
          const next = [...existing]

          for (const raw of list) {
            if (!raw) { summary.skipped++; continue }

            const normalized = normalizeRecipeShape(raw)
            if (!normalized.id || !normalized.name) { summary.skipped++; continue }

            const found = byId.get(normalized.id)
            if (found) {
              if (mode === 'update') {
                // Keep original createdAt unless import explicitly contains it
                const keepCreatedAt = found.createdAt
                const merged = { ...found, ...normalized }
                if (!Object.prototype.hasOwnProperty.call(raw, 'createdAt')) merged.createdAt = keepCreatedAt

                const cleaned = normalizeRecipeShape(merged, { generateId: false, createdAtFallback: keepCreatedAt })
                const idx = next.findIndex(r => r.id === normalized.id)
                if (idx >= 0) next[idx] = cleaned
                byId.set(cleaned.id, cleaned)
                summary.updated++
              } else {
                const copy = normalizeRecipeShape({ ...normalized, id: recipeId(), createdAt: new Date().toISOString() })
                next.unshift(copy)
                byId.set(copy.id, copy)
                summary.imported++
              }
              continue
            }

            next.unshift(normalized)
            byId.set(normalized.id, normalized)
            summary.imported++
          }

          return { recipes: next }
        })

        return summary
      },

      // Weekly Reviews (Phase 7)
      weeklyReviews: [],
      addWeeklyReview: (review) => set((state) => ({
        weeklyReviews: [...state.weeklyReviews, {
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          ...review
        }]
      })),

      // Milestones (Phase 10)
      milestones: [],
      addMilestone: (milestone) => set((state) => ({
        milestones: [...state.milestones, {
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          completed: false,
          ...milestone
        }]
      })),
      toggleMilestone: (id) => set((state) => ({
        milestones: state.milestones.map(m => 
          m.id === id ? { ...m, completed: !m.completed } : m
        )
      })),
      deleteMilestone: (id) => set((state) => ({
        milestones: state.milestones.filter(m => m.id !== id)
      })),

      // ═══════════════════════════════════════════════════════════════
      // v5.0.0 - Time Tracking
      // ═══════════════════════════════════════════════════════════════
      
      // Active time tracking session
      activeTimeSession: null, // { taskId, projectId, startTime, description }
      
      // Time tracking sessions history
      timeSessions: [],
      
      // Start time tracking for a task
      startTimeTracking: (taskId, projectId, description = '') => set((state) => ({
        activeTimeSession: {
          taskId,
          projectId,
          startTime: Date.now(),
          description
        }
      })),
      
      // Pause/stop time tracking
      stopTimeTracking: () => {
        const state = get()
        if (!state.activeTimeSession) return
        
        const { taskId, projectId, startTime, description } = state.activeTimeSession
        const endTime = Date.now()
        const duration = Math.floor((endTime - startTime) / 1000) // in seconds
        
        if (duration < 10) {
          // Don't save sessions shorter than 10 seconds
          set({ activeTimeSession: null })
          return
        }
        
        const session = {
          id: Date.now().toString(),
          taskId,
          projectId,
          startTime,
          endTime,
          duration,
          description,
          billable: false,
          createdAt: new Date().toISOString()
        }
        
        // Add duration to task timeSpent
        if (taskId) {
          const minutes = Math.floor(duration / 60)
          if (minutes > 0) {
            get().addTimeToTask(taskId, minutes)
          }
        }
        
        set((state) => ({
          activeTimeSession: null,
          timeSessions: [...state.timeSessions, session]
        }))
      },
      
      // Update active session description
      updateActiveSessionDescription: (description) => set((state) => ({
        activeTimeSession: state.activeTimeSession 
          ? { ...state.activeTimeSession, description }
          : null
      })),
      
      // Toggle billable status for a session
      toggleSessionBillable: (sessionId) => set((state) => ({
        timeSessions: state.timeSessions.map(s => 
          s.id === sessionId ? { ...s, billable: !s.billable } : s
        )
      })),
      
      // Delete a time session
      deleteTimeSession: (sessionId) => set((state) => ({
        timeSessions: state.timeSessions.filter(s => s.id !== sessionId)
      })),
      
      // Get time stats
      getTimeStats: () => {
        const state = get()
        const sessions = state.timeSessions
        const today = toISODateLocal(new Date())
        const weekAgo = toISODateLocal(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        
        const todaySessions = sessions.filter(s => toISODateLocal(new Date(s.startTime)) === today)
        const weekSessions = sessions.filter(s => toISODateLocal(new Date(s.startTime)) >= weekAgo)
        
        const totalSeconds = sessions.reduce((sum, s) => sum + s.duration, 0)
        const todaySeconds = todaySessions.reduce((sum, s) => sum + s.duration, 0)
        const weekSeconds = weekSessions.reduce((sum, s) => sum + s.duration, 0)
        const billableSeconds = sessions.filter(s => s.billable).reduce((sum, s) => sum + s.duration, 0)
        
        // Time by project
        const byProject = {}
        sessions.forEach(s => {
          if (!byProject[s.projectId]) byProject[s.projectId] = 0
          byProject[s.projectId] += s.duration
        })
        
        return {
          totalSessions: sessions.length,
          totalSeconds,
          totalHours: Math.round(totalSeconds / 3600 * 10) / 10,
          todaySeconds,
          todayHours: Math.round(todaySeconds / 3600 * 10) / 10,
          weekSeconds,
          weekHours: Math.round(weekSeconds / 3600 * 10) / 10,
          billableSeconds,
          billableHours: Math.round(billableSeconds / 3600 * 10) / 10,
          byProject
        }
      },
      
      // Get weekly report data
      getWeeklyTimeReport: () => {
        const state = get()
        const sessions = state.timeSessions
        const days = []
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
          const dateStr = toISODateLocal(date)
          const daySessions = sessions.filter(s => 
            toISODateLocal(new Date(s.startTime)) === dateStr
          )
          const totalSeconds = daySessions.reduce((sum, s) => sum + s.duration, 0)
          
          days.push({
            date: dateStr,
            dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
            sessions: daySessions.length,
            seconds: totalSeconds,
            hours: Math.round(totalSeconds / 3600 * 10) / 10
          })
        }
        
        return days
      },

      // ═══════════════════════════════════════════════════════════════
      // v5.0.0 - Notifications System
      // ═══════════════════════════════════════════════════════════════
      
      // In-app notifications
      notifications: [],
      unreadNotificationCount: 0,
      
      // Notification preferences
      notificationPreferences: {
        dueSoon: true,        // Tasks due within 2 hours
        overdue: true,        // Overdue tasks
        streakAtRisk: true,   // Habit streak about to break
        dailyBriefing: false, // Morning summary
        quietHoursStart: 23,  // 11 PM
        quietHoursEnd: 8,     // 8 AM
      },
      
      // Add notification
      addNotification: (notification) => set((state) => ({
        notifications: [
          {
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            read: false,
            ...notification
          },
          ...state.notifications
        ].slice(0, 100), // Keep last 100 notifications
        unreadNotificationCount: state.unreadNotificationCount + 1
      })),
      
      // Mark notification as read
      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        ),
        unreadNotificationCount: Math.max(0, state.unreadNotificationCount - 1)
      })),
      
      // Mark all as read
      markAllNotificationsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadNotificationCount: 0
      })),
      
      // Delete notification
      deleteNotification: (id) => set((state) => {
        const notification = state.notifications.find(n => n.id === id)
        return {
          notifications: state.notifications.filter(n => n.id !== id),
          unreadNotificationCount: notification && !notification.read 
            ? Math.max(0, state.unreadNotificationCount - 1)
            : state.unreadNotificationCount
        }
      }),
      
      // Clear all notifications
      clearAllNotifications: () => set({ notifications: [], unreadNotificationCount: 0 }),
      
      // Update notification preferences
      setNotificationPreference: (key, value) => set((state) => ({
        notificationPreferences: { ...state.notificationPreferences, [key]: value }
      })),
      
      // Check if currently in quiet hours
      isQuietHours: () => {
        const state = get()
        const { quietHoursStart, quietHoursEnd } = state.notificationPreferences
        const hour = new Date().getHours()
        
        if (quietHoursStart > quietHoursEnd) {
          // Overnight quiet hours (e.g., 23-8)
          return hour >= quietHoursStart || hour < quietHoursEnd
        }
        return hour >= quietHoursStart && hour < quietHoursEnd
      },

      // ═══════════════════════════════════════════════════════════════
      // v5.0.0 - AI Smart Prioritization
      // ═══════════════════════════════════════════════════════════════
      
      aiPrioritizationEnabled: true,
      lastAiPrioritization: null,
      aiSuggestions: [], // { taskId, suggestedPriority, reason, confidence }
      
      setAiPrioritizationEnabled: (enabled) => set({ aiPrioritizationEnabled: enabled }),
      
      setAiSuggestions: (suggestions) => set({ 
        aiSuggestions: suggestions,
        lastAiPrioritization: new Date().toISOString()
      }),
      
      applyAiSuggestion: (taskId) => set((state) => {
        const suggestion = state.aiSuggestions.find(s => s.taskId === taskId)
        if (!suggestion) return {}
        
        return {
          tasks: state.tasks.map(t => 
            t.id === taskId 
              ? { ...t, priority: suggestion.suggestedPriority, aiPriority: suggestion.suggestedPriority, aiReason: suggestion.reason }
              : t
          ),
          aiSuggestions: state.aiSuggestions.filter(s => s.taskId !== taskId)
        }
      }),
      
      dismissAiSuggestion: (taskId) => set((state) => ({
        aiSuggestions: state.aiSuggestions.filter(s => s.taskId !== taskId)
      })),

      // ═══════════════════════════════════════════════════════════════
      // v5.0.0 - Calendar Sync
      // ═══════════════════════════════════════════════════════════════
      
      calendarSyncEnabled: false,
      googleCalendarConnected: false,
      appleCalendarEnabled: false,
      calendarEvents: [], // Cached calendar events
      lastCalendarSync: null,
      
      setCalendarSyncEnabled: (enabled) => set({ calendarSyncEnabled: enabled }),
      setGoogleCalendarConnected: (connected) => set({ googleCalendarConnected: connected }),
      setAppleCalendarEnabled: (enabled) => set({ appleCalendarEnabled: enabled }),
      setCalendarEvents: (events) => set({ 
        calendarEvents: events,
        lastCalendarSync: new Date().toISOString()
      }),
      addCalendarEvent: (event) => set((state) => ({
        calendarEvents: [...state.calendarEvents, event]
      })),

      // ═══════════════════════════════════════════════════════════════
      // v5.0.0 - Bento Grid Dashboard
      // ═══════════════════════════════════════════════════════════════
      
      dashboardLayout: [
        { id: 'quick-stats', x: 0, y: 0, w: 6, h: 1 },
        { id: 'today-tasks', x: 6, y: 0, w: 3, h: 2 },
        { id: 'focus-timer', x: 9, y: 0, w: 3, h: 2 },
        { id: 'activity-chart', x: 0, y: 1, w: 6, h: 2 },
        { id: 'habits-mini', x: 0, y: 3, w: 3, h: 1 },
        { id: 'streak-card', x: 3, y: 3, w: 3, h: 1 },
        { id: 'projects', x: 6, y: 2, w: 6, h: 2 },
      ],
      
      updateDashboardLayout: (layout) => set({ dashboardLayout: layout }),
      
      resetDashboardLayout: () => set({
        dashboardLayout: [
          { id: 'quick-stats', x: 0, y: 0, w: 6, h: 1 },
          { id: 'today-tasks', x: 6, y: 0, w: 3, h: 2 },
          { id: 'focus-timer', x: 9, y: 0, w: 3, h: 2 },
          { id: 'activity-chart', x: 0, y: 1, w: 6, h: 2 },
          { id: 'habits-mini', x: 0, y: 3, w: 3, h: 1 },
          { id: 'streak-card', x: 3, y: 3, w: 3, h: 1 },
          { id: 'projects', x: 6, y: 2, w: 6, h: 2 },
        ]
      }),

      // Focus Timer - enhanced
      focusProject: null,
      focusTask: null,
      focusStartTime: null,
      focusElapsed: 0, // seconds
      focusDistractions: [], // List of distraction notes/timestamps
      
      setFocusProject: (projectId) => set({ 
        focusProject: projectId, 
        focusStartTime: projectId ? Date.now() : null,
        focusElapsed: 0,
        focusDistractions: [] 
      }),
      setFocusTask: (taskId) => set({ focusTask: taskId }),
      
      addDistraction: (note) => set((state) => ({
        focusDistractions: [...state.focusDistractions, {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          note: note || null
        }]
      })),
      
      updateFocusElapsed: () => set((state) => {
        if (!state.focusStartTime) return {}
        return { focusElapsed: Math.floor((Date.now() - state.focusStartTime) / 1000) }
      }),
      endFocus: () => {
        const state = get()
        if (state.focusTask && state.focusElapsed > 60) {
          // Add time spent to task (convert to minutes)
          const minutes = Math.floor(state.focusElapsed / 60)
          get().addTimeToTask(state.focusTask, minutes)
        }
        set({ 
          focusProject: null, 
          focusTask: null, 
          focusStartTime: null, 
          focusElapsed: 0,
          focusDistractions: []
        })
      },

      // Filters
      filters: {
        project: null,
        priority: null,
        showCompleted: false,
        search: '',
        showBlocked: true, // v5.0.0 - Show/hide blocked tasks
      },
      setFilter: (key, value) => set((state) => ({
        filters: { ...state.filters, [key]: value }
      })),
      clearFilters: () => set({
        filters: { project: null, priority: null, showCompleted: false, search: '', showBlocked: true }
      }),

      // View state
      activeView: 'dashboard',
      setActiveView: (view) => set({ activeView: view }),
      selectedProject: null,
      setSelectedProject: (id) => set({ selectedProject: id }),

      // Command palette
      commandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

      // Quick add modal
      quickAddOpen: false,
      setQuickAddOpen: (open) => set({ quickAddOpen: open }),
      
      // Quick idea capture mode
      quickIdeaMode: false,
      setQuickIdeaMode: (mode) => set({ quickIdeaMode: mode }),

      // v3.0.0 - Quick Capture Bar
      quickCaptureExpanded: false,
      setQuickCaptureExpanded: (expanded) => set({ quickCaptureExpanded: expanded }),

      // Settings modal
      settingsOpen: false,
      setSettingsOpen: (open) => set({ settingsOpen: open }),

      // Add Project modal
      addProjectOpen: false,
      addProjectDefaultStatus: null,
      setAddProjectOpen: (open) => set({ addProjectOpen: open }),
      setAddProjectDefaultStatus: (status) => set({ addProjectDefaultStatus: status }),

      // Keyboard shortcuts modal
      keyboardShortcutsOpen: false,
      setKeyboardShortcutsOpen: (open) => set({ keyboardShortcutsOpen: open }),

      // About modal
      aboutOpen: false,
      setAboutOpen: (open) => set({ aboutOpen: open }),

      // What's New modal
      whatsNewOpen: false,
      setWhatsNewOpen: (open) => set({ whatsNewOpen: open }),
      
      // Recurring Tasks Modal
      recurringOpen: false,
      setRecurringOpen: (open) => set({ recurringOpen: open }),
      
      // v5.0.0 - Notifications Panel
      notificationsPanelOpen: false,
      setNotificationsPanelOpen: (open) => set({ notificationsPanelOpen: open }),
      
      // v5.0.0 - Time Tracker Modal
      timeTrackerOpen: false,
      setTimeTrackerOpen: (open) => set({ timeTrackerOpen: open }),
      
      // v5.0.0 - Roadmap View
      roadmapViewOpen: false,
      setRoadmapViewOpen: (open) => set({ roadmapViewOpen: open }),
      roadmapZoom: 'month', // 'week' | 'month' | 'quarter'
      setRoadmapZoom: (zoom) => set({ roadmapZoom: zoom }),
      
      // v5.1.2 - Task Detail Panel
      selectedTaskId: null,
      setSelectedTaskId: (id) => set({ selectedTaskId: id }),
      
      // Onboarding
      onboardingComplete: false,
      onboardingOpen: false,
      setOnboardingComplete: (complete) => set({ onboardingComplete: complete }),
      setOnboardingOpen: (open) => set({ onboardingOpen: open }),
      shouldShowOnboarding: () => !get().onboardingComplete,
      lastSeenVersion: null,
      markWhatsNewSeen: (version) => set({ lastSeenVersion: version }),
      shouldShowWhatsNew: () => {
        const state = get()
        return state.lastSeenVersion !== APP_VERSION
      },

      // Theme settings
      theme: 'dark', // 'dark' | 'light' | 'system'
      setTheme: (theme) => set({ theme }),
      
      // Accent color
      accentColor: 'indigo', // v5.0.0 - Default to indigo (Linear-style)
      setAccentColor: (color) => set({ accentColor: color }),
      getAccentColorValue: () => ACCENT_COLORS[get().accentColor] || ACCENT_COLORS.indigo,

      // Notifications
      notificationsEnabled: true,
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      habitRemindersEnabled: true,
      setHabitRemindersEnabled: (enabled) => set({ habitRemindersEnabled: enabled }),
      taskRemindersEnabled: true,
      setTaskRemindersEnabled: (enabled) => set({ taskRemindersEnabled: enabled }),
      lastNotificationCheck: null,
      setLastNotificationCheck: (time) => set({ lastNotificationCheck: time }),

      // Keyboard shortcuts
      shortcuts: {
        quickAdd: 'Ctrl+K',
        commandPalette: 'Ctrl+P',
        settings: 'Ctrl+,',
        help: '?',
        dashboard: 'G D',
        ideas: 'G I',
        habits: 'G H',
        timeTracker: 'Ctrl+T', // v5.0.0
        roadmap: 'G R', // v5.0.0
      },

      // v3.0.0 - Daily Goals
      dailyGoals: {
        tasks: 5,
        habits: 4,
        focusMinutes: 90,
        pomodoroSessions: 4,
      },
      setDailyGoals: (goals) => set((state) => ({
        dailyGoals: { ...state.dailyGoals, ...goals }
      })),

      // v3.0.0 - Pomodoro Timer
      pomodoroOpen: false,
      setPomodoroOpen: (open) => set({ pomodoroOpen: open }),
      pomodoroSettings: {
        preset: 'pomodoro',
        customWork: 25,
        customBreak: 5,
        customLongBreak: 15,
        sessionsBeforeLong: 4,
        soundEnabled: true,
        autoStartBreaks: false,
        autoStartPomodoros: false,
      },
      setPomodoroSettings: (settings) => set((state) => ({
        pomodoroSettings: { ...state.pomodoroSettings, ...settings }
      })),
      pomodoroSessions: [],
      addPomodoroSession: (session) => set((state) => ({
        pomodoroSessions: [...state.pomodoroSessions, {
          id: Date.now().toString(),
          ...session
        }]
      })),
      getPomodoroStats: () => {
        const sessions = get().pomodoroSessions
        const today = toISODateLocal(new Date())
        const todaySessions = sessions.filter(s => s.completedAt?.startsWith(today))
        const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0)
        const todayMinutes = todaySessions.reduce((sum, s) => sum + (s.duration || 0), 0)
        return {
          totalSessions: sessions.length,
          todaySessions: todaySessions.length,
          totalMinutes,
          todayMinutes,
          totalHours: Math.round(totalMinutes / 60 * 10) / 10,
        }
      },

      // v6.0.0 - Projects board ordering (dnd-kit)
      // Allows ProjectsBoard to persist the ordering from drag & drop.
      setProjectsOrder: (nextProjects) => set((state) => ({
        projects: Array.isArray(nextProjects) ? nextProjects : state.projects,
      })),
    }),
    {
      name: 'arnarflow-storage',
      version: 4,
      migrate: (persistedState, fromVersion) => {
        const state = persistedState || {}

        // Ensure projects exist
        const projects = Array.isArray(state.projects) ? state.projects : PROJECTS

        // Add default project.status for older stored data
        const statusById = {
          eignamat: 'active',
          takkarena: 'active',
          betrithu: 'active',
          kosningagatt: 'done',
          arnar: 'on_hold',
        }

        const migratedProjects = projects.map((p) => {
          if (!p) return p
          return {
            ...p,
            status: p.status || statusById[p.id] || 'ideas',
          }
        })

        // If upgrading from older versions, auto-assign missing due dates so Timeline view works out of the box.
        // This is a *best-effort* heuristic schedule and only fills missing values.
        const addBusinessDays = (date, days) => {
          const d = new Date(date)
          let remaining = Number(days || 0)
          while (remaining > 0) {
            d.setDate(d.getDate() + 1)
            const day = d.getDay() // 0 Sun .. 6 Sat
            if (day !== 0 && day !== 6) remaining--
          }
          d.setHours(12, 0, 0, 0)
          return d
        }

        const toISODate = (d) => {
          const dd = new Date(d)
          dd.setHours(12, 0, 0, 0)
          return toISODateLocal(dd)
        }

        const tasks = Array.isArray(state.tasks) ? state.tasks : []

        const priorityRank = (p) => (p === 'high' ? 0 : p === 'medium' ? 1 : 2)
        const durationByPriority = (p) => (p === 'high' ? 3 : p === 'medium' ? 7 : 14)

        const projectDelayDays = (status) => {
          if (status === 'active') return 1
          if (status === 'ideas') return 14
          if (status === 'on_hold') return 30
          if (status === 'done' || status === 'cancelled') return 90
          return 14
        }

        const now = new Date()
        now.setHours(12, 0, 0, 0)

        // Map tasks by id for dependency lookups
        const taskById = new Map(tasks.filter(Boolean).map(t => [t.id, t]))

        // Group tasks without due dates by project
        const tasksByProject = new Map()
        for (const t of tasks) {
          if (!t) continue
          if (t.dueDate) continue
          const pid = t.projectId || 'unknown'
          if (!tasksByProject.has(pid)) tasksByProject.set(pid, [])
          tasksByProject.get(pid).push(t)
        }

        const statusByProjectId = new Map(migratedProjects.filter(Boolean).map(p => [p.id, p.status]))

        const plannedTasks = tasks.map((t) => {
          if (!t || t.dueDate) return t

          const projectStatus = statusByProjectId.get(t.projectId) || 'ideas'
          let start = addBusinessDays(now, projectDelayDays(projectStatus))

          // If other tasks in the same project were planned, push start after the latest planned start.
          const bucket = tasksByProject.get(t.projectId) || []
          // Find tasks already assigned in this pass
          const latestPlannedDue = bucket
            .filter(x => x && x.dueDate)
            .map(x => new Date(x.dueDate))
            .sort((a,b)=>b-a)[0]
          if (latestPlannedDue) start = addBusinessDays(latestPlannedDue, 1)

          // Respect dependencies: start after all blockers' due dates if any
          const blockers = Array.isArray(t.blockedBy) ? t.blockedBy : []
          let depDue = null
          for (const bid of blockers) {
            const bt = taskById.get(bid)
            const bd = bt?.dueDate ? new Date(bt.dueDate) : null
            if (bd && (!depDue || bd > depDue)) depDue = bd
          }
          if (depDue) start = addBusinessDays(depDue, 1)

          const duration = durationByPriority(t.priority)
          const due = addBusinessDays(start, duration)

          const updates = {
            startDate: t.startDate || toISODate(start),
            dueDate: toISODate(due),
          }

          const updated = { ...t, ...updates }

          // store back for subsequent dependency calculations
          taskById.set(updated.id, updated)

          // update bucket so later tasks in project are staggered
          const b = tasksByProject.get(updated.projectId)
          if (b) {
            const idx = b.findIndex(x => x && x.id === updated.id)
            if (idx >= 0) b[idx] = updated
          }

          return updated
        })

        // Sort only applies when assigning; ensure stable schedule by project+priority ordering for remaining gaps
        // (We don't reorder tasks array itself; just fill dates.)

        // Second pass: if still missing due dates (e.g., because tasksByProject didn't include completed), fill deterministically.
        const filledTasks = plannedTasks.map((t) => {
          if (!t || t.dueDate) return t
          const projectStatus = statusByProjectId.get(t.projectId) || 'ideas'
          const start = addBusinessDays(now, projectDelayDays(projectStatus) + priorityRank(t.priority) * 7)
          const due = addBusinessDays(start, durationByPriority(t.priority))
          return { ...t, startDate: t.startDate || toISODate(start), dueDate: toISODate(due) }
        })

        const existingRecipes = Array.isArray(state.recipes) ? state.recipes : []
        const seeded = (fromVersion < 4 && existingRecipes.length === 0) ? SEED_RECIPES : existingRecipes

        const migratedRecipes = (Array.isArray(seeded) ? seeded : [])
          .filter(Boolean)
          .map(r => normalizeRecipeShape(r, { generateId: false, createdAtFallback: r?.createdAt }))
          .filter(r => r && r.id)

        return {
          ...state,
          projects: migratedProjects,
          tasks: filledTasks,
          recipes: migratedRecipes,
        }
      },
    }
  )
)

// Helper function to calculate streak
function calculateStreak(habitId, habitLogs) {
  let currentStreak = 0
  let longestStreak = 0
  
  // Get all dates with logs for this habit, sorted descending
  const dates = Object.keys(habitLogs)
    .filter(key => key.startsWith(`${habitId}-`))
    .map(key => key.replace(`${habitId}-`, ''))
    .sort((a, b) => b.localeCompare(a)) // Descending: latest first
  
  // Create a map for quick lookup
  const statusMap = new Map()
  dates.forEach(date => {
    statusMap.set(date, habitLogs[`${habitId}-${date}`])
  })

  // Calculate current streak
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Check from today backwards
  for (let i = 0; i < 3650; i++) { // Check up to 10 years back
    const checkDate = new Date(today)
    checkDate.setDate(checkDate.getDate() - i)
    const dateStr = toISODateLocal(checkDate)
    const status = statusMap.get(dateStr)

    if (status === true || status === 'done') {
      currentStreak++
    } else if (status === 'skip') {
      // Skip preserves streak but doesn't add to it
      continue 
    } else if (i === 0 && !status) {
      // If today is not done/skipped, check yesterday
      continue
    } else {
      // Break on missing day (unless it's today and we just haven't done it yet)
      if (i > 0) break
    }
  }

  // Calculate longest streak
  let tempStreak = 0
  // Convert map to sorted array of [date, status]
  const sortedEntries = Array.from(statusMap.entries()).sort((a, b) => a[0].localeCompare(b[0])) // Ascending

  // Since we need to account for gaps, iterating through known log entries isn't enough if there are gaps.
  // But wait, gaps break the streak. So we only care about consecutive entries.
  // Actually, we need to iterate day by day to find gaps.
  
  if (sortedEntries.length > 0) {
    const firstDate = new Date(sortedEntries[0][0])
    const lastDate = new Date(sortedEntries[sortedEntries.length - 1][0])
    const diff = Math.floor((lastDate - firstDate) / (1000 * 60 * 60 * 24))
    
    for (let i = 0; i <= diff; i++) {
      const d = new Date(firstDate)
      d.setDate(d.getDate() + i)
      const dateStr = toISODateLocal(d)
      const status = statusMap.get(dateStr)
      
      if (status === true || status === 'done') {
        tempStreak++
      } else if (status === 'skip') {
        // Skip preserves streak
      } else {
        if (tempStreak > longestStreak) longestStreak = tempStreak
        tempStreak = 0
      }
    }
    if (tempStreak > longestStreak) longestStreak = tempStreak
  }
  
  return { current: currentStreak, longest: longestStreak }
}

export { APP_VERSION, ACCENT_COLORS, IDEA_CATEGORIES, DEFAULT_TAGS }

// Rainmeter widget auto-export
import { scheduleWidgetExport } from '../utils/widgetExporter'
useStore.subscribe((state, prevState) => {
  if (state.tasks !== prevState?.tasks) {
    scheduleWidgetExport(state.tasks, state.projects, state.activeProject)
  }
})

export default useStore
