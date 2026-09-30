import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // Ativa validação dos DTOs (LoginDto, CreateUsuarioDto, ...)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('EduPlus API')
    .setDescription(
      'Documentação da API da Plataforma de Cursos Online (NestJS, Prisma e JWT)',
    )
    .setVersion('1.0')
    .addTag('auth')
    .addTag('usuarios')
    .addBearerAuth(
      // Adiciona o campo de autenticação no Swagger
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        in: 'header',
      },
      'token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const porta = process.env.PORT ?? 3000;
  await app.listen(porta);
  console.log(`Aplicação rodando em: http://localhost:${porta}/api`);
}
void bootstrap();
