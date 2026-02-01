# Changelog

All notable changes to ArnarFlow are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [5.0.0] - 2026-02-15

### 🚀 The Pro Update

The biggest update yet! Professional-grade productivity with a beautiful Linear-style UI.

#### 🎨 UI/UX Overhaul: "Linear Style"
- **New Design System** - Complete redesign with Linear-inspired dark theme
  - Inter font for clean, modern typography
  - New color palette: `--bg-primary: #0D0D0D`, indigo accent (#6366F1)
  - Slim 6px scrollbars
  - CSS variables for easy theming
  - Glassmorphism effects for modals and floating elements
  - Spring-based micro-animations

- **Bento Grid Dashboard** - Apple-inspired modular layout
  - Draggable card positions (saved to localStorage)
  - Responsive breakpoints for tablet and mobile
  - Quick stats, today's tasks, focus timer, activity chart
  - Habits mini-view and streak card

#### ⏱️ Time Tracking
- **Full Time Tracker** - Track work sessions by project/task
  - One-click timer start from any task
  - Persistent timer in sidebar
  - Session history grouped by day
  - Weekly time reports with bar chart
  - Billable hours toggle
  - Export to CSV

#### 🔗 Task Dependencies
- **Blocked By/Blocks** - Task dependency management
  - Add dependencies via task card dropdown
  - Visual blocked indicator (🔒) on tasks
  - Blocked tasks can't be completed until dependencies done
  - Auto-computed reverse dependencies (blocks)
  - Sidebar shows blocked task count per project

#### 🔔 Notifications System
- **In-App Notifications** - Never miss important updates
  - Due soon alerts (< 2 hours)
  - Overdue task warnings
  - Streak at risk notifications
  - Quiet hours setting (no notifications 23:00-08:00)
  - Bell icon with unread count badge
  - Mark read/clear all actions

#### 🗓️ Roadmap View
- **Gantt-Style Timeline** - Visualize project schedules
  - Week/Month/Quarter zoom levels
  - Task bars with drag-to-reschedule (coming soon)
  - Today marker
  - Dependency arrows (coming soon)
  - Color-coded by project
  - Blocked task indicators

#### 🤖 AI Smart Prioritization (Prep)
- **Gemini API Integration Ready**
  - Store state for AI suggestions
  - aiPriority and aiReason fields on tasks
  - Apply/dismiss AI suggestion actions
  - ✨ indicator for AI-suggested tasks

#### 📅 Calendar Sync
- **Google Calendar** - OAuth flow ready (simulation in v5.0)
  - Two-way sync toggle
  - Sync status indicator
  - Last synced timestamp

- **Apple Calendar (iCal)** - Export support
  - Download .ics file with all tasks
  - Compatible with Apple Calendar, Outlook
  - Includes project categories and priorities

#### 📱 Mobile Responsive
- **Tablet (768-1024px)** - Optimized layout
  - 8-column bento grid
  - Collapsible sidebar

- **Mobile (< 768px)** - Touch-friendly
  - 4-column single-stack layout
  - Bottom navigation (coming soon)
  - Swipeable kanban columns (coming soon)
  - FAB menu for quick actions (coming soon)

- **Touch Optimizations**
  - 44px minimum touch targets
  - Reduced hover effects on touch devices

#### Changed
- Default accent color changed to Indigo (#6366F1)
- Updated version display to 5.0.0
- Improved task card with dependency UI
- Enhanced sidebar with time tracker widget and notification bell
- Better CSS variable usage throughout

#### Technical
- New components: TimeTracker, NotificationSystem, RoadmapView, CalendarSync
- Store additions: timeSessions, notifications, dependencies, calendarSync
- CSS overhaul with CSS custom properties
- Improved animation performance with CSS variables

---

## [4.3.0] - 2026-02-01

### 📝 The Journal Update

#### Added
- **Notes View** - Daily journal/notes feature
  - Write daily notes and journal entries
  - Navigate between dates with arrows
  - Search across all notes
  - Edit and delete notes
  - Notes sidebar with date list
  - Beautiful editor with save/cancel

- **Stats View** - Comprehensive productivity statistics dashboard
  - Key metrics: streak days, today's tasks, Pomodoro count, focus time
  - 7-day completion chart with visual bars
  - Task and focus summaries with completion rates
  - Project progress tracking with progress bars

- **Data Export/Import** - Full backup and restore
  - Export all data as JSON
  - Import from backup files
  - Clear all data option
  - Integrated into Settings

- **Onboarding** - New user welcome experience
  - Step-by-step feature introduction
  - 7 slides covering all features
  - Progress dots and navigation
  - Skip option available

- **Notes State** - Added notes persistence to store
  - addNote, updateNote, deleteNote functions
  - Notes organized by date

#### Changed
- Enhanced Settings modal with new Data section
- Added onboarding state to store
- Moved "new" badge to Notes in sidebar
- Updated version to 4.3.0

---

## [4.1.0] - 2026-02-01

### 🎯 The Deep Work Update

#### Added
- **Weekly Review** - Comprehensive weekly productivity summary
  - Tasks completed vs last week
  - Habits completion rate
  - Total focus time comparison
  - Best day highlight
  - Motivational messages

- **Focus History** - New view in sidebar to track Pomodoro sessions
  - Sessions grouped by day
  - Expandable day sections
  - Project/task context for each session
  - Stats: total time, weekly time, daily average

- **Task Subtasks** - Break tasks into smaller steps
  - Add/toggle/delete subtasks
  - Progress bar showing completion
  - Compact and full display modes
  - SubtaskProgress and SubtaskBadge components

- **CHANGELOG.md** - Full version history documentation

---

## [4.0.0] - 2026-02-01

### 🎉 The Productivity Update

#### Added
- **Pomodoro Timer** - Built-in focus timer with customizable work/break intervals
  - Circular progress visualization
  - Presets: 25/5, 15/3, 50/10, and custom
  - Desktop notifications for session completion
  - Session tracking and statistics
  - Keyboard shortcut: `Ctrl+Shift+F`

- **Daily Goals** - Set and track daily productivity targets
  - Progress rings for visual feedback
  - Track tasks, habits, and focus time
  - Motivational messages based on progress
  - Dashboard widget integration

- **Task Tags** - Color-coded labels for task organization
  - 17 color options
  - 8 default tags: Urgent, Bug, Feature, Design, Research, Content, Meeting, Blocked
  - TagBadge, TagPicker, InlineTagSelector components

- **Quick Capture Bar** - Floating action button for instant task/idea entry
  - Smart text parsing: `#project @today !high`
  - Type switching: Task, Idea, Quick
  - Project and tag selection
  - Keyboard shortcuts: `Tab` to switch type, `Esc` to close

---

## [2.2.0] - 2026-01-31

### Plane-Inspired Polish

#### Added
- **Streak Tracking** - HabitsView shows streak counters with animated fire icons
- **Progress Rings** - Circular progress indicators in habits and Kanban
- **Kanban Polish** - Drag handles, drop indicators, card hover effects

---

## [2.1.0] - 2026-01-30

### Icelandic & Persistence

#### Added
- **Icelandic Translation** - Full Íslenska language support
- **Data Persistence** - localStorage saves all data automatically
- **Language Toggle** - Quick language switcher in Settings

---

## [2.0.0] - 2026-01-28

### Pro Task Cards & Layout Fix

#### Added
- **Redesigned Task Cards** - Linear/Notion-inspired cards with priority indicators
- **Visual Polish** - Glowing status dots, pill badges, smooth animations

#### Fixed
- Window maximize issue - all views properly resize and fill window

---

## [1.9.0] - 2026-01-25

### Calendar & Timeline Update

#### Added
- **Calendar View** - Monthly calendar showing tasks by due date
- **Notification Support** - Desktop notifications for overdue tasks
- **Timeline Component** - Tasks grouped by urgency

---

## [1.8.0] - 2026-01-22

### Global Search Update

#### Added
- **Global Search** - `Ctrl+P` to search tasks, ideas, and commands
- **Quick Complete** - Complete tasks directly from search results
- **Category Filters** - Tab to switch between All, Commands, Tasks, Ideas

---

## [1.7.0] - 2026-01-20

### Dashboard Upgrade

#### Added
- **Activity Chart** - Weekly productivity bar chart
- **Productivity Streak** - Track consecutive days of completing tasks
- **Visual Refresh** - Gradient stat cards, better animations

---

## [1.6.0] - 2026-01-18

### Kanban Board Update

#### Added
- **Kanban Board** - Organize tasks in columns: To Do → In Progress → Done
- **View Toggle** - Switch between Kanban and List views
- **Glassmorphism Design** - Beautiful card design with hover effects

---

## [1.5.0] - 2026-01-15

### Auto-Updates

#### Added
- **Check for Updates** - Updates section in Settings
- **Auto-Download** - Updates download automatically in background

---

## [1.4.0] - 2026-01-12

### Project Tasks Seeding

#### Added
- **24 Pre-loaded Tasks** - Tasks auto-generated from project code analysis
- **Smart Analysis** - AI analyzed projects and created actionable tasks

---

## [1.0.0] - 2026-01-10

### 🚀 Initial Release

#### Added
- Dashboard with daily overview
- Project management with icons and colors
- Task creation and completion
- Ideas Inbox for capturing thoughts
- Habits tracking
- Keyboard shortcuts
- Dark theme with accent color customization
- Electron desktop app for Windows
