# Qoldau AI — Единый портал поддержки бизнеса

Платформа-конструктор для автоматизации мер поддержки холдинга Байтерек.  
No-code конструктор форм + AI-генерация через Claude API.

**Хакатон:** Astana Hub × АО «НИХ «Байтерек» · дедлайн 04.05.2026

---

## Быстрый старт (Docker)

```bash
# 1. Клонировать репозиторий
git clone <repo-url>
cd qolday-ai

# 2. Создать .env файл
cp .env.example .env
# Открыть .env и вставить ANTHROPIC_API_KEY

# 3. Запустить всё одной командой
make up
```

| Сервис | URL |
|--------|-----|
| Фронтенд | http://localhost:3000 |
| Backend API | http://localhost:8080 |

### Тестовые аккаунты

| Роль | ИИН | Имя |
|------|-----|-----|
| Администратор | `000000000000` | Администратор |
| Пользователь | любые 12 цифр | любое |

---

## Локальная разработка (без Docker)

```bash
# Инфраструктура (postgres + redis)
make infra

# Backend (порт 8080)
cp .env.example .env
make backend-dev

# Frontend (порт 5173)
make install-frontend
make frontend-dev
```

---

## Архитектура

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────┐
│  React 18 + TS  │────▶│  Go + chi router │────▶│ PostgreSQL 16│
│  Vite + Zustand │     │  JWT Auth        │     │ (JSONB forms)│
│  React Query v5 │     │  Anthropic API   │     ├──────────────┤
└─────────────────┘     └──────────────────┘     │   Redis 7    │
                                                  └──────────────┘
```

### Ключевая концепция: FormSchema

Вся логика форм хранится в `services.form_schema` (PostgreSQL JSONB) — не в коде.  
Администратор настраивает поля через визуальный конструктор, AI генерирует схему по описанию.

```
FormSchema → steps[] → fields[]
  type: text | select | number | currency | date | file | calculated | checkbox | radio
  condition: условная видимость шага/поля
  formula: JS-выражение для calculated полей (пересчёт в реальном времени)
  prefill_from: egov.iin | egov.org_name | egov.bin | ...
```

### Что демонстрируется

1. **Конструктор форм** — администратор без кода настраивает поля, валидацию, логику переходов
2. **AI-генерация** — описание услуги → готовая форма через Claude API (`claude-sonnet-4-6`)
3. **Клиентский путь** — личный кабинет, пошаговые формы с масками и автоматическими расчётами
4. **Mock eGov** — автозаполнение реквизитов по ИИН/БИН (`GET /api/mock/egov/:iin`)
5. **Тиражируемость** — одна платформа для 70+ услуг без изменения кода

### Контрольный кейс

Услуга «Приобретение авиатранспорта и вагонов в лизинг» предустановлена в seed-миграции.  
Реализована через `form_schema` (JSONB), не через хардкод.

---

## Команды

```bash
make up            # запустить всё (postgres, redis, backend, frontend)
make down          # остановить
make logs          # стриминг логов
make infra         # только postgres + redis
make backend-dev   # go run ./cmd/server (порт 8080)
make frontend-dev  # vite dev (порт 5173)
make migrate       # применить миграции вручную
```

## Стек

- **Frontend:** React 18, TypeScript, Vite, TanStack Query v5, Zustand, Axios
- **Backend:** Go 1.22, chi, sqlx, golang-migrate
- **БД:** PostgreSQL 16 (JSONB для form_schema), Redis 7
- **AI:** Anthropic Claude API (`claude-sonnet-4-6`)
- **Auth:** JWT, IIN-based (mock eGov)
- **Deploy:** Docker Compose, nginx
