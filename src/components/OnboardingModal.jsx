import React, { useState } from 'react'
import useStore from '../store/useStore'
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle,
  LayoutDashboard,
  ListTodo,
  Target,
  Timer,
  Sparkles,
  Keyboard,
  ArrowRight
} from 'lucide-react'

const steps = [
  {
    id: 'welcome',
    icon: Sparkles,
    title: 'Velkomin í ArnarFlow!',
    titleEn: 'Welcome to ArnarFlow!',
    description: 'Þetta er persónulega framleiðni appið þitt. Við leiðum þig í gegnum helstu eiginleikana.',
    descriptionEn: 'This is your personal productivity app. Let us show you around.',
    image: '🎯'
  },
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    title: 'Yfirlitið þitt',
    titleEn: 'Your Dashboard',
    description: 'Sjáðu allt á einum stað: verkefni dagsins, venjur, og framvindu. Þetta er heimaskjárinn þinn.',
    descriptionEn: 'See everything in one place: today\'s tasks, habits, and progress. This is your home screen.',
    image: '📊'
  },
  {
    id: 'tasks',
    icon: ListTodo,
    title: 'Verkefni og Projects',
    titleEn: 'Tasks and Projects',
    description: 'Búðu til verkefni og skipulagðu þau í projects. Notaðu ⌘+N til að bæta við fljótt.',
    descriptionEn: 'Create tasks and organize them into projects. Use ⌘+N to add quickly.',
    image: '✅'
  },
  {
    id: 'habits',
    icon: Target,
    title: 'Venjur',
    titleEn: 'Habits',
    description: 'Fylgstu með daglegum venjum og byggðu upp streaks. Smelltu á venju til að merkja hana lokna.',
    descriptionEn: 'Track daily habits and build streaks. Click a habit to mark it done.',
    image: '🔥'
  },
  {
    id: 'pomodoro',
    icon: Timer,
    title: 'Pomodoro Timer',
    titleEn: 'Pomodoro Timer',
    description: 'Notaðu Pomodoro tækni til að einbeita þér. 25 mín vinnu, 5 mín hvíld. Fáðu tilkynningu þegar tími rennur út.',
    descriptionEn: 'Use Pomodoro technique to focus. 25 min work, 5 min break. Get notified when time is up.',
    image: '🍅'
  },
  {
    id: 'shortcuts',
    icon: Keyboard,
    title: 'Flýtilyklar',
    titleEn: 'Keyboard Shortcuts',
    description: 'Vertu fljótari með flýtilyklum:\n⌘+N = Nýtt verkefni\n⌘+K = Command Palette\n⌘+, = Stillingar\n? = Flýtilyklahjálp',
    descriptionEn: 'Be faster with shortcuts:\n⌘+N = New task\n⌘+K = Command Palette\n⌘+, = Settings\n? = Shortcut help',
    image: '⚡'
  },
  {
    id: 'done',
    icon: CheckCircle,
    title: 'Þú ert tilbúin/n!',
    titleEn: 'You\'re all set!',
    description: 'Byrjaðu að nota ArnarFlow og náðu markmiðunum þínum. Gangi þér vel!',
    descriptionEn: 'Start using ArnarFlow and achieve your goals. Good luck!',
    image: '🚀'
  }
]

export default function OnboardingModal() {
  const [currentStep, setCurrentStep] = useState(0)
  const { language, setOnboardingComplete, setOnboardingOpen } = useStore()
  const accentColor = useStore(state => state.accentColor)
  
  const step = steps[currentStep]
  const isFirst = currentStep === 0
  const isLast = currentStep === steps.length - 1
  
  const handleNext = () => {
    if (isLast) {
      setOnboardingComplete(true)
      setOnboardingOpen(false)
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }
  
  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStep(prev => prev - 1)
    }
  }
  
  const handleSkip = () => {
    setOnboardingComplete(true)
    setOnboardingOpen(false)
  }

  return (
    <div className="modal-overlay" onClick={handleSkip}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        {/* Skip button */}
        <button onClick={handleSkip} className="skip-btn">
          Sleppa
        </button>

        {/* Progress dots */}
        <div className="progress-dots">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`dot ${i === currentStep ? 'active' : ''} ${i < currentStep ? 'completed' : ''}`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="content">
          <div className="icon-wrapper">
            <span className="icon-emoji">{step.image}</span>
          </div>
          
          <h2>{language === 'is' ? step.title : step.titleEn}</h2>
          
          <p className="description">
            {(language === 'is' ? step.description : step.descriptionEn).split('\n').map((line, i) => (
              <span key={i}>{line}<br/></span>
            ))}
          </p>
        </div>

        {/* Navigation */}
        <div className="navigation">
          <button 
            onClick={handlePrev} 
            className="nav-btn prev"
            disabled={isFirst}
          >
            <ChevronLeft size={20} />
            Til baka
          </button>
          
          <button onClick={handleNext} className="nav-btn next">
            {isLast ? (
              <>
                Byrja
                <CheckCircle size={18} />
              </>
            ) : (
              <>
                Áfram
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.2s ease;
          }

          .modal {
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            padding: 40px;
            width: 90%;
            max-width: 480px;
            position: relative;
            animation: slideUp 0.3s ease;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes slideUp {
            from { 
              opacity: 0;
              transform: translateY(20px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }

          .skip-btn {
            position: absolute;
            top: 16px;
            right: 16px;
            padding: 6px 12px;
            background: none;
            border: none;
            color: var(--text-secondary);
            font-size: 13px;
            cursor: pointer;
            border-radius: 6px;
            transition: all 0.2s;
          }

          .skip-btn:hover {
            background: var(--bg-secondary);
            color: var(--text-primary);
          }

          .progress-dots {
            display: flex;
            justify-content: center;
            gap: 8px;
            margin-bottom: 32px;
          }

          .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--bg-tertiary);
            transition: all 0.3s ease;
          }

          .dot.active {
            width: 24px;
            border-radius: 4px;
            background: var(--accent-${accentColor});
          }

          .dot.completed {
            background: var(--accent-${accentColor});
            opacity: 0.5;
          }

          .content {
            text-align: center;
            margin-bottom: 32px;
          }

          .icon-wrapper {
            width: 100px;
            height: 100px;
            margin: 0 auto 24px;
            border-radius: 24px;
            background: var(--bg-secondary);
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .icon-emoji {
            font-size: 48px;
          }

          h2 {
            font-size: 24px;
            margin: 0 0 16px 0;
          }

          .description {
            color: var(--text-secondary);
            font-size: 15px;
            line-height: 1.6;
            margin: 0;
          }

          .navigation {
            display: flex;
            gap: 12px;
          }

          .nav-btn {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 14px;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          }

          .nav-btn.prev {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            color: var(--text-primary);
          }

          .nav-btn.prev:hover:not(:disabled) {
            background: var(--bg-tertiary);
          }

          .nav-btn.prev:disabled {
            opacity: 0.3;
            cursor: not-allowed;
          }

          .nav-btn.next {
            background: var(--accent-${accentColor});
            border: none;
            color: white;
          }

          .nav-btn.next:hover {
            opacity: 0.9;
          }
        `}</style>
      </div>
    </div>
  )
}
