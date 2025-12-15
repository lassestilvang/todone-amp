# Todone - Task Management Application

**From to-do to todone** ✨

A production-ready task management application inspired by Todoist's feature set with a beautiful, modern UI. Built with React 18, TypeScript, and Vite for maximum performance and developer experience.

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Tests](https://img.shields.io/badge/tests-1204%20passing-brightgreen)
![TypeScript](https://img.shields.io/badge/typescript-strict%20mode-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

### 🎯 Core Task Management
- **Task Creation & Editing** - Create, edit, and organize tasks with full control
- **Sub-tasks & Hierarchies** - Unlimited nesting depth for complex task structures
- **Quick Add (Cmd+K)** - Add tasks in seconds with natural language parsing
- **Task Details** - Rich task editor with descriptions, due dates, priorities, and more
- **Smart Sorting & Filtering** - Sort, filter, and group tasks by any property

### 📅 Multiple Views
- **List View** - Organized task lists with sections and grouping options
- **Board View** - Kanban-style board for visual task management
- **Calendar View** - Monthly, weekly, and daily calendar perspectives
- **Time Blocking** - Schedule tasks by time blocks with visual calendar
- **Daily Agenda** - Focus view for today's tasks

### 🏷️ Organization
- **Projects** - Create and organize projects with hierarchy support
- **Sections** - Break down projects into manageable sections
- **Labels & Colors** - Tag tasks with customizable labels and colors
- **Favorites** - Star and quickly access frequently used items

### ⌨️ Productivity Features
- **Keyboard Shortcuts** - Fully customizable keyboard navigation
- **Recurring Tasks** - Create recurring patterns with exceptions
- **Reminders & Notifications** - Flexible reminder system with quiet hours
- **Comments & Collaboration** - Add comments and task history
- **Undo/Redo** - Full undo/redo support with visual feedback

### 🎮 Gamification
- **Karma System** - Earn karma points for task completion
- **Achievements** - Unlock badges and reach milestones
- **Streaks** - Track daily task completion streaks
- **Productivity Dashboard** - Visualize progress with charts and metrics

### 🌐 Integrations
- **Calendar Sync** - Sync time-blocked tasks to Google Calendar or Outlook
- **OAuth 2.0** - Secure authentication with popular services
- **Email Forwarding** - Convert emails to tasks (add@todone.app)
- **Browser Extension** - Add tasks from any website

### 📱 Responsive Design
- **Desktop** - Full-featured three-column layout
- **Tablet** - Two-column responsive layout with collapsible sidebar
- **Mobile** - Single-column optimized layout with swipe gestures
- **Accessibility** - WCAG 2.1 AA compliant with keyboard navigation

### 📊 Analytics & Reporting
- **Activity Feed** - Track all changes and activity
- **Productivity Reports** - Export completion reports and analytics
- **Data Export** - Export to JSON, CSV, or HTML formats
- **Print Support** - Print tasks, reports, and productivity views

### 🔒 Data & Privacy
- **Offline Support** - Full offline functionality with sync queue
- **Local Storage** - All data stored locally in IndexedDB
- **Data Export/Import** - Full data portability
- **WCAG Compliance** - Accessibility features and reduced motion support

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone the repository
git clone https://github.com/lassestilvang/todone-amp.git
cd todone-amp

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## Development

### Available Commands

```bash
# Start development server with hot reload
npm run dev

# Type check with TypeScript
npm run type-check

# Lint code with ESLint
npm run lint

# Run test suite
npm run test

# Run tests in watch mode
npm run test:watch

# Build for production
npm run build

# Preview production build
npm run preview
```

### Project Structure

```
src/
├── components/          # React components (113+)
│   ├── views/          # Page views (Inbox, Today, Calendar, etc.)
│   ├── modals/         # Modal dialogs
│   └── ...
├── store/              # Zustand state stores (30+)
│   ├── taskStore.ts
│   ├── projectStore.ts
│   ├── authStore.ts
│   └── ...
├── hooks/              # Custom React hooks
├── utils/              # Utility functions and helpers
├── types/              # TypeScript type definitions
├── db/                 # Dexie.js database setup
├── styles/             # Global styles and Tailwind config
└── App.tsx             # Root component
```

### Architecture Overview

**Frontend Stack:**
- React 18 with TypeScript (strict mode)
- Zustand for state management (30+ stores)
- Dexie.js for IndexedDB database
- Tailwind CSS for styling
- @dnd-kit for drag-and-drop
- TipTap for rich text editing

**Key Patterns:**
- Functional components with hooks
- Store-based state management
- Lazy loading and code splitting
- Virtual scrolling for performance
- Keyboard-first design

## Features in Detail

### Task Management

#### Creating Tasks
1. Press `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux) to open Quick Add
2. Type task title
3. Use shortcuts: `p:` for project, `@` for date, `!` for priority
4. Press Enter to create

#### Quick Add Shortcuts
- `p:project-name` - Set project
- `@tomorrow` - Set due date
- `@Monday` - Set to next Monday
- `!1` - Set priority (1=Urgent, 4=Low)
- `#label` - Add label

#### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Cmd+K` | Quick add modal |
| `Cmd+Enter` | Complete task |
| `1-4` | Set priority |
| `T` | Due today |
| `M` | Due tomorrow |
| `W` | Due this week |
| `?` | Show shortcuts help |
| `Cmd+Up/Down` | Move task |
| `Cmd+]` | Indent |
| `Cmd+[` | Unindent |

### Views & Organization

**List View** - Organize by sections or custom grouping
**Board View** - Kanban with columns by section, priority, or assignee
**Calendar View** - Monthly, weekly, or daily perspective
**Time Blocking** - Schedule tasks with visual time blocks

### Projects & Labels

Create hierarchical projects with sections. Use labels to categorize across projects. Create custom filters to view exactly what you need.

### Reminders & Notifications

Set flexible reminders:
- Automatic (for tasks with due time)
- Manual (custom time before due)
- Location-based (arriving/leaving)
- Recurring task reminders

Configure notification preferences:
- Email, push, or browser notifications
- Quiet hours (no notifications during sleep time)
- Sound preferences

### Analytics & Gamification

Track your productivity:
- Daily/weekly task completion goals
- Karma points for completing tasks
- Achievements and badges
- Streaks for consistency
- Detailed productivity charts

## Browser Extension

### Installation

#### Chrome & Edge
1. Open `chrome://extensions` or `edge://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `public/extension` folder

#### Firefox
1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select `public/extension/manifest-firefox.json`

#### Safari
See [Safari Extension Setup Guide](./public/extension/safari-extension-setup.md)

### Usage
- **Add Task** - Click the extension icon and fill in task details
- **Keyboard Shortcut** - Press `Cmd+Shift+K` (Mac) or `Ctrl+Shift+K` (Windows/Linux)
- **Save Page** - Right-click and select "Save to Todone"
- **Selected Text** - Highlight text, right-click, and "Add to Todone"

## Testing

### Test Suite
- **1204 total tests** across 85 test files
- **85%+ code coverage**
- Utilities, components, stores, and integration tests
- Full TypeScript strict mode compliance

### Running Tests
```bash
# Run all tests
npm run test

# Watch mode
npm run test -- --watch

# Single test file
npm run test -- path/to/test.ts

# Coverage report
npm run test -- --coverage
```

### Test Quality Metrics
- 0 ESLint errors/warnings
- 0 TypeScript strict mode violations
- All new code fully typed (no `any` types)
- Comprehensive test fixtures

## Documentation

- [Architecture Guide](./docs/ARCHITECTURE.md) - Deep dive into codebase structure
- [API Documentation](./docs/API_DOCUMENTATION.md) - Integration and API reference
- [Keyboard Shortcuts](./docs/KEYBOARD_SHORTCUTS.md) - Complete shortcuts reference
- [Contributing Guide](./CONTRIBUTING.md) - Development guidelines
- [Deployment Guide](./docs/DEPLOYMENT.md) - Production deployment instructions
- [Development Plan](./docs/DEVELOPMENT_PLAN.md) - Feature roadmap and progress

## Performance

### Optimizations
- **Lazy Loading** - Components loaded on-demand
- **Virtual Scrolling** - Efficient rendering of 1000+ tasks
- **Debounced Search** - 70% reduction in re-renders
- **Memoization** - Prevent unnecessary component updates
- **Code Splitting** - Vite automatic route-based splitting

### Bundle Metrics
- **Main JS** - 221.81 kB (53.71 kB gzipped)
- **Editor JS** - 355.82 kB (110.46 kB gzipped)
- **CSS** - 72.91 kB (10.80 kB gzipped)
- **Initial Load** - <2s (target: <2s)
- **Interaction** - <100ms (target: <100ms)

## Accessibility

### Features
- **WCAG 2.1 AA Compliant** - Full accessibility compliance
- **Keyboard Navigation** - All features accessible via keyboard
- **Screen Reader Support** - Proper ARIA labels and roles
- **Reduced Motion** - Respects `prefers-reduced-motion`
- **Dyslexia-Friendly Font** - Optional OpenDyslexic font
- **High Contrast** - Verified color contrast ratios

### Testing
- Accessibility auditor framework
- Screen reader testing
- Keyboard navigation verification
- WCAG compliance checks

## Security

### Data Protection
- **Local First** - All data stored locally in IndexedDB
- **Offline Support** - Works without internet connection
- **OAuth 2.0** - Secure authentication with PKCE
- **No Tracking** - Privacy-first design
- **Data Export** - Full data portability

### Browser Extension
- **Minimal Permissions** - Only necessary permissions requested
- **Local Storage** - Extension data stored locally
- **No Cloud Sync** - Data stays on your device

## Integrations

### Calendar Integration
- **Google Calendar** - View and sync tasks
- **Outlook** - View and sync tasks
- **iCal Export** - Generate iCal for import

### Email Integration
- **Forward to Tasks** - Send emails to add@todone.app
- **Gmail Integration** - Extract task info from emails
- **Email Forwarding** - Queue emails as tasks

### OAuth Providers
- **Google** - Google Calendar and Gmail
- **Microsoft** - Outlook and Office 365
- **Slack** - Slack workspace integration
- **GitHub** - GitHub integration

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

### Development Workflow
1. Create feature branch: `git checkout -b feature/name`
2. Make changes and add tests
3. Run quality checks: `npm run lint && npm run type-check && npm run test`
4. Submit pull request

### Code Standards
- TypeScript strict mode required
- ESLint must pass with 0 warnings
- All code must be fully typed (no `any` types)
- Tests required for all functionality
- Prettier formatting applied

## Deployment

See [Deployment Guide](./docs/DEPLOYMENT.md) for detailed instructions.

### Quick Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Quick Deploy to Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir dist
```

## License

MIT License - See [LICENSE](LICENSE) file for details

## Support

- **Issues** - Report bugs on GitHub Issues
- **Discussions** - Ask questions on GitHub Discussions
- **Email** - Contact via support email (when available)

## Roadmap

### Phase 4 (Current)
- ✅ OAuth 2.0 integration
- ✅ Browser extensions (Chrome, Firefox, Safari, Edge)
- ✅ Rich text editor integration
- ✅ Comprehensive test coverage (1200+ tests)
- 🔄 E2E testing framework
- 🔄 Performance benchmarking

### Future
- Native mobile apps (iOS/Android)
- Team collaboration features
- Advanced analytics and reporting
- AI-powered task suggestions
- Custom automation workflows

## Acknowledgments

Built by [Lasse Stilvang](https://github.com/lassestilvang) with ❤️

Inspired by Todoist, Things, and other great task managers.

---

**Ready to get productive?** Start with `npm run dev` and create your first task! 🚀
