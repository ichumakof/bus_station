# Автовокзал Иваново

Учебный проект по дисциплине "Конструирование интернет-приложений".

## Структура
- `server` — ASP.NET Core Web API
- `client` — React + Vite

## Запуск сервера
```bash
cd server
cd BusStation.API
dotnet run
```

Сервер запускается по адресу `http://localhost:5051`.

## Запуск клиента
```bash
cd client
npm run dev
```

Клиент использует адрес API из файла `.env`.

## Тестовые пользователи
- `admin@demo.com` / `Admin123!`
- `operator1@demo.com` / `Operator123!`
- `customer1@demo.com` / `Customer123!`
- `customer2@demo.com` / `Customer123!`
