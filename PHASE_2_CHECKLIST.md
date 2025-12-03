# Phase 2: Essential Features - Implementation Checklist

**Phase**: 2 / 4  
**Status**: In Progress (Week 4 - 70% Complete)  
**Priority**: High  
**Estimated Duration**: 3-4 weeks  
**Target Items**: 70+ (30+ completed, 40+ remaining)

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

## 2. Quick Add Modal ✅ (Week 2 Complete - 90%)

### Components
- [x] QuickAddModal component (full implementation)
- [ ] SuggestionsDropdown (deferred - not critical)
- [x] InputChips for selected properties (implemented as display chips)
- [x] RecentTasksList (history - integrated in modal)

### Functionality
- [x] Trigger with Cmd/Ctrl + K
- [x] Close with Escape
- [x] Parse natural language:
  - [x] Due dates: "tomorrow", "next Monday", "in 3 days" (all work!)
  - [x] Times: "at 3pm", "at 14:00"
  - [x] Priority: "p1", "p2", "p3", "p4", "!!!", "!!", "!"
  - [ ] Labels: "@label_name" (Phase 3)
  - [ ] Projects: "#project_name" (Phase 3)
  - [ ] Assignee: "+person_name" (Phase 3)
  - [ ] Recurring: "every day" (Phase 3)
  - [ ] Duration: "for 1h" (Phase 3)
- [x] Display extracted properties as chips
- [x] Create task on Enter or button click
- [x] Add to recent history
- [x] Show recent quick add items (last 10)
- [x] Clear recent history option
- [x] Persist history to localStorage

### Utilities
- [x] parseNaturalLanguageDate (already working)
- [x] parseNaturalLanguageTime (already working)
- [x] parseNaturalLanguagePriority (inline in modal)
- [ ] parseNaturalLanguageLabel (Phase 3)
- [ ] parseNaturalLanguageProject (Phase 3)
- [ ] TaskParser class (Phase 4 - nice to have)

### Store Changes
- [x] Add quickAddStore for recent history
- [x] Store last 10 quick add items
- [x] Persist to localStorage
- [x] Initialize on app load

---

## 3. Keyboard Shortcuts System ✅ (Week 2 Complete - 70%)

### Implementation
- [x] keyboardStore (Zustand store)
- [x] Global keyboard event listener (useKeyboardShortcuts hook)
- [x] Prevent conflicts with browser defaults (input detection)
- [x] Smart input detection (skip shortcuts when typing)
- [ ] Conflict detection warnings (Phase 4)

### Core Shortcuts Implemented
- [x] `Ctrl/Cmd + K`: Quick add modal (wired)
- [x] `Q`: Quick add task (wired)
- [x] `Escape`: Cancel/close (wired)
- [x] `Ctrl/Cmd + Enter`: Complete task (framework ready)
- [x] `1`: Set priority P1 (framework ready)
- [x] `2`: Set priority P2 (framework ready)
- [x] `3`: Set priority P3 (framework ready)
- [x] `4`: Set priority P4 (framework ready)
- [x] `T`: Set due date to today (framework ready)
- [x] `M`: Set due date to tomorrow (framework ready)
- [x] `W`: Set due date to next week (framework ready)
- [x] `?`: Show keyboard shortcuts help (wired)
- [ ] `A`: Add task at end (Phase 3)
- [ ] `Shift + A`: Add task at top (Phase 3)
- [ ] `/`: Focus search (Phase 3)
- [ ] `G then I/T/U`: Go to view (Phase 3)
- [ ] Navigation arrows (Phase 3)
- [ ] Cmd + ]: Indent/outdent (Phase 3)

### UI
- [x] Shortcuts help modal (? key - fully working)
- [x] Display shortcuts grouped by category
- [x] Show keyboard key visuals
- [x] Scrollable for many shortcuts
- [ ] Customizable shortcuts in settings (Phase 4)
- [ ] Shortcut hints in tooltips (Phase 4)
- [ ] Conflict detection warnings (Phase 4)

### Components
- [x] KeyboardShortcutsHelp component
- [ ] ShortcutsList component (integrated in help)
- [ ] ShortcutInput component (Phase 4)

---

## 4. Drag & Drop ✅ (Week 3 - Complete: 55% Core, 100% Foundation)

### Setup
- [x] Install @dnd-kit packages (already in package.json)
- [x] DragDropContext wrapper component
- [x] useDroppable and useDraggable hooks integration

### Task Reordering
- [x] Draggable task items (DraggableTaskItem component)
- [x] Drop preview feedback (visual opacity and scaling)
- [x] Reorder tasks in same list (reorderTasks method)
- [x] Update order in database (via db.tasks.update)
- [x] Animate position changes (CSS transitions)
- [ ] Keyboard support for drag/drop (deferred to Phase 3)

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
- [x] DraggableTaskItem component (uses useDraggable)
- [x] DroppableTaskList component (uses useDroppable)
- [x] DragDropContext provider (wraps app with DndContext)
- [ ] DroppableSection component (future)
- [ ] DroppableProject component (future)
- [ ] DragPreview component (future)

### Store Changes
- [x] DragStore for drag state (dragStore.ts created)
- [x] Update TaskStore.updateTaskOrder() (added to taskStore)
- [x] Update TaskStore.reorderTasks() (added for array reordering)
- [ ] Update ProjectStore.updateSectionOrder() (deferred)

---

## 5. Filters & Labels System ✅ (Week 4 - 70% Complete)

### Labels ✅ (Complete)
- [x] Create labels with names and colors
- [x] Edit label properties
- [x] Delete labels
- [x] Labels table in database (verified)
- [x] Add labels to tasks
- [x] Remove labels from tasks
- [x] Display labels on task items
- [x] Label colors (9 colors: red, orange, yellow, green, blue, indigo, purple, pink, gray)

### Components ✅ (Complete)
- [x] LabelSelector component
- [x] LabelColorPicker component
- [x] LabelBadge component
- [x] LabelManagement panel
- [x] Integrated in TaskDetailPanel

### Natural Language Parsing ✅ (New - Week 4)
- [x] Parse: `@label_name` in quick add
- [x] Parse: `#project_name` in quick add
- [x] Display parsed labels and projects as chips
- [x] Support multiple labels in single task

### Filtering (Partial)
- [ ] Filter tasks by label
- [ ] Filter tasks by multiple labels (AND/OR)
- [ ] Show label usage count
- [ ] Label-based views
- [ ] Add/remove filters UI
- [ ] Clear filters button

### Custom Filters (Deferred to Week 5+)
- [ ] Query builder UI
- [ ] Save custom filter
- [ ] Edit saved filter
- [ ] Delete saved filter
- [ ] Filters to favorites
- [ ] Filter suggestions

### Query Syntax (In Progress)
- [x] Parse: `@label_name` (working in quick add)
- [x] Parse: `#project_name` (working in quick add)
- [ ] Parse: `search: keyword`
- [ ] Parse: `today`, `tomorrow`, `7 days`, `overdue`
- [ ] Parse: `p1`, `p2`, `p3`, `p4`
- [ ] Parse: `##parent_project`
- [ ] Parse: `/section_name`
- [ ] Parse: `assigned to: name`, `assigned by: name`
- [ ] Parse: `created: date`, `created before: date`
- [ ] Parse: `recurring`
- [ ] Parse: `subtask`, `!subtask`
- [ ] Operators: `&` (and), `|` (or), `!` (not)

### Store Changes ✅
- [x] FilterStore for saved filters
- [x] LabelStore for label management
- [ ] Update TaskStore.filterTasks() with label filtering logic

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

### Week 2 ✅ COMPLETE
1. [x] Quick add modal - Cmd+K to create tasks (fully functional)
2. [x] Natural language parsing - Date, time, priority (working)
3. [x] Keyboard shortcuts - System and event listeners (framework ready)
   - Implemented: Cmd+K, Q, Escape, ?, Ctrl+Enter
   - Framework ready: 1-4, T, M, W for quick edits
   - History persistence for quick add

### Week 3 ✅ COMPLETE (55% + Foundation)
1. [x] Drag and drop - Foundation complete (task reordering working)
2. [x] DragDropContext, DraggableTaskItem, DroppableTaskList components
3. [x] taskStore.reorderTasks() and updateTaskOrder() methods

### Week 4 - Filters & Labels ✅ (70% Complete)
1. [x] Create label management system (labels store + components)
2. [x] Label components (selector, color picker, badge, management)
3. [x] Natural language parsing for projects (#name) and labels (@name)
4. [x] LabelStore for state management
5. [ ] FilterStore UI integration (views, sidebar)
6. [ ] Filter by single/multiple labels (in views)

### Week 5
1. [ ] Search and command palette
2. [ ] Sub-tasks
3. [ ] Board view basics

### Week 6+
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
