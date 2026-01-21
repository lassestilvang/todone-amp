import { test as base, expect, Page } from '@playwright/test'

interface TestUser {
  id: string
  name: string
  email: string
}

interface TodoneFixtures {
  authenticatedPage: Page
  testUser: TestUser
}

export const test = base.extend<TodoneFixtures>({
  testUser: async ({}, use) => {
    const user: TestUser = {
      id: `test-user-${Date.now()}`,
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
    }
    await use(user)
  },

  authenticatedPage: async ({ page, testUser }, use) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    await page.getByRole('button', { name: 'Sign Up' }).click()

    await page.getByLabel('Full Name').fill(testUser.name)
    await page.getByLabel('Email').fill(testUser.email)
    await page.getByLabel('Password').fill('testpassword123')

    await page.getByRole('button', { name: 'Create Account' }).click()

    await page.waitForSelector('[data-testid="sidebar"], #sidebar', { timeout: 15000 })

    await use(page)
  },
})

export { expect }

export async function clearIndexedDB(page: Page) {
  await page.evaluate(async () => {
    const databases = await indexedDB.databases()
    for (const db of databases) {
      if (db.name) {
        indexedDB.deleteDatabase(db.name)
      }
    }
  })
}

export async function waitForAppReady(page: Page) {
  await page.waitForLoadState('networkidle')
  await page.waitForSelector('[data-testid="sidebar"], #sidebar', { timeout: 10000 })
}
