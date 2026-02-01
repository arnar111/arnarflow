import React, { useState } from 'react'
import useStore from '../store/useStore'
import { 
  X, 
  Plus, 
  Repeat, 
  Trash2, 
  Edit2,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

const FREQUENCY_OPTIONS = [
  { id: 'daily', label: 'Daglega', labelEn: 'Daily' },
  { id: 'weekdays', label: 'Virka daga', labelEn: 'Weekdays' },
  { id: 'weekly', label: 'Vikulega', labelEn: 'Weekly' },
  { id: 'biweekly', label: 'Aðra hvora viku', labelEn: 'Biweekly' },
  { id: 'monthly', label: 'Mánaðarlega', labelEn: 'Monthly' },
]

const WEEKDAYS = [
  { id: 0, label: 'Sun', labelIs: 'Sun' },
  { id: 1, label: 'Mon', labelIs: 'Mán' },
  { id: 2, label: 'Tue', labelIs: 'Þri' },
  { id: 3, label: 'Wed', labelIs: 'Mið' },
  { id: 4, label: 'Thu', labelIs: 'Fim' },
  { id: 5, label: 'Fri', labelIs: 'Fös' },
  { id: 6, label: 'Sat', labelIs: 'Lau' },
]

export default function RecurringTasksModal({ onClose }) {
  const language = useStore(state => state.language)
  const projects = useStore(state => state.projects)
  const recurringTasks = useStore(state => state.recurringTasks || [])
  const addRecurringTask = useStore(state => state.addRecurringTask)
  const deleteRecurringTask = useStore(state => state.deleteRecurringTask)
  const toggleRecurringTask = useStore(state => state.toggleRecurringTask)
  const accentColor = useStore(state => state.accentColor)

  const [isAdding, setIsAdding] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    projectId: '',
    frequency: 'daily',
    weekdays: [], // for 'weekly' frequency
    priority: 'medium',
  })

  const handleAddTask = () => {
    if (!newTask.title.trim()) return
    
    addRecurringTask({
      ...newTask,
      enabled: true,
      createdAt: new Date().toISOString(),
    })
    
    setNewTask({
      title: '',
      projectId: '',
      frequency: 'daily',
      weekdays: [],
      priority: 'medium',
    })
    setIsAdding(false)
  }

  const toggleWeekday = (dayId) => {
    setNewTask(prev => ({
      ...prev,
      weekdays: prev.weekdays.includes(dayId)
        ? prev.weekdays.filter(d => d !== dayId)
        : [...prev.weekdays, dayId]
    }))
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-left">
            <Repeat size={20} />
            <h2>{language === 'is' ? 'Endurtekin verkefni' : 'Recurring Tasks'}</h2>
          </div>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          {/* Existing recurring tasks */}
          <div className="tasks-list">
            {recurringTasks.length === 0 ? (
              <div className="empty-state">
                <Repeat size={48} className="empty-icon" />
                <p>
                  {language === 'is' 
                    ? 'Engin endurtekin verkefni enn' 
                    : 'No recurring tasks yet'}
                </p>
                <p className="sub">
                  {language === 'is'
                    ? 'Bættu við verkefnum sem endurtaka sig sjálfkrafa'
                    : 'Add tasks that repeat automatically'}
                </p>
              </div>
            ) : (
              recurringTasks.map(task => {
                const project = projects.find(p => p.id === task.projectId)
                const freq = FREQUENCY_OPTIONS.find(f => f.id === task.frequency)
                
                return (
                  <div key={task.id} className={`task-item ${!task.enabled ? 'disabled' : ''}`}>
                    <button 
                      className="toggle-btn"
                      onClick={() => toggleRecurringTask(task.id)}
                    >
                      {task.enabled ? (
                        <CheckCircle size={18} className="enabled" />
                      ) : (
                        <AlertCircle size={18} className="disabled-icon" />
                      )}
                    </button>
                    
                    <div className="task-info">
                      <span className="task-title">{task.title}</span>
                      <div className="task-meta">
                        {project && (
                          <span className="project-tag" style={{ color: project.color }}>
                            {project.name}
                          </span>
                        )}
                        <span className="frequency">
                          <Repeat size={12} />
                          {language === 'is' ? freq?.label : freq?.labelEn}
                        </span>
                      </div>
                    </div>
                    
                    <button 
                      className="delete-btn"
                      onClick={() => deleteRecurringTask(task.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )
              })
            )}
          </div>

          {/* Add new recurring task */}
          {isAdding ? (
            <div className="add-form">
              <input
                type="text"
                placeholder={language === 'is' ? 'Nafn verkefnis...' : 'Task name...'}
                value={newTask.title}
                onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                className="task-input"
                autoFocus
              />
              
              <div className="form-row">
                <label>{language === 'is' ? 'Verkefni' : 'Project'}</label>
                <select
                  value={newTask.projectId}
                  onChange={e => setNewTask({ ...newTask, projectId: e.target.value })}
                  className="select"
                >
                  <option value="">{language === 'is' ? 'Ekkert verkefni' : 'No project'}</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <label>{language === 'is' ? 'Tíðni' : 'Frequency'}</label>
                <select
                  value={newTask.frequency}
                  onChange={e => setNewTask({ ...newTask, frequency: e.target.value })}
                  className="select"
                >
                  {FREQUENCY_OPTIONS.map(opt => (
                    <option key={opt.id} value={opt.id}>
                      {language === 'is' ? opt.label : opt.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              {newTask.frequency === 'weekly' && (
                <div className="form-row">
                  <label>{language === 'is' ? 'Dagar' : 'Days'}</label>
                  <div className="weekday-buttons">
                    {WEEKDAYS.map(day => (
                      <button
                        key={day.id}
                        className={`weekday-btn ${newTask.weekdays.includes(day.id) ? 'active' : ''}`}
                        onClick={() => toggleWeekday(day.id)}
                      >
                        {language === 'is' ? day.labelIs : day.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-row">
                <label>{language === 'is' ? 'Forgangur' : 'Priority'}</label>
                <select
                  value={newTask.priority}
                  onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                  className="select"
                >
                  <option value="low">{language === 'is' ? 'Lágur' : 'Low'}</option>
                  <option value="medium">{language === 'is' ? 'Miðlungs' : 'Medium'}</option>
                  <option value="high">{language === 'is' ? 'Hár' : 'High'}</option>
                </select>
              </div>

              <div className="form-actions">
                <button onClick={() => setIsAdding(false)} className="cancel-btn">
                  {language === 'is' ? 'Hætta við' : 'Cancel'}
                </button>
                <button onClick={handleAddTask} className="save-btn" disabled={!newTask.title.trim()}>
                  <Plus size={16} />
                  {language === 'is' ? 'Bæta við' : 'Add'}
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setIsAdding(true)} className="add-btn">
              <Plus size={16} />
              {language === 'is' ? 'Bæta við endurteknu verkefni' : 'Add recurring task'}
            </button>
          )}
        </div>

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }

          .modal {
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            width: 90%;
            max-width: 500px;
            max-height: 80vh;
            display: flex;
            flex-direction: column;
          }

          .modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px 24px;
            border-bottom: 1px solid var(--border-color);
          }

          .header-left {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .header-left h2 {
            margin: 0;
            font-size: 18px;
          }

          .close-btn {
            padding: 8px;
            background: none;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            border-radius: 8px;
            transition: all 0.2s;
          }

          .close-btn:hover {
            background: var(--bg-secondary);
            color: var(--text-primary);
          }

          .modal-content {
            flex: 1;
            overflow-y: auto;
            padding: 24px;
          }

          .tasks-list {
            margin-bottom: 20px;
          }

          .empty-state {
            text-align: center;
            padding: 40px 20px;
            color: var(--text-secondary);
          }

          .empty-icon {
            opacity: 0.3;
            margin-bottom: 16px;
          }

          .empty-state p {
            margin: 0;
          }

          .empty-state .sub {
            font-size: 13px;
            margin-top: 4px;
            opacity: 0.7;
          }

          .task-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            background: var(--bg-secondary);
            border-radius: 12px;
            margin-bottom: 8px;
            transition: opacity 0.2s;
          }

          .task-item.disabled {
            opacity: 0.5;
          }

          .toggle-btn {
            padding: 4px;
            background: none;
            border: none;
            cursor: pointer;
          }

          .toggle-btn .enabled {
            color: var(--accent-${accentColor});
          }

          .toggle-btn .disabled-icon {
            color: var(--text-secondary);
          }

          .task-info {
            flex: 1;
          }

          .task-title {
            display: block;
            font-weight: 500;
            margin-bottom: 4px;
          }

          .task-meta {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 12px;
            color: var(--text-secondary);
          }

          .project-tag {
            font-weight: 500;
          }

          .frequency {
            display: flex;
            align-items: center;
            gap: 4px;
          }

          .delete-btn {
            padding: 8px;
            background: none;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            border-radius: 8px;
            transition: all 0.2s;
          }

          .delete-btn:hover {
            background: #ef444420;
            color: #ef4444;
          }

          .add-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: 100%;
            padding: 14px;
            background: var(--accent-${accentColor});
            border: none;
            border-radius: 12px;
            color: white;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: opacity 0.2s;
          }

          .add-btn:hover {
            opacity: 0.9;
          }

          .add-form {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 16px;
          }

          .task-input {
            width: 100%;
            padding: 12px;
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            color: var(--text-primary);
            font-size: 15px;
            margin-bottom: 16px;
            outline: none;
          }

          .task-input:focus {
            border-color: var(--accent-${accentColor});
          }

          .form-row {
            margin-bottom: 12px;
          }

          .form-row label {
            display: block;
            font-size: 12px;
            color: var(--text-secondary);
            margin-bottom: 6px;
          }

          .select {
            width: 100%;
            padding: 10px;
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            color: var(--text-primary);
            font-size: 14px;
            outline: none;
          }

          .weekday-buttons {
            display: flex;
            gap: 6px;
          }

          .weekday-btn {
            flex: 1;
            padding: 8px 4px;
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            color: var(--text-secondary);
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
          }

          .weekday-btn.active {
            background: var(--accent-${accentColor});
            border-color: var(--accent-${accentColor});
            color: white;
          }

          .form-actions {
            display: flex;
            gap: 12px;
            margin-top: 16px;
          }

          .cancel-btn, .save-btn {
            flex: 1;
            padding: 12px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
          }

          .cancel-btn {
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            color: var(--text-primary);
          }

          .save-btn {
            background: var(--accent-${accentColor});
            border: none;
            color: white;
          }

          .save-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        `}</style>
      </div>
    </div>
  )
}
