import { test, expect } from '@playwright/test'

// Логин через eGov mock: только ИИН, имя тянется с бэкенда
const ADMIN_IIN = '000000000000'
const USER_IIN  = '123456789012'

test.describe('Авторизация', () => {
  test('страница логина доступна и показывает форму', async ({ page }) => {
    await page.goto('/login')
    // Поле ИИН с placeholder "123456789012"
    await expect(page.getByPlaceholder('123456789012')).toBeVisible()
    // Кнопка входа через eGov
    await expect(page.getByRole('button', { name: /войти через egov/i })).toBeVisible()
  })

  test('вход с ИИН короче 12 цифр не отправляет запрос', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder('123456789012').fill('123')
    await page.getByRole('button', { name: /войти через egov/i }).click()
    // Остаёмся на странице логина — ИИН фильтрует нецифровые символы
    await expect(page).toHaveURL(/\/login/)
  })

  test('вход обычного пользователя перенаправляет в кабинет', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder('123456789012').fill(USER_IIN)
    await page.getByRole('button', { name: /войти через egov/i }).click()
    await expect(page).toHaveURL(/\/cabinet/, { timeout: 15_000 })
  })

  test('вход администратора перенаправляет в admin-панель', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder('123456789012').fill(ADMIN_IIN)
    await page.getByRole('button', { name: /войти через egov/i }).click()
    await expect(page).toHaveURL(/\/admin/, { timeout: 15_000 })
  })

  test('выход из системы очищает сессию и token', async ({ page }) => {
    // Логинимся
    await page.goto('/login')
    await page.getByPlaceholder('123456789012').fill(USER_IIN)
    await page.getByRole('button', { name: /войти через egov/i }).click()
    await page.waitForURL(/\/cabinet/, { timeout: 15_000 })

    // Нажимаем "Выйти"
    await page.getByText('Выйти').first().click()
    await expect(page).toHaveURL(/\/login|\/$/, { timeout: 5_000 })

    // localStorage token должен быть удалён
    const token = await page.evaluate(() => localStorage.getItem('token'))
    expect(token).toBeNull()
  })

  test('защищённый маршрут редиректит неавторизованного на главную', async ({ page }) => {
    // RequireAuth редиректит на "/" — hero должен быть виден
    await page.goto('/cabinet')
    await expect(page.getByText('казахстанского бизнеса')).toBeVisible({ timeout: 8_000 })
  })
})
