import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.evaluate(() => {
      localStorage.clear()
      indexedDB.databases().then((dbs) => {
        dbs.forEach((db) => {
          if (db.name) indexedDB.deleteDatabase(db.name)
        })
      })
    })
    await page.reload()
    await page.waitForLoadState('domcontentloaded')
  })

  test('shows login page when not authenticated', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
  })

  test('can toggle between sign in and sign up', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible()

    await page.getByRole('button', { name: 'Sign Up' }).click()

    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible()
    await expect(page.getByLabel('Full Name')).toBeVisible()

    await page.getByRole('button', { name: 'Sign In' }).click()

    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible()
  })

  test('can sign up and access app', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign Up' }).click()

    const uniqueEmail = `test-${Date.now()}@example.com`
    await page.getByLabel('Full Name').fill('Test User')
    await page.getByLabel('Email').fill(uniqueEmail)
    await page.getByLabel('Password').fill('password123')

    await page.getByRole('button', { name: 'Create Account' }).click()

    await expect(page.locator('#sidebar, [data-testid="sidebar"]')).toBeVisible({ timeout: 15000 })
  })

  test('can sign in with existing account', async ({ page }) => {
    const uniqueEmail = `signin-${Date.now()}@example.com`

    await page.getByRole('button', { name: 'Sign Up' }).click()
    await page.getByLabel('Full Name').fill('Sign In Test User')
    await page.getByLabel('Email').fill(uniqueEmail)
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: 'Create Account' }).click()

    await expect(page.locator('#sidebar, [data-testid="sidebar"]')).toBeVisible({ timeout: 15000 })

    await page.evaluate(() => {
      localStorage.clear()
    })
    await page.reload()
    await page.waitForLoadState('domcontentloaded')

    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible()
    await page.getByLabel('Email').fill(uniqueEmail)
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: 'Sign In' }).click()

    await expect(page.locator('#sidebar, [data-testid="sidebar"]')).toBeVisible({ timeout: 15000 })
  })
})
