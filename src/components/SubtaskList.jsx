import React, { useState } from 'react'
import useStore from '../store/useStore'
import { useTranslation } from '../i18n/useTranslation'
import { 
  Plus, 
  Check, 
  X, 
  GripVertical,
  Circle,
  CheckCircle2
} from 'lucide-react'

// Progress bar for subtask completion
export function SubtaskProgress({ subtasks = [], size = 'sm' }) {
  if (!subtasks || subtasks.length === 0) return null

  const completed = subtasks.filter(s => s.completed).length
  const total = subtasks.length
  const progress = (completed / total) * 100

  const sizeClasses = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2'
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 bg-dark-700 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div 
          className={`h-full rounded-full transition-all duration-300 ${
            progress === 100 ? 'bg-green-500' : 'bg-accent'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-2xs text-zinc-500 font-mono">
        {completed}/{total}
      </span>
    </div>
  )
}

// Compact inline subtask display
export function SubtaskBadge({ subtasks = [] }) {
  if (!subtasks || subtasks.length === 0) return null

  const completed = subtasks.filter(s => s.completed).length
  const total = subtasks.length
  const allDone = completed === total

  return (
    <span className={`inline-flex items-center gap-1 text-2xs px-1.5 py-0.5 rounded ${
      allDone 
        ? 'bg-green-500/20 text-green-400' 
        : 'bg-dark-700 text-zinc-500'
    }`}>
      {allDone ? <CheckCircle2 size={10} /> : <Circle size={10} />}
      {completed}/{total}
    </span>
  )
}

// Full subtask list component
function SubtaskList({ taskId, subtasks = [], compact = false }) {
  const { language } = useTranslation()
  const { addSubtask, toggleSubtask, deleteSubtask } = useStore()
  const [newSubtask, setNewSubtask] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleAdd = () => {
    if (!newSubtask.trim()) return
    addSubtask(taskId, newSubtask.trim())
    setNewSubtask('')
    setIsAdding(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
    if (e.key === 'Escape') {
      setNewSubtask('')
      setIsAdding(false)
    }
  }

  if (compact) {
    return (
      <div className="space-y-1">
        {subtasks.slice(0, 3).map(subtask => (
          <div 
            key={subtask.id}
            className="flex items-center gap-2 text-xs"
          >
            <button
              onClick={() => toggleSubtask(taskId, subtask.id)}
              className={`flex-shrink-0 w-3.5 h-3.5 rounded border transition-all ${
                subtask.completed 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : 'border-zinc-600 hover:border-zinc-400'
              }`}
            >
              {subtask.completed && <Check size={10} className="m-auto" />}
            </button>
            <span className={`truncate ${subtask.completed ? 'text-zinc-600 line-through' : 'text-zinc-400'}`}>
              {subtask.title}
            </span>
          </div>
        ))}
        {subtasks.length > 3 && (
          <p className="text-2xs text-zinc-600 pl-5">
            +{subtasks.length - 3} {language === 'is' ? 'fleiri' : 'more'}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Progress */}
      {subtasks.length > 0 && (
        <SubtaskProgress subtasks={subtasks} size="sm" />
      )}

      {/* Subtask list */}
      <div className="space-y-1">
        {subtasks.map(subtask => (
          <div 
            key={subtask.id}
            className="flex items-center gap-2 group p-1.5 -mx-1.5 rounded-lg hover:bg-dark-800/50 transition-colors"
          >
            <button
              onClick={() => toggleSubtask(taskId, subtask.id)}
              className={`flex-shrink-0 w-4 h-4 rounded border-2 transition-all flex items-center justify-center ${
                subtask.completed 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : 'border-zinc-600 hover:border-accent'
              }`}
            >
              {subtask.completed && <Check size={12} strokeWidth={3} />}
            </button>
            
            <span className={`flex-1 text-sm ${
              subtask.completed ? 'text-zinc-600 line-through' : 'text-zinc-300'
            }`}>
              {subtask.title}
            </span>

            <button
              onClick={() => deleteSubtask(taskId, subtask.id)}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
            >
              <X size={12} className="text-red-400" />
            </button>
          </div>
        ))}
      </div>

      {/* Add subtask */}
      {isAdding ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-zinc-700 flex-shrink-0" />
          <input
            type="text"
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (!newSubtask.trim()) {
                setIsAdding(false)
              }
            }}
            placeholder={language === 'is' ? 'Bæta við undirverkefni...' : 'Add subtask...'}
            className="flex-1 bg-transparent text-sm outline-none placeholder-zinc-600"
            autoFocus
          />
          <button
            onClick={handleAdd}
            disabled={!newSubtask.trim()}
            className="p-1 hover:bg-accent/20 rounded transition-colors disabled:opacity-30"
          >
            <Check size={14} className="text-accent" />
          </button>
          <button
            onClick={() => {
              setNewSubtask('')
              setIsAdding(false)
            }}
            className="p-1 hover:bg-dark-700 rounded transition-colors"
          >
            <X size={14} className="text-zinc-500" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors py-1"
        >
          <Plus size={14} />
          {language === 'is' ? 'Bæta við undirverkefni' : 'Add subtask'}
        </button>
      )}
    </div>
  )
}

export default SubtaskList
