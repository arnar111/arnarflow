import React, { useEffect, useMemo, useState } from 'react'
import useStore, { IDEA_CATEGORIES } from '../store/useStore'
import { useTranslation } from '../i18n/useTranslation'
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
  ChevronDown,
  Tag,
  X,
  Link2,
  FolderOpen
} from 'lucide-react'

const IDEA_TYPES = [
  { id: 'app', icon: Smartphone, label: 'App', labelIs: 'Forrit', color: '#3b82f6' },
  { id: 'feature', icon: Sparkles, label: 'Feature', labelIs: 'Eiginleiki', color: '#a855f7' },
  { id: 'saas', icon: DollarSign, label: 'SaaS', labelIs: 'SaaS', color: '#22c55e' },
  { id: 'content', icon: FileText, label: 'Content', labelIs: 'Efni', color: '#f59e0b' },
  { id: 'other', icon: Lightbulb, label: 'Other', labelIs: 'Annað', color: '#71717a' },
]

function IdeasInbox() {
  const { t, language } = useTranslation()
  const ideas = useStore(state => state.ideas)
  const addIdea = useStore(state => state.addIdea)
  const updateIdea = useStore(state => state.updateIdea)
  const deleteIdea = useStore(state => state.deleteIdea)
  const addTask = useStore(state => state.addTask)
  const projects = useStore(state => state.projects)
  const addTagToIdea = useStore(state => state.addTagToIdea)
  const removeTagFromIdea = useStore(state => state.removeTagFromIdea)
  const ideaCategories = useStore(state => state.ideaCategories)
  const [newIdea, setNewIdea] = useState('')
  const [ideaType, setIdeaType] = useState('app')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [newTag, setNewTag] = useState('')

  // GTD Triage mode (v6.0.0)
  const [triageMode, setTriageMode] = useState(false)
  const [triageIndex, setTriageIndex] = useState(0)

  const inboxIdeas = ideas.filter(i => i.status === 'inbox')
  const starredIdeas = ideas.filter(i => i.status === 'starred')
  const archivedIdeas = ideas.filter(i => i.status === 'archived')
  const linkedIdeas = ideas.filter(i => i.projectId)

  const triageIdeas = useMemo(() => inboxIdeas, [inboxIdeas])
  const triageTotal = triageIdeas.length
  const triageCurrent = triageIdeas[triageIndex] || null

  // Keep triageIndex in range as inbox changes
  useEffect(() => {
    if (!triageMode) return
    if (triageTotal === 0) {
      setTriageMode(false)
      setTriageIndex(0)
      return
    }
    setTriageIndex((idx) => Math.max(0, Math.min(idx, triageTotal - 1)))
  }, [triageMode, triageTotal])

  const nextTriage = () => {
    setTriageIndex((idx) => {
      const next = idx + 1
      return next >= triageTotal ? 0 : next
    })
  }

  const handleTriageConvertToTask = () => {
    if (!triageCurrent) return
    addTask({
      title: triageCurrent.title,
      projectId: triageCurrent.projectId || projects[0]?.id,
      priority: 'medium',
    })
    deleteIdea(triageCurrent.id)
  }

  const handleTriageDelete = () => {
    if (!triageCurrent) return
    deleteIdea(triageCurrent.id)
  }

  const handleTriageMoveToProject = () => {
    if (!triageCurrent) return

    const input = window.prompt(
      language === 'is' ? 'Settu inn verkefnisnafn (eða id):' : 'Enter project name (or id):'
    )
    if (!input) return

    const q = input.trim().toLowerCase()
    const project = projects.find((p) => p.id.toLowerCase() === q || p.name.toLowerCase().startsWith(q))
    if (!project) {
      window.alert(language === 'is' ? 'Verkefni fannst ekki.' : 'Project not found.')
      return
    }

    updateIdea(triageCurrent.id, { projectId: project.id, status: 'assigned' })
  }

  // Keyboard shortcuts in triage
  useEffect(() => {
    if (!triageMode) return

    const onKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName
      const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag)
      if (isTyping) return

      if (e.key === 'Escape') {
        e.preventDefault()
        setTriageMode(false)
        return
      }

      const key = e.key?.toLowerCase?.()
      if (key === 's') {
        e.preventDefault()
        nextTriage()
        return
      }
      if (key === 'd') {
        e.preventDefault()
        handleTriageDelete()
        return
      }
      if (key === 't') {
        e.preventDefault()
        handleTriageConvertToTask()
        return
      }
      if (key === 'p') {
        e.preventDefault()
        handleTriageMoveToProject()
        return
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [triageMode, triageTotal, triageCurrent, language, projects])

  const handleAddIdea = (e) => {
    e.preventDefault()
    if (!newIdea.trim()) return
    
    addIdea({
      title: newIdea.trim(),
      type: ideaType,
      category: selectedCategory
    })
    setNewIdea('')
    setSelectedCategory(null)
  }

  const getTypeConfig = (type) => {
    return IDEA_TYPES.find(t => t.id === type) || IDEA_TYPES[4]
  }

  const getTypeLabel = (type) => {
    const config = getTypeConfig(type)
    return language === 'is' ? config.labelIs : config.label
  }

  const getCategoryLabel = (cat) => {
    return language === 'is' ? cat.nameIs : cat.name
  }

  return (
    <div className="p-8 max-w-5xl animate-fade-in">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-3">
              <Lightbulb className="text-amber-400" size={24} />
              {t('ideas.title')}
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              {t('ideas.subtitle')}
            </p>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <button
              type="button"
              onClick={() => {
                setTriageIndex(0)
                setTriageMode((v) => !v)
              }}
              className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                triageMode
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : 'bg-dark-800 border-dark-600 text-zinc-400 hover:text-white hover:border-dark-500'
              }`}
              title={language === 'is' ? 'GTD triage (eitt í einu)' : 'GTD triage (one at a time)'}
            >
              {language === 'is' ? 'Triage' : 'Triage'}
            </button>

            <div className="flex gap-4">
              <div className="text-right">
                <p className="text-2xl font-semibold font-mono text-amber-400">{inboxIdeas.length}</p>
                <p className="text-2xs text-zinc-500">{t('ideas.inbox')}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold font-mono text-yellow-400">{starredIdeas.length}</p>
                <p className="text-2xs text-zinc-500">{t('ideas.starred')}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold font-mono text-cyan-400">{linkedIdeas.length}</p>
                <p className="text-2xs text-zinc-500">{language === 'is' ? 'Tengdar' : 'Linked'}</p>
              </div>
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
              placeholder={t('ideas.capture')}
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-zinc-600"
            />
          </div>
          
          {/* Type Selector */}
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
                title={getTypeLabel(type.id)}
              >
                <type.icon size={14} style={{ color: ideaType === type.id ? type.color : '#71717a' }} />
              </button>
            ))}
          </div>

          {/* Category Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setSelectedCategory(selectedCategory ? null : ideaCategories[0]?.id)}
              className={`h-full px-3 rounded-xl border transition-all flex items-center gap-2 ${
                selectedCategory
                  ? 'bg-dark-700 border-accent/50'
                  : 'bg-dark-800 border-dark-600 hover:border-dark-500'
              }`}
            >
              <Tag size={14} className={selectedCategory ? 'text-accent' : 'text-zinc-500'} />
            </button>
            
            {selectedCategory && (
              <div className="absolute top-full mt-1 right-0 bg-dark-800 border border-dark-600 rounded-xl p-2 z-10 min-w-40 animate-fade-in">
                {ideaCategories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-dark-600'
                        : 'hover:bg-dark-700'
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                    {getCategoryLabel(cat)}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={!newIdea.trim()}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 rounded-xl font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Plus size={16} />
            {t('ideas.captureBtn')}
          </button>
        </div>
      </form>

      {triageMode ? (
        <div className="mt-2 rounded-2xl border border-dark-600 bg-dark-800/40 p-5 animate-fade-in">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-medium text-zinc-300">{language === 'is' ? 'Triage' : 'Triage'}</h2>
              <p className="text-xs text-zinc-500 mt-1">
                {language === 'is'
                  ? 'T = Task · P = Verkefni · D = Eyða · S = Sleppa · Esc = Hætta'
                  : 'T = Task · P = Project · D = Delete · S = Skip/Next · Esc = Exit'}
              </p>
            </div>
            <div className="text-xs text-zinc-500 font-mono">
              {triageTotal === 0 ? '0/0' : `${triageIndex + 1}/${triageTotal}`}
            </div>
          </div>

          {triageCurrent ? (
            <div className="mt-5">
              <div className="p-4 rounded-xl border border-dark-600 bg-dark-900/40">
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${getTypeConfig(triageCurrent.type).color}15` }}
                  >
                    {React.createElement(getTypeConfig(triageCurrent.type).icon, {
                      size: 16,
                      style: { color: getTypeConfig(triageCurrent.type).color },
                    })}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-white leading-snug">{triageCurrent.title}</div>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      {triageCurrent.category && (
                        <span className="text-2xs px-2 py-0.5 rounded bg-dark-700 text-zinc-300">
                          {getCategoryLabel(ideaCategories.find((c) => c.id === triageCurrent.category) || { name: triageCurrent.category, nameIs: triageCurrent.category })}
                        </span>
                      )}
                      {triageCurrent.tags?.slice(0, 6).map((tag) => (
                        <span key={tag} className="text-2xs px-2 py-0.5 rounded-full bg-dark-700 text-zinc-400">
                          #{tag}
                        </span>
                      ))}
                      {triageCurrent.projectId && (
                        <span className="text-2xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                          {projects.find((p) => p.id === triageCurrent.projectId)?.name || triageCurrent.projectId}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleTriageConvertToTask}
                  className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-medium"
                >
                  {language === 'is' ? 'T: Breyta í task' : 'T: Convert to task'}
                </button>
                <button
                  type="button"
                  onClick={handleTriageMoveToProject}
                  className="px-3 py-2 rounded-xl border border-dark-600 bg-dark-800 hover:bg-dark-700 text-zinc-200 text-sm"
                >
                  {language === 'is' ? 'P: Flytja í verkefni' : 'P: Move to project'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    nextTriage()
                  }}
                  className="px-3 py-2 rounded-xl border border-dark-600 bg-dark-800 hover:bg-dark-700 text-zinc-200 text-sm"
                >
                  {language === 'is' ? 'S: Sleppa' : 'S: Skip/Next'}
                </button>
                <button
                  type="button"
                  onClick={handleTriageDelete}
                  className="px-3 py-2 rounded-xl border border-red-500/40 bg-red-500/10 hover:bg-red-500/15 text-red-300 text-sm"
                >
                  {language === 'is' ? 'D: Eyða' : 'D: Delete'}
                </button>

                <button
                  type="button"
                  onClick={() => setTriageMode(false)}
                  className="ml-auto px-3 py-2 rounded-xl border border-dark-600 bg-dark-800 hover:bg-dark-700 text-zinc-400 text-sm"
                >
                  {language === 'is' ? 'Hætta (Esc)' : 'Exit (Esc)'}
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 text-center text-zinc-500">
              {language === 'is' ? 'Engar hugmyndir í Inbox.' : 'No inbox ideas.'}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
        {/* Inbox */}
        <div className="col-span-2">
          <h2 className="text-sm font-medium text-zinc-400 mb-4 flex items-center gap-2">
            <Inbox size={14} />
            {t('ideas.inbox')}
          </h2>
          
          {inboxIdeas.length === 0 ? (
            <div className="text-center py-16 bg-dark-800/30 rounded-xl border border-dark-600/50">
              <Lightbulb size={40} className="mx-auto text-zinc-700 mb-4" />
              <p className="text-zinc-500">{t('ideas.noIdeas')}</p>
              <p className="text-xs text-zinc-600 mt-1">
                {t('ideas.checkBrief')}
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
                  onAddTag={(tag) => addTagToIdea(idea.id, tag)}
                  onRemoveTag={(tag) => removeTagFromIdea(idea.id, tag)}
                  onSetCategory={(categoryId) => updateIdea(idea.id, { category: categoryId })}
                  projects={projects}
                  categories={ideaCategories}
                  language={language}
                  t={t}
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
              {t('ideas.starred')}
            </h2>
            
            {starredIdeas.length === 0 ? (
              <p className="text-xs text-zinc-600 text-center py-6 bg-dark-800/30 rounded-xl border border-dark-600/50">
                {t('ideas.starBest')}
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
                      {idea.tags?.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {idea.tags.map(tag => (
                            <span key={tag} className="text-2xs px-1.5 py-0.5 bg-dark-700 rounded text-zinc-500">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* Linked to Projects */}
          {linkedIdeas.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
                <Link2 size={14} className="text-cyan-400" />
                {language === 'is' ? 'Tengd við verkefni' : 'Linked to Projects'}
              </h2>
              <ul className="space-y-1.5">
                {linkedIdeas.slice(0, 5).map(idea => {
                  const project = projects.find(p => p.id === idea.projectId)
                  return (
                    <li 
                      key={idea.id}
                      className="p-2.5 bg-dark-800/50 rounded-lg border border-dark-600/50"
                    >
                      <div className="flex items-start gap-2">
                        <FolderOpen size={12} style={{ color: project?.color }} className="mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs leading-relaxed block truncate">{idea.title}</span>
                          <span className="text-2xs text-zinc-600">{project?.name}</span>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {/* Archived */}
          {archivedIdeas.length > 0 && (
            <details className="group">
              <summary className="text-sm font-medium text-zinc-500 mb-3 flex items-center gap-2 cursor-pointer hover:text-zinc-400 transition-colors">
                <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
                {t('ideas.archived')} ({archivedIdeas.length})
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
                        {t('ideas.restore')}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </details>
          )}
        </div>
      </div>
      )}
    </div>
  )
}

function IdeaCard({ idea, typeConfig, onStar, onArchive, onDelete, onAssign, onAddTag, onRemoveTag, onSetCategory, projects, categories, language, t }) {
  const [showAssign, setShowAssign] = useState(false)
  const [showTags, setShowTags] = useState(false)
  const [newTag, setNewTag] = useState('')
  const TypeIcon = typeConfig.icon

  const handleAddTag = (e) => {
    e.preventDefault()
    if (newTag.trim()) {
      onAddTag(newTag.trim().toLowerCase())
      setNewTag('')
    }
  }

  const getCategoryLabel = (cat) => {
    return language === 'is' ? cat.nameIs : cat.name
  }

  const currentCategory = categories.find(c => c.id === idea.category)

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
          <div className="flex items-center gap-2 mt-1">
            <p className="text-2xs text-zinc-600">
              {format(new Date(idea.createdAt), 'MMM d, h:mm a')}
            </p>
            {currentCategory && (
              <span 
                className="text-2xs px-1.5 py-0.5 rounded"
                style={{ 
                  backgroundColor: `${currentCategory.color}20`,
                  color: currentCategory.color
                }}
              >
                {getCategoryLabel(currentCategory)}
              </span>
            )}
          </div>
          
          {/* Tags */}
          {idea.tags?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {idea.tags.map(tag => (
                <span 
                  key={tag} 
                  className="text-2xs px-2 py-0.5 bg-dark-700 rounded-full text-zinc-400 flex items-center gap-1 group/tag"
                >
                  #{tag}
                  <button
                    onClick={() => onRemoveTag(tag)}
                    className="opacity-0 group-hover/tag:opacity-100 hover:text-red-400 transition-opacity"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onStar}
            className="p-1.5 hover:bg-yellow-500/20 rounded-lg text-zinc-500 hover:text-yellow-400 transition-colors"
            title={t('ideas.star')}
          >
            <Star size={14} />
          </button>
          <button
            onClick={() => setShowTags(!showTags)}
            className={`p-1.5 rounded-lg transition-colors ${
              showTags ? 'bg-accent/20 text-accent' : 'hover:bg-accent/20 text-zinc-500 hover:text-accent'
            }`}
            title={t('ideas.tags')}
          >
            <Tag size={14} />
          </button>
          <button
            onClick={() => setShowAssign(!showAssign)}
            className={`p-1.5 rounded-lg transition-colors ${
              showAssign ? 'bg-accent/20 text-accent' : 'hover:bg-accent/20 text-zinc-500 hover:text-accent'
            }`}
            title={t('ideas.assignToProject')}
          >
            <ArrowRight size={14} />
          </button>
          <button
            onClick={onArchive}
            className="p-1.5 hover:bg-dark-600 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors"
            title={t('ideas.archive')}
          >
            <Archive size={14} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 hover:bg-red-500/20 rounded-lg text-zinc-500 hover:text-red-400 transition-colors"
            title={t('ideas.delete')}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      
      {/* Tag Input */}
      {showTags && (
        <div className="mt-3 pt-3 border-t border-dark-600 animate-fade-in">
          <form onSubmit={handleAddTag} className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder={t('ideas.addTag')}
              className="flex-1 bg-dark-700 border border-dark-600 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-accent"
            />
            <button
              type="submit"
              disabled={!newTag.trim()}
              className="px-3 py-1.5 bg-accent/20 text-accent rounded-lg text-xs font-medium hover:bg-accent/30 transition-colors disabled:opacity-50"
            >
              {t('common.add')}
            </button>
          </form>
          
          {/* Category selector */}
          <div className="mt-2 flex flex-wrap gap-1">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => onSetCategory(cat.id)}
                className={`text-2xs px-2 py-1 rounded-lg flex items-center gap-1 transition-colors ${
                  idea.category === cat.id
                    ? 'bg-dark-600'
                    : 'hover:bg-dark-700'
                }`}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                {getCategoryLabel(cat)}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Project Assignment */}
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
