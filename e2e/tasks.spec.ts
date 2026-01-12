import { test, expect } from './fixtures/test-fixtures'

test.describe('Task Management', () => {
  test('can create a task via quick add', async ({ authenticatedPage: page }) => {
    await page.keyboard.press('Meta+k')

    const quickAddInput = page.locator('input[placeholder*="task"], input[type="text"]').first()
    await expect(quickAddInput).toBeVisible({ timeout: 5000 })

    await quickAddInput.fill('Test task from E2E')
    await page.keyboard.press('Enter')

    await expect(page.getByText('Test task from E2E')).toBeVisible({ timeout: 5000 })
  })

  test('can create a task with priority', async ({ authenticatedPage: page }) => {
    await page.keyboard.press('Meta+k')

    const quickAddInput = page.locator('input[placeholder*="task"], input[type="text"]').first()
    await quickAddInput.fill('High priority task p1')
    await page.keyboard.press('Enter')

    await expect(page.getByText('High priority task')).toBeVisible({ timeout: 5000 })
  })

  test('can create a task with due date', async ({ authenticatedPage: page }) => {
    await page.keyboard.press('Meta+k')

    const quickAddInput = page.locator('input[placeholder*="task"], input[type="text"]').first()
    await quickAddInput.fill('Task due tomorrow')
    await page.keyboard.press('Enter')

    await expect(page.getByText('Task due')).toBeVisible({ timeout: 5000 })
  })

  test('can complete a task', async ({ authenticatedPage: page }) => {
    await page.keyboard.press('Meta+k')
    const quickAddInput = page.locator('input[placeholder*="task"], input[type="text"]').first()
    await quickAddInput.fill('Task to complete')
    await page.keyboard.press('Enter')

    await expect(page.getByText('Task to complete')).toBeVisible({ timeout: 5000 })

    const taskCheckbox = page.locator('button[role="checkbox"], input[type="checkbox"]').first()
    await taskCheckbox.click()

    await expect(page.getByText('Task to complete')).toHaveClass(/line-through|completed|opacity/)
  })
})
