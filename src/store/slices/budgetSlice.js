// Budget saver slice

export const createBudgetSlice = (set, get) => ({
  budgetGoal: 300000,
  budgetWeeklyTarget: 10000,
  budgetSaved: 0,
  setBudgetGoal: (n) => set({ budgetGoal: Number(n || 0) }),
  setBudgetWeeklyTarget: (n) => set({ budgetWeeklyTarget: Number(n || 0) }),
  addBudgetSaved: (delta) => set((state) => ({ budgetSaved: (state.budgetSaved || 0) + Number(delta || 0) })),
  resetBudgetSaved: () => set({ budgetSaved: 0 }),

  budgetReceipts: [],
  budgetTransactions: [],
  importBudgetSync: (payload) => set((state) => {
    const receipts = Array.isArray(payload?.receipts) ? payload.receipts : []
    const transactions = Array.isArray(payload?.transactions) ? payload.transactions : []
    const existingReceiptIds = new Set((state.budgetReceipts || []).map(r => r.id))
    const existingTxIds = new Set((state.budgetTransactions || []).map(t => t.id))
    return {
      budgetReceipts: [...(state.budgetReceipts || []), ...receipts.filter(r => r && r.id && !existingReceiptIds.has(r.id))],
      budgetTransactions: [...(state.budgetTransactions || []), ...transactions.filter(t => t && t.id && !existingTxIds.has(t.id))]
    }
  }),
  resetBudgetData: () => set({ budgetReceipts: [], budgetTransactions: [] }),
})
