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
  white: '\x1b[37m'
};

const symbols = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
  rocket: '🚀',
  chart: '📊'
};

class SimpleAPITester {
  constructor(baseUrl = 'http://localhost:4000') {
    this.baseUrl = baseUrl;
    this.accessToken = null;
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
    }

    console.log(`${color}${symbol} [${time}] ${message}${colors.reset}`);
  }

  async request(method, path, data = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      
      const options = {
        hostname: url.hostname,
        port: url.port || 80,
        path: url.pathname,
        method: method.toUpperCase(),
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };

      if (this.accessToken) {
        options.headers['Authorization'] = `Bearer ${this.accessToken}`;
      }

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const jsonBody = body ? JSON.parse(body) : {};
            resolve({ status: res.statusCode, data: jsonBody, body });
          } catch (e) {
            resolve({ status: res.statusCode, data: body, body });
          }
        });
      });

      req.on('error', reject);
      
      if (data) {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }

  async test(name, testFn) {
    this.results.total++;
    try {
      this.log(`Тест: ${name}`, 'info');
      await testFn();
      this.results.passed++;
      this.log(`${name} - УСПЕШНО`, 'success');
    } catch (error) {
      this.results.failed++;
      this.log(`${name} - ОШИБКА: ${error.message}`, 'error');
    }
  }

  expect(response, expectedStatus, testName) {
    if (response.status !== expectedStatus) {
      throw new Error(`Ожидался статус ${expectedStatus}, получен ${response.status}. Ответ: ${JSON.stringify(response.data).substring(0, 100)}`);
    }
  }

  async runTests() {
    console.log(`${colors.bright}${colors.blue}${symbols.rocket} ТЕСТИРОВАНИЕ API${colors.reset}`);
    console.log(`${colors.cyan}URL: ${this.baseUrl}${colors.reset}\n`);

    const startTime = Date.now();

    // 1. Проверка здоровья сервиса
    await this.test('Проверка состояния сервиса', async () => {
      const response = await this.request('GET', '/api/health');
      this.expect(response, 200, 'Health check');
      if (response.data.status !== 'ok') {
        throw new Error('Сервис не в порядке');
      }
    });

    // 2. Регистрация пользователя
    await this.test('Регистрация нового пользователя', async () => {
      const userData = {
        email: `test_${Date.now()}@example.com`,
        password: 'TestPassword123!',
        name: 'Тестовый Пользователь',
        role: 'USER'
      };

      const response = await this.request('POST', '/api/auth/register', userData);
      this.expect(response, 201, 'Регистрация');
      
      if (!response.data.access_token) {
        throw new Error('Токен доступа не получен');
      }
      
      this.accessToken = response.data.access_token;
      this.log(`Токен получен: ${this.accessToken.substring(0, 20)}...`, 'info');
    });

    // 3. Получение профиля
    await this.test('Получение профиля пользователя', async () => {
      const response = await this.request('GET', '/api/auth/profile');
      this.expect(response, 200, 'Профиль');
      
      if (!response.data.email) {
        throw new Error('Данные профиля не получены');
      }
    });

    // 4. Создание штрафа
    await this.test('Создание штрафа', async () => {
      const fineData = {
        amount: 1500,
        reason: 'Превышение скорости',
        location: 'ул. Тестовая, 123',
        violatorName: 'Иван Тестов',
        violatorPhone: '+7900123456',
        vehicleNumber: 'А123БВ777'
      };

      const response = await this.request('POST', '/api/fines', fineData);
      this.expect(response, 201, 'Создание штрафа');
    });

    // 5. Получение списка штрафов
    await this.test('Получение списка штрафов', async () => {
      const response = await this.request('GET', '/api/fines');
      this.expect(response, 200, 'Список штрафов');
      
      if (!Array.isArray(response.data)) {
        throw new Error('Ответ не является массивом');
      }
    });

    // 6. Создание эвакуации
    await this.test('Создание эвакуации', async () => {
      const evacuationData = {
        vehicleNumber: 'Б456ГД888',
        reason: 'Неправильная парковка',
        location: 'ул. Парковочная, 456',
        evacuationLocation: 'Штрафстоянка №1',
        cost: 3000
      };

      const response = await this.request('POST', '/api/evacuations', evacuationData);
      this.expect(response, 201, 'Создание эвакуации');
    });

    // 7. Получение списка эвакуаций
    await this.test('Получение списка эвакуаций', async () => {
      const response = await this.request('GET', '/api/evacuations');
      this.expect(response, 200, 'Список эвакуаций');
    });

    // 8. Тест документации Swagger
    await this.test('Проверка документации Swagger', async () => {
      const response = await this.request('GET', '/api/docs');
      if (response.status !== 200 && response.status !== 301 && response.status !== 302) {
        throw new Error(`Swagger недоступен, статус: ${response.status}`);
      }
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
    } else {
      console.log(`\n${colors.bright}${colors.yellow}⚠️  ЕСТЬ ОШИБКИ${colors.reset}`);
    }

    return this.results.failed === 0;
  }
}

// Запуск
async function main() {
  const baseUrl = process.argv[2] || 'http://localhost:4000';
  const tester = new SimpleAPITester(baseUrl);
  
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

module.exports = SimpleAPITester;