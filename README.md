# Автовокзал - Иваново (учебный проект)

Этот репозиторий содержит учебный проект Автовокзал - Иваново (лабораторные работы).

## Структура
- `server/` — ASP.NET Core Web API + тесты
- `client/` — React (Vite) frontend

## Быстрый старт (после генерации кода лабами)
### Backend
```bash
cd server
dotnet restore
dotnet test
dotnet run --project ServiceDesk.API
```

### Frontend
```bash
cd client
npm i
npm run dev
```

## Переменные окружения
Скопируйте `.env.example` в `.env` и заполните значения по комментариям.

## Документация по лабам
См. `docs/README.md`.
