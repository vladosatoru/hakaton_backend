#!/usr/bin/env node

const http = require('http');

// Цвета и символы
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  magenta: '\x1b[35m'
};

const symbols = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
  rocket: '🚀',
  chart: '📊',
  gear: '⚙️',
  book: '📚'
};

class ReadOnlyTester {
  constructor(baseUrl = 'http://localhost:4000') {
    this.baseUrl = baseUrl;
    this.results = { passed: 0, failed: 0, total: 0 };
  }

  log(message, type = 'info') {
    const time = new Date().toLocaleTimeString();
    let color = colors.cyan;
    let symbol = symbols.info;

    switch (type) {
      case 'success':
        color = colors.green;
        symbol = symbols.success;
        break;
      case 'error':
        color = colors.red;
        symbol = symbols.error;
        break;
      case 'warning':
        color = colors.yellow;
        symbol = symbols.warning;
        break;
      case 'header':
        color = colors.magenta;
        symbol = symbols.gear;
        break;
    }

    console.log(`${color}${symbol} [${time}] ${message}${colors.reset}`);
  }

  async request(method, path) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      
      const options = {
        hostname: url.hostname,
        port: url.port || 80,
        path: url.pathname,
        method: method.toUpperCase(),
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const jsonBody = body ? JSON.parse(body) : {};
            resolve({ 
              status: res.statusCode, 
              data: jsonBody, 
              body,
              size: body.length 
            });
          } catch (e) {
            resolve({ 
              status: res.statusCode, 
              data: body, 
              body,
              size: body.length 
            });
          }
        });
      });

      req.on('error', reject);
      req.end();
    });
  }

  async test(name, testFn) {
    this.results.total++;
    try {
      this.log(`${name}`, 'info');
      const result = await testFn();
      this.results.passed++;
      this.log(`${name} - УСПЕШНО ${result || ''}`, 'success');
    } catch (error) {
      this.results.failed++;
      this.log(`${name} - ОШИБКА: ${error.message}`, 'error');
    }
  }

  formatSize(bytes) {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }

  async runTests() {
    console.log(`${colors.bright}${colors.blue}${symbols.rocket} ТЕСТИРОВАНИЕ ПУБЛИЧНЫХ ENDPOINTS${colors.reset}`);
    console.log(`${colors.cyan}URL: ${this.baseUrl}${colors.reset}\n`);

    const startTime = Date.now();

    // Основные проверки
    this.log('\n🔍 ОСНОВНЫЕ ПРОВЕРКИ', 'header');
    
    await this.test('Health Check', async () => {
      const response = await this.request('GET', '/api/health');
      if (response.status !== 200) {
        throw new Error(`Статус: ${response.status}`);
      }
      return `(${this.formatSize(response.size)})`;
    });

    await this.test('Swagger Documentation', async () => {
      const response = await this.request('GET', '/api/docs');
      if (response.status !== 200 && response.status !== 301 && response.status !== 302) {
        throw new Error(`Статус: ${response.status}`);
      }
      return `(${this.formatSize(response.size)})`;
    });

    // Проверка публичных endpoints
    this.log('\n📋 ПУБЛИЧНЫЕ ДАННЫЕ', 'header');

    await this.test('Список штрафов (публичный)', async () => {
      const response = await this.request('GET', '/api/fines');
      if (response.status !== 200) {
        throw new Error(`Статус: ${response.status}`);
      }
      const count = Array.isArray(response.data) ? response.data.length : 0;
      return `(${count} записей, ${this.formatSize(response.size)})`;
    });

    await this.test('Список эвакуаций (публичный)', async () => {
      const response = await this.request('GET', '/api/evacuations');
      if (response.status !== 200) {
        throw new Error(`Статус: ${response.status}`);
      }
      const count = Array.isArray(response.data) ? response.data.length : 0;
      return `(${count} записей, ${this.formatSize(response.size)})`;
    });

    await this.test('Реестр светофоров (публичный)', async () => {
      const response = await this.request('GET', '/api/traffic-light-registry');
      if (response.status !== 200) {
        throw new Error(`Статус: ${response.status}`);
      }
      const count = Array.isArray(response.data) ? response.data.length : 0;
      return `(${count} записей, ${this.formatSize(response.size)})`;
    });

    await this.test('Список новостей (публичный)', async () => {
      const response = await this.request('GET', '/api/news');
      if (response.status !== 200) {
        throw new Error(`Статус: ${response.status}`);
      }
      const count = Array.isArray(response.data) ? response.data.length : 0;
      return `(${count} записей, ${this.formatSize(response.size)})`;
    });

    // Проверка защищенных endpoints (должны возвращать 401)
    this.log('\n🔒 ЗАЩИЩЕННЫЕ ENDPOINTS', 'header');

    await this.test('Профиль пользователя (требует авторизацию)', async () => {
      const response = await this.request('GET', '/api/auth/profile');
      if (response.status !== 401) {
        throw new Error(`Ожидался 401, получен ${response.status}`);
      }
      return '(правильно защищен)';
    });

    await this.test('Статистика (требует админские права)', async () => {
      const response = await this.request('GET', '/api/statistics/main');
      if (response.status !== 401 && response.status !== 403) {
        throw new Error(`Ожидался 401/403, получен ${response.status}`);
      }
      return '(правильно защищен)';
    });

    // Проверка несуществующих endpoints
    this.log('\n❓ ПРОВЕРКА ОШИБОК', 'header');

    await this.test('Несуществующий endpoint', async () => {
      const response = await this.request('GET', '/api/nonexistent');
      if (response.status !== 404) {
        throw new Error(`Ожидался 404, получен ${response.status}`);
      }
      return '(правильно возвращает 404)';
    });

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // Итоговый отчет
    console.log(`\n${colors.bright}${colors.white}${symbols.chart} ИТОГОВЫЙ ОТЧЕТ${colors.reset}`);
    console.log(`${colors.bright}═══════════════════════════════════════${colors.reset}`);
    console.log(`${colors.green}${symbols.success} Пройдено: ${this.results.passed}${colors.reset}`);
    console.log(`${colors.red}${symbols.error} Провалено: ${this.results.failed}${colors.reset}`);
    console.log(`${colors.cyan}📝 Всего тестов: ${this.results.total}${colors.reset}`);
    console.log(`${colors.yellow}⏱️  Время: ${duration}с${colors.reset}`);
    
    const successRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
    console.log(`${colors.cyan}📊 Успешность: ${successRate}%${colors.reset}`);

    if (this.results.failed === 0) {
      console.log(`\n${colors.bright}${colors.green}🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ!${colors.reset}`);
      console.log(`${colors.green}${symbols.book} API готов к использованию${colors.reset}`);
    } else {
      console.log(`\n${colors.bright}${colors.yellow}⚠️  ЕСТЬ ПРОБЛЕМЫ${colors.reset}`);
    }

    return this.results.failed === 0;
  }
}

// Запуск
async function main() {
  const baseUrl = process.argv[2] || 'http://localhost:4000';
  const tester = new ReadOnlyTester(baseUrl);
  
  try {
    const success = await tester.runTests();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error(`${colors.red}${symbols.error} Критическая ошибка: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ReadOnlyTester;