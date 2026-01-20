# OS Dark Mode Testing Guide

**Task**: T6.8.7 - Manual testing on different OS dark mode settings  
**Status**: 🔵 In Progress  
**Last Updated**: January 2026

---

## Overview

This guide provides a comprehensive checklist for manually testing the Todone theming system across different operating systems and their native dark mode settings.

---

## Test Environments

### Required OS Combinations

| OS | Version | Browser(s) to Test |
|----|---------|-------------------|
| macOS | Sonoma 14+ | Safari, Chrome, Firefox |
| Windows | 11 | Edge, Chrome, Firefox |
| iOS | 17+ | Safari, Chrome |
| Android | 14+ | Chrome, Firefox |
| Linux | Ubuntu 22.04+ | Firefox, Chrome |

---

## Pre-Test Setup

1. **Clear application data**:
   - Open DevTools → Application → Storage → Clear site data
   - Or delete `todone-theme` from localStorage

2. **Start dev server**:
   ```bash
   npm run dev
   ```

3. **Note your OS dark mode setting** before starting each test section

---

## Test Cases

### 1. System Preference Detection

#### Test 1.1: Initial Load Respects OS Setting
| Step | Action | Expected Result | ✅/❌ |
|------|--------|-----------------|-------|
| 1 | Set OS to **Light mode** | - | |
| 2 | Clear localStorage and refresh app | App loads in light theme | |
| 3 | Set OS to **Dark mode** | - | |
| 4 | Clear localStorage and refresh app | App loads in dark theme | |

#### Test 1.2: No Flash of Wrong Theme (FOUC)
| Step | Action | Expected Result | ✅/❌ |
|------|--------|-----------------|-------|
| 1 | Set OS to Dark mode | - | |
| 2 | Clear localStorage | - | |
| 3 | Hard refresh (Cmd+Shift+R / Ctrl+Shift+R) | No white flash before dark theme appears | |
| 4 | Repeat with Light mode | No dark flash before light theme appears | |

#### Test 1.3: Real-time OS Change Detection
| Step | Action | Expected Result | ✅/❌ |
|------|--------|-----------------|-------|
| 1 | Set theme mode to "System" in app | Theme switcher shows system icon | |
| 2 | Keep app open, switch OS to Dark mode | App immediately switches to dark theme | |
| 3 | Switch OS back to Light mode | App immediately switches to light theme | |
| 4 | Verify no page reload occurred | URL stays same, no loading state | |

---

### 2. Theme Mode Switching

#### Test 2.1: Manual Override
| Step | Action | Expected Result | ✅/❌ |
|------|--------|-----------------|-------|
| 1 | Set OS to Light mode | - | |
| 2 | Click theme switcher → Dark | App switches to dark, ignores OS setting | |
| 3 | Change OS to Dark mode | App stays dark (no change) | |
| 4 | Click theme switcher → System | App reflects OS setting (dark) | |

#### Test 2.2: Theme Persistence
| Step | Action | Expected Result | ✅/❌ |
|------|--------|-----------------|-------|
| 1 | Set theme to Dark mode manually | - | |
| 2 | Close browser completely | - | |
| 3 | Reopen browser and navigate to app | App loads in Dark mode | |
| 4 | Verify localStorage contains correct value | `todone-theme` has `"mode":"dark"` | |

#### Test 2.3: Keyboard Shortcut
| Step | Action | Expected Result | ✅/❌ |
|------|--------|-----------------|-------|
| 1 | Press `Cmd+Shift+L` (Mac) / `Ctrl+Shift+L` (Win) | Theme toggles light ↔ dark | |
| 2 | Repeat shortcut multiple times | Cycles correctly each time | |

---

### 3. Visual Consistency

#### Test 3.1: Component Rendering
For each theme (Light, Dark, System-Light, System-Dark), verify:

| Component | Light ✅/❌ | Dark ✅/❌ | Notes |
|-----------|------------|-----------|-------|
| Sidebar | | | Background, text, hover states |
| Task cards | | | Border, checkbox, priority colors |
| Modals | | | Backdrop, content, close button |
| Form inputs | | | Border, placeholder, focus ring |
| Buttons | | | Primary, secondary, ghost variants |
| Dropdowns | | | Menu background, selected item |
| Date picker | | | Calendar grid, selected date |
| Toasts | | | Success, error, info variants |
| Empty states | | | Illustrations, decorative elements |
| Loading skeletons | | | Shimmer animation visible |

#### Test 3.2: Transition Smoothness
| Step | Action | Expected Result | ✅/❌ |
|------|--------|-----------------|-------|
| 1 | Toggle theme via switcher | Smooth 150ms transition | |
| 2 | Verify no flickering | Colors blend smoothly | |
| 3 | Check with reduced motion OS setting | Transitions are instant (no animation) | |

---

### 4. Color Theme Variants

Test each named theme with both light and dark base modes:

| Theme | Loads ✅/❌ | Colors Correct ✅/❌ | Persists ✅/❌ |
|-------|-----------|---------------------|--------------|
| Default | | | |
| Nord | | | |
| Dracula | | | |
| Solarized Light | | | |
| Solarized Dark | | | |
| One Dark | | | |
| GitHub Light | | | |
| GitHub Dark | | | |
| High Contrast | | | |

---

### 5. PWA & Mobile

#### Test 5.1: PWA Theme Color
| Step | Action | Expected Result | ✅/❌ |
|------|--------|-----------------|-------|
| 1 | Install PWA on device | - | |
| 2 | Switch to Dark mode | Browser chrome/title bar updates | |
| 3 | Check `<meta name="theme-color">` | Value matches current theme | |

#### Test 5.2: Mobile Touch Targets
| Step | Action | Expected Result | ✅/❌ |
|------|--------|-----------------|-------|
| 1 | Test theme switcher on mobile | Touch target ≥44px, easy to tap | |
| 2 | Verify contrast of active states | Selected state clearly visible | |

---

### 6. OS-Specific Behaviors

#### macOS
| Test | Expected | ✅/❌ |
|------|----------|-------|
| Auto Dark Mode (sunset) triggers app change | Yes, when in System mode | |
| Safari matches system accent color | N/A (no native integration) | |

#### Windows
| Test | Expected | ✅/❌ |
|------|----------|-------|
| High Contrast mode detected | App switches to High Contrast theme | |
| Taskbar theme doesn't affect app | Correct, app uses web preference | |

#### iOS
| Test | Expected | ✅/❌ |
|------|----------|-------|
| Control Center dark mode toggle | Triggers app theme change | |
| Scheduled dark mode | Works when in System mode | |

#### Android
| Test | Expected | ✅/❌ |
|------|----------|-------|
| Quick Settings dark mode | Triggers app theme change | |
| Battery Saver dark mode | May trigger if OS sends media query | |

---

## Known Issues & Edge Cases

Document any issues found during testing:

| Issue | OS/Browser | Steps to Reproduce | Severity |
|-------|------------|-------------------|----------|
| | | | |

---

## Sign-Off

| Tester | Date | OS Tested | Result |
|--------|------|-----------|--------|
| | | | |

---

## References

- [prefers-color-scheme MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)
- [WCAG 2.1 Contrast Requirements](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- Theme implementation: [docs/THEMING_ARCHITECTURE.md](./THEMING_ARCHITECTURE.md)
