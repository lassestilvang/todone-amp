# Phase 2: Essential Features - Implementation Checklist

**Phase**: 2 / 4  
**Status**: Starting  
**Priority**: High  
**Estimated Duration**: 3-4 weeks  
**Target Items**: 70+

---

## 1. Task Detail Panel & Editing ✅ (Week 1 Complete - 85%)

### Components
- [x] TaskDetailPanel component (modal/drawer)
- [x] DatePickerInput component with calendar picker
- [x] TimePickerInput component with preset times
- [x] PrioritySelector component with P1-P4 buttons
- [x] ProjectSelector component with project dropdown
- [x] SectionSelector component (placeholder for future sections CRUD)
- [ ] LabelMultiSelect component (Phase 2, Week 2)
- [ ] AssigneeSelector component (Phase 3 - Team collaboration)

### Functionality
- [x] Open task detail on task item click
- [x] Close detail panel with Escape key
- [x] Edit task content/title
- [x] Edit task description
- [x] Change due date with calendar picker (supports natural language: "today", "tomorrow", "in 3 days")
- [x] Set/change due time with time picker (supports natural language: "at 3pm", "at 14:00")
- [x] Change priority (P1-P4)
- [x] Change project (clears section on project change)
- [x] Change section (placeholder - will be expanded)
- [ ] Add/remove labels (Phase 2, Week 3)
- [ ] Add/remove assignee (Phase 3)
- [x] Delete task with confirmation modal
- [x] Save changes to IndexedDB
- [x] Show unsaved changes indicator
- [x] Discard changes on close without save (with confirmation)
- [ ] Task history in detail panel (Phase 3 - Activity log)

### Store Changes
- [x] Add taskDetailStore for editing state (useTaskDetailStore created)
- [x] TaskStore.updateTask method works (Phase 1 foundation)
- [ ] Handle conflicts during editing (for Phase 3+)

---

## 2. Quick Add Modal ⬜

### Components
- [ ] QuickAddModal component
- [ ] TaskInputField with suggestions
- [ ] SuggestionsDropdown component
- [ ] InputChips for selected properties
- [ ] RecentTasksList (history)

### Functionality
- [ ] Trigger with Cmd/Ctrl + K
- [ ] Close with Escape
- [ ] Parse natural language:
  - [ ] Due dates: "tomorrow", "next Monday", "Jan 15", "in 3 days"
  - [ ] Times: "at 3pm", "at 14:00"
  - [ ] Priority: "p1", "p2", "p3", "p4", "!!!", "!!", "!"
  - [ ] Labels: "@label_name"
  - [ ] Projects: "#project_name"
  - [ ] Assignee: "+person_name" (prepare)
  - [ ] Recurring: "every day", "every Monday" (prepare)
  - [ ] Duration: "for 1h", "for 30min"
- [ ] Show smart suggestions as user types
- [ ] Display extracted properties as chips
- [ ] Edit individual properties via chips
- [ ] Create task on Enter
- [ ] Add to recent history
- [ ] Show recent quick add items
- [ ] Clear recent history option
- [ ] Custom keyboard shortcuts

### Utilities
- [ ] Enhance parseNaturalLanguageDate (already partial)
- [ ] Enhance parseNaturalLanguageTime (already partial)
- [ ] Create parseNaturalLanguagePriority()
- [ ] Create parseNaturalLanguageLabel()
- [ ] Create parseNaturalLanguageProject()
- [ ] Create parseNaturalLanguageDuration()
- [ ] Create TaskParser class combining all

### Store Changes
- [ ] Add quickAddStore for recent history
- [ ] Store last 10-20 quick add items
- [ ] Persist to localStorage

---

## 3. Keyboard Shortcuts System ⬜

### Implementation
- [ ] KeyboardShortcutsManager class
- [ ] ShortcutsStore in Zustand
- [ ] Global keyboard event listener
- [ ] useKeyboardShortcut custom hook
- [ ] Prevent conflicts with browser defaults

### Core Shortcuts
- [ ] `Ctrl/Cmd + K`: Quick add / Command palette
- [ ] `Q`: Quick add task
- [ ] `A`: Add task at end of list
- [ ] `Shift + A`: Add task at top of list
- [ ] `Ctrl/Cmd + S`: Save current task
- [ ] `Escape`: Cancel/close
- [ ] `Ctrl/Cmd + Enter`: Complete task
- [ ] `1`: Set priority P1
- [ ] `2`: Set priority P2
- [ ] `3`: Set priority P3
- [ ] `4`: Set priority P4
- [ ] `T`: Set due date to today
- [ ] `Y`: Set due date to yesterday
- [ ] `M`: Set due date to tomorrow
- [ ] `W`: Set due date to next week
- [ ] `/`: Focus search
- [ ] `G then I`: Go to Inbox
- [ ] `G then T`: Go to Today
- [ ] `G then U`: Go to Upcoming
- [ ] `↑/↓`: Navigate tasks
- [ ] `Ctrl/Cmd + ↑/↓`: Move task up/down
- [ ] `Ctrl/Cmd + ]`: Indent (make sub-task)
- [ ] `Ctrl/Cmd + [`: Outdent

### UI
- [ ] Shortcuts help modal (? key)
- [ ] Customizable shortcuts in settings (Phase 4)
- [ ] Shortcut hints in tooltips
- [ ] Conflict detection and warnings
- [ ] Display current shortcuts in modal

### Components
- [ ] KeyboardShortcutsHelp component
- [ ] ShortcutsList component
- [ ] ShortcutInput component (for customization)

---

## 4. Drag & Drop ⬜

### Setup
- [ ] Install @dnd-kit packages
- [ ] DragDropContext wrapper component
- [ ] useDroppable and useDraggable hooks

### Task Reordering
- [ ] Draggable task items
- [ ] Drop preview feedback
- [ ] Reorder tasks in same list
- [ ] Update order in database
- [ ] Animate position changes
- [ ] Keyboard support for drag/drop

### Cross-Container Drag
- [ ] Drag task to different project
- [ ] Drag task to different section
- [ ] Drag task between views
- [ ] Visual drop zone indicators
- [ ] Prevent invalid drops
- [ ] Undo invalid drops

### Sections
- [ ] Drag to reorder sections
- [ ] Drag tasks between sections
- [ ] Create new section via drag
- [ ] Collapse/expand sections

### Components
- [ ] DraggableTaskItem component
- [ ] DroppableSection component
- [ ] DroppableProject component
- [ ] DragPreview component

### Store Changes
- [ ] DragStore for drag state
- [ ] Update TaskStore.updateTaskOrder()
- [ ] Update ProjectStore.updateSectionOrder()

---

## 5. Filters & Labels System ⬜

### Labels
- [ ] Create labels with names and colors
- [ ] Edit label properties
- [ ] Delete labels
- [ ] Labels table in database (verify)
- [ ] Add labels to tasks
- [ ] Remove labels from tasks
- [ ] Display labels on task items
- [ ] Label colors (20+ options)

### Components
- [ ] LabelSelector component
- [ ] LabelColorPicker component
- [ ] LabelList component
- [ ] LabelManagement panel
- [ ] LabelBadge component

### Filtering
- [ ] Filter tasks by label
- [ ] Filter tasks by multiple labels (AND/OR)
- [ ] Show label usage count
- [ ] Label-based views
- [ ] Add/remove filters UI
- [ ] Clear filters button

### Custom Filters
- [ ] Query builder UI
- [ ] Save custom filter
- [ ] Edit saved filter
- [ ] Delete saved filter
- [ ] Filters to favorites
- [ ] Filter suggestions

### Query Syntax
- [ ] Parse: `search: keyword`
- [ ] Parse: `today`, `tomorrow`, `7 days`, `overdue`
- [ ] Parse: `p1`, `p2`, `p3`, `p4`
- [ ] Parse: `@label_name`, `@label*`
- [ ] Parse: `#project_name`, `##parent_project`
- [ ] Parse: `/section_name`
- [ ] Parse: `assigned to: name`, `assigned by: name`
- [ ] Parse: `created: date`, `created before: date`
- [ ] Parse: `recurring`
- [ ] Parse: `subtask`, `!subtask`
- [ ] Operators: `&` (and), `|` (or), `!` (not)

### Store Changes
- [ ] FilterStore for saved filters
- [ ] LabelStore for label management
- [ ] Update TaskStore.filterTasks() with new logic

---

## 6. Search & Command Palette ⬜

### Command Palette
- [ ] CommandPalette component
- [ ] Trigger with Cmd/Ctrl + K (shared with Quick Add)
- [ ] Smart mode detection (new task vs. search)
- [ ] Show suggestions while typing
- [ ] Real-time search results

### Search Features
- [ ] Search by task content
- [ ] Search by project name
- [ ] Search by label name
- [ ] Search by filter name
- [ ] Search by person name
- [ ] Combined search results
- [ ] Keyboard navigation through results
- [ ] Jump to project on select
- [ ] Jump to filter on select
- [ ] Jump to label on select
- [ ] Open task on select

### UI
- [ ] Recent searches list
- [ ] Search history storage
- [ ] Clear search history
- [ ] Search result categories
- [ ] Result highlighting
- [ ] No results message

### Navigation
- [ ] Navigate to Inbox
- [ ] Navigate to Today
- [ ] Navigate to Upcoming
- [ ] Navigate to projects
- [ ] Navigate to filters
- [ ] Execute actions via command

### Components
- [ ] SearchBar component
- [ ] SearchResults component
- [ ] ResultCategory component
- [ ] ResultItem component
- [ ] CommandPaletteNav component

---

## 7. Sub-tasks & Task Hierarchy ⬜

### Database
- [ ] Add parentTaskId to Task model (verify in types)
- [ ] Update IndexedDB indices for parentTaskId
- [ ] Query sub-tasks of a task

### UI Display
- [ ] Indent sub-tasks in list view
- [ ] Collapse/expand parent tasks
- [ ] Counter badge on parent (sub-task count)
- [ ] Highlight parent task when viewing sub-task
- [ ] Breadcrumb navigation for nested tasks

### Sub-task Management
- [ ] Create sub-task
- [ ] Move task to be sub-task (indent)
- [ ] Promote sub-task to task (outdent)
- [ ] Delete sub-task
- [ ] Edit sub-task
- [ ] Deep nesting support (task > sub > sub-sub, etc.)

### Keyboard Shortcuts
- [ ] `Ctrl/Cmd + ]`: Indent task (make sub-task)
- [ ] `Ctrl/Cmd + [`: Outdent task
- [ ] Support for nested keyboard navigation

### Parent Task Behavior
- [ ] Complete all sub-tasks to complete parent
- [ ] Incomplete parent if sub-task unchecked
- [ ] Inherit due date from parent (optional)
- [ ] Show progress on parent

### Components
- [ ] SubTaskList component
- [ ] SubTaskItem component
- [ ] SubTaskCreator component
- [ ] TaskHierarchyBreadcrumb component

### Store Changes
- [ ] Update TaskStore with sub-task operations
- [ ] Add getSubTasks(parentId) method
- [ ] Add getParentTask(id) method

---

## 8. View Layouts ⬜

### Board View (Kanban)
- [ ] Add "board" view type option
- [ ] Column configuration:
  - [ ] By section
  - [ ] By priority (P1, P2, P3, P4)
  - [ ] By assignee
  - [ ] Custom columns
- [ ] Drag tasks between columns
- [ ] Show task count per column
- [ ] Collapse/expand columns
- [ ] Add task to column
- [ ] Reorder columns
- [ ] Column styling
- [ ] Empty column states

### Calendar View
- [ ] Add "calendar" view type option
- [ ] Monthly calendar display
- [ ] Weekly calendar display
- [ ] Daily agenda display
- [ ] Show tasks on due dates
- [ ] All-day task section
- [ ] Time-blocked tasks (hourly)
- [ ] Drag tasks to reschedule
- [ ] Create task on date click
- [ ] Current time indicator
- [ ] Multi-day task display
- [ ] Event details on click
- [ ] Color-coded by project/priority

### List View Enhancement
- [ ] Keep existing list view
- [ ] Add grouping options:
  - [ ] By date (today, tomorrow, etc.)
  - [ ] By project
  - [ ] By priority
  - [ ] By label
  - [ ] None (flat)
- [ ] Add sorting options:
  - [ ] Due date (asc/desc)
  - [ ] Priority (high to low)
  - [ ] Created date
  - [ ] Alphabetical
  - [ ] Custom order
- [ ] Collapsible groups
- [ ] Group headers with counts
- [ ] Subtotals per group

### View Switcher
- [ ] View switcher UI in header
- [ ] Three buttons: List, Board, Calendar
- [ ] Persist selected view per project
- [ ] Smooth transition between views
- [ ] Save view preference to settings

### Components
- [ ] BoardView component
- [ ] BoardColumn component
- [ ] BoardCard component
- [ ] CalendarView component
- [ ] CalendarDay component
- [ ] CalendarEvent component
- [ ] ViewSwitcher component
- [ ] ListViewOptions component (grouping, sorting)

### Store Changes
- [ ] Add viewStore for view preferences
- [ ] Save view type per project
- [ ] Save grouping/sorting preferences

---

## Phase 2 Summary

### Components to Create
- [ ] 15-20 new components
- [ ] Reusable sub-components
- [ ] Modal and drawer wrappers

### Stores to Enhance
- [ ] TaskStore (enhanced filtering, sorting)
- [ ] ProjectStore (view preferences)
- [ ] New: LabelStore
- [ ] New: FilterStore
- [ ] New: KeyboardStore
- [ ] New: DragStore
- [ ] New: ViewStore

### Utilities to Add
- [ ] Enhanced date parsing
- [ ] Task parsing for quick add
- [ ] Filter query parser
- [ ] Keyboard event handler
- [ ] Drag drop utilities

### Database Updates
- [ ] Add indices for new queries
- [ ] Migration ready (Dexie handles)

### Testing Areas (Phase 4)
- [ ] Date parsing accuracy
- [ ] Filter query parsing
- [ ] Drag/drop interaction
- [ ] Keyboard shortcut conflicts
- [ ] View switching
- [ ] Task editing

---

## Implementation Priority

### Week 1 ✅ COMPLETE
1. [x] Task detail panel - Full modal with editing
2. [x] Date and time pickers - Calendar and time inputs
3. [x] Basic task editing - Content, description, priority, dates, project, section
4. [x] Store integration - taskDetailStore for state management

### Week 2 ⬜ STARTING
1. [ ] Quick add modal - Cmd+K to create tasks
2. [ ] Natural language parsing - Enhance existing utilities
3. [ ] Keyboard shortcuts - System and event listeners

### Week 3
1. [ ] Drag and drop
2. [ ] Filters and labels
3. [ ] Filter UI

### Week 4
1. [ ] Search and command palette
2. [ ] Sub-tasks
3. [ ] Board view basics

### Week 4-5
1. [ ] Calendar view
2. [ ] View switching
3. [ ] List view enhancements
4. [ ] Testing and polish

---

## Quality Checklist

For each feature:
- [ ] TypeScript types defined
- [ ] No `any` types used
- [ ] Props interface created
- [ ] Default props handled
- [ ] Error states included
- [ ] Loading states included
- [ ] Empty states designed
- [ ] Accessible (ARIA labels)
- [ ] Keyboard navigable
- [ ] Responsive (desktop first)
- [ ] Comments for complex logic
- [ ] Follows code standards

---

## Definition of Done (Per Feature)

- [ ] Feature implemented and working
- [ ] TypeScript strict mode passes
- [ ] ESLint passes with no errors
- [ ] Prettier formatted
- [ ] No console errors/warnings
- [ ] Accessibility checklist passed
- [ ] Manual testing completed
- [ ] Performance acceptable
- [ ] Documentation updated
- [ ] Ready for Phase 3 iteration

---

## Known Challenges & Solutions

### Challenge: Natural Language Parsing
**Solution**: Build incremental parser, test with examples, user feedback

### Challenge: Keyboard Shortcut Conflicts
**Solution**: Central registry, conflict detection, clear documentation

### Challenge: Drag/Drop Complexity
**Solution**: Start simple (same-list reorder), then expand

### Challenge: Performance with Many Tasks
**Solution**: Virtual scrolling, memoization, query optimization

### Challenge: View State Management
**Solution**: Separate viewStore, per-project preferences

---

## Metrics & KPIs

By end of Phase 2:
- [ ] 50+ essential features working
- [ ] < 2s initial load time maintained
- [ ] < 100ms interaction response
- [ ] Zero TypeScript errors
- [ ] Zero ESLint errors
- [ ] 0 `any` types
- [ ] 95%+ accessibility score

---

**Status**: Ready to start  
**Last Updated**: December 3, 2025  
**Next**: Begin task detail panel implementation
