# 🚀 Быстрый запуск проекта

## 1. Установка зависимостей
```bash
npm install
```

## 2. Настройка базы данных
```bash
# Создать .env файл
cp .env.example .env

# Запустить миграции
npx prisma migrate dev

# Заполнить тестовыми данными (опционально)
npx prisma db seed
```

## 3. Запуск в разработке
```bash
npm run dev
```
**API доступно:** http://localhost:4000/api/docs

## 4. Docker запуск
```bash
# Разработка
docker-compose -f docker-compose.dev.yml up

# Продакшн
docker-compose up
```

## 5. Тестирование API
```bash
# Тест публичных endpoints
node test-readonly.js

# Полное тестирование
node test-api.js
```



## Основные команды
- `npm run dev` - запуск разработки
- `npm run build` - сборка проекта
- `npm run start` - запуск продакшн
- `npx prisma studio` - GUI для БД
- `npx prisma migrate reset` - сброс БД