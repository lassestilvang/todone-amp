/**
 * Todone Chrome Extension - Popup Script
 * Handles quick task creation from browser popup
 */

class TodonePopup {
  constructor() {
    this.form = document.getElementById('task-form')
    this.titleInput = document.getElementById('task-title')
    this.prioritySelect = document.getElementById('task-priority')
    this.dueInput = document.getElementById('task-due')
    this.descriptionInput = document.getElementById('task-description')
    this.projectSelect = document.getElementById('task-project')
    this.statusMessage = document.getElementById('status-message')
    this.loadingState = document.getElementById('loading-state')
    this.successState = document.getElementById('success-state')
    this.successMessage = document.getElementById('success-message')

    this.initializeEventListeners()
    this.loadProjects()
    this.loadSelectedText()
  }

  initializeEventListeners() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e))
    document.getElementById('cancel-btn').addEventListener('click', () => this.closePopup())
    document.getElementById('close-btn').addEventListener('click', () => this.closePopup())
    document.getElementById('add-another-btn').addEventListener('click', () => this.addAnother())
  }

  async loadSelectedText() {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
      const tab = tabs[0]

      chrome.tabs.executeScript(
        tab.id,
        {
          code: 'window.getSelection().toString()'
        },
        (results) => {
          if (results && results[0]) {
            const selectedText = results[0]
            if (selectedText.length > 0 && selectedText.length < 200) {
              this.titleInput.value = selectedText
            }
          }
        }
      )
    } catch (error) {
      console.error('Error getting selected text:', error)
    }
  }

  async loadProjects() {
    try {
      const result = await chrome.storage.sync.get('projects')
      const projects = result.projects || []

      projects.forEach((project) => {
        const option = document.createElement('option')
        option.value = project.id
        option.textContent = project.name
        this.projectSelect.appendChild(option)
      })
    } catch (error) {
      console.error('Error loading projects:', error)
    }
  }

  async handleSubmit(e) {
    e.preventDefault()

    const title = this.titleInput.value.trim()
    if (!title) {
      this.showStatus('Please enter a task title', 'error')
      return
    }

    this.showLoading(true)

    try {
      const task = {
        id: `ext-${Date.now()}`,
        title,
        priority: this.prioritySelect.value || 'medium',
        dueDate: this.dueInput.value || null,
        description: this.descriptionInput.value || '',
        projectId: this.projectSelect.value || null,
        completed: false,
        createdAt: new Date().toISOString(),
        source: 'chrome-extension'
      }

      // Send to Todone app
      const result = await this.sendTaskToTodone(task)

      if (result.success) {
        this.showSuccess(`Task "${title}" added successfully!`)
      } else {
        this.showStatus('Failed to add task. Please try again.', 'error')
        this.showLoading(false)
      }
    } catch (error) {
      console.error('Error adding task:', error)
      this.showStatus('Error: ' + error.message, 'error')
      this.showLoading(false)
    }
  }

  async sendTaskToTodone(task) {
    // Store task in chrome storage for sync
    const result = await chrome.storage.sync.get('pendingTasks')
    const pendingTasks = result.pendingTasks || []
    pendingTasks.push(task)

    await chrome.storage.sync.set({ pendingTasks })

    // Try to send to open Todone window
    const todoneTabResult = await chrome.tabs.query({ url: '*://localhost:5173/*' })
    if (todoneTabResult.length > 0) {
      try {
        await chrome.tabs.sendMessage(todoneTabResult[0].id, {
          action: 'addTask',
          task
        })
      } catch (error) {
        console.log('Todone tab not ready, task will sync later')
      }
    }

    return { success: true }
  }

  showLoading(show) {
    if (show) {
      this.form.classList.add('hidden')
      this.loadingState.classList.remove('hidden')
    } else {
      this.form.classList.remove('hidden')
      this.loadingState.classList.add('hidden')
    }
  }

  showSuccess(message) {
    this.showLoading(false)
    this.form.classList.add('hidden')
    this.successMessage.textContent = message
    this.successState.classList.remove('hidden')

    // Auto-close after 3 seconds
    setTimeout(() => {
      window.close()
    }, 3000)
  }

  showStatus(message, type = 'info') {
    this.statusMessage.textContent = message
    this.statusMessage.className = `status-message status-${type}`
  }

  addAnother() {
    this.successState.classList.add('hidden')
    this.form.classList.remove('hidden')
    this.form.reset()
    this.titleInput.focus()
  }

  closePopup() {
    window.close()
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new TodonePopup()
})
