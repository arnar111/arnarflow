# ArnarFlow v5.0.0 Roadmap 🚀

## Research Summary

### PM App Trends 2026
Based on analysis of Linear, Notion, Asana, Motion, and emerging tools:

**Key Themes:**
1. **AI-First** - Not just chatbots, but intelligent automation
2. **Reduce Manual Effort** - Auto-scheduling, smart prioritization
3. **Clean, Fast UI** - Linear-style minimal design is dominant
4. **Cross-App Integration** - Everything connects
5. **Focus on Flow** - Reduce context switching

### UI/UX Design Trends 2026

| Trend | Description | Priority |
|-------|-------------|----------|
| **Bento Grid** | Modular cards, Apple-inspired layouts | 🔥 High |
| **Linear Style** | Minimal, fast, keyboard-first | 🔥 High |
| **Glassmorphism** | Subtle glass effects, depth | Medium |
| **Dark Mode Pro** | User expectation, not feature | 🔥 High |
| **Micro-Animations** | Purposeful motion, not decorative | Medium |
| **AI Integrations** | Woven naturally, not bolted on | 🔥 High |
| **Context-Aware** | Time, location, usage patterns | Medium |
| **Scrollytelling** | Animated data narratives | Low |
| **Voice UI** | 42% prefer voice for quick tasks | Future |

---

## ArnarFlow Current State (v4.3.0)

### ✅ Already Implemented
- Dashboard with stats
- Project management
- Task creation with tags, priorities, subtasks
- Kanban board
- Calendar view
- Habits tracking with streaks
- Pomodoro timer
- Daily goals
- Notes/Journal
- Stats view
- Weekly review
- Quick capture
- Keyboard shortcuts
- Global search (Ctrl+P)
- Data export/import
- Icelandic translation
- Dark theme

### 🎯 Missing (Industry Standard)
- AI features
- Time tracking
- Dependencies/blockers
- Roadmap/timeline view
- Integrations (Calendar, etc.)
- Team/collaboration features
- Recurring tasks (partial)
- Notifications system
- Mobile responsive

---

## v5.0.0 Feature Plan

### 🎨 UI/UX Overhaul: "Linear Style"

#### 1. Bento Grid Dashboard (HIGH PRIORITY)
```
┌─────────────────┬──────────┬──────────┐
│                 │  Today   │  Focus   │
│   Quick Stats   │  Tasks   │  Timer   │
│                 │          │          │
├────────┬────────┼──────────┴──────────┤
│ Streak │ Habits │                      │
│  Card  │ Mini   │    Activity Chart    │
├────────┴────────┤                      │
│   Active Proj   │                      │
└─────────────────┴──────────────────────┘
```

**Implementation:**
- CSS Grid with `grid-template-areas`
- Draggable card positions (localStorage)
- Responsive breakpoints
- Smooth resize animations

#### 2. Linear-Style Design System

**Typography:**
- Font: Inter or Geist Sans
- Headings: Semi-bold, tight tracking
- Body: 14px, high line-height
- Monospace: JetBrains Mono for dates/times

**Colors (Dark Mode):**
```css
--bg-primary: #0D0D0D;      /* Near black */
--bg-secondary: #171717;     /* Card background */
--bg-tertiary: #262626;      /* Hover states */
--border: #2E2E2E;           /* Subtle borders */
--text-primary: #FAFAFA;     /* High contrast */
--text-secondary: #A1A1A1;   /* Muted */
--accent: #6366F1;           /* Indigo primary */
--accent-hover: #818CF8;     /* Indigo light */
--success: #22C55E;
--warning: #F59E0B;
--error: #EF4444;
```

**Components:**
- Pill buttons with subtle hover
- Ghost buttons for secondary actions
- Slim scrollbars
- Card shadows: subtle, multi-layer
- Focus rings: accent color, 2px offset

#### 3. Micro-Animations (Motion Design)

**Principles:**
- Speed = Trust (fast animations only)
- Useful, not viral
- Spring physics for natural feel

**Animations to Add:**
- Card enter: scale(0.95) → scale(1), opacity 0→1
- Hover: translateY(-2px), shadow increase
- Complete task: checkmark draw, confetti optional
- View transitions: fade + slight slide
- Loading: skeleton pulse, not spinners
- Drag: lift effect, drop shadow

#### 4. Glassmorphism Accents

**Where to Use:**
- Modal overlays
- Floating elements (Quick Capture)
- Sidebar sections
- NOT cards (keep them solid)

```css
.glass-panel {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

---

### 🤖 AI Features

#### 1. Smart Task Prioritization
**How it works:**
- Analyze task title, due date, project importance
- Consider past completion patterns
- Surface "Focus Today" recommendations
- Re-prioritize automatically when things slip

**UI:**
- ✨ icon next to AI-suggested tasks
- "AI thinks this is urgent" tooltip
- Daily "Focus Mode" suggestion

#### 2. Natural Language Task Creation
**Examples:**
- "Meeting with John tomorrow at 3pm" → Creates task + calendar event
- "Review PR by Friday high priority" → Parses due date + priority
- "Bug: login broken #frontend !urgent" → Tags + priority

**Implementation:**
- Use Gemini API (already have key)
- Parse on blur/enter in task input
- Show preview before creating

#### 3. AI Daily Briefing
**Generate each morning:**
- What's due today
- Suggested focus order
- Predicted time needed
- Blockers to address

#### 4. Smart Autocomplete
- Suggest project based on task title
- Suggest tags based on keywords
- Suggest due date based on context

---

### ⏱️ Time Tracking

#### Design
```
┌────────────────────────────────────────┐
│ 🔴 02:34:15   Task: Fix login bug      │
│ [Project: Frontend] [Pause] [Stop]     │
└────────────────────────────────────────┘
```

**Features:**
- One-click timer start from task
- Timer persists in header bar
- Session history (like Pomodoro)
- Weekly time report by project
- Billable hours toggle
- Export to CSV

**Storage:**
```js
timeSessions: [
  {
    id: string,
    taskId: string,
    projectId: string,
    startTime: timestamp,
    endTime: timestamp,
    duration: seconds,
    billable: boolean
  }
]
```

---

### 🔗 Task Dependencies

#### UI Concept
- In task detail: "Blocked by" dropdown
- Visual indicator: 🔒 icon on blocked tasks
- Auto-move to "Blocked" column in Kanban
- Dependency graph view (future)

**Fields:**
```js
task: {
  blockedBy: [taskId, taskId],
  blocks: [taskId],  // Auto-computed
}
```

---

### 🗓️ Roadmap View (Timeline)

#### Design
```
Q1 2026
├── Jan  ████████░░░░  Project A
├── Feb  ░░████████░░  Project B
└── Mar  ░░░░░░████████ Project C

Q2 2026
├── Apr  ████░░░░░░░░  Project D
```

**Features:**
- Drag to adjust dates
- Zoom: Week / Month / Quarter
- Color by project
- Milestones as diamonds ◆
- Dependencies as arrows

---

### 🔔 Notifications System

#### Types
1. **Due Soon** - Task due in < 2 hours
2. **Overdue** - Task passed due date
3. **Completed** - Team member finished task (future)
4. **Reminder** - Custom time reminders
5. **Streak at Risk** - Haven't completed habits

#### Implementation
- Desktop notifications (Electron)
- In-app notification bell
- Notification preferences in Settings
- Quiet hours setting

---

### 📱 Responsive Design

**Breakpoints:**
- Desktop: > 1024px (current)
- Tablet: 768-1024px
- Mobile: < 768px

**Mobile Adaptations:**
- Sidebar → Bottom nav
- Kanban → Swipeable columns
- Dashboard → Stacked cards
- Quick actions → FAB menu

---

### 🔌 Integrations

#### Phase 1: Google Calendar (v5.0)
- Sync tasks with due date/time
- Two-way sync (optional)
- Show calendar events in timeline
- OAuth flow in Settings

#### Phase 2: Future
- Notion (import)
- Todoist (import)
- Slack (notifications)
- GitHub (issues sync)

---

## Implementation Phases

### Phase 1: UI Overhaul (Week 1-2) ✅ COMPLETE
- [x] New color system (Linear-style dark palette)
- [x] Typography update (Inter font)
- [x] Bento grid dashboard (CSS grid with responsive breakpoints)
- [x] Micro-animations (spring physics, staggered children)
- [x] Glassmorphism accents (modals, floating elements)
- [x] Slim scrollbars (6px width)

### Phase 2: Core Features (Week 3-4) ✅ COMPLETE
- [x] Time tracking (full timer with history and reports)
- [x] Task dependencies (blockedBy field, visual indicators)
- [x] Notifications system (in-app with preferences)
- [ ] Recurring tasks (full) - PARTIAL (existing from v4)

### Phase 3: AI Features (Week 5-6) 🔄 IN PROGRESS
- [x] Smart prioritization (store ready, UI indicators)
- [ ] Natural language input - PENDING
- [ ] Daily briefing - PENDING
- [ ] Smart autocomplete - PENDING

### Phase 4: Views & Polish (Week 7-8) ✅ COMPLETE
- [x] Roadmap view (Gantt-style timeline)
- [x] Responsive mobile (breakpoints, touch optimizations)
- [x] Google Calendar integration (OAuth flow ready)
- [x] Apple Calendar / iCal export

---

## Design Resources

### Inspiration
- **Linear** - linear.app (keyboard-first, minimal)
- **Notion** - notion.so (flexible, blocks)
- **Height** - height.app (beautiful animations)
- **Craft** - craft.do (native feel)
- **Raycast** - raycast.com (speed)

### UI Libraries to Consider
- **Radix UI** - Accessible primitives (Linear uses this)
- **Framer Motion** - Animations
- **TailwindCSS** - Already using? Enhance it
- **shadcn/ui** - Beautiful components

### Fonts
- **Inter** - Modern, readable
- **Geist** - Vercel's font, very Linear-like
- **JetBrains Mono** - Monospace for code/times

### Icons
- **Lucide** - Already using, good choice
- **Phosphor** - Alternative, more playful
- **Heroicons** - Alternative, more minimal

---

## Metrics to Track

- Time to create task
- Tasks completed per day
- Feature usage (analytics)
- Session duration
- Keyboard shortcut usage
- AI feature adoption

---

## Summary: v5.0.0 "The Pro Update" 🎯

**Tagline:** "Professional-grade productivity, beautiful by default"

**Key Additions:**
1. ✨ Linear-style dark UI
2. 📊 Bento grid dashboard
3. ⏱️ Time tracking
4. 🔗 Task dependencies
5. 🗓️ Roadmap view
6. 🤖 AI task features
7. 🔔 Notifications
8. 📱 Mobile responsive
9. 🔌 Google Calendar sync

**Removed/Changed:**
- Old dashboard layout → Bento grid
- Basic animations → Spring physics
- Manual prioritization → AI suggestions

---

---

## ✅ v5.0.0 Implementation Complete

**Implementation Date:** 2026-02-15
**Implemented by:** Blær 🌀

### Completed Features:
1. ✅ **UI Overhaul** - Linear-style colors, Inter font, slim scrollbars, CSS variables
2. ✅ **TimeTracker** - Full component with timer, session history, weekly reports, CSV export
3. ✅ **Task Dependencies** - blockedBy field, visual indicators, blocking logic in store
4. ✅ **NotificationSystem** - Due soon/overdue alerts, quiet hours, notification preferences
5. ✅ **RoadmapView** - Gantt-style timeline, week/month/quarter zoom, today marker
6. ✅ **AI Prioritization** - Store state ready (Gemini API integration pending)
7. ✅ **CalendarSync** - Google Calendar OAuth flow, Apple Calendar iCal export
8. ✅ **Bento Grid** - Dashboard layout with responsive breakpoints
9. ✅ **Mobile Responsive** - Tablet/mobile breakpoints, touch optimizations

### Files Created/Modified:
- `src/index.css` - Complete redesign with Linear-style design system
- `src/store/useStore.js` - Added time tracking, dependencies, notifications state
- `src/components/TimeTracker.jsx` - NEW: Full time tracking component
- `src/components/NotificationSystem.jsx` - NEW: In-app notifications
- `src/components/RoadmapView.jsx` - NEW: Gantt timeline view
- `src/components/CalendarSync.jsx` - NEW: Google/Apple calendar sync
- `src/components/ProjectView.jsx` - Enhanced with dependencies UI
- `src/components/Sidebar.jsx` - Added time tracker widget, notification bell
- `src/App.jsx` - Integrated all new components
- `CHANGELOG.md` - Updated with v5.0.0 changes
- `package.json` - Version bumped to 5.0.0

### Pending (Future Updates):
- Natural language task input
- AI daily briefing
- Smart autocomplete
- Draggable dashboard cards (full implementation)
- Bottom mobile navigation
- Dependency arrows in roadmap view

---

*Last updated: 2026-02-15*
*Author: Blær 🌀*
