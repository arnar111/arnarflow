import React, { useState, useEffect, useRef } from 'react'
import useStore from '../store/useStore'
import { useTranslation } from '../i18n/useTranslation'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Coffee, 
  Brain,
  Zap,
  Volume2,
  VolumeX,
  Check,
  X
} from 'lucide-react'

const PRESETS = {
  pomodoro: { work: 25, break: 5, longBreak: 15, sessionsBeforeLong: 4 },
  short: { work: 15, break: 3, longBreak: 10, sessionsBeforeLong: 4 },
  long: { work: 50, break: 10, longBreak: 30, sessionsBeforeLong: 2 },
  custom: { work: 25, break: 5, longBreak: 15, sessionsBeforeLong: 4 }
}

function PomodoroTimer({ onClose }) {
  const { t, language } = useTranslation()
  const { 
    focusProject, 
    focusTask, 
    projects, 
    tasks,
    pomodoroSettings,
    setPomodoroSettings,
    pomodoroStats,
    addPomodoroSession,
    endFocus
  } = useStore()

  const [mode, setMode] = useState('work') // work, break, longBreak
  const [timeLeft, setTimeLeft] = useState(PRESETS.pomodoro.work * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [selectedPreset, setSelectedPreset] = useState('pomodoro')
  const [customSettings, setCustomSettings] = useState(PRESETS.pomodoro)
  
  const audioRef = useRef(null)
  const intervalRef = useRef(null)

  const project = focusProject ? projects.find(p => p.id === focusProject) : null
  const task = focusTask ? tasks.find(t => t.id === focusTask) : null

  const settings = selectedPreset === 'custom' ? customSettings : PRESETS[selectedPreset]

  // Initialize timer based on mode
  useEffect(() => {
    const durations = {
      work: settings.work * 60,
      break: settings.break * 60,
      longBreak: settings.longBreak * 60
    }
    setTimeLeft(durations[mode])
  }, [mode, settings])

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      handleTimerComplete()
    }

    return () => clearInterval(intervalRef.current)
  }, [isRunning, timeLeft])

  const handleTimerComplete = () => {
    setIsRunning(false)
    
    // Play sound
    if (soundEnabled) {
      playNotificationSound()
    }

    // Show notification
    if (Notification.permission === 'granted') {
      const title = mode === 'work' 
        ? (language === 'is' ? 'Vinna lokið!' : 'Work session complete!')
        : (language === 'is' ? 'Hlé lokið!' : 'Break is over!')
      const body = mode === 'work'
        ? (language === 'is' ? 'Tími til að taka hlé' : 'Time for a break')
        : (language === 'is' ? 'Tilbúinn að halda áfram?' : 'Ready to continue?')
      
      new Notification(title, { body, icon: '/icon.png' })
    }

    if (mode === 'work') {
      const newCount = sessionsCompleted + 1
      setSessionsCompleted(newCount)
      
      // Save session
      addPomodoroSession({
        projectId: focusProject,
        taskId: focusTask,
        duration: settings.work,
        completedAt: new Date().toISOString()
      })

      // Determine next break type
      if (newCount % settings.sessionsBeforeLong === 0) {
        setMode('longBreak')
      } else {
        setMode('break')
      }
    } else {
      setMode('work')
    }
  }

  const playNotificationSound = () => {
    // Simple beep using Web Audio API
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioCtx.destination)
    
    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    gainNode.gain.value = 0.3
    
    oscillator.start()
    setTimeout(() => {
      oscillator.stop()
      audioCtx.close()
    }, 200)
  }

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setMode('work')
    setSessionsCompleted(0)
    setTimeLeft(settings.work * 60)
  }

  const skipToBreak = () => {
    setIsRunning(false)
    if (mode === 'work') {
      const newCount = sessionsCompleted + 1
      setSessionsCompleted(newCount)
      if (newCount % settings.sessionsBeforeLong === 0) {
        setMode('longBreak')
      } else {
        setMode('break')
      }
    } else {
      setMode('work')
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = (() => {
    const total = mode === 'work' 
      ? settings.work * 60 
      : mode === 'break' 
        ? settings.break * 60 
        : settings.longBreak * 60
    return ((total - timeLeft) / total) * 100
  })()

  const getModeColor = () => {
    switch (mode) {
      case 'work': return '#3b82f6'
      case 'break': return '#22c55e'
      case 'longBreak': return '#a855f7'
      default: return '#3b82f6'
    }
  }

  const getModeIcon = () => {
    switch (mode) {
      case 'work': return <Brain size={20} />
      case 'break': return <Coffee size={20} />
      case 'longBreak': return <Zap size={20} />
      default: return <Brain size={20} />
    }
  }

  const getModeLabel = () => {
    if (language === 'is') {
      switch (mode) {
        case 'work': return 'Vinna'
        case 'break': return 'Stutt hlé'
        case 'longBreak': return 'Langt hlé'
        default: return 'Vinna'
      }
    }
    switch (mode) {
      case 'work': return 'Focus'
      case 'break': return 'Short Break'
      case 'longBreak': return 'Long Break'
      default: return 'Focus'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="w-full max-w-md bg-dark-900 rounded-2xl border border-dark-500 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-dark-600 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${getModeColor()}20`, color: getModeColor() }}
            >
              {getModeIcon()}
            </div>
            <div>
              <h2 className="font-semibold">{getModeLabel()}</h2>
              {project && (
                <p className="text-xs text-zinc-500">{project.name}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
            >
              {soundEnabled ? <Volume2 size={18} className="text-zinc-400" /> : <VolumeX size={18} className="text-zinc-500" />}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
            >
              <Settings size={18} className="text-zinc-400" />
            </button>
            <button
              onClick={() => {
                endFocus()
                onClose?.()
              }}
              className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
            >
              <X size={18} className="text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Timer Display */}
        <div className="p-8">
          {/* Circular Progress */}
          <div className="relative w-56 h-56 mx-auto mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="112"
                cy="112"
                r="100"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-dark-700"
              />
              <circle
                cx="112"
                cy="112"
                r="100"
                fill="none"
                stroke={getModeColor()}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 100}
                strokeDashoffset={2 * Math.PI * 100 * (1 - progress / 100)}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-mono font-bold" style={{ color: getModeColor() }}>
                {formatTime(timeLeft)}
              </span>
              <span className="text-xs text-zinc-500 mt-2">
                {language === 'is' ? 'Lotur' : 'Sessions'}: {sessionsCompleted}
              </span>
            </div>
          </div>

          {/* Task info */}
          {task && (
            <div className="text-center mb-6 p-3 bg-dark-800/50 rounded-xl">
              <p className="text-sm text-zinc-400 truncate">{task.title}</p>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={resetTimer}
              className="p-3 hover:bg-dark-700 rounded-xl transition-colors"
              title={language === 'is' ? 'Endurstilla' : 'Reset'}
            >
              <RotateCcw size={20} className="text-zinc-400" />
            </button>
            
            <button
              onClick={toggleTimer}
              className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all hover:scale-105"
              style={{ backgroundColor: getModeColor() }}
            >
              {isRunning ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
            </button>
            
            <button
              onClick={skipToBreak}
              className="p-3 hover:bg-dark-700 rounded-xl transition-colors"
              title={language === 'is' ? 'Sleppa' : 'Skip'}
            >
              <Check size={20} className="text-zinc-400" />
            </button>
          </div>

          {/* Mode switcher */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {['work', 'break', 'longBreak'].map(m => (
              <button
                key={m}
                onClick={() => {
                  setIsRunning(false)
                  setMode(m)
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  mode === m 
                    ? 'bg-white/10 text-white' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {m === 'work' ? (language === 'is' ? 'Vinna' : 'Focus') :
                 m === 'break' ? (language === 'is' ? 'Hlé' : 'Break') :
                 (language === 'is' ? 'Langt hlé' : 'Long')}
              </button>
            ))}
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="px-6 pb-6 border-t border-dark-600 pt-4">
            <h3 className="text-sm font-medium mb-3">
              {language === 'is' ? 'Stillingar' : 'Timer Settings'}
            </h3>
            
            {/* Presets */}
            <div className="flex gap-2 mb-4">
              {Object.keys(PRESETS).map(preset => (
                <button
                  key={preset}
                  onClick={() => setSelectedPreset(preset)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                    selectedPreset === preset
                      ? 'bg-accent text-white'
                      : 'bg-dark-700 text-zinc-400 hover:bg-dark-600'
                  }`}
                >
                  {preset === 'pomodoro' ? '25/5' :
                   preset === 'short' ? '15/3' :
                   preset === 'long' ? '50/10' : 
                   (language === 'is' ? 'Sérsniðið' : 'Custom')}
                </button>
              ))}
            </div>

            {/* Custom settings */}
            {selectedPreset === 'custom' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-2xs text-zinc-500 block mb-1">
                    {language === 'is' ? 'Vinna (mín)' : 'Work (min)'}
                  </label>
                  <input
                    type="number"
                    value={customSettings.work}
                    onChange={(e) => setCustomSettings({...customSettings, work: parseInt(e.target.value) || 25})}
                    className="w-full bg-dark-700 rounded-lg px-3 py-2 text-sm"
                    min="1"
                    max="120"
                  />
                </div>
                <div>
                  <label className="text-2xs text-zinc-500 block mb-1">
                    {language === 'is' ? 'Hlé (mín)' : 'Break (min)'}
                  </label>
                  <input
                    type="number"
                    value={customSettings.break}
                    onChange={(e) => setCustomSettings({...customSettings, break: parseInt(e.target.value) || 5})}
                    className="w-full bg-dark-700 rounded-lg px-3 py-2 text-sm"
                    min="1"
                    max="30"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default PomodoroTimer
