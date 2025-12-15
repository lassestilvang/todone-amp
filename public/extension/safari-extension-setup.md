# Safari Extension Setup Guide

## Overview
Safari extensions on macOS require a different development approach compared to Chrome/Firefox. This guide covers setting up a Safari Web Extension.

## Requirements
- macOS 14.0 (Sonoma) or later
- Xcode 14.0 or later
- Swift 5.7 or later

## Project Structure
```
Todone.xcodeproj/
├── Todone (App Target)
├── Todone Extension (Extension Target)
└── Shared Resources
    └── Resources
        ├── manifest.json
        ├── popup.html
        ├── popup.js
        ├── content.js
        └── styles.css
```

## Steps to Create Safari Extension

### 1. Create Xcode Project
```bash
# Create a new macOS app project with extension
open -b com.apple.dt.Xcode
# File → New → Project → macOS → App
```

### 2. Add Web Extension Target
- In Xcode: File → New → Target → Web Extension

### 3. Copy Web Files
Copy the following files into the Safari extension target:

```
popup.html
popup.js
content.js
styles.css
manifest.json
icons/
├── icon-16x16.png
├── icon-48x48.png
└── icon-128x128.png
```

### 4. Update manifest.json for Safari

```json
{
  "manifest_version": 3,
  "name": "Todone - Task Manager",
  "version": "1.0.0",
  "description": "Add tasks to Todone directly from your browser",
  "permissions": [
    "activeTab",
    "scripting",
    "storage",
    "tabs",
    "contextMenus"
  ],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon-16x16.png",
      "48": "icons/icon-48x48.png",
      "128": "icons/icon-128x128.png"
    },
    "default_title": "Add to Todone"
  },
  "icons": {
    "16": "icons/icon-16x16.png",
    "48": "icons/icon-48x48.png",
    "128": "icons/icon-128x128.png"
  },
  "content_scripts": [
    {
      "matches": ["https://*/*", "http://*/*"],
      "js": ["content.js"],
      "run_at": "document_end"
    }
  ],
  "commands": {
    "quick-add": {
      "suggested_key": {
        "default": "Command+Shift+K"
      },
      "description": "Quick add task from selected text"
    }
  }
}
```

### 5. Update Background Script for Safari
Create `background.swift`:

```swift
import SafariServices

class SafariExtensionHandler: NSObject, NSExtensionRequestHandling {
    func beginRequest(with context: NSExtensionContext) {
        let response = NSExtensionItem()
        context.completeRequest(response, returningItems: nil, completionHandler: nil)
    }
}
```

### 6. Build and Run

```bash
# Select device/simulator
# Select Todone target
# Product → Build (Cmd+B)
# Product → Run (Cmd+R)
```

### 7. Enable Extension in Safari
1. Open Safari
2. Safari → Settings → Extensions
3. Check "Todone - Task Manager"
4. Configure extension permissions

## Key Differences from Chrome/Firefox

| Feature | Chrome | Firefox | Safari |
|---------|--------|---------|--------|
| Manifest | MV3 | MV3 | MV3 (partial) |
| Service Worker | ✓ | ✓ | Limited |
| Native Integration | ✗ | ✗ | ✓ (App wrapper) |
| Sidebar | ✗ | ✓ | ✓ |
| Context Menu | ✓ | ✓ | ✓ |
| Storage API | ✓ | ✓ | ✓ |
| Icons | PNG | PNG | PNG/PDF |

## Testing

### Manual Testing
1. Load unpacked extension in Safari
2. Test quick add functionality
3. Test context menu integration
4. Verify keyboard shortcuts work
5. Test on different websites

### Automated Testing
Use XCTest for Swift components:

```swift
import XCTest

class SafariExtensionTests: XCTestCase {
    func testExtensionLoads() {
        // Test extension loading
    }
    
    func testPopupFunctionality() {
        // Test popup interactions
    }
}
```

## Distribution

### Mac App Store
1. Create App Store Connect account
2. Configure app signing
3. Build release version
4. Submit for review

### Direct Distribution
1. Notarize app with Apple
2. Create DMG installer
3. Distribute to users

## Resources

- [Safari Web Extension Developer Guide](https://developer.apple.com/documentation/safariservices)
- [App Extension Programming Guide](https://developer.apple.com/library/archive/documentation/General/Conceptual/ExtensibilityPG/)
- [Safari 15+ Extension Changes](https://webkit.org/blog/11989/webkit-features-in-safari-15/)

## Support

For issues:
1. Check Safari console (Develop → Show JavaScript Console)
2. Use Xcode debugger
3. Check extension logs in Console.app
4. Review Apple's troubleshooting guide

## Next Steps

1. [ ] Create Xcode project structure
2. [ ] Implement Swift background handler
3. [ ] Add auto-update mechanism
4. [ ] Implement app preferences UI
5. [ ] Create installer (DMG)
6. [ ] Submit to App Store for review
