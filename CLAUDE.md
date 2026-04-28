# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Qoldau AI** — единый портал поддержки бизнеса (хакатон Astana Hub × Байтерек, дедлайн 04.05.2026).
Ключевое требование: услуги реализуются через no-code конструктор форм, а не хардкодом — иначе задание считается невыполненным.

## Development Commands

### Full stack (Docker)
```bash
make up          # запустить всё (postgres, redis, backend, frontend)
make down        # остановить
make logs        # стриминг логов
make infra       # только postgres + redis (для локальной разработки)
```

### Local development (without Docker)
```bash
# Backend
cp .env.example .env   # заполнить переменные
make backend-dev       # go run ./cmd/server (порт 8080)
make migrate           # go run ./cmd/migrate

# Frontend
make install-frontend  # npm install
make frontend-dev      # vite dev (порт 5173)
```

### Frontend-only commands
```bash
cd frontend
npm run dev      # dev-сервер
npm run build    # tsc + vite build
npm run lint     # eslint src
```

### TypeScript check
```bash
cd frontend && npx tsc --noEmit
```

## Architecture

### Stack
- **Frontend**: React 18 + TypeScript + Vite, `@tanstack/react-query` v5, `axios`, `zustand`
- **Backend**: Go 1.22 + `chi` router, PostgreSQL 16 (JSONB), Redis 7
- **Auth**: JWT (IIN-based, без пароля — mock eGov-вход)
- **AI**: Anthropic Claude API (`claude-sonnet-4-6`) — генерация `form_schema` по описанию

### Proxy
Vite проксирует `/api` и `/uploads` → `http://localhost:8080`. В продакшне frontend собирается в статику и раздаётся через nginx перед backend.

### Core concept: FormSchema
Вся логика форм хранится в `services.form_schema` (PostgreSQL JSONB). Структура:

```
FormSchema { steps: FormStep[] }
FormStep   { id, title, fields: FormField[], condition? }
FormField  { id, type, label, placeholder?, required?, options?,
             mask?, formula?, readonly?, accept?, prefill_from?, condition? }
```

Типы полей: `text | textarea | number | currency | select | multiselect | date | file | calculated | checkbox | radio`

- **`calculated`** поля: `formula` — JS-выражение с `field_id` как переменными (пересчитывается в реальном времени).
- **`condition`** на шаге/поле: `{ field_id, operator: equals|not_equals|greater_than|less_than, value }` — условная видимость.
- **`prefill_from`**: `'egov.xxx'` — автозаполнение из mock eGov API (поле `field.id` ← `egovData[xxx]`).

### Frontend structure

```
src/
  api/client.ts          — все axios-клиенты: servicesApi, applicationsApi,
                           documentsApi, notificationsApi, mockApi, aiApi
  store/auth.ts          — zustand + localStorage: { user, token, setAuth, logout }
  types/index.ts         — все TypeScript-типы (FormSchema, Service, Application, …)
  components/
    FormRenderer/        — рендерит FormSchema в пошаговую форму (stepper + валидация)
    icons.tsx            — все иконки через I.IconName
    Toast.tsx            — useToast() → toast.push(msg, 'success'|'error')
    Layout/Header.tsx    — Header (публичный) + AdminTopBar (admin-панель)
  pages/
    cabinet/ApplyPage.tsx      — подача заявки через FormRenderer
    cabinet/DashboardPage.tsx  — личный кабинет (заявки, уведомления, профиль, документы)
    ServiceDetailPage.tsx      — детальная страница услуги (вкладки: документы/шаги — из form_schema)
    admin/ServiceFormPage.tsx  — конструктор форм для администратора
```

### Backend structure

```
backend/
  cmd/server/main.go         — точка входа, роутинг chi, DI хендлеров
  internal/
    config/config.go          — загрузка env (DATABASE_URL, JWT_SECRET, ANTHROPIC_API_KEY, …)
    db/db.go                  — sqlx Postgres + golang-migrate
    models/models.go          — все модели (User, Service, Application, Document, Notification)
    handlers/                 — по одному файлу на домен (auth, services, applications, …)
      ai.go                   — POST /api/ai/generate-form → Anthropic API → form_schema JSON
      mock.go                 — GET /api/mock/egov/:iin → { iin, full_name, org_name, bin, … }
    middleware/auth.go        — JWT-валидация + RequireRole
  migrations/001_init.up.sql — схема БД + seed (admin iin=000000000000, контрольный кейс лизинга)
```

### API routes summary
| Method | Path | Auth |
|--------|------|------|
| POST | `/api/auth/login` | — |
| GET | `/api/auth/me` | user |
| GET/POST | `/api/services` | GET public, POST admin/author |
| PUT/DELETE | `/api/services/:id` | admin/author |
| POST | `/api/services/:id/publish` | admin |
| POST | `/api/ai/generate-form` | user |
| POST/GET | `/api/applications` | user |
| PUT | `/api/applications/:id/status` | admin |
| POST/GET | `/api/documents` | user |
| GET/PUT | `/api/notifications` | user |
| GET | `/api/mock/egov/:iin` | — |
| GET | `/api/analytics/summary` | admin |

### React Query conventions
- v5 синтаксис: `useQuery({ queryKey, queryFn, enabled })`
- Нет `onSuccess` колбека — вместо него `useEffect` на `data`
- `useQueryClient().invalidateQueries({ queryKey: [...] })` после мутаций

### Styling
- Inline styles + CSS-классы из `index.css`: `btn btn-primary btn-secondary btn-ghost btn-sm`, `card`, `input select textarea`, `badge`, `field-label`, `skeleton`, `page-fade`, `container`
- CSS-переменные: `--color-primary`, `--color-accent`, `--color-success`, `--color-danger`, `--color-text`, `--color-text-2`, `--color-text-3`, `--color-border`, `--color-surface-2`, `--color-info`, `--color-info-soft`, `--color-success-soft`, `--color-accent-soft`
- Иконки: `I.Check`, `I.ArrowLeft`, `I.ArrowRight`, `I.Shield`, `I.Info`, `I.Upload`, `I.Document`, `I.Download`, `I.CheckCircle`, `I.Alert` и др. из `components/icons.tsx`

### Auth flow
- Вход: POST `/api/auth/login` с `{ iin, full_name, org_name? }` → JWT-токен
- Токен хранится в `localStorage('token')` и добавляется через axios-интерцептор
- 401 → авторедирект на `/login`
- Роли: `user` / `author` / `admin`; сид-администратор — IIN `000000000000`
