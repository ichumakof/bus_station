# Автовокзал - Иваново (Lab 2 — Frontend scaffold)

Каркас клиентского приложения Service Desk на **React 18 + TypeScript + Vite**, с **Ant Design 5**, **React Router v6** и **TanStack Query v5**.

## Что сделано (Lab 2)
- Настроен Vite React + TS проект.
- Подключены:
  - Ant Design (Layout, Menu, базовые компоненты).
  - React Router v6 (публичные и приватные маршруты).
  - TanStack Query v5 (`QueryClientProvider` в `main.tsx`).
- Реализованы:
  - `AuthContext` (заглушка) с `login/logout/init`
    - токен хранится в `localStorage`
    - `isAuthenticated` вычисляется от token (синхронизирован с localStorage)
  - Guards:
    - `RequireAuth` — без токена редиректит на `/login`
    - `RequireRole` — при неверной роли показывает 403
  - Базовые UI-состояния страниц:
    - `PageLoading`, `PageEmpty`, `PageError`, `PageValidation`, `PageNotFound`
    - `ForbiddenPage` (403)
  - `AppLayout` (Header + Sider + Content) с меню по роли.
- Созданы страницы-заглушки для всех маршрутов.
- **Сборка проходит**: `npm run build` (0 TS errors).

## Маршруты
Public:
- `/login`
- `/register`

Customer:
- `/trips`
- `/my-tickets`

Operator:
- `/manage/routes`
- `/manage/edit-trips`

Admin:
- `/admin/sales-report`
- `/admin/users`

## Demo login (только для Lab 2)
На странице `/login` есть кнопки demo-входа:
- Login as Customer
- Login as Operator
- Login as Admin

Они устанавливают `dev-token` в `localStorage` и переводят на домашний маршрут роли.
Реальных API-вызовов **нет** — это будет в Lab 3.

## Как запустить
Из корня репозитория:

```bash
cd client
npm install
npm run dev
```

Открыть в браузере:
- http://localhost:5173

## Проверка сборки
```bash
cd client
npm run build
```

## Структура (кратко)
```text
client/
  src/
    api/            # позже: запросы к API
    components/     # layout, guards, page states
    contexts/       # AuthContext
    pages/          # public/customer/operator/admin + TripDetailPage
```

## Примечания
- Большой warning про chunk size — ожидаем (antd тяжёлый). Code-splitting будет позже, когда появятся реальные страницы.
- Реальная авторизация через `/api/auth/login` и `/api/auth/me` — в Lab 3.
