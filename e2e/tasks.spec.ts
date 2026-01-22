import { test, expect } from './fixtures/test-fixtures'

test.describe('Task Management', () => {
  test('can create a task via quick add', async ({ authenticatedPage: page }) => {
    await page.keyboard.press('Meta+k')

    const quickAddInput = page.locator('input[placeholder*="task"], input[type="text"]').first()
    await expect(quickAddInput).toBeVisible({ timeout: 5000 })

    await quickAddInput.fill('Test task from E2E p3')
    await page.keyboard.press('Enter')

    await expect(page.getByText('Test task from E2E')).toBeVisible({ timeout: 5000 })
  })

  test('can create a task with priority', async ({ authenticatedPage: page }) => {
    await page.keyboard.press('Meta+k')

    const quickAddInput = page.locator('input[placeholder*="task"], input[type="text"]').first()
    await expect(quickAddInput).toBeVisible({ timeout: 5000 })
    await quickAddInput.fill('HighPriorityTask p1')
    await page.keyboard.press('Enter')

    await expect(page.getByText('HighPriorityTask')).toBeVisible({ timeout: 5000 })
  })

  test('can create a task with due date', async ({ authenticatedPage: page }) => {
    await page.keyboard.press('Meta+k')

    const quickAddInput = page.locator('input[placeholder*="task"], input[type="text"]').first()
    await expect(quickAddInput).toBeVisible({ timeout: 5000 })
    await quickAddInput.fill('DueDateTask tomorrow')
    await page.keyboard.press('Enter')

    await expect(page.locator('p', { hasText: 'DueDateTask' })).toBeVisible({ timeout: 5000 })
  })

  test('can complete a task', async ({ authenticatedPage: page }) => {
    await page.keyboard.press('Meta+k')
    const quickAddInput = page.locator('input[placeholder*="task"], input[type="text"]').first()
    await expect(quickAddInput).toBeVisible({ timeout: 5000 })
    await quickAddInput.fill('TaskToComplete p2')
    await page.keyboard.press('Enter')

    await expect(page.getByText('TaskToComplete')).toBeVisible({ timeout: 5000 })

    const taskCheckbox = page.locator('button[role="checkbox"], input[type="checkbox"]').first()
    await taskCheckbox.click()

    await expect(page.getByText('TaskToComplete')).not.toBeVisible({ timeout: 5000 })
  })
})
