# Keyboard Shortcuts Reference

Complete keyboard shortcuts guide for Todone. All shortcuts are fully customizable in **Settings → Keyboard Shortcuts**.

## Global Shortcuts

| Shortcut | macOS Alternative | Action |
|----------|-------------------|--------|
| `Ctrl+K` | `Cmd+K` | Open Quick Add modal |
| `Ctrl+Enter` | `Cmd+Enter` | Complete active task |
| `Ctrl+Z` | `Cmd+Z` | Undo last action |
| `Ctrl+Shift+Z` | `Cmd+Shift+Z` | Redo |
| `?` | `?` | Show this shortcuts help |
| `Escape` | `Escape` | Close modals/clear selection |

## Task Management

### Priority (When Task Active)

| Shortcut | Priority |
|----------|----------|
| `!4` or `P` | Low priority |
| `!3` | Medium priority |
| `!2` | High priority |
| `!1` | Urgent priority |

### Quick Due Dates (When Task Active)

| Shortcut | Action |
|----------|--------|
| `T` | Due today |
| `M` | Due tomorrow |
| `W` | Due this week |
| `N` | Remove due date |

### Quick Add Syntax

In Quick Add modal (`Cmd+K`), use these shortcuts to add metadata:

```
Learn JavaScript @tomorrow !1 p:Work #coding
```

| Prefix | Meaning | Example |
|--------|---------|---------|
| `@` | Due date | `@tomorrow`, `@Monday`, `@next Friday` |
| `!` | Priority | `!1` (urgent), `!2` (high), `!3` (medium), `!4` (low) |
| `p:` | Project | `p:Work`, `p:Personal` |
| `#` | Label | `#coding`, `#meeting` |
| `~` | Assign to | `~John`, `~sarah@example.com` |
| `<` | Time | `<3pm`, `<14:00` |

**Examples:**
- `Fix bug @today !1 p:Work` → Due today, urgent, Work project
- `Grocery shopping @tomorrow #shopping` → Due tomorrow, shopping label
- `Team meeting @Monday <2pm p:Work #meeting` → Monday 2pm, Work project

## Navigation

| Shortcut | Action |
|----------|--------|
| `/` | Focus search bar |
| `G` then `I` | Go to Inbox |
| `G` then `T` | Go to Today |
| `G` then `U` | Go to Upcoming |
| `G` then `C` | Go to Calendar |
| `G` then `B` | Go to Board |
| `↑` `↓` | Navigate list (when focused) |
| `Enter` | Open selected task |

## Task Editing (Task Detail Panel Open)

| Shortcut | Action |
|----------|--------|
| `Cmd+Enter` | Save and close |
| `Escape` | Close without saving |
| `Tab` | Move to next field |
| `Shift+Tab` | Move to previous field |
| `Cmd+B` | Bold selected text |
| `Cmd+I` | Italic selected text |
| `Cmd+U` | Underline selected text |
| `Cmd+K` | Insert link |

## Task Ordering & Organization

| Shortcut | macOS Alternative | Action |
|----------|-------------------|--------|
| `Ctrl+↑` | `Cmd+↑` | Move task up |
| `Ctrl+↓` | `Cmd+↓` | Move task down |
| `Ctrl+]` | `Cmd+]` | Indent (create subtask) |
| `Ctrl+[` | `Cmd+[` | Unindent (promote task) |

## Bulk Actions (With Tasks Selected)

| Shortcut | Action |
|----------|--------|
| `Delete` | Delete selected tasks |
| `Ctrl+D` | Delete selected tasks |
| `C` | Copy selected tasks |
| `X` | Cut selected tasks |
| `V` | Paste tasks |
| `Ctrl+A` | Select all tasks in view |

## View-Specific Shortcuts

### List View

| Shortcut | Action |
|----------|--------|
| `V` then `L` | Switch to list view |
| `S` | Open sort options |
| `F` | Open filter panel |
| `G` | Open grouping options |

### Board View

| Shortcut | Action |
|----------|--------|
| `V` then `B` | Switch to board view |
| `Arrow Keys` | Navigate columns |
| `Enter` | Open card details |

### Calendar View

| Shortcut | Action |
|----------|--------|
| `V` then `C` | Switch to calendar view |
| `←` `→` | Previous/next month |
| `T` | Jump to today |
| `W` | Switch to week view |
| `D` | Switch to day view |

## Selection & Filtering

| Shortcut | Action |
|----------|--------|
| `Ctrl+A` | Select all |
| `Ctrl+Shift+A` | Deselect all |
| `Space` | Toggle selection (item focused) |
| `Ctrl+F` | Open filter dialog |
| `Ctrl+Shift+F` | Clear all filters |

## Project & Section Management

| Shortcut | Action |
|----------|--------|
| `N` | New project |
| `E` | Edit project (when selected) |
| `Ctrl+.` | Open project menu |
| `Ctrl+,` | Archive project |

## Settings & Help

| Shortcut | Action |
|----------|--------|
| `Ctrl+,` | Open settings |
| `?` | Show keyboard shortcuts help |
| `H` | Show help panel |
| `Ctrl+H` | Open keyboard shortcuts |
| `Shift+?` | Full keyboard shortcut reference |

## Customizing Shortcuts

### Change a Shortcut

1. Go to **Settings** (Cmd+,)
2. Navigate to **Keyboard Shortcuts** tab
3. Find the action you want to change
4. Click the shortcut field
5. Press your desired key combination
6. Click **Save**

### Reset to Defaults

- Click **Reset to Defaults** button in Keyboard Shortcuts settings
- Or delete individual shortcuts and click **Restore**

### Export/Import Shortcuts

1. Go to **Settings → Keyboard Shortcuts**
2. Click **Export** to save your custom shortcuts
3. Click **Import** to load saved shortcuts on another device

## Accessibility Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Alt+H` | Show accessibility help |
| `Ctrl+Alt+A` | Toggle dark mode |
| `Ctrl+Alt+F` | Toggle dyslexia-friendly font |
| `Ctrl+Alt+R` | Toggle reduced motion |

## Device-Specific Shortcuts

### Windows/Linux
- Use `Ctrl` instead of `Cmd`
- Use `Shift+Ctrl` instead of `Cmd+Shift`

### macOS
- Use `Cmd` for most shortcuts
- Use `Ctrl` for system shortcuts only

### Mobile/Touch Devices

**Swipe Gestures** (instead of keyboard shortcuts):
- **Swipe Right** - Complete task
- **Swipe Left** - Schedule/Delete menu
- **Pull Down** - Refresh list
- **Long Press** - Open context menu

## Tips & Tricks

### Speed Up Workflow

1. **Use Quick Add Extensively** - Cmd+K is your fastest way to add tasks
   ```
   Cmd+K → Type task details → Enter
   ```

2. **Master Quick Due Dates** - Add @tomorrow instead of clicking calendar
   ```
   Learn React @monday !1 p:Work
   ```

3. **Use Batch Shortcuts** - Select multiple with Cmd+A, then delete/move
   ```
   Cmd+A → Ctrl+Shift+P → select new project
   ```

4. **Keyboard Navigation** - Never touch your mouse
   ```
   / → search → arrow keys → enter
   ```

### Common Workflows

**Create Weekly Goals Every Monday**
1. Cmd+K
2. Type task name
3. Type `@every Monday`
4. Press Enter

**Quickly Prioritize Important Tasks**
1. View all tasks (Cmd+K without search)
2. Arrow keys to navigate
3. Press `!1` to mark urgent
4. Press ↓ to move to next

**Review What You Did Today**
1. Press `G` then `T` (go to Today)
2. Press `Cmd+Z` to see undo history (shows all actions)

## Shortcut Conflicts

If you encounter conflicting shortcuts with your browser:

1. Use different key combinations (e.g., `Alt` instead of `Ctrl`)
2. Check your browser's shortcut settings
3. Disable problematic browser shortcuts:
   - **Chrome**: Settings → Advanced → Keyboard shortcuts
   - **Firefox**: about:config search for "browser.sessionstore"
   - **Safari**: System Preferences → Keyboard → Shortcuts

## Troubleshooting

### Shortcut Not Working

1. **Check if it's enabled** - Go to Settings → Keyboard Shortcuts
2. **Check for conflicts** - Browser or OS might have same shortcut
3. **Try alternative** - Use macOS/Windows alternative shown in table
4. **Reset shortcuts** - Click Reset to Defaults in settings

### Can't Type Special Characters

Some keyboards may not have easy access to special characters (`@`, `!`, `#`). You can:

1. Copy-paste special characters from a text editor
2. Change to keyboard with those characters
3. Use the UI instead of Quick Add shortcuts

### Shortcuts Not Persisting

- Check if you're in **Incognito/Private** mode (data not saved)
- Clear browser cache and reload
- Check localStorage in Developer Tools (F12)

---

**Pro Tip:** Most popular task managers use similar shortcuts. If you're coming from Todoist or Things, most shortcuts will feel familiar!

For questions about shortcuts or to suggest improvements, open an issue on GitHub.
