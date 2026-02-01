import React, { useState, useMemo, useEffect, useRef } from 'react'
import useStore from '../store/useStore'
import { 
  Plus, 
  Search, 
  Calendar, 
  Edit3, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Save,
  X,
  FileText
} from 'lucide-react'

// Helper to get date string
const getDateStr = (date) => date.toISOString().split('T')[0]

// Format date nicely in Icelandic
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const days = ['Sun', 'Mán', 'Þri', 'Mið', 'Fim', 'Fös', 'Lau']
  const months = ['jan', 'feb', 'mar', 'apr', 'maí', 'jún', 'júl', 'ágú', 'sep', 'okt', 'nóv', 'des']
  return `${days[date.getDay()]} ${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}`
}

// Format date for display
const formatDateShort = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getDate()}. ${['jan', 'feb', 'mar', 'apr', 'maí', 'jún', 'júl', 'ágú', 'sep', 'okt', 'nóv', 'des'][date.getMonth()]}`
}

export default function NotesView() {
  const notes = useStore(state => state.notes || {})
  const addNote = useStore(state => state.addNote)
  const updateNote = useStore(state => state.updateNote)
  const deleteNote = useStore(state => state.deleteNote)
  const accentColor = useStore(state => state.accentColor)
  
  const [selectedDate, setSelectedDate] = useState(getDateStr(new Date()))
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const textareaRef = useRef(null)

  // Get current note
  const currentNote = notes[selectedDate]
  
  // Get all dates with notes
  const noteDates = useMemo(() => {
    return Object.keys(notes).sort().reverse()
  }, [notes])
  
  // Filtered notes for search
  const filteredDates = useMemo(() => {
    if (!searchQuery) return noteDates
    const query = searchQuery.toLowerCase()
    return noteDates.filter(date => 
      notes[date]?.content?.toLowerCase().includes(query)
    )
  }, [notes, noteDates, searchQuery])

  // Start editing
  const handleEdit = () => {
    setEditContent(currentNote?.content || '')
    setIsEditing(true)
  }

  // Save note
  const handleSave = () => {
    if (editContent.trim()) {
      if (currentNote) {
        updateNote(selectedDate, editContent)
      } else {
        addNote(selectedDate, editContent)
      }
    }
    setIsEditing(false)
  }

  // Cancel editing
  const handleCancel = () => {
    setIsEditing(false)
    setEditContent('')
  }

  // Delete note
  const handleDelete = () => {
    if (window.confirm('Ertu viss um að eyða þessari glósu?')) {
      deleteNote(selectedDate)
      setIsEditing(false)
    }
  }

  // Navigate dates
  const goToPreviousDay = () => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() - 1)
    setSelectedDate(getDateStr(date))
  }

  const goToNextDay = () => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() + 1)
    setSelectedDate(getDateStr(date))
  }

  const goToToday = () => {
    setSelectedDate(getDateStr(new Date()))
  }

  // Focus textarea when editing
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.selectionStart = textareaRef.current.value.length
    }
  }, [isEditing])

  const isToday = selectedDate === getDateStr(new Date())

  return (
    <div className="notes-view">
      {/* Header */}
      <div className="notes-header">
        <div className="notes-title">
          <FileText size={24} />
          <h1>Glósur</h1>
        </div>
        <div className="notes-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Leita í glósum..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="notes-content">
        {/* Sidebar with dates */}
        <div className="notes-sidebar">
          <button 
            className="new-note-btn"
            onClick={() => {
              goToToday()
              handleEdit()
            }}
          >
            <Plus size={16} />
            Ný glósa
          </button>

          <div className="notes-list">
            {filteredDates.length === 0 ? (
              <div className="no-notes">
                {searchQuery ? 'Engar glósur fundust' : 'Engar glósur enn'}
              </div>
            ) : (
              filteredDates.map(date => (
                <button
                  key={date}
                  className={`note-item ${date === selectedDate ? 'active' : ''}`}
                  onClick={() => setSelectedDate(date)}
                >
                  <span className="note-date">{formatDateShort(date)}</span>
                  <span className="note-preview">
                    {notes[date]?.content?.slice(0, 50)}...
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main editor */}
        <div className="notes-main">
          {/* Date navigation */}
          <div className="date-nav">
            <button onClick={goToPreviousDay} className="nav-btn">
              <ChevronLeft size={20} />
            </button>
            <div className="date-display">
              <Calendar size={16} />
              <span>{formatDate(selectedDate)}</span>
              {isToday && <span className="today-badge">Í dag</span>}
            </div>
            <button onClick={goToNextDay} className="nav-btn">
              <ChevronRight size={20} />
            </button>
            {!isToday && (
              <button onClick={goToToday} className="today-btn">
                Í dag
              </button>
            )}
          </div>

          {/* Note content */}
          <div className="note-editor">
            {isEditing ? (
              <>
                <textarea
                  ref={textareaRef}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Skrifaðu glósur hér..."
                  className="note-textarea"
                />
                <div className="editor-actions">
                  <button onClick={handleCancel} className="cancel-btn">
                    <X size={16} />
                    Hætta við
                  </button>
                  <button onClick={handleSave} className="save-btn">
                    <Save size={16} />
                    Vista
                  </button>
                </div>
              </>
            ) : currentNote ? (
              <>
                <div className="note-display">
                  {currentNote.content.split('\n').map((line, i) => (
                    <p key={i}>{line || '\u00A0'}</p>
                  ))}
                </div>
                <div className="display-actions">
                  <button onClick={handleEdit} className="edit-btn">
                    <Edit3 size={16} />
                    Breyta
                  </button>
                  <button onClick={handleDelete} className="delete-btn">
                    <Trash2 size={16} />
                    Eyða
                  </button>
                </div>
                <div className="note-meta">
                  Síðast breytt: {new Date(currentNote.updatedAt).toLocaleString('is-IS')}
                </div>
              </>
            ) : (
              <div className="empty-note">
                <FileText size={48} className="empty-icon" />
                <p>Engin glósa fyrir þennan dag</p>
                <button onClick={handleEdit} className="start-writing-btn">
                  <Edit3 size={16} />
                  Skrifa glósu
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .notes-view {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
        }

        .notes-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-color);
        }

        .notes-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .notes-title h1 {
          margin: 0;
          font-size: 24px;
        }

        .notes-search {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 8px 12px;
          width: 250px;
        }

        .notes-search input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-size: 14px;
        }

        .notes-content {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        .notes-sidebar {
          width: 250px;
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          background: var(--bg-secondary);
        }

        .new-note-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin: 16px;
          padding: 10px;
          background: var(--accent-${accentColor});
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .new-note-btn:hover {
          opacity: 0.9;
        }

        .notes-list {
          flex: 1;
          overflow-y: auto;
          padding: 0 8px 16px;
        }

        .note-item {
          width: 100%;
          text-align: left;
          padding: 12px;
          border: none;
          background: none;
          border-radius: 8px;
          cursor: pointer;
          margin-bottom: 4px;
          transition: background 0.2s;
        }

        .note-item:hover {
          background: var(--bg-tertiary);
        }

        .note-item.active {
          background: var(--accent-${accentColor})20;
        }

        .note-date {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .note-preview {
          display: block;
          font-size: 12px;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .no-notes {
          text-align: center;
          color: var(--text-secondary);
          padding: 24px;
          font-size: 14px;
        }

        .notes-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .date-nav {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 24px;
          border-bottom: 1px solid var(--border-color);
        }

        .nav-btn {
          padding: 8px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          cursor: pointer;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .nav-btn:hover {
          background: var(--bg-tertiary);
        }

        .date-display {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 500;
        }

        .today-badge {
          font-size: 12px;
          padding: 2px 8px;
          background: var(--accent-${accentColor})20;
          color: var(--accent-${accentColor});
          border-radius: 12px;
        }

        .today-btn {
          margin-left: auto;
          padding: 6px 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
          color: var(--text-primary);
          transition: background 0.2s;
        }

        .today-btn:hover {
          background: var(--bg-tertiary);
        }

        .note-editor {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
        }

        .note-textarea {
          width: 100%;
          height: calc(100% - 60px);
          min-height: 300px;
          padding: 16px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          color: var(--text-primary);
          font-size: 15px;
          line-height: 1.7;
          resize: none;
          outline: none;
          font-family: inherit;
        }

        .note-textarea:focus {
          border-color: var(--accent-${accentColor});
        }

        .editor-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 16px;
        }

        .cancel-btn, .save-btn, .edit-btn, .delete-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .cancel-btn {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
        }

        .save-btn {
          background: var(--accent-${accentColor});
          border: none;
          color: white;
        }

        .note-display {
          background: var(--bg-secondary);
          border-radius: 12px;
          padding: 24px;
          min-height: 200px;
        }

        .note-display p {
          margin: 0 0 12px 0;
          line-height: 1.7;
          font-size: 15px;
        }

        .display-actions {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }

        .edit-btn {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
        }

        .delete-btn {
          background: none;
          border: 1px solid var(--border-color);
          color: #ef4444;
        }

        .note-meta {
          margin-top: 16px;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .empty-note {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          color: var(--text-secondary);
        }

        .empty-icon {
          opacity: 0.3;
          margin-bottom: 16px;
        }

        .empty-note p {
          margin: 0 0 16px 0;
        }

        .start-writing-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: var(--accent-${accentColor});
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 14px;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .start-writing-btn:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  )
}
