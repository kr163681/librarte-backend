import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Validaciones globales para DTOs
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // ✅ CORS habilitado (para cuando conectes frontend)
  app.enableCors({ origin: true, credentials: true });

  // ✅ Swagger - Documentación interactiva con JWT
  const swaggerConfig = new DocumentBuilder()
    .setTitle('LibrArte API')
    .setDescription('API para gestión de librería pública y tienda 📚')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token', // 👈 nombre que usará Swagger
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  // ✅ Puerto configurable desde .env
  const config = app.get(ConfigService);
  const port = config.get<number>('app.port') ?? 3000;

  await app.listen(port);
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
  console.log(`📖 Documentación disponible en http://localhost:${port}/api`);
}

bootstrap().catch((err: unknown) => {
  if (err instanceof Error) {
    console.error('❌ Error al arrancar la aplicación:', err.message);
    console.error(err.stack);
  } else {
    console.error('❌ Error al arrancar la aplicación:', err);
  }
  process.exit(1);
});
