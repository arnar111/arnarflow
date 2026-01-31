import React from 'react'
import useStore from '../store/useStore'
import { X, Sparkles, Zap, Settings, Keyboard, Download, Info, Palette } from 'lucide-react'

const APP_VERSION = '1.3.0'

const changelog = [
  {
    version: '1.3.0',
    date: 'January 2025',
    title: 'Settings & Polish Update',
    features: [
      {
        icon: Settings,
        title: 'Settings Panel',
        description: 'New settings modal with theme options, accent colors, and notification preferences.'
      },
      {
        icon: Keyboard,
        title: 'Keyboard Shortcuts Help',
        description: 'Press ? anytime to see all available keyboard shortcuts.'
      },
      {
        icon: Download,
        title: 'Export & Import Data',
        description: 'Back up your data or transfer it to another device easily.'
      },
      {
        icon: Palette,
        title: 'Theme Customization',
        description: 'Choose from dark, light, or system theme with multiple accent colors.'
      },
      {
        icon: Info,
        title: 'About Section',
        description: 'View app version and information in the new About modal.'
      },
      {
        icon: Sparkles,
        title: 'UI Improvements',
        description: 'Enhanced animations, smoother transitions, and polished interface.'
      },
    ]
  },
  {
    version: '1.2.0',
    date: 'January 2025',
    title: 'Focus & Habits',
    features: [
      {
        icon: Zap,
        title: 'Focus Mode',
        description: 'Track time spent on tasks with the focus timer.'
      },
    ]
  },
]

function WhatsNewModal() {
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
      <div className="w-full max-w-lg bg-dark-900 rounded-xl border border-dark-500 shadow-2xl shadow-black/50 overflow-hidden animate-fade-in-scale">
        {/* Header */}
        <div className="relative px-5 py-6 border-b border-dark-600 bg-gradient-to-br from-accent/10 to-transparent">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <X size={18} className="text-zinc-400" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <Sparkles size={20} className="text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">What's New</h2>
              <p className="text-xs text-zinc-500">ArnarFlow v{latestRelease.version}</p>
            </div>
          </div>
          <p className="text-sm text-zinc-400 mt-2">{latestRelease.title}</p>
        </div>

        {/* Features */}
        <div className="p-5 max-h-[50vh] overflow-y-auto">
          <ul className="space-y-4 stagger-children">
            {latestRelease.features.map((feature, index) => (
              <li key={index} className="flex gap-3">
                <div 
                  className="w-8 h-8 rounded-lg bg-dark-800 flex items-center justify-center flex-shrink-0"
                >
                  <feature.icon size={16} className="text-accent" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">{feature.title}</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">{feature.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-dark-600 flex justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-accent hover:bg-accent/90 rounded-lg text-sm font-medium transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  )
}

export { APP_VERSION }
export default WhatsNewModal
