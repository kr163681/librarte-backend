import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Módulos propios
import { LibrosModule } from './libros/libros.module';
import { PrestamosModule } from './prestamos/prestamos.module';
import { VentasModule } from './ventas/ventas.module'; // 👈 nuevo

@Module({
  imports: [
    // Carga variables de entorno de .env en toda la app
    ConfigModule.forRoot({ isGlobal: true }),

    // Conexión a PostgreSQL con TypeORM (usa variables del .env)
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true, // ⚠️ Solo en desarrollo, no en producción
      logging: true, // Opcional: ver SQL generado en consola
    }),

    // Módulos de tu app
    LibrosModule,
    PrestamosModule,
    VentasModule, // 👈 aquí lo agregamos
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
