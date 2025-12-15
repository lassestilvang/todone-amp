/**
 * Todone Chrome Extension - Content Script
 * Injected into web pages for capturing text and context
 */

class TodoneContent {
  constructor() {
    this.initializeContextMenu()
    this.initializeKeyboardShortcuts()
    this.initializeMessageListener()
  }

  initializeContextMenu() {
    // Add context menu for selected text
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'getSelectedText') {
        const selectedText = window.getSelection().toString()
        sendResponse({ text: selectedText })
      }

      if (request.action === 'getPageInfo') {
        const pageInfo = {
          title: document.title,
          url: window.location.href,
          selectedText: window.getSelection().toString(),
          description: this.extractMetaDescription()
        }
        sendResponse(pageInfo)
      }
    })
  }

  initializeKeyboardShortcuts() {
    // Cmd+Shift+K (Mac) or Ctrl+Shift+K (Windows/Linux)
    document.addEventListener('keydown', (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const isShortcut =
        (isMac && e.metaKey && e.shiftKey && e.key === 'k') ||
        (!isMac && e.ctrlKey && e.shiftKey && e.key === 'K')

      if (isShortcut) {
        e.preventDefault()
        this.openQuickAdd()
      }
    })
  }

  initializeMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'addTask') {
        console.log('Task received from extension:', request.task)
        // Notify Todone app if open
        window.postMessage(
          {
            type: 'TODONE_ADD_TASK',
            task: request.task
          },
          '*'
        )
      }
    })
  }

  extractMetaDescription() {
    const descriptionMeta = document.querySelector('meta[name="description"]')
    return descriptionMeta ? descriptionMeta.getAttribute('content') : ''
  }

  openQuickAdd() {
    // Send message to popup or background script
    chrome.runtime.sendMessage(
      { action: 'openQuickAdd' },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error opening quick add:', chrome.runtime.lastError)
        }
      }
    )
  }
}

// Initialize content script
const todoneContent = new TodoneContent()

// Log that content script is loaded
console.log('Todone extension content script loaded')
