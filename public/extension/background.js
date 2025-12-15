/**
 * Todone Chrome Extension - Background Service Worker
 * Handles background tasks and inter-window communication
 */

class TodoneBackground {
  constructor() {
    this.initializeInstallListener()
    this.initializeMessageListener()
    this.initializeContextMenu()
  }

  initializeInstallListener() {
    chrome.runtime.onInstalled.addListener((details) => {
      if (details.reason === 'install') {
        // Open onboarding page
        chrome.tabs.create({
          url: 'https://todone.app/extension-install'
        })
      }
    })
  }

  initializeMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'openQuickAdd') {
        chrome.action.openPopup()
        sendResponse({ success: true })
      }

      if (request.action === 'syncPendingTasks') {
        this.syncPendingTasks().then((result) => {
          sendResponse(result)
        })
        return true // Required for async response
      }
    })
  }

  initializeContextMenu() {
    // Create context menu item for adding to Todone
    chrome.contextMenus.create(
      {
        id: 'add-to-todone',
        title: 'Add "%s" to Todone',
        contexts: ['selection']
      },
      () => {
        if (chrome.runtime.lastError) {
          console.log('Context menu item creation error:', chrome.runtime.lastError)
        }
      }
    )

    // Create context menu item for saving page
    chrome.contextMenus.create(
      {
        id: 'save-page-to-todone',
        title: 'Save Page to Todone',
        contexts: ['page']
      },
      () => {
        if (chrome.runtime.lastError) {
          console.log('Context menu item creation error:', chrome.runtime.lastError)
        }
      }
    )

    // Handle context menu clicks
    chrome.contextMenus.onClicked.addListener((info, tab) => {
      if (info.menuItemId === 'add-to-todone') {
        this.addSelectedToTodone(info.selectionText, tab)
      } else if (info.menuItemId === 'save-page-to-todone') {
        this.savePageToTodone(tab)
      }
    })
  }

  async addSelectedToTodone(selectedText, tab) {
    const task = {
      id: `ext-${Date.now()}`,
      title: selectedText.substring(0, 100),
      description: `From: ${tab.title}\nURL: ${tab.url}`,
      completed: false,
      createdAt: new Date().toISOString(),
      source: 'chrome-context-menu'
    }

    await this.saveTask(task)
    this.showNotification(`Added "${task.title}" to Todone`)
  }

  async savePageToTodone(tab) {
    const task = {
      id: `ext-${Date.now()}`,
      title: tab.title,
      description: `URL: ${tab.url}`,
      completed: false,
      createdAt: new Date().toISOString(),
      source: 'chrome-save-page'
    }

    await this.saveTask(task)
    this.showNotification(`Saved "${task.title}" to Todone`)
  }

  async saveTask(task) {
    const result = await chrome.storage.sync.get('pendingTasks')
    const pendingTasks = result.pendingTasks || []
    pendingTasks.push(task)

    await chrome.storage.sync.set({ pendingTasks })

    // Notify open Todone tabs
    const tabs = await chrome.tabs.query({})
    tabs.forEach((tab) => {
      if (tab.url && tab.url.includes('todone.app')) {
        chrome.tabs.sendMessage(
          tab.id,
          {
            action: 'addTask',
            task
          }
        ).catch(() => {
          // Tab might not have content script loaded
        })
      }
    })
  }

  async syncPendingTasks() {
    try {
      const result = await chrome.storage.sync.get('pendingTasks')
      const pendingTasks = result.pendingTasks || []

      // Return pending tasks for sync
      return {
        success: true,
        tasks: pendingTasks,
        count: pendingTasks.length
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  showNotification(message) {
    // Chrome notification (if permissions granted)
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'extension/icons/icon-128.png',
      title: 'Todone',
      message: message
    }).catch(() => {
      // Notifications might be disabled
      console.log('Notification:', message)
    })
  }
}

// Initialize background service worker
const todoneBackground = new TodoneBackground()

console.log('Todone background service worker loaded')
