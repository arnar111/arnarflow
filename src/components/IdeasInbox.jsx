import React, { useState } from 'react'
import useStore from '../store/useStore'
import DynamicIcon from './Icons'
import { format } from 'date-fns'
import { 
  Lightbulb, 
  Plus, 
  Trash2, 
  ArrowRight,
  Star,
  Archive,
  Smartphone,
  Sparkles,
  DollarSign,
  FileText,
  Inbox,
  Zap,
  ChevronDown
} from 'lucide-react'

const IDEA_TYPES = [
  { id: 'app', icon: Smartphone, label: 'App', color: '#3b82f6' },
  { id: 'feature', icon: Sparkles, label: 'Feature', color: '#a855f7' },
  { id: 'saas', icon: DollarSign, label: 'SaaS', color: '#22c55e' },
  { id: 'content', icon: FileText, label: 'Content', color: '#f59e0b' },
  { id: 'other', icon: Lightbulb, label: 'Other', color: '#71717a' },
]

function IdeasInbox() {
  const { ideas, addIdea, updateIdea, deleteIdea, projects } = useStore()
  const [newIdea, setNewIdea] = useState('')
  const [ideaType, setIdeaType] = useState('app')

  const inboxIdeas = ideas.filter(i => i.status === 'inbox')
  const starredIdeas = ideas.filter(i => i.status === 'starred')
  const archivedIdeas = ideas.filter(i => i.status === 'archived')

  const handleAddIdea = (e) => {
    e.preventDefault()
    if (!newIdea.trim()) return
    
    addIdea({
      title: newIdea.trim(),
      type: ideaType
    })
    setNewIdea('')
  }

  const getTypeConfig = (type) => {
    return IDEA_TYPES.find(t => t.id === type) || IDEA_TYPES[4]
  }

  return (
    <div className="p-8 max-w-5xl animate-fade-in">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-3">
              <Lightbulb className="text-amber-400" size={24} />
              Ideas Inbox
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Capture ideas from daily briefs and random inspiration
            </p>
          </div>
          
          <div className="flex gap-4 text-sm">
            <div className="text-right">
              <p className="text-2xl font-semibold font-mono text-amber-400">{inboxIdeas.length}</p>
              <p className="text-2xs text-zinc-500">Inbox</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold font-mono text-yellow-400">{starredIdeas.length}</p>
              <p className="text-2xs text-zinc-500">Starred</p>
            </div>
          </div>
        </div>
      </header>

      {/* Add Idea Form */}
      <form onSubmit={handleAddIdea} className="mb-8">
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-dark-800 border border-dark-600 rounded-xl px-4 py-2.5 focus-within:border-amber-500 transition-colors">
            <Zap size={16} className="text-amber-500" />
            <input
              type="text"
              value={newIdea}
              onChange={(e) => setNewIdea(e.target.value)}
              placeholder="Capture an idea..."
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-zinc-600"
            />
          </div>
          <div className="flex gap-1 bg-dark-800 border border-dark-600 rounded-xl p-1">
            {IDEA_TYPES.map(type => (
              <button
                key={type.id}
                type="button"
                onClick={() => setIdeaType(type.id)}
                className={`p-2 rounded-lg transition-all ${
                  ideaType === type.id
                    ? 'bg-dark-600'
                    : 'hover:bg-dark-700'
                }`}
                title={type.label}
              >
                <type.icon size={14} style={{ color: ideaType === type.id ? type.color : '#71717a' }} />
              </button>
            ))}
          </div>
          <button
            type="submit"
            disabled={!newIdea.trim()}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 rounded-xl font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Plus size={16} />
            Capture
          </button>
        </div>
      </form>

      <div className="grid grid-cols-3 gap-6">
        {/* Inbox */}
        <div className="col-span-2">
          <h2 className="text-sm font-medium text-zinc-400 mb-4 flex items-center gap-2">
            <Inbox size={14} />
            Inbox
          </h2>
          
          {inboxIdeas.length === 0 ? (
            <div className="text-center py-16 bg-dark-800/30 rounded-xl border border-dark-600/50">
              <Lightbulb size={40} className="mx-auto text-zinc-700 mb-4" />
              <p className="text-zinc-500">No ideas yet</p>
              <p className="text-xs text-zinc-600 mt-1">
                Check your daily brief for inspiration
              </p>
            </div>
          ) : (
            <ul className="space-y-2 stagger-children">
              {inboxIdeas.map(idea => (
                <IdeaCard 
                  key={idea.id}
                  idea={idea}
                  typeConfig={getTypeConfig(idea.type)}
                  onStar={() => updateIdea(idea.id, { status: 'starred' })}
                  onArchive={() => updateIdea(idea.id, { status: 'archived' })}
                  onDelete={() => deleteIdea(idea.id)}
                  onAssign={(projectId) => updateIdea(idea.id, { projectId, status: 'assigned' })}
                  projects={projects}
                />
              ))}
            </ul>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Starred */}
          <div>
            <h2 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
              <Star size={14} className="text-yellow-400" />
              Starred
            </h2>
            
            {starredIdeas.length === 0 ? (
              <p className="text-xs text-zinc-600 text-center py-6 bg-dark-800/30 rounded-xl border border-dark-600/50">
                Star your best ideas
              </p>
            ) : (
              <ul className="space-y-1.5">
                {starredIdeas.map(idea => {
                  const typeConfig = getTypeConfig(idea.type)
                  return (
                    <li 
                      key={idea.id}
                      className="p-2.5 bg-dark-800/50 rounded-lg border border-dark-600/50 hover:bg-dark-800 transition-colors group"
                    >
                      <div className="flex items-start gap-2">
                        <typeConfig.icon size={12} style={{ color: typeConfig.color }} className="mt-0.5 shrink-0" />
                        <span className="flex-1 text-xs leading-relaxed">{idea.title}</span>
                        <button
                          onClick={() => updateIdea(idea.id, { status: 'inbox' })}
                          className="opacity-0 group-hover:opacity-100 text-yellow-400 transition-opacity"
                        >
                          <Star size={12} fill="currentColor" />
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* Archived */}
          {archivedIdeas.length > 0 && (
            <details className="group">
              <summary className="text-sm font-medium text-zinc-500 mb-3 flex items-center gap-2 cursor-pointer hover:text-zinc-400 transition-colors">
                <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
                Archived ({archivedIdeas.length})
              </summary>
              <ul className="space-y-1 opacity-50">
                {archivedIdeas.slice(0, 5).map(idea => {
                  const typeConfig = getTypeConfig(idea.type)
                  return (
                    <li 
                      key={idea.id}
                      className="p-2 bg-dark-800/30 rounded-lg text-xs flex items-center gap-2"
                    >
                      <typeConfig.icon size={10} className="text-zinc-600 shrink-0" />
                      <span className="flex-1 truncate text-zinc-500">{idea.title}</span>
                      <button
                        onClick={() => updateIdea(idea.id, { status: 'inbox' })}
                        className="text-2xs text-zinc-600 hover:text-zinc-400 transition-colors"
                      >
                        Restore
                      </button>
                    </li>
                  )
                })}
              </ul>
            </details>
          )}
        </div>
      </div>
    </div>
  )
}

function IdeaCard({ idea, typeConfig, onStar, onArchive, onDelete, onAssign, projects }) {
  const [showAssign, setShowAssign] = useState(false)
  const TypeIcon = typeConfig.icon

  return (
    <li className="p-4 bg-dark-800/50 rounded-xl border border-dark-600/50 hover:bg-dark-800 hover:border-dark-500 transition-all group">
      <div className="flex items-start gap-3">
        <div 
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${typeConfig.color}15` }}
        >
          <TypeIcon size={16} style={{ color: typeConfig.color }} />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-snug">{idea.title}</p>
          <p className="text-2xs text-zinc-600 mt-1">
            {format(new Date(idea.createdAt), 'MMM d, h:mm a')}
          </p>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onStar}
            className="p-1.5 hover:bg-yellow-500/20 rounded-lg text-zinc-500 hover:text-yellow-400 transition-colors"
            title="Star"
          >
            <Star size={14} />
          </button>
          <button
            onClick={() => setShowAssign(!showAssign)}
            className="p-1.5 hover:bg-accent/20 rounded-lg text-zinc-500 hover:text-accent transition-colors"
            title="Assign to project"
          >
            <ArrowRight size={14} />
          </button>
          <button
            onClick={onArchive}
            className="p-1.5 hover:bg-dark-600 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors"
            title="Archive"
          >
            <Archive size={14} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 hover:bg-red-500/20 rounded-lg text-zinc-500 hover:text-red-400 transition-colors"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      
      {showAssign && (
        <div className="mt-3 pt-3 border-t border-dark-600 flex gap-2 flex-wrap animate-fade-in">
          {projects.map(project => (
            <button
              key={project.id}
              onClick={() => onAssign(project.id)}
              className="text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors hover:opacity-80"
              style={{ backgroundColor: `${project.color}15`, color: project.color }}
            >
              <DynamicIcon name={project.icon} size={12} />
              {project.name}
            </button>
          ))}
        </div>
      )}
    </li>
  )
}

export default IdeasInbox
