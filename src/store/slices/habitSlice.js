// Habits slice - habits, logs, streaks

const HABITS = [
  { id: 'exercise', name: 'Exercise', nameIs: 'Hreyfing', icon: 'Dumbbell', target: 'Move for 15 min (gentle on back)', targetIs: 'Hreyfa sig í 15 mín (varlega á bakið)' },
  { id: 'clean', name: 'Clean', nameIs: 'Þrifa', icon: 'Sparkles', target: 'Tidy one area', targetIs: 'Þrífa eitt svæði' },
  { id: 'cook', name: 'Cook', nameIs: 'Elda', icon: 'ChefHat', target: 'Make a healthy meal', targetIs: 'Elda hollt mat' },
  { id: 'cocopuffs', name: 'Coco Puffs', nameIs: 'Coco Puffs', icon: 'Cat', target: 'Quality time with kitty', targetIs: 'Gæðatími með kettinum' },
]

export { HABITS }

// Helper function to calculate streak
function calculateStreak(habitId, habitLogs) {
  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0

  const dates = Object.keys(habitLogs)
    .filter(key => key.startsWith(`${habitId}-`) && habitLogs[key])
    .map(key => key.replace(`${habitId}-`, ''))
    .sort()
    .reverse()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today)
    checkDate.setDate(checkDate.getDate() - i)
    const dateStr = checkDate.toISOString().split('T')[0]
    if (habitLogs[`${habitId}-${dateStr}`]) {
      currentStreak++
    } else {
      break
    }
  }

  for (const dateStr of dates) {
    const prevDate = new Date(dateStr)
    prevDate.setDate(prevDate.getDate() - 1)
    const prevDateStr = prevDate.toISOString().split('T')[0]
    if (habitLogs[`${habitId}-${prevDateStr}`]) {
      tempStreak++
    } else {
      if (tempStreak > longestStreak) longestStreak = tempStreak
      tempStreak = 1
    }
  }
  if (tempStreak > longestStreak) longestStreak = tempStreak
  if (currentStreak > longestStreak) longestStreak = currentStreak

  return { current: currentStreak, longest: longestStreak }
}

export { calculateStreak }

export const createHabitSlice = (set, get) => ({
  habits: HABITS,
  habitLogs: {},
  habitStreaks: {},

  toggleHabit: (habitId, date) => set((state) => {
    const key = `${habitId}-${date}`
    const newLogs = { ...state.habitLogs }
    newLogs[key] = !newLogs[key]
    const newStreaks = { ...state.habitStreaks }
    newStreaks[habitId] = calculateStreak(habitId, newLogs)
    return { habitLogs: newLogs, habitStreaks: newStreaks }
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
})
