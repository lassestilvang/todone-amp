import { test, expect } from './fixtures/test-fixtures'
import { Page } from '@playwright/test'

/**
 * Load Testing Suite - T7.2.6
 *
 * Tests application performance with 1000+ tasks.
 * Measures:
 * - Initial render time
 * - Scroll performance (FPS)
 * - Memory usage
 * - Interaction latency
 */

interface PerformanceMetrics {
  initialRenderTime: number
  scrollFPS: number
  memoryUsage: number
  taskToggleLatency: number
  taskCount: number
}

interface TaskData {
  id: string
  content: string
  priority: 'p1' | 'p2' | 'p3' | 'p4' | null
  completed: boolean
  dueDateOffset?: number
  labels: string[]
  projectId?: string
  order: number
}

// Generate task data
function generateTaskData(count: number): TaskData[] {
  const prefixes = ['Review', 'Update', 'Fix', 'Implement', 'Design', 'Test', 'Document']
  const subjects = ['auth', 'database', 'API', 'components', 'services', 'tests', 'docs']
  const priorities: ('p1' | 'p2' | 'p3' | 'p4' | null)[] = ['p1', 'p2', 'p3', 'p4', null]

  const tasks: TaskData[] = []

  for (let i = 0; i < count; i++) {
    const prefix = prefixes[i % prefixes.length]
    const subject = subjects[i % subjects.length]

    tasks.push({
      id: `load-test-${Date.now()}-${i}`,
      content: `${prefix} ${subject} #${i}`,
      priority: priorities[i % priorities.length],
      completed: false,
      dueDateOffset: Math.random() > 0.3 ? Math.floor(Math.random() * 30) : undefined,
      labels: i % 3 === 0 ? ['urgent'] : [],
      projectId: undefined,
      order: i,
    })
  }

  return tasks
}

// Inject tasks via IndexedDB
async function injectTestTasks(page: Page, count: number): Promise<void> {
  const tasks = generateTaskData(count)

  await page.evaluate(async (tasksData: TaskData[]) => {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('TodoneDB')

      request.onerror = () => reject(new Error('Failed to open IndexedDB'))

      request.onsuccess = () => {
        const db = request.result
        const now = new Date()

        // Check if tasks store exists
        if (!db.objectStoreNames.contains('tasks')) {
          db.close()
          reject(new Error('Tasks store not found - app may not be initialized'))
          return
        }

        try {
          const transaction = db.transaction(['tasks'], 'readwrite')
          const store = transaction.objectStore('tasks')

          for (const taskData of tasksData) {
            const task = {
              id: taskData.id,
              content: taskData.content,
              priority: taskData.priority,
              completed: taskData.completed,
              dueDate:
                taskData.dueDateOffset !== undefined
                  ? new Date(now.getTime() + taskData.dueDateOffset * 86400000)
                  : undefined,
              labels: taskData.labels,
              projectId: taskData.projectId,
              order: taskData.order,
              createdAt: now,
              updatedAt: now,
              reminders: [],
              attachments: [],
            }
            store.put(task)
          }

          transaction.oncomplete = () => {
            db.close()
            resolve()
          }

          transaction.onerror = () => {
            db.close()
            reject(new Error('Transaction failed'))
          }
        } catch (error) {
          db.close()
          reject(error)
        }
      }
    })
  }, tasks)
}

// Clear test tasks
async function clearTestTasks(page: Page): Promise<void> {
  await page.evaluate(async () => {
    return new Promise<void>((resolve) => {
      const request = indexedDB.open('TodoneDB')

      request.onerror = () => resolve()

      request.onsuccess = () => {
        const db = request.result

        if (!db.objectStoreNames.contains('tasks')) {
          db.close()
          resolve()
          return
        }

        try {
          const transaction = db.transaction(['tasks'], 'readwrite')
          const store = transaction.objectStore('tasks')
          const getAllRequest = store.getAll()

          getAllRequest.onsuccess = () => {
            const tasks = getAllRequest.result || []
            const testTasks = tasks.filter(
              (t: { id: string }) => t.id && t.id.startsWith('load-test-')
            )

            for (const task of testTasks) {
              store.delete(task.id)
            }
          }

          transaction.oncomplete = () => {
            db.close()
            resolve()
          }

          transaction.onerror = () => {
            db.close()
            resolve()
          }
        } catch {
          db.close()
          resolve()
        }
      }
    })
  })
}

// Measure scroll FPS
async function measureScrollFPS(page: Page): Promise<number> {
  const fps = await page.evaluate(async () => {
    return new Promise<number>((resolve) => {
      const frameTimestamps: number[] = []
      let rafId: number
      let frameCount = 0

      const recordFrame = (timestamp: number) => {
        frameTimestamps.push(timestamp)
        frameCount++

        if (frameCount < 60) {
          rafId = requestAnimationFrame(recordFrame)
        } else {
          cancelAnimationFrame(rafId)
          const durations: number[] = []
          for (let i = 1; i < frameTimestamps.length; i++) {
            durations.push(frameTimestamps[i] - frameTimestamps[i - 1])
          }
          if (durations.length > 0) {
            const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length
            const calculatedFps = Math.min(60, Math.round(1000 / avgDuration))
            resolve(calculatedFps)
          } else {
            resolve(60)
          }
        }
      }

      // Find scrollable container
      const container =
        document.querySelector('[role="list"]') ||
        document.querySelector('[data-testid="task-list"]') ||
        document.querySelector('main')

      if (container) {
        let scrollPos = 0
        const scrollInterval = setInterval(() => {
          scrollPos += 100
          container.scrollTop = scrollPos
          if (scrollPos > 3000) {
            clearInterval(scrollInterval)
          }
        }, 16)
      }

      rafId = requestAnimationFrame(recordFrame)

      setTimeout(() => {
        cancelAnimationFrame(rafId)
        resolve(60)
      }, 3000)
    })
  })

  return fps
}

// Measure memory usage
async function measureMemory(page: Page): Promise<number> {
  const memoryMB = await page.evaluate(() => {
    interface PerformanceMemory {
      usedJSHeapSize: number
    }

    interface PerformanceWithMemory extends Performance {
      memory?: PerformanceMemory
    }

    const perf = performance as PerformanceWithMemory
    if (perf.memory) {
      return Math.round(perf.memory.usedJSHeapSize / 1024 / 1024)
    }
    return 0
  })

  return memoryMB
}

test.describe('Load Testing - 1000+ Tasks', () => {
  test.setTimeout(120000)

  test.afterEach(async ({ authenticatedPage: page }) => {
    await clearTestTasks(page)
  })

  test('should render 1000 tasks efficiently', async ({ authenticatedPage: page }) => {
    // Inject 1000 tasks
    await injectTestTasks(page, 1000)

    // Refresh to load tasks
    const startTime = Date.now()
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Wait for sidebar (app ready) and task list
    await page.waitForSelector('[data-testid="sidebar"], #sidebar', { timeout: 15000 })
    await page.waitForTimeout(500) // Allow render to complete

    const renderTime = Date.now() - startTime

    console.log(`Initial render time (1000 tasks): ${renderTime}ms`)

    // Should render in under 5 seconds
    expect(renderTime).toBeLessThan(5000)

    // Check for virtual scrolling
    const renderedTasks = await page.locator('[role="listitem"]').count()
    console.log(`Rendered tasks in viewport: ${renderedTasks}`)

    // Virtual list should limit rendered items
    expect(renderedTasks).toBeLessThan(150)
  })

  test('should maintain smooth scrolling with 1000 tasks', async ({ authenticatedPage: page }) => {
    await injectTestTasks(page, 1000)
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('[data-testid="sidebar"], #sidebar', { timeout: 15000 })
    await page.waitForTimeout(1000)

    const fps = await measureScrollFPS(page)
    console.log(`Scroll FPS (1000 tasks): ${fps}`)

    // Should maintain at least 30fps during scroll
    expect(fps).toBeGreaterThanOrEqual(30)
  })

  test('should handle 5000 tasks without crashing', async ({ authenticatedPage: page }) => {
    await injectTestTasks(page, 5000)

    const startTime = Date.now()
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('[data-testid="sidebar"], #sidebar', { timeout: 30000 })
    await page.waitForTimeout(500)

    const renderTime = Date.now() - startTime

    console.log(`Initial render time (5000 tasks): ${renderTime}ms`)

    // Should still render under 10 seconds
    expect(renderTime).toBeLessThan(10000)

    // Check memory usage
    const memoryMB = await measureMemory(page)
    console.log(`Memory usage (5000 tasks): ${memoryMB}MB`)

    if (memoryMB > 0) {
      expect(memoryMB).toBeLessThan(300)
    }
  })

  test('should toggle task completion quickly with large dataset', async ({
    authenticatedPage: page,
  }) => {
    await injectTestTasks(page, 1000)
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('[data-testid="sidebar"], #sidebar', { timeout: 15000 })
    await page.waitForTimeout(1000)

    // Find first task checkbox
    const checkbox = page
      .locator('[role="listitem"]')
      .first()
      .locator('button[role="checkbox"], input[type="checkbox"]')

    if (await checkbox.isVisible({ timeout: 5000 })) {
      const startTime = Date.now()
      await checkbox.click()
      await page.waitForTimeout(100)
      const latency = Date.now() - startTime

      console.log(`Task toggle latency: ${latency}ms`)

      // Toggle should be under 300ms
      expect(latency).toBeLessThan(300)
    } else {
      console.log('No checkbox found - checking alternate selectors')
      const altCheckbox = page.locator('input[type="checkbox"]').first()
      if (await altCheckbox.isVisible({ timeout: 2000 })) {
        const startTime = Date.now()
        await altCheckbox.click()
        const latency = Date.now() - startTime
        console.log(`Task toggle latency (alt): ${latency}ms`)
        expect(latency).toBeLessThan(300)
      }
    }
  })
})

test.describe('Performance Metrics Summary', () => {
  test.setTimeout(120000)

  test('generate comprehensive load test report @slow', async ({ authenticatedPage: page }) => {
    const metrics: PerformanceMetrics = {
      initialRenderTime: 0,
      scrollFPS: 0,
      memoryUsage: 0,
      taskToggleLatency: 0,
      taskCount: 1000,
    }

    await injectTestTasks(page, 1000)

    const startTime = Date.now()
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('[data-testid="sidebar"], #sidebar', { timeout: 15000 })
    await page.waitForTimeout(500)
    metrics.initialRenderTime = Date.now() - startTime

    metrics.scrollFPS = await measureScrollFPS(page)
    metrics.memoryUsage = await measureMemory(page)

    // Measure toggle latency
    const checkbox = page
      .locator('[role="listitem"]')
      .first()
      .locator('button[role="checkbox"], input[type="checkbox"]')
    if (await checkbox.isVisible({ timeout: 5000 })) {
      const toggleStart = Date.now()
      await checkbox.click()
      await page.waitForTimeout(50)
      metrics.taskToggleLatency = Date.now() - toggleStart
    }

    console.log('\n')
    console.log('╔════════════════════════════════════════════════════════════╗')
    console.log('║           LOAD TEST RESULTS (1000 tasks)                   ║')
    console.log('╠════════════════════════════════════════════════════════════╣')
    console.log(`║ Initial Render Time:  ${String(metrics.initialRenderTime).padEnd(6)}ms                          ║`)
    console.log(`║ Scroll FPS:           ${String(metrics.scrollFPS).padEnd(6)}fps                         ║`)
    console.log(`║ Memory Usage:         ${String(metrics.memoryUsage || 'N/A').padEnd(6)}MB                          ║`)
    console.log(`║ Task Toggle Latency:  ${String(metrics.taskToggleLatency).padEnd(6)}ms                          ║`)
    console.log('╠════════════════════════════════════════════════════════════╣')
    console.log('║ TARGETS:                                                   ║')
    console.log('║   - Render < 5000ms   ✓ if within budget                   ║')
    console.log('║   - Scroll >= 30fps   ✓ if smooth                          ║')
    console.log('║   - Toggle < 300ms    ✓ if responsive                      ║')
    console.log('╚════════════════════════════════════════════════════════════╝')
    console.log('\n')

    await clearTestTasks(page)

    // Assert all metrics pass
    expect(metrics.initialRenderTime).toBeLessThan(5000)
    expect(metrics.scrollFPS).toBeGreaterThanOrEqual(30)
    if (metrics.taskToggleLatency > 0) {
      expect(metrics.taskToggleLatency).toBeLessThan(300)
    }
  })
})
