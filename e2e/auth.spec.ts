import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
      indexedDB.databases().then((dbs) => {
        dbs.forEach((db) => {
          if (db.name) indexedDB.deleteDatabase(db.name)
        })
      })
    })
    await page.reload()
  })

  test('shows login page when not authenticated', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
  })

  test('can toggle between sign in and sign up', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible()

    await page.getByRole('button', { name: 'Sign Up' }).click()

    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible()
    await expect(page.getByLabel('Full Name')).toBeVisible()

    await page.getByRole('button', { name: 'Sign In' }).click()

    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible()
  })

  test('can sign up and access app', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'Sign Up' }).click()

    await page.getByLabel('Full Name').fill('Test User')
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Password').fill('password123')

    await page.getByRole('button', { name: 'Create Account' }).click()

    await expect(page.locator('#sidebar, [data-testid="sidebar"]')).toBeVisible({ timeout: 10000 })
  })

  test('can sign in with existing account', async ({ page }) => {
    await page.goto('/')

    await page.getByLabel('Email').fill('demo@todone.app')
    await page.getByLabel('Password').fill('password')

    await page.getByRole('button', { name: 'Sign In' }).click()

    await expect(page.locator('#sidebar, [data-testid="sidebar"]')).toBeVisible({ timeout: 10000 })
  })
})
