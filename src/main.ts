import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  const config = new DocumentBuilder()
    .addBearerAuth({
      type: 'http',
    })
    .setTitle('Web API documentation')
    .setDescription('OpenAPI documentation for Lisa AI Web HTTP API')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('openapi', app, document);

  app.use((request, response, next) => {
    request.session = {};
    return next();
  });

  app.enableCors();

  await app.listen(3000);
}

bootstrap();
