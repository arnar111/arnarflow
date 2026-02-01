import React, { useState } from 'react'
import useStore from '../store/useStore'
import { useTranslation } from '../i18n/useTranslation'
import { X, Plus, Folder } from 'lucide-react'

const ICONS = [
  'Folder', 'Home', 'Trophy', 'Headphones', 'Globe', 'Rocket', 
  'Code', 'Briefcase', 'ShoppingCart', 'Heart', 'Star', 'Zap',
  'Book', 'Camera', 'Coffee', 'Music', 'Palette', 'Target'
]

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#a855f7', 
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1'
]

function AddProjectModal({ onClose }) {
  const { t } = useTranslation()
  const { addProject } = useStore()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('Folder')
  const [color, setColor] = useState('#3b82f6')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    
    addProject({
      name: name.trim(),
      description: description.trim(),
      icon,
      color
    })
    
    onClose()
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md bg-dark-900 rounded-2xl border border-dark-500 shadow-2xl overflow-hidden animate-fade-in-scale">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-600">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Plus size={18} className="text-accent" />
            {t('addProject.title')}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <X size={18} className="text-zinc-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs text-zinc-500 block mb-1.5">{t('addProject.projectName')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('addProject.projectNamePlaceholder')}
              className="w-full bg-dark-800 border border-dark-600 rounded-xl px-4 py-2.5 text-sm focus:border-accent transition-colors"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-zinc-500 block mb-1.5">{t('addProject.description')}</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('addProject.descriptionPlaceholder')}
              className="w-full bg-dark-800 border border-dark-600 rounded-xl px-4 py-2.5 text-sm focus:border-accent transition-colors"
            />
          </div>

          {/* Color */}
          <div>
            <label className="text-xs text-zinc-500 block mb-1.5">{t('addProject.color')}</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-lg transition-all ${
                    color === c ? 'ring-2 ring-offset-2 ring-offset-dark-900 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c, ringColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Icon */}
          <div>
            <label className="text-xs text-zinc-500 block mb-1.5">{t('addProject.icon')}</label>
            <div className="flex gap-2 flex-wrap">
              {ICONS.map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs transition-all ${
                    icon === i 
                      ? 'bg-accent/20 text-accent ring-1 ring-accent' 
                      : 'bg-dark-800 text-zinc-500 hover:bg-dark-700'
                  }`}
                >
                  {i.slice(0, 2)}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="pt-2">
            <label className="text-xs text-zinc-500 block mb-1.5">{t('addProject.preview')}</label>
            <div 
              className="flex items-center gap-3 p-3 rounded-xl border border-dark-600"
              style={{ backgroundColor: `${color}10` }}
            >
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: `${color}20`, color }}
              >
                {icon.slice(0, 2)}
              </div>
              <div>
                <p className="font-medium" style={{ color }}>{name || t('addProject.projectNamePlaceholder')}</p>
                <p className="text-xs text-zinc-500">{description || t('addProject.description')}</p>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-medium transition-colors"
          >
            {t('addProject.create')}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddProjectModal
