import { NestFactory } from '@nestjs/core';
import { AppModule } from './api/app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function start() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true })); // Good practice for DTOs

  const config = new DocumentBuilder()
    .setTitle('ERP API')
    .setDescription('ERP System Basic API')
    .setVersion('1.0')
    .addTag('Products')
    .addTag('Inventory')
    .addTag('Purchase Receipts')
    .addTag('Sales')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
start();
