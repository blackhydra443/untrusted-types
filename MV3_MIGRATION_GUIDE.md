# Chrome Extension Manifest V3 Migration Guide

## Overview
This document outlines the migration from Manifest V2 to Manifest V3 for the Untrusted Types DevTools extension.

## Key Changes

### 1. Manifest Version Update
- **Before**: "manifest_version": 2
- **After**: "manifest_version": 3

### 2. Permissions Restructuring

#### MV2:
```json
{
    "permissions": [
        "storage",
        "webRequest",
        "webRequestBlocking",
        "http://*/*",
        "https://*/*"
    ]
}
```

#### MV3:
```json
{
    "permissions": ["storage"],
    "host_permissions": ["http://*/*", "https://*/*"]
}
```

**Changes**:
- Removed `webRequest` and `webRequestBlocking` (MV3 uses `declarativeNetRequest`)
- Moved URL patterns to new `host_permissions` field
- Kept `storage` in `permissions`

### 3. Web Accessible Resources

#### MV2:
```json
{
    "web_accessible_resources": ["settings.json"]
}
```

#### MV3:
```json
{
    "web_accessible_resources": [
        {
            "resources": ["settings.json"],
            "matches": ["http://*/*", "https://*/*"]
        }
    ]
}
```

### 4. Background Scripts

#### MV2:
```json
{
    "background": {
        "scripts": ["build/background.js"],
        "persistent": true
    }
}
```

#### MV3:
```json
{
    "background": {
        "service_worker": "build/background.js",
        "type": "module"
    }
}
```

**Changes**:
- Background page replaced with Service Worker
- `persistent` property removed
- Service Workers are event-driven and unload when idle
- Added "type": "module" for ES6 module support

---

## Code Changes

### background.ts - MV3 Update

**Key Changes**:
- Removed `window.postMessage()` (Service Workers have no window object)
- Replaced with `chrome.runtime.sendMessage()` for content script communication
- Removed deprecated `chrome.webRequest.onBeforeRequest` API
- Added error handling with `.catch()`
- Added `chrome.runtime.onMessage` listener

### content.ts - MV3 Update

**Key Changes**:
- Added error handling for when background Service Worker is unloaded
- `window.addEventListener('message')` remains unchanged for injected script communication

### HTML Files

**Key Changes**:
- Moved script tags to end of body (MV3 best practice)
- Added proper DOCTYPE and meta charset
- Ensures styles load before scripts execute

---

## API Migration Table

| MV2 API | MV3 Replacement | Status |
|---------|-----------------|--------|
| `chrome.webRequest` | `chrome.declarativeNetRequest` | **Not needed for this extension** |
| `window.postMessage` (background) | `chrome.runtime.sendMessage` | ✅ Updated |
| Background page | Service Worker | ✅ Updated |
| `persistent: true` | Removed (Service Workers auto-unload) | ✅ Updated |

---

## Service Worker Limitations & Solutions

### Limitation 1: No Window Object
- **Problem**: Service Workers don't have `window` object
- **Solution**: Use `chrome.storage` and `chrome.runtime` APIs instead

### Limitation 2: Idle Unloading
- **Problem**: Service Worker unloads when idle, losing in-memory state
- **Solution**: 
  - Use `chrome.storage.local` for persistent state
  - Reinitialize state on message/event receipt
  - Add service worker reactivation handling

### Limitation 3: No DOM Access
- **Problem**: Service Workers can't access DOM
- **Solution**: Use content scripts for DOM manipulation (already implemented)

---

## Testing Checklist

Before deploying, verify:

- [ ] Extension loads without manifest errors
- [ ] `chrome.storage` operations work correctly
- [ ] Content scripts can communicate with background service worker
- [ ] DevTools panel opens and functions correctly
- [ ] Settings changes propagate to all tabs
- [ ] Extension survives idle unloading and reloads properly
- [ ] No console errors in background service worker
- [ ] No console errors in content scripts
- [ ] DevTools panel receives updates from background

---

## References

- [Chrome Extension MV3 Documentation](https://developer.chrome.com/docs/extensions/mv3/)
- [Migration Guide](https://developer.chrome.com/docs/extensions/migrating/)
- [Service Workers in Extensions](https://developer.chrome.com/docs/extensions/mv3/service_workers/)