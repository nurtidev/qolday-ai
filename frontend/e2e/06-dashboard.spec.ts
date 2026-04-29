import { test, expect, type Page } from '@playwright/test'

async function loginAsUser(page: Page) {
  await page.goto('/login')
  await page.getByPlaceholder('123456789012').fill('123456789012')
  await page.getByRole('button', { name: /войти через egov/i }).click()
  await page.waitForURL(/\/cabinet/, { timeout: 15_000 })
}

async function loginAsAdmin(page: Page) {
  await page.goto('/login')
  await page.getByPlaceholder('123456789012').fill('000000000000')
  await page.getByRole('button', { name: /войти через egov/i }).click()
  await page.waitForURL(/\/admin/, { timeout: 15_000 })
}

test.describe('Личный кабинет', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page)
  })

  test('кабинет доступен и показывает контент', async ({ page }) => {
    await expect(page).toHaveURL(/\/cabinet/)
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('показывает секцию заявок', async ({ page }) => {
    await expect(page.getByText(/заявк/i).first()).toBeVisible({ timeout: 10_000 })
  })

  test('кнопка выхода работает', async ({ page }) => {
    await page.getByText('Выйти').first().click()
    await expect(page).toHaveURL(/\/login|\/$/, { timeout: 5_000 })
  })
})

test.describe('Админ-панель', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('дашборд показывает статистику', async ({ page }) => {
    await expect(page).toHaveURL(/\/admin/)
    // Должны быть цифры аналитики или заголовки
    await expect(page.locator('body')).not.toBeEmpty()
    await expect(page.getByText(/услуги|заявки|пользовател/i).first()).toBeVisible({ timeout: 10_000 })
  })

  test('страница управления услугами доступна', async ({ page }) => {
    await page.goto('/admin/services')
    await expect(page).not.toHaveURL(/\/login/)
    // "Создать услугу" — это <Link>, рендерится как <a>
    await expect(page.getByRole('link', { name: /создать услугу/i })).toBeVisible({ timeout: 10_000 })
  })

  test('страница заявок в админке доступна', async ({ page }) => {
    await page.goto('/admin/applications')
    await expect(page).not.toHaveURL(/\/login/)
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('конструктор форм: создание новой услуги открывается', async ({ page }) => {
    await page.goto('/admin/services')
    // "Создать услугу" — это Link, не button
    const createLink = page.getByRole('link', { name: /создать услугу/i })
    await createLink.waitFor({ timeout: 10_000 })
    await createLink.click()
    await expect(page).toHaveURL(/\/admin\/services\/new/, { timeout: 5_000 })
  })
})
