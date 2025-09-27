# Быстрое развертывание

## Railway (Рекомендуется)

1. Зарегистрируйтесь на [Railway](https://railway.app)
2. Создайте новый проект из GitHub репозитория
3. Добавьте PostgreSQL базу данных
4. Настройте переменные окружения:
   ```
   NODE_ENV=production
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=your-secret-key-32-chars-min
   JWT_EXPIRES_IN=7d
   ```
5. Деплой произойдет автоматически

## Render

1. Зарегистрируйтесь на [Render](https://render.com)
2. Создайте Web Service из GitHub
3. Создайте PostgreSQL базу данных
4. Настройте переменные окружения
5. Деплой произойдет автоматически

## Проверка развертывания

После развертывания проверьте:
- `GET /api/health` - статус сервиса
- `GET /api/docs` - Swagger документация
- `POST /api/auth/register` - регистрация пользователя

## Файлы конфигурации

- `railway.toml` - конфигурация Railway
- `render.yaml` - конфигурация Render
- `.env.example` - пример переменных окружения

Подробное руководство см. в `DEPLOYMENT_GUIDE.md`