import { Minus, Square, X, Zap } from 'lucide-react'

export default function TitleBar() {
  const handleMinimize = () => window.electronAPI?.minimize()
  const handleMaximize = () => window.electronAPI?.maximize()
  const handleClose = () => window.electronAPI?.close()

  return (
    <div className="title-bar">
      <div className="title-bar-drag">
        <div className="title-bar-icon">
          <Zap size={18} className="text-purple-400" />
        </div>
        <span className="title-bar-text">ArnarFlow</span>
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
