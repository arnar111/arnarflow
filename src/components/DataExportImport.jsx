import React, { useState, useRef } from 'react'
import useStore from '../store/useStore'
import { 
  Download, 
  Upload, 
  Check, 
  AlertTriangle, 
  FileJson,
  RefreshCw,
  Trash2
} from 'lucide-react'

export default function DataExportImport({ onClose }) {
  const [status, setStatus] = useState({ type: null, message: '' })
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef(null)
  
  const tasks = useStore(state => state.tasks)
  const projects = useStore(state => state.projects)
  const habits = useStore(state => state.habits)
  const habitLogs = useStore(state => state.habitLogs)
  const ideas = useStore(state => state.ideas)
  const notes = useStore(state => state.notes)
  const pomodoroSessions = useStore(state => state.pomodoroSessions)
  
  // Export all data
  const handleExport = async () => {
    setIsExporting(true)
    setStatus({ type: null, message: '' })
    
    try {
      const exportData = {
        version: '4.3.0',
        exportedAt: new Date().toISOString(),
        data: {
          tasks,
          projects,
          habits,
          habitLogs,
          ideas,
          notes,
          pomodoroSessions,
        }
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `arnarflow-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      setStatus({ 
        type: 'success', 
        message: 'Gögn flutt út! Skjalið hefur verið sótt.' 
      })
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: `Villa við útflutning: ${error.message}` 
      })
    } finally {
      setIsExporting(false)
    }
  }
  
  // Import data from file
  const handleImport = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    setIsImporting(true)
    setStatus({ type: null, message: '' })
    
    try {
      const text = await file.text()
      const importData = JSON.parse(text)
      
      // Validate structure
      if (!importData.data) {
        throw new Error('Ógilt skráarsnið')
      }
      
      // Confirm import
      const confirmed = window.confirm(
        `Þetta mun skipta út núverandi gögnum með:\n\n` +
        `• ${importData.data.tasks?.length || 0} verkefni\n` +
        `• ${importData.data.projects?.length || 0} projects\n` +
        `• ${importData.data.habits?.length || 0} venjur\n` +
        `• ${Object.keys(importData.data.notes || {}).length} glósur\n\n` +
        `Ertu viss?`
      )
      
      if (!confirmed) {
        setIsImporting(false)
        return
      }
      
      // Import each data type
      const store = useStore.getState()
      
      if (importData.data.tasks) {
        useStore.setState({ tasks: importData.data.tasks })
      }
      if (importData.data.projects) {
        useStore.setState({ projects: importData.data.projects })
      }
      if (importData.data.habits) {
        useStore.setState({ habits: importData.data.habits })
      }
      if (importData.data.habitLogs) {
        useStore.setState({ habitLogs: importData.data.habitLogs })
      }
      if (importData.data.ideas) {
        useStore.setState({ ideas: importData.data.ideas })
      }
      if (importData.data.notes) {
        useStore.setState({ notes: importData.data.notes })
      }
      if (importData.data.pomodoroSessions) {
        useStore.setState({ pomodoroSessions: importData.data.pomodoroSessions })
      }
      
      setStatus({ 
        type: 'success', 
        message: 'Gögn flutt inn! Síða endurnýst...' 
      })
      
      // Refresh after 1.5 seconds
      setTimeout(() => {
        window.location.reload()
      }, 1500)
      
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: `Villa við innflutning: ${error.message}` 
      })
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }
  
  // Clear all data
  const handleClearData = () => {
    const confirmed = window.confirm(
      '⚠️ AÐVÖRUN: Þetta mun eyða ÖLLUM gögnum!\n\n' +
      'Þetta er ekki hægt að afturkalla.\n\n' +
      'Ertu viss?'
    )
    
    if (confirmed) {
      const doubleConfirm = window.confirm(
        'Ertu ALVEG viss? Öll gögn tapast.'
      )
      
      if (doubleConfirm) {
        localStorage.removeItem('arnarflow-storage')
        setStatus({ 
          type: 'success', 
          message: 'Gögnum eytt. Endurnýjar...' 
        })
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    }
  }

  const accentColor = useStore(state => state.accentColor)

  return (
    <div className="data-export-import">
      <div className="section">
        <h3>
          <Download size={18} />
          Flytja út gögn
        </h3>
        <p>Sæktu afrits af öllum gögnum sem JSON skrá.</p>
        <button 
          onClick={handleExport}
          disabled={isExporting}
          className="export-btn"
        >
          {isExporting ? (
            <>
              <RefreshCw size={16} className="spin" />
              Flyt út...
            </>
          ) : (
            <>
              <FileJson size={16} />
              Flytja út sem JSON
            </>
          )}
        </button>
      </div>

      <div className="divider" />

      <div className="section">
        <h3>
          <Upload size={18} />
          Flytja inn gögn
        </h3>
        <p>Hladdu inn gögnum úr JSON skrá. Núverandi gögn skiptast út.</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          style={{ display: 'none' }}
          id="import-file"
        />
        <label htmlFor="import-file" className="import-btn">
          {isImporting ? (
            <>
              <RefreshCw size={16} className="spin" />
              Flyt inn...
            </>
          ) : (
            <>
              <Upload size={16} />
              Velja skrá
            </>
          )}
        </label>
      </div>

      <div className="divider" />

      <div className="section danger">
        <h3>
          <Trash2 size={18} />
          Eyða öllum gögnum
        </h3>
        <p>Eyðir öllu og byrjar upp á nýtt. Þetta er ekki hægt að afturkalla!</p>
        <button 
          onClick={handleClearData}
          className="danger-btn"
        >
          <Trash2 size={16} />
          Eyða öllu
        </button>
      </div>

      {status.type && (
        <div className={`status ${status.type}`}>
          {status.type === 'success' ? (
            <Check size={16} />
          ) : (
            <AlertTriangle size={16} />
          )}
          {status.message}
        </div>
      )}

      <style jsx>{`
        .data-export-import {
          padding: 8px 0;
        }

        .section {
          padding: 16px 0;
        }

        .section h3 {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          margin: 0 0 8px 0;
        }

        .section p {
          font-size: 13px;
          color: var(--text-secondary);
          margin: 0 0 12px 0;
        }

        .divider {
          height: 1px;
          background: var(--border-color);
        }

        .export-btn, .import-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: var(--accent-${accentColor});
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 14px;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .export-btn:hover, .import-btn:hover {
          opacity: 0.9;
        }

        .export-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .section.danger {
          
        }

        .danger-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: transparent;
          border: 1px solid #ef4444;
          border-radius: 8px;
          color: #ef4444;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .danger-btn:hover {
          background: #ef4444;
          color: white;
        }

        .status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border-radius: 8px;
          margin-top: 16px;
          font-size: 14px;
        }

        .status.success {
          background: #10b98120;
          color: #10b981;
        }

        .status.error {
          background: #ef444420;
          color: #ef4444;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
