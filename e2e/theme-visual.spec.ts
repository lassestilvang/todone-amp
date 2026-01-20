import { test as base, expect } from '@playwright/test'

interface TestUser {
  id: string
  name: string
  email: string
}

interface VisualFixtures {
  authenticatedPage: ReturnType<typeof base['page']>
  testUser: TestUser
}

const test = base.extend<VisualFixtures>({
  testUser: async ({}, use) => {
    const user: TestUser = {
      id: `visual-test-${Date.now()}`,
      name: 'Visual Test User',
      email: `visual-${Date.now()}@example.com`,
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

async function setThemeMode(
  page: ReturnType<typeof base['page']>,
  mode: 'light' | 'dark'
): Promise<void> {
  const themeSwitcher = page.getByRole('button', { name: /theme/i }).first()
  await expect(themeSwitcher).toBeVisible({ timeout: 5000 })

  const html = page.locator('html')
  const targetIsDark = mode === 'dark'

  let attempts = 0
  while (attempts < 4) {
    const currentClass = await html.getAttribute('class')
    const currentIsDark = currentClass?.includes('dark') ?? false

    if (currentIsDark === targetIsDark) break

    await themeSwitcher.click()
    await page.waitForTimeout(300)
    attempts++
  }

  // Wait for theme transition to complete
  await page.waitForTimeout(200)
}

test.describe('Visual Regression - Theme Changes', () => {
  test.describe.configure({ mode: 'serial' })

  test('main layout - light mode', async ({ authenticatedPage: page }) => {
    await setThemeMode(page, 'light')
    await page.waitForTimeout(300)

    await expect(page).toHaveScreenshot('main-layout-light.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    })
  })

  test('main layout - dark mode', async ({ authenticatedPage: page }) => {
    await setThemeMode(page, 'dark')
    await page.waitForTimeout(300)

    await expect(page).toHaveScreenshot('main-layout-dark.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    })
  })

  test('sidebar - light mode', async ({ authenticatedPage: page }) => {
    await setThemeMode(page, 'light')
    await page.waitForTimeout(300)

    const sidebar = page.locator('aside').first()
    await expect(sidebar).toHaveScreenshot('sidebar-light.png', {
      maxDiffPixelRatio: 0.05,
    })
  })

  test('sidebar - dark mode', async ({ authenticatedPage: page }) => {
    await setThemeMode(page, 'dark')
    await page.waitForTimeout(300)

    const sidebar = page.locator('aside').first()
    await expect(sidebar).toHaveScreenshot('sidebar-dark.png', {
      maxDiffPixelRatio: 0.05,
    })
  })

  test('theme switcher button - light mode', async ({ authenticatedPage: page }) => {
    await setThemeMode(page, 'light')
    await page.waitForTimeout(300)

    const themeSwitcher = page.getByRole('button', { name: /theme/i }).first()
    await expect(themeSwitcher).toHaveScreenshot('theme-switcher-light.png', {
      maxDiffPixelRatio: 0.05,
    })
  })

  test('theme switcher button - dark mode', async ({ authenticatedPage: page }) => {
    await setThemeMode(page, 'dark')
    await page.waitForTimeout(300)

    const themeSwitcher = page.getByRole('button', { name: /theme/i }).first()
    await expect(themeSwitcher).toHaveScreenshot('theme-switcher-dark.png', {
      maxDiffPixelRatio: 0.05,
    })
  })
})

test.describe('Visual Regression - Component States', () => {
  test('buttons hover state - light mode', async ({ authenticatedPage: page }) => {
    await setThemeMode(page, 'light')
    await page.waitForTimeout(300)

    const addButton = page.getByRole('button', { name: /add|create|new/i }).first()
    if (await addButton.isVisible()) {
      await addButton.hover()
      await page.waitForTimeout(100)
      await expect(addButton).toHaveScreenshot('button-hover-light.png', {
        maxDiffPixelRatio: 0.05,
      })
    }
  })

  test('buttons hover state - dark mode', async ({ authenticatedPage: page }) => {
    await setThemeMode(page, 'dark')
    await page.waitForTimeout(300)

    const addButton = page.getByRole('button', { name: /add|create|new/i }).first()
    if (await addButton.isVisible()) {
      await addButton.hover()
      await page.waitForTimeout(100)
      await expect(addButton).toHaveScreenshot('button-hover-dark.png', {
        maxDiffPixelRatio: 0.05,
      })
    }
  })

  test('navigation items - light mode', async ({ authenticatedPage: page }) => {
    await setThemeMode(page, 'light')
    await page.waitForTimeout(300)

    const navItem = page.getByRole('link', { name: /today|inbox|upcoming/i }).first()
    if (await navItem.isVisible()) {
      await expect(navItem).toHaveScreenshot('nav-item-light.png', {
        maxDiffPixelRatio: 0.05,
      })
    }
  })

  test('navigation items - dark mode', async ({ authenticatedPage: page }) => {
    await setThemeMode(page, 'dark')
    await page.waitForTimeout(300)

    const navItem = page.getByRole('link', { name: /today|inbox|upcoming/i }).first()
    if (await navItem.isVisible()) {
      await expect(navItem).toHaveScreenshot('nav-item-dark.png', {
        maxDiffPixelRatio: 0.05,
      })
    }
  })
})

test.describe('Visual Regression - Empty States', () => {
  test('empty inbox - light mode', async ({ authenticatedPage: page }) => {
    await setThemeMode(page, 'light')
    await page.waitForTimeout(300)

    // Navigate to inbox
    const inboxLink = page.getByRole('link', { name: /inbox/i }).first()
    if (await inboxLink.isVisible()) {
      await inboxLink.click()
      await page.waitForTimeout(500)

      const mainContent = page.locator('main').first()
      await expect(mainContent).toHaveScreenshot('empty-inbox-light.png', {
        maxDiffPixelRatio: 0.05,
      })
    }
  })

  test('empty inbox - dark mode', async ({ authenticatedPage: page }) => {
    await setThemeMode(page, 'dark')
    await page.waitForTimeout(300)

    // Navigate to inbox
    const inboxLink = page.getByRole('link', { name: /inbox/i }).first()
    if (await inboxLink.isVisible()) {
      await inboxLink.click()
      await page.waitForTimeout(500)

      const mainContent = page.locator('main').first()
      await expect(mainContent).toHaveScreenshot('empty-inbox-dark.png', {
        maxDiffPixelRatio: 0.05,
      })
    }
  })
})

test.describe('Visual Regression - Settings Page Themes', () => {
  test('settings page - light mode', async ({ authenticatedPage: page }) => {
    await setThemeMode(page, 'light')
    await page.waitForTimeout(300)

    // Navigate to settings
    const settingsLink = page.getByRole('link', { name: /settings/i }).first()
    if (await settingsLink.isVisible()) {
      await settingsLink.click()
      await page.waitForTimeout(500)

      await expect(page).toHaveScreenshot('settings-light.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.05,
      })
    }
  })

  test('settings page - dark mode', async ({ authenticatedPage: page }) => {
    await setThemeMode(page, 'dark')
    await page.waitForTimeout(300)

    // Navigate to settings
    const settingsLink = page.getByRole('link', { name: /settings/i }).first()
    if (await settingsLink.isVisible()) {
      await settingsLink.click()
      await page.waitForTimeout(500)

      await expect(page).toHaveScreenshot('settings-dark.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.05,
      })
    }
  })
})

test.describe('Visual Regression - Focus States', () => {
  test('focus ring visibility - light mode', async ({ authenticatedPage: page }) => {
    await setThemeMode(page, 'light')
    await page.waitForTimeout(300)

    const themeSwitcher = page.getByRole('button', { name: /theme/i }).first()
    await themeSwitcher.focus()
    await page.waitForTimeout(100)

    await expect(themeSwitcher).toHaveScreenshot('focus-ring-light.png', {
      maxDiffPixelRatio: 0.05,
    })
  })

  test('focus ring visibility - dark mode', async ({ authenticatedPage: page }) => {
    await setThemeMode(page, 'dark')
    await page.waitForTimeout(300)

    const themeSwitcher = page.getByRole('button', { name: /theme/i }).first()
    await themeSwitcher.focus()
    await page.waitForTimeout(100)

    await expect(themeSwitcher).toHaveScreenshot('focus-ring-dark.png', {
      maxDiffPixelRatio: 0.05,
    })
  })
})

test.describe('Visual Regression - Responsive Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('mobile layout - light mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    await page.getByRole('button', { name: 'Sign Up' }).click()
    await page.getByLabel('Full Name').fill('Mobile Light User')
    await page.getByLabel('Email').fill(`mobile-light-${Date.now()}@example.com`)
    await page.getByLabel('Password').fill('testpassword123')
    await page.getByRole('button', { name: 'Create Account' }).click()

    await page.waitForSelector('main', { state: 'visible', timeout: 15000 })
    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot('mobile-layout-light.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    })
  })

  test('mobile layout - dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    await page.getByRole('button', { name: 'Sign Up' }).click()
    await page.getByLabel('Full Name').fill('Mobile Dark User')
    await page.getByLabel('Email').fill(`mobile-dark-${Date.now()}@example.com`)
    await page.getByLabel('Password').fill('testpassword123')
    await page.getByRole('button', { name: 'Create Account' }).click()

    await page.waitForSelector('main', { state: 'visible', timeout: 15000 })
    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot('mobile-layout-dark.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    })
  })
})

test.describe('Visual Regression - Tablet', () => {
  test.use({ viewport: { width: 768, height: 1024 } })

  test('tablet layout - light mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    await page.getByRole('button', { name: 'Sign Up' }).click()
    await page.getByLabel('Full Name').fill('Tablet Light User')
    await page.getByLabel('Email').fill(`tablet-light-${Date.now()}@example.com`)
    await page.getByLabel('Password').fill('testpassword123')
    await page.getByRole('button', { name: 'Create Account' }).click()

    await page.waitForSelector('main', { state: 'visible', timeout: 15000 })
    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot('tablet-layout-light.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    })
  })

  test('tablet layout - dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    await page.getByRole('button', { name: 'Sign Up' }).click()
    await page.getByLabel('Full Name').fill('Tablet Dark User')
    await page.getByLabel('Email').fill(`tablet-dark-${Date.now()}@example.com`)
    await page.getByLabel('Password').fill('testpassword123')
    await page.getByRole('button', { name: 'Create Account' }).click()

    await page.waitForSelector('main', { state: 'visible', timeout: 15000 })
    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot('tablet-layout-dark.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    })
  })
})
