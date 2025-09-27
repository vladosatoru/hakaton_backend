import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { ValidationPipe } from '@nestjs/common'
import * as process from "process";

const start = async () => {
  const app = await NestFactory.create(AppModule)
  const PORT = process.env.PORT || 4200
  
  app.setGlobalPrefix('api')
  app.enableCors()
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }))

  // Настройка Swagger документации
  const config = new DocumentBuilder()
    .setTitle('ЦОДД Смоленской области API')
    .setDescription(`
      API для цифровой веб-платформы ЦОДД Смоленской области.
      
      Система включает:
      - Управление данными о штрафах и эвакуации
      - Реестр светофоров
      - Аналитику и статистику
      - Систему ролей (Гость, Редактор, Администратор)
      - Импорт/экспорт данных
      
      Для доступа к административным функциям используйте:
      - admin@codd.ru / admin123 (Администратор)
      - editor@codd.ru / editor123 (Редактор)
      - guest@codd.ru / guest123 (Гость)
    `)
    .setVersion('1.0')
    .addTag('auth', 'Аутентификация и авторизация')
    .addTag('fine-statistics', 'Статистика штрафов')
    .addTag('evacuation-requests', 'Заявки на эвакуацию')
    .addTag('traffic-light-registry', 'Реестр светофоров')
    .addTag('import-export', 'Импорт/экспорт данных')
    .addTag('statistics', 'Общая статистика')
    .addTag('news', 'Новости')
    .addTag('documents', 'Документы')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  })

  await app.listen(PORT, () => {
    console.log(`🚀 Server started on PORT ${PORT}`)
    console.log(`📚 Swagger documentation available at http://localhost:${PORT}/api/docs`)
  })
}

start()
