#!/bin/bash

# Docker управление для проекта ЦОДД

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Проверка Docker
check_docker() {
    if ! docker --version > /dev/null 2>&1; then
        error "Docker не установлен или не запущен"
        exit 1
    fi
    log "Docker доступен"
}

# Сборка образов
build_prod() {
    log "Сборка production образа..."
    docker build -t codd-backend:latest .
    log "Production образ собран успешно"
}

build_dev() {
    log "Сборка development образа..."
    docker build -f Dockerfile.dev -t codd-backend:dev .
    log "Development образ собран успешно"
}

# Запуск production
start_prod() {
    log "Запуск production окружения..."
    docker-compose up -d
    log "Production окружение запущено"
    info "API доступен по адресу: http://localhost:4000"
    info "Swagger документация: http://localhost:4000/api/docs"
}

# Запуск development
start_dev() {
    log "Запуск development окружения..."
    docker-compose -f docker-compose.dev.yml up -d
    log "Development окружение запущено"
    info "API доступен по адресу: http://localhost:4001"
    info "Swagger документация: http://localhost:4001/api/docs"
}

# Остановка контейнеров
stop_all() {
    log "Остановка всех контейнеров..."
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    log "Все контейнеры остановлены"
}

# Очистка
clean() {
    log "Очистка Docker ресурсов..."
    docker-compose down -v
    docker-compose -f docker-compose.dev.yml down -v
    docker system prune -f
    log "Очистка завершена"
}

# Логи
logs_prod() {
    docker-compose logs -f backend
}

logs_dev() {
    docker-compose -f docker-compose.dev.yml logs -f backend-dev
}

# Статус
status() {
    log "Статус контейнеров:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

# Тестирование
test_api() {
    log "Тестирование API..."
    if [ -f "test-readonly.js" ]; then
        node test-readonly.js http://localhost:4000
    else
        error "Файл test-readonly.js не найден"
    fi
}

# Помощь
show_help() {
    echo "Использование: $0 [команда]"
    echo ""
    echo "Команды:"
    echo "  build-prod     Собрать production образ"
    echo "  build-dev      Собрать development образ"
    echo "  start-prod     Запустить production окружение"
    echo "  start-dev      Запустить development окружение"
    echo "  stop           Остановить все контейнеры"
    echo "  clean          Очистить Docker ресурсы"
    echo "  logs-prod      Показать логи production"
    echo "  logs-dev       Показать логи development"
    echo "  status         Показать статус контейнеров"
    echo "  test           Протестировать API"
    echo "  help           Показать эту справку"
}

# Основная логика
case "${1:-help}" in
    "build-prod")
        check_docker
        build_prod
        ;;
    "build-dev")
        check_docker
        build_dev
        ;;
    "start-prod")
        check_docker
        build_prod
        start_prod
        ;;
    "start-dev")
        check_docker
        build_dev
        start_dev
        ;;
    "stop")
        check_docker
        stop_all
        ;;
    "clean")
        check_docker
        clean
        ;;
    "logs-prod")
        check_docker
        logs_prod
        ;;
    "logs-dev")
        check_docker
        logs_dev
        ;;
    "status")
        check_docker
        status
        ;;
    "test")
        test_api
        ;;
    "help"|*)
        show_help
        ;;
esac