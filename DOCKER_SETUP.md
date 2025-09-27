# 🐳 Docker Setup Guide для проекта ЦОДД

## 📋 Что из списка выбрать для развертывания

Для вашего проекта рекомендую следующие варианты из списка:

### ✅ **Рекомендуемые варианты:**

1. **🐳 Connect to Docker Standalone via URL/IP, API or Socket**
   - **Лучший выбор для разработки и тестирования**
   - Простая настройка и управление
   - Подходит для одиночных серверов

2. **🔄 Connect to Docker Swarm via URL/IP, API or Socket**
   - **Для production с высокой нагрузкой**
   - Автоматическое масштабирование
   - Отказоустойчивость

3. **☸️ Connect to a Kubernetes environment via URL/IP**
   - **Для enterprise решений**
   - Максимальная масштабируемость
   - Сложная настройка, но мощные возможности

### ❌ **Не подходящие варианты:**
- **Podman** - менее распространен, может быть совместимость
- **ACI** - специфично для Azure, ограниченные возможности

## 🚀 Быстрый старт

### 1. Установка Docker
```bash
# macOS (через Homebrew)
brew install --cask docker

# Или скачайте Docker Desktop с официального сайта
# https://www.docker.com/products/docker-desktop
```

### 2. Запуск проекта

#### Production режим:
```bash
# Сборка и запуск
npm run docker:start

# Или через скрипт
./docker-scripts.sh start-prod
```

#### Development режим:
```bash
# Сборка и запуск с hot reload
npm run docker:start:dev

# Или через скрипт
./docker-scripts.sh start-dev
```

## 📁 Структура Docker файлов

```
├── Dockerfile              # Production образ
├── Dockerfile.dev          # Development образ с hot reload
├── docker-compose.yml      # Production окружение
├── docker-compose.dev.yml  # Development окружение
├── .dockerignore           # Исключения для Docker
└── docker-scripts.sh       # Скрипты управления
```

## 🛠️ Доступные команды

### NPM скрипты:
```bash
npm run docker:build        # Собрать production образ
npm run docker:build:dev    # Собрать development образ
npm run docker:start        # Запустить production
npm run docker:start:dev    # Запустить development
npm run docker:stop         # Остановить все контейнеры
npm run docker:clean        # Очистить Docker ресурсы
npm run docker:logs         # Показать логи production
npm run docker:logs:dev     # Показать логи development
npm run docker:status       # Статус контейнеров
npm run docker:test         # Тестировать API
```

### Прямые команды:
```bash
./docker-scripts.sh build-prod     # Собрать production
./docker-scripts.sh build-dev      # Собрать development
./docker-scripts.sh start-prod     # Запустить production
./docker-scripts.sh start-dev      # Запустить development
./docker-scripts.sh stop           # Остановить все
./docker-scripts.sh clean          # Очистить ресурсы
./docker-scripts.sh status         # Показать статус
./docker-scripts.sh help           # Показать справку
```

## 🌐 Доступ к приложению

### Production (порт 4000):
- **API:** http://localhost:4000
- **Swagger:** http://localhost:4000/api/docs
- **Health Check:** http://localhost:4000/api/health

### Development (порт 4001):
- **API:** http://localhost:4001
- **Swagger:** http://localhost:4001/api/docs
- **Health Check:** http://localhost:4001/api/health

## 🗄️ База данных

### Production:
- **Host:** localhost
- **Port:** 5432
- **Database:** hakaton
- **User:** postgres
- **Password:** postgres

### Development:
- **Host:** localhost
- **Port:** 5433
- **Database:** hakaton_dev
- **User:** postgres
- **Password:** postgres

## 🔧 Конфигурация окружения

### Production переменные:
```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/hakaton
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=4000
NODE_ENV=production
CORS_ORIGIN=*
MAX_FILE_SIZE=10485760
UPLOAD_DEST=./uploads
```

### Development переменные:
```env
DATABASE_URL=postgresql://postgres:postgres@postgres-dev:5432/hakaton_dev
JWT_SECRET=dev-jwt-secret-key
PORT=4000
NODE_ENV=development
CORS_ORIGIN=*
MAX_FILE_SIZE=10485760
UPLOAD_DEST=./uploads
```

## 📊 Мониторинг и логи

### Просмотр логов:
```bash
# Production логи
docker-compose logs -f backend

# Development логи
docker-compose -f docker-compose.dev.yml logs -f backend-dev

# Логи базы данных
docker-compose logs -f postgres
```

### Статус контейнеров:
```bash
docker ps
# или
npm run docker:status
```

## 🧪 Тестирование

### Автоматическое тестирование API:
```bash
# Тест production
npm run docker:test

# Тест development
node test-readonly.js http://localhost:4001
```

### Ручное тестирование:
```bash
# Health check
curl http://localhost:4000/api/health

# Swagger документация
open http://localhost:4000/api/docs
```

## 🚀 Развертывание в production

### 1. Локальный сервер:
```bash
# Клонируйте репозиторий
git clone <your-repo>
cd backend

# Запустите production
npm run docker:start
```

### 2. Облачные платформы:

#### Railway:
```bash
# Установите Railway CLI
npm install -g @railway/cli

# Войдите в аккаунт
railway login

# Разверните проект
railway up
```

#### Render:
- Подключите GitHub репозиторий
- Используйте `render.yaml` конфигурацию
- Автоматическое развертывание при push

#### Docker Swarm:
```bash
# Инициализация swarm
docker swarm init

# Развертывание stack
docker stack deploy -c docker-compose.yml codd-stack
```

## 🔒 Безопасность

### Production рекомендации:
1. **Смените JWT_SECRET** на случайную строку
2. **Настройте CORS_ORIGIN** на ваш домен
3. **Используйте HTTPS** в production
4. **Настройте firewall** для базы данных
5. **Регулярно обновляйте** Docker образы

### Переменные окружения:
```bash
# Создайте .env файл для production
cp .env.example .env
# Отредактируйте значения
```

## 🛠️ Troubleshooting

### Частые проблемы:

#### Docker не запускается:
```bash
# Проверьте статус Docker
docker --version

# Запустите Docker Desktop
open -a Docker
```

#### Порты заняты:
```bash
# Найдите процесс на порту
lsof -i :4000

# Остановите контейнеры
npm run docker:stop
```

#### Проблемы с базой данных:
```bash
# Пересоздайте volumes
npm run docker:clean
npm run docker:start
```

#### Ошибки сборки:
```bash
# Очистите Docker cache
docker system prune -a

# Пересоберите образ
npm run docker:build
```

## 📚 Дополнительные ресурсы

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [NestJS Docker Guide](https://docs.nestjs.com/recipes/docker)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)

## 🎯 Заключение

Ваш проект готов к развертыванию с Docker! Рекомендую начать с **Docker Standalone** для разработки и тестирования, а затем перейти к **Docker Swarm** или **Kubernetes** для production с высокой нагрузкой.

Все конфигурации оптимизированы для production использования с учетом безопасности и производительности.