import React from 'react'
import useStore, { APP_VERSION } from '../store/useStore'
import { useTranslation } from '../i18n/useTranslation'
import { X, Zap, Github, Heart, RefreshCw } from 'lucide-react'

function AboutModal() {
  const { t } = useTranslation()
  const { setAboutOpen, setWhatsNewOpen } = useStore()

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setAboutOpen(false)
    }
  }

  const handleCheckForUpdates = () => {
    if (window.electronAPI?.checkForUpdates) {
      window.electronAPI.checkForUpdates()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-sm bg-dark-900 rounded-xl border border-dark-500 shadow-2xl shadow-black/50 overflow-hidden animate-fade-in-scale">
        {/* Content */}
        <div className="p-6 text-center">
          <button
            onClick={() => setAboutOpen(false)}
            className="absolute top-4 right-4 p-1.5 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <X size={18} className="text-zinc-400" />
          </button>

          {/* Logo */}
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent to-cyan-500 flex items-center justify-center shadow-lg shadow-accent/20">
            <Zap size={32} className="text-white" />
          </div>

          {/* App Name */}
          <h1 className="text-xl font-semibold mb-1">ArnarFlow</h1>
          <p className="text-sm text-zinc-500 mb-4">{t('aboutModal.version')} {APP_VERSION}</p>

          {/* Description */}
          <p className="text-sm text-zinc-400 mb-6">
            {t('aboutModal.description')}
          </p>

          {/* Links */}
          <div className="space-y-2 mb-6">
            <button
              onClick={handleCheckForUpdates}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-lg transition-colors text-sm"
            >
              <RefreshCw size={14} />
              {t('aboutModal.checkForUpdates')}
            </button>
            
            <button
              onClick={() => {
                setAboutOpen(false)
                setWhatsNewOpen(true)
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-lg transition-colors text-sm"
            >
              {t('aboutModal.viewChangelog')}
            </button>

            <a
              href="https://github.com/arnar111/arnarflow"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-lg transition-colors text-sm"
            >
              <Github size={14} />
              {t('aboutModal.viewOnGitHub')}
            </a>
          </div>

          {/* Footer */}
          <p className="text-xs text-zinc-600 flex items-center justify-center gap-1">
            {t('aboutModal.madeWith')} <Heart size={12} className="text-red-500" /> {t('aboutModal.forArnar')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default AboutModal
