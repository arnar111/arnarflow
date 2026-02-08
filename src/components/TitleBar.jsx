import { Minus, Square, X, Zap, PlusCircle, Lightbulb } from 'lucide-react'
import useStore from '../store/useStore'

export default function TitleBar() {
  const handleMinimize = () => window.electronAPI?.minimize()
  const handleMaximize = () => window.electronAPI?.maximize()
  const handleClose = () => window.electronAPI?.close()
  const setQuickAddOpen = useStore(state => state.setQuickAddOpen)
  const setQuickIdeaMode = useStore(state => state.setQuickIdeaMode)

  const handleQuickAdd = () => { setQuickIdeaMode(false); setQuickAddOpen(true) }
  const handleQuickIdea = () => { setQuickIdeaMode(true); setQuickAddOpen(true) }

  return (
    <div className="title-bar">
      <div className="title-bar-drag">
        <div className="title-bar-icon">
          <Zap size={18} className="text-purple-400" />
        </div>
        <span className="title-bar-text">ArnarFlow</span>
        <div className="ml-3 hidden sm:flex items-center gap-2">
          <button onClick={handleQuickIdea} className="title-bar-btn title-bar-btn-ghost" title="Quick Idea">
            <Lightbulb size={14} />
          </button>
          <button onClick={handleQuickAdd} className="title-bar-btn title-bar-btn-ghost" title="Quick Add Task">
            <PlusCircle size={14} />
          </button>
        </div>
      </div>
      
      <div className="title-bar-controls">
        <button 
          onClick={handleMinimize}
          className="title-bar-btn title-bar-btn-default"
        >
          <Minus size={16} />
        </button>
        <button 
          onClick={handleMaximize}
          className="title-bar-btn title-bar-btn-default"
        >
          <Square size={14} />
        </button>
        <button 
          onClick={handleClose}
          className="title-bar-btn title-bar-btn-close"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
