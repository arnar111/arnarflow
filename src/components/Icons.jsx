import * as LucideIcons from 'lucide-react'

// Map icon names to components
const iconMap = {
  // Projects
  Home: LucideIcons.Home,
  Trophy: LucideIcons.Trophy,
  Headphones: LucideIcons.Headphones,
  Vote: LucideIcons.Vote,
  Globe: LucideIcons.Globe,
  
  // Habits
  Dumbbell: LucideIcons.Dumbbell,
  Sparkles: LucideIcons.Sparkles,
  ChefHat: LucideIcons.ChefHat,
  Cat: LucideIcons.Cat,
  
  // Ideas
  Smartphone: LucideIcons.Smartphone,
  DollarSign: LucideIcons.DollarSign,
  FileText: LucideIcons.FileText,
  Lightbulb: LucideIcons.Lightbulb,
  
  // Fallback
  Circle: LucideIcons.Circle,
}

export function DynamicIcon({ name, size = 20, className = '', style = {} }) {
  const IconComponent = iconMap[name] || LucideIcons.Circle
  return <IconComponent size={size} className={className} style={style} />
}

export default DynamicIcon
