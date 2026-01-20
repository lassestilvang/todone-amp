import { test as base, expect } from '@playwright/test'

interface TestUser {
  id: string
  name: string
  email: string
}

interface PWAThemeFixtures {
  authenticatedPage: ReturnType<typeof base['page']>
  testUser: TestUser
}

const test = base.extend<PWAThemeFixtures>({
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

    await page.waitForSelector('main', { state: 'visible', timeout: 15000 })

    await use(page)
  },
})

test.describe('PWA Theme Color Meta Tag', () => {
  test('theme-color meta tag exists in document', async ({ authenticatedPage: page }) => {
    const themeColorMeta = page.locator('meta[name="theme-color"]')
    await expect(themeColorMeta).toHaveCount(1)
  })

  test('theme-color updates when switching to dark mode', async ({ authenticatedPage: page }) => {
    const themeSwitcher = page.getByRole('button', { name: /theme/i }).first()
    await expect(themeSwitcher).toBeVisible({ timeout: 5000 })

    // Click until we get to dark mode
    const html = page.locator('html')
    let attempts = 0
    while (!(await html.getAttribute('class'))?.includes('dark') && attempts < 3) {
      await themeSwitcher.click()
      await page.waitForTimeout(200)
      attempts++
    }

    // Verify dark mode is active
    await expect(html).toHaveClass(/dark/)

    // Check theme-color is updated to dark color
    const themeColorMeta = page.locator('meta[name="theme-color"]')
    const themeColor = await themeColorMeta.getAttribute('content')
    expect(themeColor).toBe('#111827')
  })

  test('theme-color updates when switching to light mode', async ({ authenticatedPage: page }) => {
    const themeSwitcher = page.getByRole('button', { name: /theme/i }).first()
    await expect(themeSwitcher).toBeVisible({ timeout: 5000 })

    // Click until we get to light mode
    const html = page.locator('html')
    let attempts = 0
    while ((await html.getAttribute('class'))?.includes('dark') && attempts < 3) {
      await themeSwitcher.click()
      await page.waitForTimeout(200)
      attempts++
    }

    // Verify light mode is active
    await expect(html).not.toHaveClass(/dark/)

    // Check theme-color is updated to light color (brand green)
    const themeColorMeta = page.locator('meta[name="theme-color"]')
    const themeColor = await themeColorMeta.getAttribute('content')
    expect(themeColor).toBe('#10b981')
  })

  test('theme-color persists after page reload', async ({ authenticatedPage: page }) => {
    const themeSwitcher = page.getByRole('button', { name: /theme/i }).first()
    await expect(themeSwitcher).toBeVisible({ timeout: 5000 })

    // Set to dark mode
    const html = page.locator('html')
    let attempts = 0
    while (!(await html.getAttribute('class'))?.includes('dark') && attempts < 3) {
      await themeSwitcher.click()
      await page.waitForTimeout(200)
      attempts++
    }

    // Verify dark mode and theme-color
    await expect(html).toHaveClass(/dark/)
    let themeColorMeta = page.locator('meta[name="theme-color"]')
    expect(await themeColorMeta.getAttribute('content')).toBe('#111827')

    // Reload page
    await page.reload()
    await page.waitForLoadState('domcontentloaded')

    // Theme should still be dark after reload
    await expect(html).toHaveClass(/dark/)

    // Theme-color should be correctly set after reload
    themeColorMeta = page.locator('meta[name="theme-color"]')
    expect(await themeColorMeta.getAttribute('content')).toBe('#111827')
  })

  test('favicon updates with theme', async ({ authenticatedPage: page }) => {
    const themeSwitcher = page.getByRole('button', { name: /theme/i }).first()
    await expect(themeSwitcher).toBeVisible({ timeout: 5000 })

    // Set to dark mode
    const html = page.locator('html')
    let attempts = 0
    while (!(await html.getAttribute('class'))?.includes('dark') && attempts < 3) {
      await themeSwitcher.click()
      await page.waitForTimeout(200)
      attempts++
    }

    // Verify dark mode
    await expect(html).toHaveClass(/dark/)

    // Check favicon is dark variant
    const faviconLink = page.locator('link[rel="icon"]')
    const faviconHref = await faviconLink.getAttribute('href')
    expect(faviconHref).toContain('dark')

    // Switch to light mode
    attempts = 0
    while ((await html.getAttribute('class'))?.includes('dark') && attempts < 3) {
      await themeSwitcher.click()
      await page.waitForTimeout(200)
      attempts++
    }

    // Verify light mode
    await expect(html).not.toHaveClass(/dark/)

    // Check favicon is light variant
    const lightFaviconHref = await faviconLink.getAttribute('href')
    expect(lightFaviconHref).toContain('light')
  })
})

test.describe('PWA Theme Color with System Preference', () => {
  test('respects system dark preference for theme-color', async ({ page }) => {
    // Emulate dark mode system preference
    await page.emulateMedia({ colorScheme: 'dark' })

    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    // Sign up
    await page.getByRole('button', { name: 'Sign Up' }).click()
    await page.getByLabel('Full Name').fill('System Test User')
    await page.getByLabel('Email').fill(`system-test-${Date.now()}@example.com`)
    await page.getByLabel('Password').fill('testpassword123')
    await page.getByRole('button', { name: 'Create Account' }).click()

    await page.waitForSelector('main', { state: 'visible', timeout: 15000 })

    // Theme-color should be dark since system prefers dark
    const themeColorMeta = page.locator('meta[name="theme-color"]')
    const themeColor = await themeColorMeta.getAttribute('content')
    expect(themeColor).toBe('#111827')
  })

  test('respects system light preference for theme-color', async ({ page }) => {
    // Emulate light mode system preference
    await page.emulateMedia({ colorScheme: 'light' })

    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    // Sign up
    await page.getByRole('button', { name: 'Sign Up' }).click()
    await page.getByLabel('Full Name').fill('System Test User')
    await page.getByLabel('Email').fill(`system-test-${Date.now()}@example.com`)
    await page.getByLabel('Password').fill('testpassword123')
    await page.getByRole('button', { name: 'Create Account' }).click()

    await page.waitForSelector('main', { state: 'visible', timeout: 15000 })

    // Theme-color should be light since system prefers light
    const themeColorMeta = page.locator('meta[name="theme-color"]')
    const themeColor = await themeColorMeta.getAttribute('content')
    expect(themeColor).toBe('#10b981')
  })

  test('theme-color updates when system preference changes', async ({ page }) => {
    // Start with light mode
    await page.emulateMedia({ colorScheme: 'light' })

    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    // Sign up
    await page.getByRole('button', { name: 'Sign Up' }).click()
    await page.getByLabel('Full Name').fill('System Change User')
    await page.getByLabel('Email').fill(`system-change-${Date.now()}@example.com`)
    await page.getByLabel('Password').fill('testpassword123')
    await page.getByRole('button', { name: 'Create Account' }).click()

    await page.waitForSelector('main', { state: 'visible', timeout: 15000 })

    // Verify light theme-color
    let themeColorMeta = page.locator('meta[name="theme-color"]')
    expect(await themeColorMeta.getAttribute('content')).toBe('#10b981')

    // Change system preference to dark
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.waitForTimeout(300) // Wait for the preference change to take effect

    // Theme-color should update to dark
    themeColorMeta = page.locator('meta[name="theme-color"]')
    expect(await themeColorMeta.getAttribute('content')).toBe('#111827')
  })
})
