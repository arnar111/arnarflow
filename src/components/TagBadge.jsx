import React from 'react'
import { X } from 'lucide-react'

// Predefined tag colors
export const TAG_COLORS = {
  red: { bg: '#ef444420', text: '#ef4444', border: '#ef444440' },
  orange: { bg: '#f9731620', text: '#f97316', border: '#f9731640' },
  amber: { bg: '#f59e0b20', text: '#f59e0b', border: '#f59e0b40' },
  yellow: { bg: '#eab30820', text: '#eab308', border: '#eab30840' },
  lime: { bg: '#84cc1620', text: '#84cc16', border: '#84cc1640' },
  green: { bg: '#22c55e20', text: '#22c55e', border: '#22c55e40' },
  emerald: { bg: '#10b98120', text: '#10b981', border: '#10b98140' },
  teal: { bg: '#14b8a620', text: '#14b8a6', border: '#14b8a640' },
  cyan: { bg: '#06b6d420', text: '#06b6d4', border: '#06b6d440' },
  sky: { bg: '#0ea5e920', text: '#0ea5e9', border: '#0ea5e940' },
  blue: { bg: '#3b82f620', text: '#3b82f6', border: '#3b82f640' },
  indigo: { bg: '#6366f120', text: '#6366f1', border: '#6366f140' },
  violet: { bg: '#8b5cf620', text: '#8b5cf6', border: '#8b5cf640' },
  purple: { bg: '#a855f720', text: '#a855f7', border: '#a855f740' },
  fuchsia: { bg: '#d946ef20', text: '#d946ef', border: '#d946ef40' },
  pink: { bg: '#ec489920', text: '#ec4899', border: '#ec489940' },
  rose: { bg: '#f4366220', text: '#f43662', border: '#f4366240' },
  slate: { bg: '#64748b20', text: '#64748b', border: '#64748b40' },
}

// Default tags
export const DEFAULT_TAGS = [
  { id: 'urgent', name: 'Urgent', nameIs: 'Brýnt', color: 'red' },
  { id: 'bug', name: 'Bug', nameIs: 'Villa', color: 'orange' },
  { id: 'feature', name: 'Feature', nameIs: 'Eiginleiki', color: 'blue' },
  { id: 'design', name: 'Design', nameIs: 'Hönnun', color: 'purple' },
  { id: 'research', name: 'Research', nameIs: 'Rannsókn', color: 'cyan' },
  { id: 'content', name: 'Content', nameIs: 'Efni', color: 'amber' },
  { id: 'meeting', name: 'Meeting', nameIs: 'Fundur', color: 'green' },
  { id: 'blocked', name: 'Blocked', nameIs: 'Blokkað', color: 'slate' },
]

function TagBadge({ tag, size = 'sm', onRemove, onClick, language = 'en', showDot = true }) {
  const colors = TAG_COLORS[tag.color] || TAG_COLORS.slate
  const name = language === 'is' && tag.nameIs ? tag.nameIs : tag.name
  
  const sizeClasses = {
    xs: 'text-2xs px-2 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5',
  }

  const dotSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
  }
  
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full font-medium transition-all ${sizeClasses[size]} ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
      }}
    >
      {showDot && (
        <span 
          className={`${dotSizes[size]} rounded-full flex-shrink-0`}
          style={{ backgroundColor: colors.text }}
        />
      )}
      {name}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="ml-0.5 hover:opacity-70 transition-opacity"
        >
          <X size={size === 'xs' ? 10 : 12} />
        </button>
      )}
    </span>
  )
}

// Tag Picker Component
export function TagPicker({ selectedTags = [], tags, onToggle, language = 'en' }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map(tag => {
        const isSelected = selectedTags.includes(tag.id)
        const colors = TAG_COLORS[tag.color] || TAG_COLORS.slate
        const name = language === 'is' && tag.nameIs ? tag.nameIs : tag.name
        
        return (
          <button
            key={tag.id}
            onClick={() => onToggle(tag.id)}
            className={`text-xs px-2 py-1 rounded-full transition-all ${
              isSelected 
                ? 'ring-2 ring-offset-1 ring-offset-dark-900' 
                : 'opacity-60 hover:opacity-100'
            }`}
            style={{
              backgroundColor: colors.bg,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              ringColor: colors.text,
            }}
          >
            {name}
          </button>
        )
      })}
    </div>
  )
}

// Inline Tag Selector (for quick add)
export function InlineTagSelector({ tags, selectedTags = [], onToggle, language = 'en' }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-hide">
      {tags.slice(0, 6).map(tag => {
        const isSelected = selectedTags.includes(tag.id)
        const colors = TAG_COLORS[tag.color] || TAG_COLORS.slate
        
        return (
          <button
            key={tag.id}
            onClick={() => onToggle(tag.id)}
            className={`flex-shrink-0 w-5 h-5 rounded-full transition-all ${
              isSelected ? 'ring-2 ring-white/50 scale-110' : 'opacity-50 hover:opacity-100'
            }`}
            style={{ backgroundColor: colors.text }}
            title={language === 'is' && tag.nameIs ? tag.nameIs : tag.name}
          />
        )
      })}
    </div>
  )
}

export default TagBadge
