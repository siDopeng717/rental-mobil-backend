import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

import {
  SwaggerModule,
  DocumentBuilder,
} from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // Swagger Config
  const config = new DocumentBuilder()
    .setTitle('Car Rental API')
    .setDescription(
      'Documentation for Car Rental Backend API',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(
    app,
    config,
  );

  // Swagger JSON Endpoint
  app.getHttpAdapter().get(
    '/swagger.json',
    (req, res) => {
      res.json(document);
    },
  );

  const port = process.env.PORT || 3000;

  await app.listen(port);

  console.log(
    `Server running on http://localhost:${port}`,
  );

  console.log(
    `Swagger JSON running on /swagger.json`,
  );
}

bootstrap();
