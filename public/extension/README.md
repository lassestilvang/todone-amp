# Todone Browser Extension

A Chrome/Firefox/Edge browser extension for quickly adding tasks to Todone from any webpage.

## Features

- 🚀 **Quick Add**: Add tasks with Cmd+Shift+K (Mac) or Ctrl+Shift+K (Windows/Linux)
- 📋 **Save Web Pages**: Right-click any page to save it as a task
- ✂️ **Capture Text**: Select text on any webpage and add it as a task
- 🏷️ **Priority & Due Dates**: Set priority levels and due dates directly from the popup
- 🔄 **Sync**: Automatically syncs tasks to your Todone account
- 📱 **Works Anywhere**: Available on Chrome, Firefox, Safari, and Edge

## Installation

### Chrome (Chromium-based)

1. Download the extension from Chrome Web Store (link coming soon)
2. Or manually install:
   - Build the extension: `npm run build:extension`
   - Open `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `public/extension` folder

### Firefox

1. Download from Firefox Add-ons (link coming soon)
2. Or manually install:
   - Build the extension: `npm run build:extension`
   - Visit `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on"
   - Select `public/manifest.json`

### Safari

Coming soon - Safari extension support

### Edge

1. Download from Microsoft Edge Add-ons (link coming soon)
2. Or sideload using the same process as Chrome

## Usage

### Keyboard Shortcut
- **Cmd+Shift+K** (Mac) or **Ctrl+Shift+K** (Windows/Linux)
- Opens the quick add popup with any selected text pre-filled

### Context Menu
- Right-click any text: "Add [selected text] to Todone"
- Right-click page: "Save Page to Todone"

### From the Popup
- Click the Todone icon in your browser toolbar
- Fill in task details and click "Add Task"

## Permissions

The extension requires the following permissions:

- **activeTab**: To access the current tab's content
- **scripting**: To inject content scripts
- **storage**: To store tasks locally for syncing
- **tabs**: To work across multiple tabs

These permissions are used only to:
- Capture selected text and page information
- Store tasks temporarily for offline use
- Sync with your Todone account

## Settings

### Connection
- Click the extension icon and scroll to "Settings"
- Sign in with your Todone account
- Choose which projects to sync with

### Keyboard Shortcut
- Modify the default shortcut in `chrome://extensions/shortcuts` (Chrome)
- Or in Firefox preferences under "Shortcuts"

## Syncing

### Automatic Sync
- Tasks are synced when you're online
- If offline, tasks are queued locally
- Automatic sync when connection is restored

### Manual Sync
- Use the "Sync Now" button in the popup

## Troubleshooting

### Tasks Not Appearing
1. Check that you're signed into Todone
2. Verify sync is enabled in settings
3. Try manual sync from the popup
4. Check browser console for errors (F12)

### Keyboard Shortcut Not Working
1. Ensure the shortcut isn't conflicting with another app
2. Disable browser extensions that use the same shortcut
3. Re-map the shortcut in browser settings

### Permissions Errors
1. Grant the required permissions in browser settings
2. Reload the extension (chrome://extensions or about:addons)

## Development

### Build
```bash
npm run build:extension
```

### Test
```bash
npm run test:extension
```

### Load Unpacked (Chrome)
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `public/extension` folder

### Debug
- Right-click the Todone icon → "Inspect popup"
- Right-click any webpage → "Inspect page"
- Check the Service Worker logs in `chrome://extensions/`

## File Structure

```
public/extension/
├── manifest.json          # Extension metadata
├── popup.html            # Popup UI
├── popup.js              # Popup logic
├── content.js            # Content script (injected into pages)
├── background.js         # Service worker (background tasks)
├── styles.css            # Extension styles
├── icons/                # Extension icons
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
└── README.md            # This file
```

## Privacy

The extension:
- Does NOT collect browsing history
- Does NOT track visited websites
- Only sends task data to your Todone account
- All data is encrypted in transit
- Data stored locally is only for sync purposes

## Support

For issues or feature requests:
- GitHub Issues: https://github.com/lassestilvang/todone-amp/issues
- Email: support@todone.app

## License

MIT License - See LICENSE file

## Changelog

### Version 1.0.0
- Initial release
- Quick add popup
- Context menu integration
- Task syncing
- Project selection
- Priority & due date support
