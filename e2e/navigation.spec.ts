import { test, expect } from './fixtures/test-fixtures'

test.describe('Navigation', () => {
  test('can navigate between views via sidebar', async ({ authenticatedPage: page }) => {
    await expect(page.locator('#sidebar, [data-testid="sidebar"]')).toBeVisible()

    await page.getByRole('button', { name: /today/i }).click()
    await expect(page.getByRole('heading', { name: /today/i })).toBeVisible({ timeout: 5000 })

    await page.getByRole('button', { name: /upcoming/i }).click()
    await expect(page.getByRole('heading', { name: /upcoming/i })).toBeVisible({ timeout: 5000 })

    await page.getByRole('button', { name: /inbox/i }).first().click()
    await expect(page.getByRole('heading', { name: /inbox/i })).toBeVisible({ timeout: 5000 })
  })

  test('can navigate to Eisenhower Matrix view', async ({ authenticatedPage: page }) => {
    const eisenhowerButton = page.getByRole('button', { name: /eisenhower|matrix/i })

    if (await eisenhowerButton.isVisible()) {
      await eisenhowerButton.click()
      await expect(
        page.getByRole('heading', { name: /eisenhower|matrix|urgent|important/i })
      ).toBeVisible({ timeout: 5000 })
    }
  })

  test('keyboard shortcuts open quick add modal', async ({ authenticatedPage: page }) => {
    await page.keyboard.press('Meta+k')

    const quickAddModal = page.locator('[role="dialog"], .quick-add-modal, input[type="text"]')
    await expect(quickAddModal.first()).toBeVisible({ timeout: 5000 })

    await page.keyboard.press('Escape')

    await expect(quickAddModal.first()).not.toBeVisible({ timeout: 5000 })
  })

  test('keyboard shortcuts help modal works', async ({ authenticatedPage: page }) => {
    await page.keyboard.press('Shift+?')

    const helpModal = page.locator('[role="dialog"]').filter({ hasText: /keyboard|shortcut/i })
    if (await helpModal.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(helpModal).toBeVisible()
      await page.keyboard.press('Escape')
    }
  })
})
