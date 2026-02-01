import { useMemo } from 'react'
import useStore from '../store/useStore'
import translations from './translations'

/**
 * Hook to get translations based on current language
 * @returns {{ t: (key: string) => string, language: string }}
 */
export function useTranslation() {
  const language = useStore(state => state.language)
  
  const t = useMemo(() => {
    const lang = translations[language] || translations.is
    
    /**
     * Get translation by dot-notation key
     * @param {string} key - e.g., 'dashboard.title' or 'common.save'
     * @param {Object} params - optional parameters for interpolation
     * @returns {string}
     */
    return (key, params = {}) => {
      const keys = key.split('.')
      let value = lang
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k]
        } else {
          // Fallback to Icelandic, then to key itself
          let fallback = translations.is
          for (const fk of keys) {
            if (fallback && typeof fallback === 'object' && fk in fallback) {
              fallback = fallback[fk]
            } else {
              return key // Return key if not found anywhere
            }
          }
          return typeof fallback === 'string' ? fallback : key
        }
      }
      
      // Handle arrays and non-string values
      if (Array.isArray(value)) {
        return value
      }
      
      if (typeof value !== 'string') {
        return value // Return objects/other types as-is
      }
      
      // Simple interpolation: {{name}} -> params.name
      return value.replace(/\{\{(\w+)\}\}/g, (_, paramKey) => {
        return params[paramKey] !== undefined ? params[paramKey] : `{{${paramKey}}}`
      })
    }
  }, [language])
  
  return { t, language }
}

export default useTranslation
