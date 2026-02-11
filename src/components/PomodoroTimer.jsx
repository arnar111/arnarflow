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
  X,
  AlertOctagon,
  List,
  Infinity,
  Plus
} from 'lucide-react'

const PRESETS = {
  pomodoro: { work: 25, break: 5, longBreak: 15, sessionsBeforeLong: 4 },
  short: { work: 15, break: 3, longBreak: 10, sessionsBeforeLong: 4 },
  long: { work: 50, break: 10, longBreak: 30, sessionsBeforeLong: 2 },
  deep: { work: 90, break: 20, longBreak: 30, sessionsBeforeLong: 2 }, // Added 90/20
  custom: { work: 25, break: 5, longBreak: 15, sessionsBeforeLong: 4 }
}

function PomodoroTimer({ onClose }) {
  const { t, language } = useTranslation()
  const focusProject = useStore(state => state.focusProject)
  const focusTask = useStore(state => state.focusTask)
  const setFocusTask = useStore(state => state.setFocusTask)
  const projects = useStore(state => state.projects)
  const tasks = useStore(state => state.tasks)
  const pomodoroSettings = useStore(state => state.pomodoroSettings)
  const setPomodoroSettings = useStore(state => state.setPomodoroSettings)
  const pomodoroStats = useStore(state => state.pomodoroStats)
  const addPomodoroSession = useStore(state => state.addPomodoroSession)
  const endFocus = useStore(state => state.endFocus)
  const addDistraction = useStore(state => state.addDistraction)
  const focusDistractions = useStore(state => state.focusDistractions)

  const [mode, setMode] = useState('work') // work, break, longBreak
  const [timeLeft, setTimeLeft] = useState(PRESETS.pomodoro.work * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [selectedPreset, setSelectedPreset] = useState('pomodoro')
  const [customSettings, setCustomSettings] = useState(PRESETS.pomodoro)
  const [showTaskSelector, setShowTaskSelector] = useState(false)
  const [distractionNote, setDistractionNote] = useState('')
  const [showDistractionInput, setShowDistractionInput] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0) // For Flow Mode
  const [isFlowMode, setIsFlowMode] = useState(false)
  
  const audioRef = useRef(null)
  const intervalRef = useRef(null)

  const project = focusProject ? projects.find(p => p.id === focusProject) : null
  const task = focusTask ? tasks.find(t => t.id === focusTask) : null

  const settings = selectedPreset === 'custom' ? customSettings : PRESETS[selectedPreset]

  // Initialize timer based on mode
  useEffect(() => {
    if (isFlowMode) {
      if (!isRunning) setElapsedTime(0)
      return
    }
    const durations = {
      work: settings.work * 60,
      break: settings.break * 60,
      longBreak: settings.longBreak * 60
    }
    setTimeLeft(durations[mode])
  }, [mode, settings, isFlowMode]) // Intentionally not isRunning to avoid reset on pause

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (isFlowMode) {
          setElapsedTime(prev => prev + 1)
        } else {
          if (timeLeft > 0) {
            setTimeLeft(prev => prev - 1)
          } else {
            handleTimerComplete()
          }
        }
      }, 1000)
    }

    return () => clearInterval(intervalRef.current)
  }, [isRunning, timeLeft, isFlowMode])

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
      
      // Save session with distractions
      addPomodoroSession({
        projectId: focusProject,
        taskId: focusTask,
        duration: settings.work,
        distractions: focusDistractions,
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
  
  const handleFlowStop = () => {
    setIsRunning(false)
    if (elapsedTime > 60) {
      addPomodoroSession({
        projectId: focusProject,
        taskId: focusTask,
        duration: Math.floor(elapsedTime / 60),
        distractions: focusDistractions,
        completedAt: new Date().toISOString(),
        type: 'flow'
      })
    }
    setElapsedTime(0)
    setIsFlowMode(false)
  }

  const handleAddDistraction = () => {
    const note = distractionNote.trim()
    addDistraction(note || undefined) // Store optional note
    setShowDistractionInput(false)
    setDistractionNote('')
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
      <div className="w-full max-w-md bg-dark-900 rounded-2xl border border-dark-500 shadow-2xl overflow-hidden relative">
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
                strokeDashoffset={isFlowMode ? 0 : 2 * Math.PI * 100 * (1 - progress / 100)}
                className={`transition-all ${isFlowMode ? 'animate-pulse-slow' : 'duration-1000'}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-mono font-bold" style={{ color: getModeColor() }}>
                {isFlowMode ? formatTime(elapsedTime) : formatTime(timeLeft)}
              </span>
              <span className="text-xs text-zinc-500 mt-2 flex items-center gap-1.5">
                {isFlowMode 
                  ? <><Infinity size={14} className="text-purple-400" /> {language === 'is' ? 'Flæði' : 'Flow'}</>
                  : `${language === 'is' ? 'Lotur' : 'Sessions'}: ${sessionsCompleted}`
                }
              </span>
              {focusDistractions.length > 0 && (
                <span className="mt-1 text-2xs text-amber-500/70 bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertOctagon size={10} />
                  {focusDistractions.length}
                </span>
              )}
            </div>
          </div>

          {/* Task info - Enhanced Selector */}
          <div 
            className="text-center mb-6 p-3 bg-dark-800/50 rounded-xl cursor-pointer hover:bg-dark-800 transition-colors relative group border border-transparent hover:border-dark-600/50" 
            onClick={() => setShowTaskSelector(!showTaskSelector)}
          >
            {task ? (
              <>
                <p className="text-sm text-zinc-300 font-medium truncate flex items-center justify-center gap-2">
                  {task.title}
                  <List size={14} className="opacity-0 group-hover:opacity-50 transition-opacity" />
                </p>
                {project && <p className="text-xs text-zinc-500 mt-1">{project.name}</p>}
              </>
            ) : (
              <div className="flex items-center justify-center gap-2 text-zinc-500 group-hover:text-zinc-300 transition-colors">
                <Plus size={16} />
                <span className="text-sm">{language === 'is' ? 'Veldu verkefni' : 'Select Task'}</span>
              </div>
            )}
            
            {showTaskSelector && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-dark-800 border border-dark-600 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto p-2 animate-in fade-in slide-in-from-top-2" onClick={e => e.stopPropagation()}>
                <p className="text-xs text-zinc-500 px-2 py-1 uppercase tracking-wider font-medium text-left">
                  {language === 'is' ? 'Verkefni' : 'Tasks'}
                </p>
                {tasks.filter(t => !t.completed).map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setFocusTask(t.id)
                      setShowTaskSelector(false)
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-dark-700 text-sm truncate text-zinc-300 flex items-center gap-2"
                  >
                    <div className={`w-2 h-2 rounded-full ${t.priority === 'high' ? 'bg-red-500' : t.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                    {t.title}
                  </button>
                ))}
                {tasks.filter(t => !t.completed).length === 0 && (
                  <p className="text-center text-zinc-500 text-xs py-4">{language === 'is' ? 'Engin verkefni' : 'No tasks'}</p>
                )}
              </div>
            )}
          </div>

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
              className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all hover:scale-105 shadow-lg shadow-current/20"
              style={{ backgroundColor: getModeColor(), color: '#fff' }}
            >
              {isRunning ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
            </button>
            
            <button
              onClick={isFlowMode ? handleFlowStop : skipToBreak}
              className="p-3 hover:bg-dark-700 rounded-xl transition-colors"
              title={isFlowMode ? (language === 'is' ? 'Ljúka' : 'Finish') : (language === 'is' ? 'Sleppa' : 'Skip')}
            >
              {isFlowMode ? <Check size={20} className="text-green-400" /> : <Check size={20} className="text-zinc-400" />}
            </button>

            {/* Distraction Button */}
            {(isRunning || isFlowMode) && (
              <button
                onClick={() => setShowDistractionInput(true)}
                className="p-3 hover:bg-dark-700 rounded-xl transition-colors relative animate-in fade-in slide-in-from-left-2"
                title={language === 'is' ? 'Skrá truflun' : 'Log Distraction'}
              >
                <AlertOctagon size={20} className="text-amber-500" />
              </button>
            )}
          </div>
          
          {/* Distraction Input Modal */}
          {showDistractionInput && (
            <div className="absolute inset-0 z-30 bg-dark-900/95 flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <AlertOctagon className="text-amber-500" />
                {language === 'is' ? 'Hvað truflaði?' : 'What distracted you?'}
              </h3>
              <input
                type="text"
                value={distractionNote}
                onChange={(e) => setDistractionNote(e.target.value)}
                placeholder={language === 'is' ? 'Símtal, póstur, osfrv...' : 'Call, email, etc...'}
                className="w-full bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:border-amber-500 text-center"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAddDistraction()}
              />
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowDistractionInput(false)}
                  className="flex-1 py-3 rounded-xl bg-dark-800 text-zinc-400 hover:bg-dark-700 font-medium"
                >
                  {language === 'is' ? 'Hætta við' : 'Cancel'}
                </button>
                <button
                  onClick={handleAddDistraction}
                  className="flex-1 py-3 rounded-xl bg-amber-500 text-dark-900 hover:bg-amber-400 font-bold"
                >
                  {language === 'is' ? 'Skrá' : 'Log'}
                </button>
              </div>
            </div>
          )}

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
            
            {/* Presets - Enhanced */}
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.keys(PRESETS).map(preset => (
                <button
                  key={preset}
                  onClick={() => {
                    setSelectedPreset(preset)
                    setIsFlowMode(false)
                    setMode('work')
                  }}
                  className={`flex-1 min-w-[60px] py-2 rounded-lg text-xs font-medium transition-all ${
                    !isFlowMode && selectedPreset === preset
                      ? 'bg-accent text-white'
                      : 'bg-dark-700 text-zinc-400 hover:bg-dark-600'
                  }`}
                >
                  {preset === 'pomodoro' ? '25/5' :
                   preset === 'short' ? '15/3' :
                   preset === 'long' ? '50/10' : 
                   preset === 'deep' ? '90/20' :
                   (language === 'is' ? 'Sérsniðið' : 'Custom')}
                </button>
              ))}
              <button
                onClick={() => {
                  setIsFlowMode(true)
                  setMode('work')
                }}
                className={`flex-1 min-w-[60px] py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                  isFlowMode
                    ? 'bg-purple-500 text-white'
                    : 'bg-dark-700 text-zinc-400 hover:bg-dark-600'
                }`}
              >
                <Infinity size={12} />
                {language === 'is' ? 'Flæði' : 'Flow'}
              </button>
            </div>

            {/* Custom settings */}
            {selectedPreset === 'custom' && !isFlowMode && (
              <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
                <div>
                  <label className="text-2xs text-zinc-500 block mb-1">
                    {language === 'is' ? 'Vinna (mín)' : 'Work (min)'}
                  </label>
                  <input
                    type="number"
                    value={customSettings.work}
                    onChange={(e) => setCustomSettings({...customSettings, work: parseInt(e.target.value) || 25})}
                    className="w-full bg-dark-700 rounded-lg px-3 py-2 text-sm text-zinc-200 border border-dark-600 focus:border-accent focus:outline-none"
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
                    className="w-full bg-dark-700 rounded-lg px-3 py-2 text-sm text-zinc-200 border border-dark-600 focus:border-accent focus:outline-none"
                    min="1"
                    max="30"
                  />
                </div>
              </div>
            )}
            
            {/* Flow Mode Info */}
            {isFlowMode && (
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 animate-in fade-in slide-in-from-top-2">
                <p className="text-xs text-purple-300 flex items-center gap-2">
                  <Infinity size={14} />
                  {language === 'is' 
                    ? 'Flæði hamur: Telur upp og engin hlé.' 
                    : 'Flow Mode: Counts up with no breaks.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default PomodoroTimer
