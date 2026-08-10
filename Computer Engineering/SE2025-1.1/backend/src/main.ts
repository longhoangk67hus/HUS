import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Bootstrap the Cinema System application
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe (class-validator)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  });

  // Swagger/OpenAPI Configuration
  const config = new DocumentBuilder()
    .setTitle('Cinema System API')
    .setDescription('Cinema booking system - Migrated from .NET to Node.js')
    .setVersion('1.0')
    .addTag('authentication', 'User authentication and registration')
    .addTag('movies', 'Movie management endpoints')
    .addTag('theaters', 'Theater management endpoints')
    .addTag('showtimes', 'Showtime scheduling endpoints')
    .addTag('reservations', 'Seat reservation endpoints')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Cinema System API Docs',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT || 5000;
  await app.listen(port);

  console.log(`🚀 Cinema System Backend running on: http://localhost:${port}`);
  console.log(`📖 Swagger UI: http://localhost:${port}/api`);
  console.log(`📄 Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap().catch((error) => {
  console.error('❌ Application startup failed:', error);
  process.exit(1);
});
