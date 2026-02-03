import * as LucideIcons from 'lucide-react'

// DynamicIcon: try to resolve by name from lucide-react, fallback to Circle
export function DynamicIcon({ name, size = 20, className = '', style = {} }) {
  const IconComponent = LucideIcons[name] || LucideIcons.Circle
  return <IconComponent size={size} className={className} style={style} />
}

export default DynamicIcon
