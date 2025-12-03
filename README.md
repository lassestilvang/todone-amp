# Todone - Complete Task Management Application

From to-do to todone. A beautiful, production-ready task management application inspired by Todoist.

## Features

### Phase 1: Core Foundation ✅

- **Authentication**: JWT-based auth system with signup/login UI
- **Task Management**: Create, read, update, delete tasks
- **Task Properties**: Priority levels (P1-P4), due dates, descriptions
- **Views**:
  - Inbox: Quick processing area for new tasks
  - Today: All tasks due today with overdue section
  - Upcoming: Next 7 days grouped by date
- **Projects**: Create and organize projects with custom colors
- **Sections**: Organize tasks within projects
- **Storage**: IndexedDB with Dexie for offline-first functionality
- **State Management**: Zustand for global state
- **Styling**: Tailwind CSS with custom design system

### Planned Features

#### Phase 2: Essential Features
- Filters and labels system
- Search and command palette (Cmd/Ctrl + K)
- Comprehensive keyboard shortcuts
- Three view layouts (list, board, calendar)
- Sub-tasks and task hierarchy
- Drag-and-drop support
- Task comments and collaboration

#### Phase 3: Advanced Features
- Recurring tasks with natural language scheduler
- Calendar integration
- Template system (50+ pre-built templates)
- Shared projects and team collaboration
- Reminders and notifications

#### Phase 4: Polish & AI
- AI Assist features
- Offline support with sync
- Productivity/Karma system
- Mobile responsive design
- Browser extension
- Performance optimization

## Technology Stack

- **Frontend**: React 18+ with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Database**: IndexedDB (Dexie.js)
- **Date/Time**: date-fns
- **Icons**: Lucide React
- **Build Tool**: Vite
- **UI Components**: Custom component library

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will open at `http://localhost:3000`

### Demo Account

Email: `demo@todone.app`  
Password: `password`

## Project Structure

```
src/
├── components/      # Reusable UI components
├── db/             # Database layer (Dexie)
├── pages/          # Page components
├── store/          # State management (Zustand)
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
├── views/          # View components (Inbox, Today, etc.)
├── App.tsx         # Main app component
├── main.tsx        # Entry point
└── index.css       # Global styles
```

## Code Quality

- TypeScript strict mode enabled
- ESLint configuration
- Prettier for code formatting
- No `any` types allowed
- React hooks for state and side effects
- Semantic HTML
- ARIA labels for accessibility

## Keyboard Shortcuts

- `Ctrl/Cmd + K`: Quick add / Command palette
- `Q`: Quick add task
- `T`: Set due date to today
- `M`: Set due date to tomorrow
- `1-4`: Set priority P1-P4
- `Escape`: Cancel/close

See full list in settings.

## Database Schema

Tasks are stored in IndexedDB with the following indices:
- Primary key: `id`
- Secondary indices: `projectId`, `sectionId`, `completed`, `dueDate`
- Compound indices: `[projectId+order]`, `[sectionId+order]`, `[taskId+createdAt]`

## API Structure (Ready for Backend)

The app is structured to easily connect to a REST API:
- `POST /api/tasks` - Create task
- `GET /api/tasks` - List tasks
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/projects` - Create project
- `GET /api/projects` - List projects
- Similar endpoints for other entities

## Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigation throughout
- Screen reader support with ARIA labels
- Focus indicators visible
- Semantic HTML structure
- Color contrast meets standards

## Performance Targets

- Initial load: < 2s
- Interaction response: < 100ms
- Virtual scrolling for 1000+ tasks
- Code splitting by route
- Service worker ready (implement next)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npm run type-check
```

### Testing (Coming soon)
```bash
npm run test
```

## Contributing

See CONTRIBUTING.md for guidelines.

## License

MIT

## Roadmap

- [x] Phase 1: Core Foundation
- [ ] Phase 2: Essential Features (in progress)
- [ ] Phase 3: Advanced Features
- [ ] Phase 4: Polish & AI

## Support

For issues and questions, please open an issue on the repository.

---

**Todone** - Where tasks get done.
