import React, { useState } from 'react'
import useStore from '../store/useStore'
import { 
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  LayoutDashboard,
  ListTodo,
  Clock,
  Sparkles,
  Keyboard,
  Palette,
  Languages,
  Database
} from 'lucide-react'
import { useTranslation } from '../i18n/useTranslation'

export default function OnboardingModal() {
  const { t, language } = useTranslation()
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedLanguage, setSelectedLanguage] = useState(language || 'is')
  const [selectedTheme, setSelectedTheme] = useState(useStore.getState().theme || 'dark')
  const [selectedAccent, setSelectedAccent] = useState(useStore.getState().accentColor || 'indigo')
  const [seedSamples, setSeedSamples] = useState(true)
  const [enableNotifications, setEnableNotifications] = useState(useStore.getState().notificationsEnabled)

  const setLanguage = useStore(state => state.setLanguage)
  const setTheme = useStore(state => state.setTheme)
  const setAccentColor = useStore(state => state.setAccentColor)
  const seedProjectTasks = useStore(state => state.seedProjectTasks)
  const recalculateAllStreaks = useStore(state => state.recalculateAllStreaks)
  const setOnboardingComplete = useStore(state => state.setOnboardingComplete)
  const setOnboardingOpen = useStore(state => state.setOnboardingOpen)
  const setNotificationsEnabled = useStore(state => state.setNotificationsEnabled)
  const accentColor = useStore(state => state.accentColor)

  const steps = [
    { id: 'welcome', title: language === 'is' ? 'Velkomin í ArnarFlow!' : 'Welcome to ArnarFlow!', description: language === 'is' ? 'Þetta er persónulega framleiðni appið þitt. Við leiðum þig í gegnum helstu eiginleikana.' : 'This is your personal productivity app. We will guide you through the main features.' , icon: Sparkles },
    { id: 'language', title: language === 'is' ? 'Veldu Tungumál' : 'Choose Language', description: language === 'is' ? 'Veldu íslensku eða ensku fyrir UI-ið.' : 'Pick Icelandic or English for the UI.', icon: Languages },
    { id: 'appearance', title: language === 'is' ? 'Útlit & Þema' : 'Appearance & Theme', description: language === 'is' ? 'Veldu dökkt þema og áherslulit til að passa stílnum þínum.' : 'Choose dark theme and an accent color to match your style.', icon: Palette },
    { id: 'samples', title: language === 'is' ? 'Sýnisverkefni' : 'Sample Projects', description: language === 'is' ? 'Sæktu sýnisverkefni og verkefni til að koma þér af stað (valfrjálst).' : 'Seed sample projects and tasks to get started quickly (optional).', icon: Database },
    { id: 'shortcuts', title: language === 'is' ? 'Flýtilyklar & Staðsetning' : 'Shortcuts & Where to Find Things', description: language === 'is' ? 'Notaðu flýtilykla til að bæta við og flakka. Verkefni eru undir "Projects" og tímalínan undir "Roadmap".' : 'Use shortcuts to add and navigate. Projects live in "Projects" (Kanban) and the Timeline is "Roadmap".', icon: ListTodo },
    { id: 'done', title: language === 'is' ? 'Allt tilbúið!' : "You're all set!", description: language === 'is' ? 'Byrjaðu að nota ArnarFlow. Opnaðu stillingar seinna til að keyra uppsetningarleiðbeininguna aftur.' : 'Start using ArnarFlow. You can reopen the onboarding from Settings anytime.', icon: CheckCircle }
  ]

  const step = steps[currentStep]
  const isFirst = currentStep === 0
  const isLast = currentStep === steps.length - 1

  const goNext = () => {
    if (currentStep === 1) {
      // language step: apply selection immediately for live preview
      setLanguage(selectedLanguage)
    }

    if (currentStep === 2) {
      setTheme(selectedTheme)
      setAccentColor(selectedAccent)
    }

    if (currentStep === 3) {
      // preferences step: notifications
      setNotificationsEnabled(enableNotifications)
    }

    if (isLast) {
      // finalize
      if (seedSamples) {
        seedProjectTasks()
        // ensure streaks are calculated
        recalculateAllStreaks()
      }
      setOnboardingComplete(true)
      setOnboardingOpen(false)
      return
    }
    setCurrentStep(s => s + 1)
  }

  const goPrev = () => {
    if (!isFirst) setCurrentStep(s => s - 1)
  }

  const handleSkip = () => {
    setOnboardingComplete(true)
    setOnboardingOpen(false)
  }

  const renderStepContent = () => {
    switch (step.id) {
      case 'welcome':
        return (
          <div className="text-center space-y-3">
            <div className="badge-graphic">🎯</div>
            <h3 className="text-lg font-semibold">{step.title}</h3>
            <p className="text-zinc-400">{step.description}</p>
          </div>
        )

      case 'language':
        return (
          <div className="space-y-3">
            <p className="text-zinc-400">{step.description}</p>
            <div className="flex gap-2 mt-3">
              <button onClick={() => setSelectedLanguage('is')} className={`flex-1 py-3 rounded-lg border ${selectedLanguage==='is'?'border-accent bg-accent/6':''}`}>🇮🇸 Íslenksa</button>
              <button onClick={() => setSelectedLanguage('en')} className={`flex-1 py-3 rounded-lg border ${selectedLanguage==='en'?'border-accent bg-accent/6':''}`}>🇬🇧 English</button>
            </div>
          </div>
        )

      case 'appearance':
        return (
          <div className="space-y-3">
            <p className="text-zinc-400">{step.description}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button onClick={() => setSelectedTheme('dark')} className={`py-3 rounded-lg border ${selectedTheme==='dark'?'border-accent bg-accent/6':''}`}>{language==='is'?'Dökkt':'Dark'}</button>
              <button onClick={() => setSelectedTheme('light')} className={`py-3 rounded-lg border ${selectedTheme==='light'?'border-accent bg-accent/6':''}`}>{language==='is'?'Ljóst':'Light'}</button>
            </div>

            <div className="mt-4">
              <label className="text-sm text-zinc-400">{language==='is'?'Áherslulitur':'Accent color'}</label>
              <div className="flex gap-2 mt-2">
                {['blue','purple','indigo','cyan','green','orange','pink'].map(c => (
                  <button key={c} onClick={() => setSelectedAccent(c)} className={`w-10 h-10 rounded-lg ring-offset-2 ${selectedAccent===c? 'ring-2 ring-offset-dark-900':''}`} style={{backgroundColor: {blue:'#3b82f6', purple:'#a855f7', indigo:'#6366f1', cyan:'#06b6d4', green:'#22c55e', orange:'#f97316', pink:'#ec4899'}[c]}} />
                ))}
              </div>
            </div>
          </div>
        )

      case 'samples':
        return (
          <div className="space-y-3">
            <p className="text-zinc-400">{step.description}</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div>
                <div className="font-medium">{language==='is'?'Sæktu sýnisverkefni':'Seed sample projects'}</div>
                <div className="text-sm text-zinc-500">{language==='is'?'Bæta við nokkrum verkefnum og verkefna punktum til að prófa appið.':'Add a few projects and tasks to try the app.'}</div>
              </div>
              <div>
                <button onClick={() => setSeedSamples(s => !s)} className={`w-16 h-8 rounded-full ${seedSamples? 'bg-accent':'bg-dark-700'}`}>
                  <div className={`w-6 h-6 bg-white rounded-full m-0.5 transition-transform ${seedSamples? 'translate-x-8':''}`} />
                </button>
              </div>
            </div>

            <div className="mt-2 text-sm text-zinc-500">{language==='is'?'Þú getur líka bætt við eigin verkefnum síðar.':'You can add your own projects later as well.'}</div>
          </div>
        )

      case 'shortcuts':
        return (
          <div className="space-y-3">
            <p className="text-zinc-400">{step.description}</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-dark-800 border border-dark-600">
                <div className="text-sm text-zinc-300 font-medium">⌘+N</div>
                <div className="text-xs text-zinc-500">{language==='is'?'Nýtt verkefni':'New task'}</div>
              </div>
              <div className="p-3 rounded-lg bg-dark-800 border border-dark-600">
                <div className="text-sm text-zinc-300 font-medium">⌘+K</div>
                <div className="text-xs text-zinc-500">{language==='is'?'Leita / Command Palette':'Search / Command Palette'}</div>
              </div>
              <div className="p-3 rounded-lg bg-dark-800 border border-dark-600">
                <div className="text-sm text-zinc-300 font-medium">⌘+,</div>
                <div className="text-xs text-zinc-500">{language==='is'?'Opna stillingar':'Open settings'}</div>
              </div>
              <div className="p-3 rounded-lg bg-dark-800 border border-dark-600">
                <div className="text-sm text-zinc-300 font-medium">?</div>
                <div className="text-xs text-zinc-500">{language==='is'?'Flýtilyklahjálp':'Shortcut help'}</div>
              </div>
            </div>
            <div className="mt-3 text-sm text-zinc-400">{language==='is'?'Verkefni: Sidebar → Projects. Tímalína: Sidebar → Roadmap.':'Projects: Sidebar → Projects. Timeline: Sidebar → Roadmap.'}</div>
          </div>
        )

      case 'done':
        return (
          <div className="text-center space-y-3">
            <div className="badge-graphic">🚀</div>
            <h3 className="text-lg font-semibold">{step.title}</h3>
            <p className="text-zinc-400">{step.description}</p>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={handleSkip}>
      <div className="w-full max-w-2xl mx-4 bg-gradient-to-br from-dark-900/90 via-dark-800/80 to-[rgba(70,48,125,0.6)] border border-dark-700 rounded-2xl p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-accent/40 to-[var(--accent-glow)] flex items-center justify-center text-2xl">{step.icon && <step.icon size={20} className="text-white" />}</div>
              <div>
                <h2 className="text-xl font-semibold">{step.title}</h2>
                <div className="text-xs text-zinc-400">{`${currentStep+1}/${steps.length}`}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleSkip} className="text-sm text-zinc-400 hover:text-zinc-200">{language==='is'?'Sleppa':'Skip'}</button>
            <button onClick={() => { setOnboardingOpen(false); setOnboardingComplete(true) }} className="p-2 rounded-lg hover:bg-dark-800"><X size={16} className="text-zinc-400" /></button>
          </div>
        </div>

        <div className="mt-6">
          {renderStepContent()}
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {Array.from({length: steps.length}).map((_, i) => (
              <div key={i} className={`h-2 rounded-full ${i===currentStep? 'w-8 bg-accent':'w-3 bg-dark-700'}`} />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={goPrev} disabled={isFirst} className="px-4 py-2 rounded-lg bg-dark-800 text-sm text-zinc-300 disabled:opacity-50">{language==='is'?'Til baka':'Back'}</button>
            <button onClick={goNext} className="px-4 py-2 rounded-lg bg-accent text-sm text-white flex items-center gap-2">{isLast ? (language==='is'?'Byrja':'Get started') : (language==='is'?'Áfram':'Next')} {isLast ? <CheckCircle size={16} /> : <ChevronRight size={16} />}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
