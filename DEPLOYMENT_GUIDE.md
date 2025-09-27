# Руководство по развертыванию приложения

## Обзор приложения

Данное приложение представляет собой NestJS API с PostgreSQL базой данных, включающее:
- Систему аутентификации с JWT
- Управление заявками на эвакуацию
- Реестр светофоров
- Статистику и аналитику
- Импорт/экспорт данных
- Swagger документацию

## Рекомендуемые платформы для бесплатного развертывания

### 1. Railway (Рекомендуется) ⭐

**Преимущества:**
- $5 бесплатных кредитов при регистрации
- Простое развертывание из GitHub
- Встроенная поддержка PostgreSQL, Redis, MongoDB
- Быстрые деплои с Railpack
- Совместная работа в реальном времени
- Поддержка cron jobs

**Ограничения:**
- После использования $5 кредитов требуется переход на платный план ($5/месяц)
- Приложения останавливаются при исчерпании кредитов

**Подходит для:** Прототипов, хакатонов, небольших проектов

### 2. Render

**Преимущества:**
- Постоянный бесплатный план
- 750 часов бесплатного использования в месяц
- Бесплатная PostgreSQL база данных
- Поддержка статических сайтов

**Ограничения:**
- Бесплатные сервисы останавливаются через 15 минут неактивности
- PostgreSQL базы данных удаляются через 90 дней на бесплатном плане
- Холодный старт может занимать несколько секунд
- Ограниченные минуты сборки

**Подходит для:** Обучения, демонстрации, некритичных проектов

### 3. Fly.io

**Преимущества:**
- Высокая производительность
- Глобальные регионы
- Поддержка Docker

**Ограничения:**
- Больше нет бесплатного плана (только $5 кредит при регистрации)
- Требует кредитную карту
- Более сложная настройка

**Подходит для:** Продакшн приложений с небольшим бюджетом

## Пошаговое развертывание на Railway

### Подготовка проекта

1. **Создайте файл `railway.toml`** в корне проекта:

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm run start:prod"
healthcheckPath = "/api/health"
healthcheckTimeout = 300
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 10

[environments.production]
variables = { NODE_ENV = "production" }
```

2. **Обновите `package.json`** для добавления скрипта здоровья:

```json
{
  "scripts": {
    "start:prod": "node dist/main",
    "health": "curl -f http://localhost:$PORT/api/health || exit 1"
  }
}
```

3. **Создайте endpoint для проверки здоровья** в `src/app.controller.ts`:

```typescript
@Get('health')
health() {
  return { status: 'ok', timestamp: new Date().toISOString() };
}
```

### Развертывание

1. **Зарегистрируйтесь на Railway:**
   - Перейдите на https://railway.app
   - Войдите через GitHub

2. **Создайте новый проект:**
   - Нажмите "New Project"
   - Выберите "Deploy from GitHub repo"
   - Выберите ваш репозиторий

3. **Добавьте PostgreSQL:**
   - В проекте нажмите "+"
   - Выберите "Database" → "Add PostgreSQL"

4. **Настройте переменные окружения:**
   ```
   NODE_ENV=production
   PORT=${{PORT}}
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   ```

5. **Деплой:**
   - Railway автоматически развернет приложение
   - Получите URL в настройках сервиса

## Пошаговое развертывание на Render

### Подготовка

1. **Создайте `render.yaml`** в корне проекта:

```yaml
services:
  - type: web
    name: traffic-management-api
    env: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm run start:prod
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: traffic-management-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_EXPIRES_IN
        value: 7d

databases:
  - name: traffic-management-db
    plan: free
    databaseName: traffic_management
    user: admin
```

### Развертывание

1. **Зарегистрируйтесь на Render:**
   - Перейдите на https://render.com
   - Войдите через GitHub

2. **Создайте веб-сервис:**
   - Нажмите "New" → "Web Service"
   - Подключите GitHub репозиторий
   - Выберите Free план

3. **Создайте базу данных:**
   - Нажмите "New" → "PostgreSQL"
   - Выберите Free план

4. **Настройте переменные окружения** в настройках сервиса

## Альтернативные варианты баз данных

### Supabase (Рекомендуется для БД)
- 500MB бесплатного хранилища
- 2 бесплатных проекта
- Встроенная аутентификация
- Real-time подписки

### Neon
- 3GB бесплатного хранилища
- Serverless PostgreSQL
- Автоматическое масштабирование

### PlanetScale
- 5GB бесплатного хранилища
- MySQL совместимость
- Ветвление схемы базы данных

## Настройка переменных окружения

Создайте файл `.env.production`:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-frontend-domain.com
```

## Оптимизация для продакшена

### 1. Dockerfile (опционально)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]
```

### 2. Настройка CORS

В `main.ts`:

```typescript
app.enableCors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
});
```

### 3. Логирование

Добавьте в `main.ts`:

```typescript
app.useLogger(['error', 'warn', 'log']);
```

## Мониторинг и обслуживание

### Проверка состояния
- Railway: встроенные метрики в дашборде
- Render: логи и метрики в панели управления

### Резервное копирование
- Railway: автоматические бэкапы PostgreSQL
- Render: ручные бэкапы через pg_dump

### Масштабирование
- Railway: вертикальное масштабирование в настройках
- Render: обновление до платного плана для горизонтального масштабирования

## Устранение неполадок

### Частые проблемы:

1. **Приложение не запускается:**
   - Проверьте переменные окружения
   - Убедитесь, что PORT настроен правильно
   - Проверьте логи развертывания

2. **Ошибки базы данных:**
   - Проверьте DATABASE_URL
   - Убедитесь, что миграции выполнены
   - Проверьте SSL настройки для продакшена

3. **CORS ошибки:**
   - Настройте CORS_ORIGIN
   - Проверьте домены в настройках

### Полезные команды:

```bash
# Проверка подключения к БД
npm run typeorm:show

# Выполнение миграций
npm run typeorm:run

# Откат миграций
npm run typeorm:revert
```

## Заключение

Для быстрого прототипирования рекомендуется **Railway** благодаря простоте использования и встроенной поддержке PostgreSQL. Для долгосрочных проектов с ограниченным бюджетом лучше использовать **Render** с внешней базой данных от **Supabase** или **Neon**.

Помните о ограничениях бесплатных планов и планируйте переход на платные тарифы при росте нагрузки.