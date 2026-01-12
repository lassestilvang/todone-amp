import { test as base, expect } from '@playwright/test'

interface TestUser {
  id: string
  name: string
  email: string
}

interface TodoneFixtures {
  authenticatedPage: ReturnType<typeof base['page']>
  testUser: TestUser
}

export const test = base.extend<TodoneFixtures>({
  testUser: async ({}, use) => {
    const user: TestUser = {
      id: `test-user-${Date.now()}`,
      name: 'Test User',
      email: 'test@example.com',
    }
    await use(user)
  },

  authenticatedPage: async ({ page, testUser }, use) => {
    await page.goto('/')

    await page.evaluate((user) => {
      localStorage.setItem('userId', user.id)
      localStorage.setItem(
        'user',
        JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: new Date().toISOString(),
        })
      )
    }, testUser)

    await page.reload()

    await page.waitForSelector('[data-testid="sidebar"], #sidebar', { timeout: 10000 })

    await use(page)
  },
})

export { expect }

export async function clearIndexedDB(page: ReturnType<typeof base['page']>) {
  await page.evaluate(async () => {
    const databases = await indexedDB.databases()
    for (const db of databases) {
      if (db.name) {
        indexedDB.deleteDatabase(db.name)
      }
    }
  })
}

export async function waitForAppReady(page: ReturnType<typeof base['page']>) {
  await page.waitForLoadState('networkidle')
  await page.waitForSelector('[data-testid="sidebar"], #sidebar', { timeout: 10000 })
}
