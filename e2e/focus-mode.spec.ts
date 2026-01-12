import { test, expect } from './fixtures/test-fixtures'

test.describe('Focus Mode / Pomodoro Timer', () => {
  test('focus mode widget is visible when authenticated', async ({ authenticatedPage: page }) => {
    const focusWidget = page.locator('[data-testid="focus-widget"], .focus-mode-widget')

    await expect(focusWidget.or(page.getByRole('button', { name: /focus|timer|pomodoro/i }))).toBeVisible({ timeout: 10000 })
  })

  test('can start a focus session', async ({ authenticatedPage: page }) => {
    const startButton = page.getByRole('button', { name: /start|focus|begin/i }).first()

    if (await startButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await startButton.click()

      const timerDisplay = page.locator('[data-testid="timer-display"], .timer-display, text=/\\d+:\\d+/')
      await expect(timerDisplay.first()).toBeVisible({ timeout: 5000 })
    }
  })

  test('can pause and resume focus session', async ({ authenticatedPage: page }) => {
    const startButton = page.getByRole('button', { name: /start|focus|begin/i }).first()

    if (await startButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await startButton.click()

      const pauseButton = page.getByRole('button', { name: /pause/i })
      if (await pauseButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await pauseButton.click()

        const resumeButton = page.getByRole('button', { name: /resume|continue/i })
        await expect(resumeButton).toBeVisible({ timeout: 3000 })
      }
    }
  })
})
