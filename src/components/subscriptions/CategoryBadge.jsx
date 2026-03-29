import React from 'react'
import { CATEGORIES } from './constants'

export default function CategoryBadge({ category, language = 'is', size = 'sm' }) {
  const cat = CATEGORIES[category] || CATEGORIES.other
  const Icon = cat.icon
  const label = language === 'is' ? cat.is : cat.en

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px] gap-1',
    sm: 'px-2 py-1 text-xs gap-1.5',
    md: 'px-3 py-1.5 text-sm gap-2',
  }

  const iconSizes = { xs: 10, sm: 12, md: 14 }

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${cat.bg} ${cat.text} ${sizeClasses[size] || sizeClasses.sm}`}
    >
      <Icon size={iconSizes[size] || 12} />
      <span>{label}</span>
    </span>
  )
}
