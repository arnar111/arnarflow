import React, { useState, useEffect } from 'react'
import useStore from '../store/useStore'
import { Zap, RefreshCw, Check, AlertCircle, Sparkles, Plus, Trash2 } from 'lucide-react'

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && window.process?.type === 'renderer'

export default function BlaerSync() {
  const [syncData, setSyncData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastSync, setLastSync] = useState(null)
  const [importedCount, setImportedCount] = useState(0)
  const [showPanel, setShowPanel] = useState(false)
  
  const { addTask, tasks, projects, addIdea } = useStore()

  // Fetch sync data from file
  const fetchSyncData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      let data = null
      
      if (isElectron && window.electronAPI?.readSyncFile) {
        // In Electron - use IPC
        data = await window.electronAPI.readSyncFile()
      } else {
        // In browser/dev - try multiple paths
        const paths = [
          '/blaer-sync.json',
          './blaer-sync.json',
          'blaer-sync.json'
        ]
        
        for (const path of paths) {
          try {
            const response = await fetch(path + '?t=' + Date.now())
            if (response.ok) {
              data = await response.json()
              break
            }
          } catch (e) {
            continue
          }
        }
      }
      
      if (!data) {
        // Fallback - create empty structure
        data = { tasks: [], ideas: [], notes: [] }
      }
      
      setSyncData(data)
      setLastSync(new Date())
      return data
    } catch (err) {
      console.error('Blær sync error:', err)
      // Don't show error, just use empty data
      setSyncData({ tasks: [], ideas: [], notes: [] })
      setLastSync(new Date())
      return null
    } finally {
      setLoading(false)
    }
  }

  // Import a single task
  const importTask = (task) => {
    // Check if task already exists (by title + project)
    const exists = Object.values(tasks).some(t => 
      t.title === task.title && t.projectId === task.projectId
    )
    
    if (exists) {
      return false
    }

    addTask({
      title: task.title,
      description: task.description || '',
      projectId: task.projectId || projects[0]?.id,
      priority: task.priority || 'medium',
      dueDate: task.dueDate || null,
      tags: task.tags || [],
      status: task.status || 'todo',
      source: 'blaer'
    })
    
    return true
  }

  // Import all pending tasks
  const importAllTasks = () => {
    if (!syncData?.tasks?.length) return
    
    let imported = 0
    syncData.tasks.forEach(task => {
      if (importTask(task)) imported++
    })
    
    setImportedCount(imported)
    
    // Clear imported tasks notification after 3s
    setTimeout(() => setImportedCount(0), 3000)
  }

  // Import a single idea
  const importIdea = (idea) => {
    addIdea({
      content: idea.content || idea.title,
      category: idea.category || 'product',
      source: 'blaer',
      createdAt: new Date().toISOString()
    })
  }

  // Auto-fetch on mount and every 5 minutes
  useEffect(() => {
    fetchSyncData()
    
    const interval = setInterval(fetchSyncData, 5 * 60 * 1000) // 5 minutes
    return () => clearInterval(interval)
  }, [])

  const pendingTasks = syncData?.tasks?.filter(task => {
    return !Object.values(tasks).some(t => 
      t.title === task.title && t.projectId === task.projectId
    )
  }) || []

  const pendingIdeas = syncData?.ideas || []

  return (
    <>
      {/* Floating Blær Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className={`fixed bottom-24 right-6 z-40 p-3 rounded-2xl shadow-lg transition-all hover:scale-110 ${
          pendingTasks.length > 0 
            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 animate-pulse' 
            : 'bg-dark-800 border border-dark-600 hover:border-purple-500/50'
        }`}
        title="Blær Sync"
      >
        <Zap size={22} className={pendingTasks.length > 0 ? 'text-white' : 'text-purple-400'} />
        {pendingTasks.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs font-bold flex items-center justify-center text-white">
            {pendingTasks.length}
          </span>
        )}
      </button>

      {/* Sync Panel */}
      {showPanel && (
        <div className="fixed bottom-40 right-6 z-50 w-96 bg-dark-800 border border-dark-600 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="p-4 border-b border-dark-600 bg-gradient-to-r from-purple-600/20 to-indigo-600/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="text-purple-400" size={20} />
                <h3 className="font-semibold text-white">Blær Sync</h3>
              </div>
              <button
                onClick={fetchSyncData}
                disabled={loading}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <RefreshCw size={16} className={`text-zinc-400 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            {lastSync && (
              <p className="text-xs text-zinc-500 mt-1">
                Síðast sótt: {lastSync.toLocaleTimeString('is-IS')}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto">
            {error && (
              <div className="p-4 bg-red-500/10 border-b border-red-500/20 flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {importedCount > 0 && (
              <div className="p-4 bg-green-500/10 border-b border-green-500/20 flex items-center gap-2 text-green-400 text-sm">
                <Check size={16} />
                {importedCount} verkefni flutt inn!
              </div>
            )}

            {/* Pending Tasks */}
            {pendingTasks.length > 0 ? (
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-zinc-400">
                    Ný verkefni frá Blær ({pendingTasks.length})
                  </h4>
                  <button
                    onClick={importAllTasks}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                  >
                    <Plus size={14} />
                    Flytja öll inn
                  </button>
                </div>
                
                <div className="space-y-2">
                  {pendingTasks.map((task, i) => {
                    const project = projects.find(p => p.id === task.projectId)
                    return (
                      <div 
                        key={i}
                        className="p-3 bg-dark-700/50 rounded-xl border border-dark-600/50 group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white text-sm truncate">{task.title}</p>
                            {task.description && (
                              <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{task.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              {project && (
                                <span 
                                  className="text-2xs px-2 py-0.5 rounded-full"
                                  style={{ 
                                    backgroundColor: project.color + '20',
                                    color: project.color
                                  }}
                                >
                                  {project.name}
                                </span>
                              )}
                              {task.priority && task.priority !== 'medium' && (
                                <span className={`text-2xs px-2 py-0.5 rounded-full ${
                                  task.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                                  task.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                  'bg-green-500/20 text-green-400'
                                }`}>
                                  {task.priority}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => importTask(task)}
                            className="p-2 hover:bg-purple-500/20 rounded-lg text-purple-400 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Zap size={32} className="mx-auto mb-3 text-zinc-700" />
                <p className="text-sm text-zinc-500">Engin ný verkefni frá Blær</p>
                <p className="text-xs text-zinc-600 mt-1">Blær bætir við verkefnum sjálfkrafa</p>
              </div>
            )}

            {/* Pending Ideas */}
            {pendingIdeas.length > 0 && (
              <div className="p-4 border-t border-dark-600">
                <h4 className="text-sm font-medium text-zinc-400 mb-3">
                  Hugmyndir ({pendingIdeas.length})
                </h4>
                <div className="space-y-2">
                  {pendingIdeas.map((idea, i) => (
                    <div 
                      key={i}
                      className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 flex items-center justify-between"
                    >
                      <p className="text-sm text-amber-200">{idea.content || idea.title}</p>
                      <button
                        onClick={() => importIdea(idea)}
                        className="p-1.5 hover:bg-amber-500/20 rounded-lg text-amber-400"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-dark-600 bg-dark-900/50">
            <p className="text-2xs text-zinc-600 text-center">
              Blær rannsakar og bætir við verkefnum í bakgrunni
            </p>
          </div>
        </div>
      )}
    </>
  )
}
