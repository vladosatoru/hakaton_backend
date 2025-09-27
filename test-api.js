#!/usr/bin/env node

const https = require('https');
const http = require('http');

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Символы для результатов
const symbols = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️'
};

class APITester {
  constructor(baseUrl = 'http://localhost:4000/api') {
    this.baseUrl = baseUrl;
    this.accessToken = null;
    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0
    };
  }

  // Логирование с цветами
  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    let color = colors.white;
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
      case 'info':
        color = colors.cyan;
        symbol = symbols.info;
        break;
    }

    console.log(`${color}${symbol} [${timestamp}] ${message}${colors.reset}`);
  }

  // HTTP запрос
  async makeRequest(method, endpoint, data = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(endpoint, this.baseUrl);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;

      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: method.toUpperCase(),
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };

      if (this.accessToken) {
        options.headers['Authorization'] = `Bearer ${this.accessToken}`;
      }

      const req = client.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });

        res.on('end', () => {
          try {
            const jsonBody = body ? JSON.parse(body) : {};
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: jsonBody
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: body
            });
          }
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  // Выполнение теста
  async runTest(testName, testFunction) {
    this.testResults.total++;
    try {
      this.log(`Запуск теста: ${testName}`, 'info');
      await testFunction();
      this.testResults.passed++;
      this.log(`${testName} - ПРОЙДЕН`, 'success');
    } catch (error) {
      this.testResults.failed++;
      this.log(`${testName} - ПРОВАЛЕН: ${error.message}`, 'error');
    }
  }

  // Проверка ответа
  assertResponse(response, expectedStatus, testName) {
    if (response.status !== expectedStatus) {
      throw new Error(`Ожидался статус ${expectedStatus}, получен ${response.status}`);
    }
  }

  // Тесты аутентификации
  async testAuthentication() {
    await this.runTest('Регистрация пользователя', async () => {
      const userData = {
        email: `test_${Date.now()}@example.com`,
        password: 'TestPassword123!',
        name: 'Test User',
        role: 'USER'
      };

      const response = await this.makeRequest('POST', '/auth/register', userData);
      this.assertResponse(response, 201, 'Регистрация');
      
      if (!response.data.access_token) {
        throw new Error('Токен доступа не получен');
      }
      
      this.accessToken = response.data.access_token;
      this.log(`Токен получен: ${this.accessToken.substring(0, 20)}...`, 'info');
    });

    await this.runTest('Получение профиля пользователя', async () => {
      const response = await this.makeRequest('GET', '/auth/profile');
      this.assertResponse(response, 200, 'Профиль пользователя');
      
      if (!response.data.email) {
        throw new Error('Данные профиля не получены');
      }
    });
  }

  // Тесты штрафов
  async testFines() {
    let fineId = null;

    await this.runTest('Создание штрафа', async () => {
      const fineData = {
        amount: 1500,
        reason: 'Превышение скорости',
        location: 'ул. Тестовая, 123',
        violatorName: 'Иван Иванов',
        violatorPhone: '+7900123456',
        vehicleNumber: 'А123БВ777'
      };

      const response = await this.makeRequest('POST', '/fines', fineData);
      this.assertResponse(response, 201, 'Создание штрафа');
      fineId = response.data.id;
    });

    await this.runTest('Получение списка штрафов', async () => {
      const response = await this.makeRequest('GET', '/fines');
      this.assertResponse(response, 200, 'Список штрафов');
      
      if (!Array.isArray(response.data)) {
        throw new Error('Ответ не является массивом');
      }
    });

    if (fineId) {
      await this.runTest('Получение штрафа по ID', async () => {
        const response = await this.makeRequest('GET', `/fines/${fineId}`);
        this.assertResponse(response, 200, 'Штраф по ID');
      });

      await this.runTest('Обновление штрафа', async () => {
        const updateData = {
          amount: 2000,
          reason: 'Превышение скорости (обновлено)'
        };

        const response = await this.makeRequest('PATCH', `/fines/${fineId}`, updateData);
        this.assertResponse(response, 200, 'Обновление штрафа');
      });
    }
  }

  // Тесты эвакуаций
  async testEvacuations() {
    let evacuationId = null;

    await this.runTest('Создание эвакуации', async () => {
      const evacuationData = {
        vehicleNumber: 'Б456ГД888',
        reason: 'Неправильная парковка',
        location: 'ул. Парковочная, 456',
        evacuationLocation: 'Штрафстоянка №1',
        cost: 3000
      };

      const response = await this.makeRequest('POST', '/evacuations', evacuationData);
      this.assertResponse(response, 201, 'Создание эвакуации');
      evacuationId = response.data.id;
    });

    await this.runTest('Получение списка эвакуаций', async () => {
      const response = await this.makeRequest('GET', '/evacuations');
      this.assertResponse(response, 200, 'Список эвакуаций');
    });

    if (evacuationId) {
      await this.runTest('Получение эвакуации по ID', async () => {
        const response = await this.makeRequest('GET', `/evacuations/${evacuationId}`);
        this.assertResponse(response, 200, 'Эвакуация по ID');
      });
    }
  }

  // Тесты реестра светофоров
  async testTrafficLights() {
    await this.runTest('Получение реестра светофоров', async () => {
      const response = await this.makeRequest('GET', '/traffic-light-registry');
      this.assertResponse(response, 200, 'Реестр светофоров');
    });

    await this.runTest('Создание записи светофора', async () => {
      const trafficLightData = {
        registryNumber: Math.floor(Math.random() * 10000),
        address: 'ул. Светофорная, 789',
        lightType: 'STANDARD',
        installYear: 2023,
        status: 'ACTIVE',
        latitude: 55.7558,
        longitude: 37.6176,
        isPublic: true
      };

      const response = await this.makeRequest('POST', '/traffic-light-registry', trafficLightData);
      this.assertResponse(response, 201, 'Создание светофора');
    });
  }

  // Тесты импорта/экспорта
  async testImportExport() {
    await this.runTest('Получение типов данных для экспорта', async () => {
      const response = await this.makeRequest('GET', '/import-export/data-types');
      this.assertResponse(response, 200, 'Типы данных');
    });

    await this.runTest('Экспорт данных штрафов', async () => {
      const exportData = {
        dataType: 'fine_statistics',
        format: 'csv',
        filename: 'test_export'
      };

      const response = await this.makeRequest('POST', '/import-export/export', exportData);
      this.assertResponse(response, 200, 'Экспорт данных');
    });
  }

  // Тест статистики (требует админских прав)
  async testStatistics() {
    await this.runTest('Получение статистики (может потребовать админские права)', async () => {
      try {
        const response = await this.makeRequest('GET', '/statistics/main');
        if (response.status === 403) {
          this.log('Статистика недоступна - требуются админские права', 'warning');
          return;
        }
        this.assertResponse(response, 200, 'Статистика');
      } catch (error) {
        if (error.message.includes('403')) {
          this.log('Статистика недоступна - требуются админские права', 'warning');
          return;
        }
        throw error;
      }
    });
  }

  // Тест health endpoint
  async testHealth() {
    await this.runTest('Проверка состояния сервиса', async () => {
      const response = await this.makeRequest('GET', '/health');
      this.assertResponse(response, 200, 'Health check');
      
      if (response.data.status !== 'ok') {
        throw new Error('Сервис не в порядке');
      }
    });
  }

  // Запуск всех тестов
  async runAllTests() {
    console.log(`${colors.bright}${colors.blue}🚀 Запуск тестирования API${colors.reset}`);
    console.log(`${colors.cyan}Базовый URL: ${this.baseUrl}${colors.reset}\n`);

    const startTime = Date.now();

    try {
      // Проверка доступности сервера
      await this.testHealth();
      
      // Тесты аутентификации
      this.log('\n📝 Тестирование аутентификации', 'info');
      await this.testAuthentication();

      // Тесты основного функционала
      this.log('\n💰 Тестирование штрафов', 'info');
      await this.testFines();

      this.log('\n🚗 Тестирование эвакуаций', 'info');
      await this.testEvacuations();

      this.log('\n🚦 Тестирование светофоров', 'info');
      await this.testTrafficLights();

      this.log('\n📊 Тестирование импорта/экспорта', 'info');
      await this.testImportExport();

      this.log('\n📈 Тестирование статистики', 'info');
      await this.testStatistics();

    } catch (error) {
      this.log(`Критическая ошибка: ${error.message}`, 'error');
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // Итоговый отчет
    console.log(`\n${colors.bright}${colors.white}📊 ИТОГОВЫЙ ОТЧЕТ${colors.reset}`);
    console.log(`${colors.bright}═══════════════════════════════════════${colors.reset}`);
    console.log(`${colors.green}${symbols.success} Пройдено: ${this.testResults.passed}${colors.reset}`);
    console.log(`${colors.red}${symbols.error} Провалено: ${this.testResults.failed}${colors.reset}`);
    console.log(`${colors.cyan}📝 Всего тестов: ${this.testResults.total}${colors.reset}`);
    console.log(`${colors.yellow}⏱️  Время выполнения: ${duration}с${colors.reset}`);
    
    const successRate = ((this.testResults.passed / this.testResults.total) * 100).toFixed(1);
    console.log(`${colors.magenta}📊 Успешность: ${successRate}%${colors.reset}`);

    if (this.testResults.failed === 0) {
      console.log(`\n${colors.bright}${colors.green}🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!${colors.reset}`);
    } else {
      console.log(`\n${colors.bright}${colors.yellow}⚠️  НЕКОТОРЫЕ ТЕСТЫ НЕ ПРОЙДЕНЫ${colors.reset}`);
    }
  }
}

// Запуск тестов
async function main() {
  const baseUrl = process.argv[2] || 'http://localhost:4000/api';
  const tester = new APITester(baseUrl);
  
  try {
    await tester.runAllTests();
  } catch (error) {
    console.error(`${colors.red}${symbols.error} Ошибка запуска тестов: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Запуск только если файл выполняется напрямую
if (require.main === module) {
  main();
}

module.exports = APITester;