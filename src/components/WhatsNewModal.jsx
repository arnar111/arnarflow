import React from 'react'
import useStore, { APP_VERSION } from '../store/useStore'
import { useTranslation } from '../i18n/useTranslation'
import { 
  X, 
  Sparkles, 
  Zap, 
  Settings, 
  Keyboard, 
  Download, 
  LayoutGrid,
  Search,
  BarChart3,
  Flame,
  Calendar,
  Bell,
  CheckSquare,
  ArrowRight,
  RefreshCw,
  Timer,
  GitBranch,
  Link,
  Smartphone,
  Palette
} from 'lucide-react'

const changelog = [
  {
    version: '5.0.0',
    date: 'February 2026',
    title: 'The Pro Update',
    features: [
      {
        icon: Palette,
        title: 'Linear-Style UI',
        titleIs: 'Linear-stíll viðmót',
        description: 'Complete redesign with Inter font, new dark palette, glassmorphism, and spring animations.',
        descriptionIs: 'Fullkomin endurnýjun með Inter letri, nýjum dökkum litum, glassmorphism og spring hreyfimyndum.'
      },
      {
        icon: Timer,
        title: 'Time Tracking',
        titleIs: 'Tímamæling',
        description: 'Track work sessions by project/task. Timer in sidebar, session history, weekly reports, CSV export.',
        descriptionIs: 'Fylgstu með vinnulotum eftir verkefnum. Tímamælir í hliðarstiku, lotusaga, vikuskýrslur, CSV útflutningur.'
      },
      {
        icon: Link,
        title: 'Task Dependencies',
        titleIs: 'Verkefnatengingar',
        description: 'Mark tasks as blocked by others. Visual indicators, auto-blocking prevents completion until deps done.',
        descriptionIs: 'Merktu verkefni sem blokkuð af öðrum. Sjónræn merki, sjálfvirk blokkun kemur í veg fyrir að ljúka þar til tengingar kláraðar.'
      },
      {
        icon: Bell,
        title: 'Notifications',
        titleIs: 'Tilkynningar',
        description: 'Due soon, overdue, streak at risk alerts. Quiet hours, notification preferences.',
        descriptionIs: 'Tilkynningar um skiladaga, seinkaðar, streak í hættu. Þagnartímar, tilkynningastillingar.'
      },
      {
        icon: GitBranch,
        title: 'Roadmap View',
        titleIs: 'Tímalína',
        description: 'Gantt-style timeline. Week/Month/Quarter zoom, today marker, color-coded by project.',
        descriptionIs: 'Gantt-stíls tímalína. Viku/Mánaðar/Ársfjórðungs aðdráttur, dagsetning dagsins, litamerkingar eftir verkefnum.'
      },
      {
        icon: Calendar,
        title: 'Calendar Sync',
        titleIs: 'Dagatal',
        description: 'Google Calendar OAuth ready, Apple Calendar iCal export. Two-way sync support.',
        descriptionIs: 'Google Calendar OAuth tilbúið, Apple Calendar iCal útflutningur. Tvíátta samstilling.'
      },
      {
        icon: Smartphone,
        title: 'Mobile Ready',
        titleIs: 'Snjallsíma tilbúið',
        description: 'Responsive breakpoints for tablet and mobile. Touch-optimized with 44px targets.',
        descriptionIs: 'Sveigjanleg stærð fyrir spjaldtölvur og síma. Snertivænt með 44px marksvæðum.'
      },
    ]
  },
  {
    version: '4.3.0',
    date: 'February 2026',
    title: 'The Journal Update',
    features: [
      {
        icon: CheckSquare,
        title: 'Glósur / Notes',
        description: 'Daily journal/notes feature. Write, edit, and search through your daily entries.'
      },
      {
        icon: BarChart3,
        title: 'Stats View',
        description: 'Full productivity dashboard with streak tracking, completion charts, and project progress.'
      },
      {
        icon: Calendar,
        title: 'Date Navigation',
        description: 'Easily navigate between days to view and edit notes from any date.'
      },
    ]
  },
  {
    version: '4.1.0',
    date: 'February 2026',
    title: 'The Deep Work Update',
    features: [
      {
        icon: Calendar,
        title: 'Weekly Review',
        description: 'See your week at a glance: tasks completed, habits tracked, focus time. Compare to last week.'
      },
      {
        icon: BarChart3,
        title: 'Focus History',
        description: 'New Focus view in sidebar. Track all your Pomodoro sessions, grouped by day with stats.'
      },
      {
        icon: CheckSquare,
        title: 'Task Subtasks',
        description: 'Break tasks into smaller steps with checklists. Progress bar shows completion.'
      },
    ]
  },
  {
    version: '4.0.0',
    date: 'February 2026',
    title: 'The Productivity Update',
    features: [
      {
        icon: Zap,
        title: 'Pomodoro Timer',
        description: 'Built-in focus timer with customizable work/break intervals. Circular progress, notifications, and session tracking.'
      },
      {
        icon: BarChart3,
        title: 'Daily Goals',
        description: 'Set and track daily goals for tasks, habits, and focus time. Beautiful progress rings on your dashboard.'
      },
      {
        icon: LayoutGrid,
        title: 'Task Tags',
        description: '17 color-coded tags to organize your tasks. Urgent, Bug, Feature, Design, and more.'
      },
      {
        icon: Search,
        title: 'Quick Capture',
        description: 'Floating capture bar for instant task/idea entry. Smart parsing: #project @today !high'
      },
    ]
  },
  {
    version: '2.2.0',
    date: 'January 2026',
    title: 'Plane-Inspired Polish',
    features: [
      {
        icon: Flame,
        title: 'Streak Tracking',
        description: 'HabitsView now shows streak counters with animated fire icons that intensify at 7, 14, 30+ days.'
      },
      {
        icon: BarChart3,
        title: 'Progress Rings',
        description: 'Circular progress indicators in habits and Kanban, inspired by Plane\'s UI components.'
      },
      {
        icon: LayoutGrid,
        title: 'Kanban Polish',
        description: 'Drag handles, drop indicators, card hover effects - smoother project management experience.'
      },
    ]
  },
  {
    version: '2.1.0',
    date: 'January 2026',
    title: 'Icelandic & Persistence',
    features: [
      {
        icon: Sparkles,
        title: 'Icelandic Translation',
        description: 'Full Icelandic (Íslenska) language support. Switch languages in Settings.'
      },
      {
        icon: Download,
        title: 'Data Persistence',
        description: 'All your projects, tasks, habits, and ideas are automatically saved to localStorage.'
      },
      {
        icon: Settings,
        title: 'Language Toggle',
        description: 'Quick language switcher in Settings modal - switch between Icelandic and English.'
      },
    ]
  },
  {
    version: '2.0.0',
    date: 'January 2026',
    title: 'Pro Task Cards & Layout Fix',
    features: [
      {
        icon: LayoutGrid,
        title: 'Redesigned Task Cards',
        description: 'Beautiful Linear/Notion-inspired cards with priority indicators, gradient headers, and smooth animations.'
      },
      {
        icon: Sparkles,
        title: 'Visual Polish',
        description: 'Glowing status dots, pill badges, better drag-and-drop feedback, and hover effects.'
      },
      {
        icon: RefreshCw,
        title: 'Layout Fix',
        description: 'Fixed window maximize issue - all views now properly resize and fill the window.'
      },
    ]
  },
  {
    version: '1.9.0',
    date: 'January 2026',
    title: 'Calendar & Timeline Update',
    features: [
      {
        icon: Calendar,
        title: 'Calendar View',
        description: 'View all your tasks by due date in a beautiful monthly calendar. Click any day to see tasks.'
      },
      {
        icon: Bell,
        title: 'Notification Support',
        description: 'Get desktop notifications for overdue tasks and reminders (enable in Settings).'
      },
      {
        icon: ArrowRight,
        title: 'Timeline Component',
        description: 'Tasks grouped by urgency: Overdue, Today, Tomorrow, This Week, and Later.'
      },
    ]
  },
  {
    version: '1.8.0',
    date: 'January 2026',
    title: 'Global Search Update',
    features: [
      {
        icon: Search,
        title: 'Global Search',
        description: 'Press Ctrl+P to search across all tasks, ideas, and commands in one place.'
      },
      {
        icon: CheckSquare,
        title: 'Quick Complete',
        description: 'Complete tasks directly from search results without navigating.'
      },
      {
        icon: Keyboard,
        title: 'Category Filters',
        description: 'Use Tab to switch between All, Commands, Tasks, and Ideas in search.'
      },
    ]
  },
  {
    version: '1.7.0',
    date: 'January 2026',
    title: 'Dashboard Upgrade',
    features: [
      {
        icon: BarChart3,
        title: 'Activity Chart',
        description: 'See your weekly productivity at a glance with the new activity bar chart.'
      },
      {
        icon: Flame,
        title: 'Productivity Streak',
        description: 'Track your consecutive days of completing tasks with the streak counter.'
      },
      {
        icon: Sparkles,
        title: 'Visual Refresh',
        description: 'Gradient stat cards, better animations, and improved visual hierarchy.'
      },
    ]
  },
  {
    version: '1.6.0',
    date: 'January 2026',
    title: 'Kanban Board Update',
    features: [
      {
        icon: LayoutGrid,
        title: 'Kanban Board',
        description: 'Organize tasks in columns: To Do → In Progress → Done. Drag and drop to move tasks.'
      },
      {
        icon: ArrowRight,
        title: 'View Toggle',
        description: 'Switch between Kanban and List views with one click.'
      },
      {
        icon: Sparkles,
        title: 'Glassmorphism Design',
        description: 'Beautiful card design with hover effects and smooth animations.'
      },
    ]
  },
  {
    version: '1.5.0',
    date: 'January 2026',
    title: 'Auto-Updates',
    features: [
      {
        icon: RefreshCw,
        title: 'Check for Updates',
        description: 'New Updates section in Settings. Check for and install updates with one click.'
      },
      {
        icon: Download,
        title: 'Auto-Download',
        description: 'Updates download automatically in the background and prompt you to restart.'
      },
    ]
  },
  {
    version: '1.4.0',
    date: 'January 2026',
    title: 'Project Tasks Seeding',
    features: [
      {
        icon: CheckSquare,
        title: '24 Pre-loaded Tasks',
        description: 'Tasks auto-generated from project code analysis for Eignamat, Takk Arena, Betri Þú, and more.'
      },
      {
        icon: Zap,
        title: 'Smart Analysis',
        description: 'AI analyzed your projects and created actionable tasks for each one.'
      },
    ]
  },
]

function WhatsNewModal() {
  const { t } = useTranslation()
  const { setWhatsNewOpen, markWhatsNewSeen } = useStore()

  const handleClose = () => {
    markWhatsNewSeen(APP_VERSION)
    setWhatsNewOpen(false)
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const latestRelease = changelog[0]

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-lg bg-dark-900 rounded-2xl border border-dark-500 shadow-2xl shadow-black/50 overflow-hidden animate-fade-in-scale">
        {/* Header */}
        <div className="relative px-6 py-6 border-b border-dark-600 bg-gradient-to-br from-accent/20 via-purple-500/10 to-transparent">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <X size={18} className="text-zinc-400" />
          </button>
          
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center shadow-lg">
              <Sparkles size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{t('whatsNew.title')}</h2>
              <p className="text-xs text-zinc-500">ArnarFlow v{APP_VERSION}</p>
            </div>
          </div>
          <p className="text-sm text-zinc-400">{latestRelease.title}</p>
        </div>

        {/* Features */}
        <div className="p-5 max-h-[50vh] overflow-y-auto">
          {/* Latest release features */}
          <ul className="space-y-4 mb-6">
            {latestRelease.features.map((feature, index) => (
              <li key={index} className="flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon size={18} className="text-accent" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{feature.title}</h3>
                  <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{feature.description}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Previous releases */}
          <details className="group">
            <summary className="cursor-pointer text-xs text-zinc-500 hover:text-zinc-400 transition-colors flex items-center gap-1 mb-3">
              <ArrowRight size={12} className="group-open:rotate-90 transition-transform" />
              {t('whatsNew.previousUpdates')}
            </summary>
            
            <div className="space-y-4 pl-2 border-l border-dark-600">
              {changelog.slice(1).map((release, i) => (
                <div key={i} className="pl-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono text-accent">v{release.version}</span>
                    <span className="text-2xs text-zinc-600">{release.date}</span>
                  </div>
                  <p className="text-xs text-zinc-500 font-medium mb-1">{release.title}</p>
                  <ul className="space-y-1">
                    {release.features.slice(0, 2).map((f, j) => (
                      <li key={j} className="text-2xs text-zinc-600 flex items-center gap-1">
                        <f.icon size={10} />
                        {f.title}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </details>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-dark-600 flex items-center justify-between bg-dark-800/30">
          <p className="text-2xs text-zinc-600">
            {t('whatsNew.builtWith')}
          </p>
          <button
            onClick={handleClose}
            className="px-5 py-2 bg-gradient-to-r from-accent to-purple-500 hover:opacity-90 rounded-xl text-sm font-semibold transition-all shadow-lg"
          >
            {t('whatsNew.letsGo')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default WhatsNewModal
