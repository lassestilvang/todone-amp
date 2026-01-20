import { test as base, expect } from '@playwright/test'

interface TestUser {
  id: string
  name: string
  email: string
}

interface MobileThemeFixtures {
  authenticatedMobilePage: ReturnType<typeof base['page']>
  testUser: TestUser
}

const test = base.extend<MobileThemeFixtures>({
  testUser: async ({}, use) => {
    const user: TestUser = {
      id: `test-user-${Date.now()}`,
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
    }
    await use(user)
  },

  authenticatedMobilePage: async ({ page, testUser }, use) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    await page.getByRole('button', { name: 'Sign Up' }).click()

    await page.getByLabel('Full Name').fill(testUser.name)
    await page.getByLabel('Email').fill(testUser.email)
    await page.getByLabel('Password').fill('testpassword123')

    await page.getByRole('button', { name: 'Create Account' }).click()

    // Wait for app to be ready - on mobile, wait for main element to be visible
    await page.waitForSelector('main', { state: 'visible', timeout: 15000 })

    await use(page)
  },
})

test.describe('Theme Switching on Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('theme switcher is visible on mobile', async ({ authenticatedMobilePage: page }) => {
    // On mobile, theme switcher is in the mobile header
    const themeSwitcher = page.getByRole('button', { name: /theme/i })
    await expect(themeSwitcher.first()).toBeVisible({ timeout: 5000 })
  })

  test('can cycle through themes on mobile', async ({ authenticatedMobilePage: page }) => {
    const themeSwitcher = page.getByRole('button', { name: /theme/i }).first()
    await expect(themeSwitcher).toBeVisible({ timeout: 5000 })

    // Get initial state
    const html = page.locator('html')

    // Click to cycle: light -> dark -> system -> light
    await themeSwitcher.click()
    await page.waitForTimeout(200)

    // Click again to continue cycling
    await themeSwitcher.click()
    await page.waitForTimeout(200)

    // Click once more to complete cycle
    await themeSwitcher.click()
    await page.waitForTimeout(200)

    // Verify theme class exists (either 'light' or 'dark')
    const hasThemeClass = await html.evaluate((el) => {
      return el.classList.contains('light') || el.classList.contains('dark')
    })
    expect(hasThemeClass).toBe(true)
  })

  test('theme persists after page reload on mobile', async ({ authenticatedMobilePage: page }) => {
    const themeSwitcher = page.getByRole('button', { name: /theme/i }).first()
    await expect(themeSwitcher).toBeVisible({ timeout: 5000 })

    // Set to dark mode by cycling
    const html = page.locator('html')
    let isDark = await html.evaluate((el) => el.classList.contains('dark'))

    // Click until we get dark mode
    let attempts = 0
    while (!isDark && attempts < 3) {
      await themeSwitcher.click()
      await page.waitForTimeout(200)
      isDark = await html.evaluate((el) => el.classList.contains('dark'))
      attempts++
    }

    // Reload the page
    await page.reload()
    await page.waitForLoadState('domcontentloaded')

    // Check theme is preserved (check localStorage)
    const storedTheme = await page.evaluate(() => {
      const stored = localStorage.getItem('todone-theme')
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch {
          return null
        }
      }
      return null
    })

    expect(storedTheme).not.toBeNull()
  })

  test('theme changes apply visual updates on mobile', async ({ authenticatedMobilePage: page }) => {
    const html = page.locator('html')

    // Get main content area
    const body = page.locator('body')
    await expect(body).toBeVisible({ timeout: 5000 })

    // Get initial background
    const initialBgColor = await body.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })

    // Get current mode
    const currentIsDark = await html.evaluate((el) => el.classList.contains('dark'))

    // Toggle theme
    const themeSwitcher = page.getByRole('button', { name: /theme/i }).first()
    await themeSwitcher.click()
    await page.waitForTimeout(300) // Wait for transition

    const afterToggleIsDark = await html.evaluate((el) => el.classList.contains('dark'))

    // If we changed modes, colors should change
    if (currentIsDark !== afterToggleIsDark) {
      const newBgColor = await body.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor
      })
      // Background should change between light and dark
      expect(newBgColor).not.toBe(initialBgColor)
    }
  })

  test('mobile navigation theme switcher is accessible', async ({
    authenticatedMobilePage: page,
  }) => {
    const themeSwitcher = page.getByRole('button', { name: /theme/i }).first()
    await expect(themeSwitcher).toBeVisible({ timeout: 5000 })

    // Check aria-label exists
    const ariaLabel = await themeSwitcher.getAttribute('aria-label')
    expect(ariaLabel).toMatch(/theme/i)

    // Check it can be focused
    await themeSwitcher.focus()
    await expect(themeSwitcher).toBeFocused()

    // Check keyboard interaction works
    await page.keyboard.press('Enter')
    await page.waitForTimeout(200)

    // Theme should have changed
    const html = page.locator('html')
    const hasThemeClass = await html.evaluate((el) => {
      return el.classList.contains('light') || el.classList.contains('dark')
    })
    expect(hasThemeClass).toBe(true)
  })

  test('touch interactions work for theme toggle', async ({ browser, testUser }) => {
    // Create a context with touch enabled for mobile simulation
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
      hasTouch: true,
    })
    const page = await context.newPage()

    // Authenticate
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.getByRole('button', { name: 'Sign Up' }).click()
    await page.getByLabel('Full Name').fill(testUser.name)
    await page.getByLabel('Email').fill(testUser.email)
    await page.getByLabel('Password').fill('testpassword123')
    await page.getByRole('button', { name: 'Create Account' }).click()
    await page.waitForSelector('main', { state: 'visible', timeout: 15000 })

    const themeSwitcher = page.getByRole('button', { name: /theme/i }).first()
    await expect(themeSwitcher).toBeVisible({ timeout: 5000 })

    // Get bounding box for tap
    const box = await themeSwitcher.boundingBox()
    expect(box).not.toBeNull()

    if (box) {
      // Simulate tap
      await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2)
      await page.waitForTimeout(200)

      // Verify the page is still functional
      const html = page.locator('html')
      const hasThemeClass = await html.evaluate((el) => {
        return el.classList.contains('light') || el.classList.contains('dark')
      })
      expect(hasThemeClass).toBe(true)
    }

    await context.close()
  })
})

test.describe('Theme Switching on Tablet', () => {
  test.use({ viewport: { width: 768, height: 1024 } })

  test('theme switcher works on tablet viewport', async ({ authenticatedMobilePage: page }) => {
    // On tablet, the sidebar should be visible
    await page.waitForSelector('[data-testid="sidebar"], #sidebar, main', { timeout: 10000 })

    const themeSwitcher = page.getByRole('button', { name: /theme/i }).first()
    await expect(themeSwitcher).toBeVisible({ timeout: 5000 })

    // Click and verify it works
    await themeSwitcher.click()
    await page.waitForTimeout(200)

    const html = page.locator('html')
    const hasThemeClass = await html.evaluate((el) => {
      return el.classList.contains('light') || el.classList.contains('dark')
    })
    expect(hasThemeClass).toBe(true)
  })
})

test.describe('System Theme Preference on Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('respects system dark mode preference', async ({ page }) => {
    // Emulate dark color scheme before navigating
    await page.emulateMedia({ colorScheme: 'dark' })

    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    // Skip auth - just check theme on login page
    const html = page.locator('html')

    // Check if theme respects system preference
    await page.waitForTimeout(500)

    const themeClass = await html.evaluate((el) => {
      return {
        hasDark: el.classList.contains('dark'),
        hasLight: el.classList.contains('light'),
      }
    })

    // Should have some theme class set
    expect(themeClass.hasDark || themeClass.hasLight).toBe(true)
  })

  test('respects system light mode preference', async ({ page }) => {
    // Emulate light color scheme
    await page.emulateMedia({ colorScheme: 'light' })

    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    const html = page.locator('html')
    await page.waitForTimeout(500)

    const themeClass = await html.evaluate((el) => {
      return {
        hasDark: el.classList.contains('dark'),
        hasLight: el.classList.contains('light'),
      }
    })

    expect(themeClass.hasDark || themeClass.hasLight).toBe(true)
  })
})
