import React, { useState } from 'react'
import useStore from '../store/useStore'
import { 
  X, Plus, Copy, Trash2, FileText, 
  ChevronDown, ChevronUp, Zap
} from 'lucide-react'

const PRIORITY_COLORS = {
  high: 'bg-red-500/20 text-red-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  low: 'bg-green-500/20 text-green-400',
}

export default function TaskTemplatesModal({ onClose }) {
  const { 
    taskTemplates, addTaskTemplate, deleteTaskTemplate, 
    createTaskFromTemplate, projects, language, tags 
  } = useStore()

  const [showForm, setShowForm] = useState(false)
  const [expanded, setExpanded] = useState(null)
  const [form, setForm] = useState({
    name: '', title: '', description: '', 
    projectId: '', priority: 'medium', tags: []
  })

  const t = (is, en) => language === 'is' ? is : en

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    addTaskTemplate({ ...form, name: form.name || form.title })
    setForm({ name: '', title: '', description: '', projectId: '', priority: 'medium', tags: [] })
    setShowForm(false)
  }

  const handleUse = (templateId) => {
    createTaskFromTemplate(templateId)
    onClose()
  }

  const projectMap = Object.fromEntries((projects || []).map(p => [p.id, p]))

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#1e1e2e] rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-blue-400" />
            <h2 className="text-lg font-semibold text-white">
              {t('Verkefnasniðmát', 'Task Templates')}
            </h2>
            <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
              {taskTemplates.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowForm(!showForm)}
                    className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors">
              <Plus size={16} />
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* New Template Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="p-4 border-b border-white/10 space-y-3 bg-white/[0.02]">
            <input
              type="text" placeholder={t('Nafn sniðmáts', 'Template name')}
              value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50"
            />
            <input
              type="text" placeholder={t('Titill verks', 'Task title')} required
              value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50"
            />
            <textarea
              placeholder={t('Lýsing (valfrjálst)', 'Description (optional)')} rows={2}
              value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 resize-none"
            />
            <div className="flex gap-2">
              <select value={form.projectId} onChange={e => setForm({...form, projectId: e.target.value})}
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50">
                <option value="">{t('Ekkert verkefni', 'No project')}</option>
                {(projects || []).map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50">
                <option value="high">{t('Hátt', 'High')}</option>
                <option value="medium">{t('Miðlungs', 'Medium')}</option>
                <option value="low">{t('Lágt', 'Low')}</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)}
                      className="px-3 py-1.5 text-sm text-white/50 hover:text-white/80 transition-colors">
                {t('Hætta við', 'Cancel')}
              </button>
              <button type="submit"
                      className="px-4 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                {t('Vista', 'Save')}
              </button>
            </div>
          </form>
        )}

        {/* Templates List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {taskTemplates.length === 0 ? (
            <div className="text-center py-12 text-white/30">
              <FileText size={32} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">{t('Engin sniðmát ennþá', 'No templates yet')}</p>
              <p className="text-xs mt-1 text-white/20">
                {t('Búðu til sniðmát eða vistaðu verk sem sniðmát', 
                   'Create a template or save a task as template')}
              </p>
            </div>
          ) : (
            taskTemplates.map(template => {
              const project = projectMap[template.projectId]
              const isExpanded = expanded === template.id
              return (
                <div key={template.id} 
                     className="bg-white/[0.03] border border-white/5 rounded-xl hover:border-white/10 transition-all">
                  <div className="flex items-center gap-3 p-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white truncate">
                          {template.name || template.title}
                        </span>
                        {template.priority && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${PRIORITY_COLORS[template.priority]}`}>
                            {template.priority}
                          </span>
                        )}
                      </div>
                      {project && (
                        <span className="text-xs text-white/30">{project.name}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleUse(template.id)}
                              title={t('Nota sniðmát', 'Use template')}
                              className="p-1.5 rounded-lg text-green-400 hover:bg-green-500/20 transition-colors">
                        <Zap size={14} />
                      </button>
                      <button onClick={() => setExpanded(isExpanded ? null : template.id)}
                              className="p-1.5 rounded-lg text-white/40 hover:bg-white/10 transition-colors">
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      <button onClick={() => deleteTaskTemplate(template.id)}
                              className="p-1.5 rounded-lg text-red-400/60 hover:bg-red-500/20 hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="px-3 pb-3 pt-0 border-t border-white/5">
                      {template.title !== template.name && (
                        <p className="text-xs text-white/50 mt-2">
                          <span className="text-white/30">{t('Titill:', 'Title:')}</span> {template.title}
                        </p>
                      )}
                      {template.description && (
                        <p className="text-xs text-white/40 mt-1">{template.description}</p>
                      )}
                      {template.tags?.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {template.tags.map(tagId => (
                            <span key={tagId} className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/50">
                              {tagId}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/5 text-center">
          <p className="text-[10px] text-white/20">
            {t('💡 Hægrismelltu á verk → "Vista sem sniðmát"',
               '💡 Right-click a task → "Save as template"')}
          </p>
        </div>
      </div>
    </div>
  )
}
