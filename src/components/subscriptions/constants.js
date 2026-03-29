import {
  Phone, Tv, Shield, Dumbbell, Play, Code,
  Newspaper, Zap, CreditCard, Music, Gamepad2
} from 'lucide-react'

export const CATEGORIES = {
  telecom:       { is: 'Fjarskipti',    en: 'Telecom',       icon: Phone,       color: '#3B82F6', bg: 'bg-blue-500/10',    text: 'text-blue-400' },
  streaming:     { is: 'Streymi',       en: 'Streaming',     icon: Play,        color: '#EF4444', bg: 'bg-red-500/10',     text: 'text-red-400' },
  entertainment: { is: 'Afþreying',     en: 'Entertainment', icon: Gamepad2,    color: '#8B5CF6', bg: 'bg-violet-500/10',  text: 'text-violet-400' },
  insurance:     { is: 'Tryggingar',    en: 'Insurance',     icon: Shield,      color: '#10B981', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  fitness:       { is: 'Líkamsrækt',    en: 'Fitness',       icon: Dumbbell,    color: '#F59E0B', bg: 'bg-amber-500/10',   text: 'text-amber-400' },
  software:      { is: 'Hugbúnaður',    en: 'Software/AI',   icon: Code,        color: '#6366F1', bg: 'bg-indigo-500/10',  text: 'text-indigo-400' },
  music:         { is: 'Tónlist',       en: 'Music',         icon: Music,       color: '#EC4899', bg: 'bg-pink-500/10',    text: 'text-pink-400' },
  news:          { is: 'Fréttir',       en: 'News/Media',    icon: Newspaper,   color: '#F97316', bg: 'bg-orange-500/10',  text: 'text-orange-400' },
  utilities:     { is: 'Veitur',        en: 'Utilities',     icon: Zap,         color: '#14B8A6', bg: 'bg-teal-500/10',    text: 'text-teal-400' },
  other:         { is: 'Annað',         en: 'Other',         icon: CreditCard,  color: '#6B7280', bg: 'bg-gray-500/10',    text: 'text-gray-400' },
}

export const KNOWN_SUBSCRIPTIONS = [
  // Telecom
  { pattern: /síminn/i,             name: 'Síminn',          category: 'telecom',       defaultAmount: 4990 },
  { pattern: /sýn\b/i,             name: 'Sýn',             category: 'telecom',       defaultAmount: 2299 },
  { pattern: /nova/i,              name: 'Nova',             category: 'telecom',       defaultAmount: 4990 },
  { pattern: /vodafone/i,          name: 'Vodafone',         category: 'telecom',       defaultAmount: 4990 },
  { pattern: /hringdu/i,           name: 'Hringdu',          category: 'telecom',       defaultAmount: 2990 },
  // Streaming
  { pattern: /netflix/i,           name: 'Netflix',          category: 'streaming',     defaultAmount: 1990 },
  { pattern: /spotify/i,           name: 'Spotify',          category: 'streaming',     defaultAmount: 1490 },
  { pattern: /disney/i,            name: 'Disney+',          category: 'streaming',     defaultAmount: 1290 },
  { pattern: /hbo|^max$/i,         name: 'Max (HBO)',        category: 'streaming',     defaultAmount: 1490 },
  { pattern: /viaplay/i,           name: 'Viaplay',          category: 'streaming',     defaultAmount: 1590 },
  { pattern: /youtube.*premium/i,  name: 'YouTube Premium',  category: 'streaming',     defaultAmount: 1790 },
  { pattern: /amazon.*prime/i,     name: 'Amazon Prime',     category: 'streaming',     defaultAmount: 1832 },
  { pattern: /prime.*video/i,      name: 'Prime Video',      category: 'streaming',     defaultAmount: 1969 },
  // Insurance
  { pattern: /vörður/i,            name: 'Vörður',           category: 'insurance',     defaultAmount: 3960 },
  { pattern: /sjóvá/i,             name: 'Sjóvá',            category: 'insurance',     defaultAmount: 5000 },
  { pattern: /\bvís\b|\bvis\b/i,   name: 'VÍS',             category: 'insurance',     defaultAmount: 4500 },
  { pattern: /tryggingamiðstöðin/i, name: 'Tryggingamiðstöðin', category: 'insurance',  defaultAmount: 4000 },
  // Fitness
  { pattern: /sporthöllin/i,       name: 'Sporthöllin',      category: 'fitness',       defaultAmount: 10600 },
  { pattern: /world class/i,       name: 'World Class',      category: 'fitness',       defaultAmount: 9900 },
  { pattern: /líkn/i,              name: 'Líkn',             category: 'fitness',       defaultAmount: 3990 },
  // Software / AI
  { pattern: /chatgpt|openai/i,    name: 'ChatGPT Plus',     category: 'software',      defaultAmount: 3500 },
  { pattern: /claude|anthropic/i,  name: 'Claude Pro',       category: 'software',      defaultAmount: 3500 },
  { pattern: /cursor/i,            name: 'Cursor',           category: 'software',      defaultAmount: 3500 },
  { pattern: /github.*copilot/i,   name: 'GitHub Copilot',   category: 'software',      defaultAmount: 1800 },
  { pattern: /notion/i,            name: 'Notion',           category: 'software',      defaultAmount: 1500 },
  // Music
  { pattern: /tidal/i,             name: 'Tidal',            category: 'music',         defaultAmount: 1690 },
  { pattern: /apple.*music/i,      name: 'Apple Music',      category: 'music',         defaultAmount: 1490 },
  // News
  { pattern: /mbl\.is/i,           name: 'mbl.is',           category: 'news',          defaultAmount: 1990 },
  { pattern: /visir/i,             name: 'Vísir',            category: 'news',          defaultAmount: 1490 },
  { pattern: /stundin/i,           name: 'Stundin',          category: 'news',          defaultAmount: 1990 },
  // Utilities
  { pattern: /orkuveita/i,         name: 'Orkuveitan',       category: 'utilities',     defaultAmount: 8000 },
  { pattern: /veitur/i,            name: 'Veitur',           category: 'utilities',     defaultAmount: 6000 },
]

// Interval detection helpers
export const isMonthlyInterval = (days) => days >= 25 && days <= 35
export const isYearlyInterval = (days) => days >= 350 && days <= 380

// Billing cycle options
export const BILLING_CYCLES = [
  { value: 'monthly', is: 'Mánaðarlega', en: 'Monthly' },
  { value: 'yearly', is: 'Árlega', en: 'Yearly' },
  { value: 'weekly', is: 'Vikulega', en: 'Weekly' },
  { value: 'quarterly', is: 'Ársfjórðungslega', en: 'Quarterly' },
]
