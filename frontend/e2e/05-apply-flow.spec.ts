import { test, expect, type Page } from '@playwright/test'

async function loginAsUser(page: Page) {
  await page.goto('/login')
  await page.getByPlaceholder('123456789012').fill('123456789012')
  await page.getByRole('button', { name: /войти через egov/i }).click()
  await page.waitForURL(/\/cabinet/, { timeout: 15_000 })
}

test.describe('Подача заявки', () => {
  test('неавторизованный пользователь на /cabinet/apply редиректится на главную', async ({ page }) => {
    // RequireAuth редиректит на "/" — hero должен быть виден
    await page.goto('/cabinet/apply/00000000-0000-0000-0000-000000000000')
    await expect(page.getByText('казахстанского бизнеса')).toBeVisible({ timeout: 8_000 })
  })

  test('ссылка "Подать заявку" на детальной странице ведёт на форму', async ({ page }) => {
    await loginAsUser(page)
    await page.goto('/services')
    await expect(page.locator('a.card').first()).toBeVisible({ timeout: 20_000 })
    await page.locator('a.card').first().click()
    await expect(page).toHaveURL(/\/services\/[a-f0-9-]+/)

    const applyLink = page.getByRole('link', { name: /подать заявку/i })
    await expect(applyLink).toBeVisible({ timeout: 10_000 })
    await applyLink.click()
    await expect(page).toHaveURL(/\/cabinet\/apply\/[a-f0-9-]+/, { timeout: 5_000 })
  })

  test('форма заявки отображает поля ввода', async ({ page }) => {
    await loginAsUser(page)
    await page.goto('/services')
    await expect(page.locator('a.card').first()).toBeVisible({ timeout: 20_000 })
    await page.locator('a.card').first().click()
    const applyLink = page.getByRole('link', { name: /подать заявку/i })
    await applyLink.waitFor({ timeout: 10_000 })
    await applyLink.click()
    await expect(page).toHaveURL(/\/cabinet\/apply\//)

    // Должны быть поля формы
    await expect(page.locator('input, select, textarea').first()).toBeVisible({ timeout: 10_000 })
  })

  test('форма показывает stepper с номерами шагов', async ({ page }) => {
    await loginAsUser(page)
    await page.goto('/services')
    await expect(page.locator('a.card').first()).toBeVisible({ timeout: 20_000 })
    // Берём услугу с лизингом — там 2 шага
    const leasingCard = page.locator('a.card').filter({ hasText: 'авиатранспорта' })
    if (await leasingCard.isVisible()) {
      await leasingCard.click()
      const applyLink = page.getByRole('link', { name: /подать заявку/i })
      await applyLink.waitFor({ timeout: 10_000 })
      await applyLink.click()
      // Stepper: "Шаг 1" или нумерация видна
      await expect(page.getByText(/шаг 1|1\s*из\s*|step 1/i).first()).toBeVisible({ timeout: 10_000 })
    }
  })
})
