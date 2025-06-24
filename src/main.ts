import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { Session, ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';
import * as passport from 'passport';
import * as bodyParser from 'body-parser';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import rateLimit from 'express-rate-limit';
import cors from "cors"

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ credentials: true, origin: ['https://padel-point.vercel.app', 'https://padel-point.ar'] });


  // CONFIGURATION SERVICE

  const configService = new ConfigService()

  // PROXIES
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', true);

  // SWAGGER

  // const config = new DocumentBuilder()
  //   .setTitle('Nest API - TypeORM')
  //   .setDescription('Nest api for test of auth and DB')
  //   .setVersion('1.0')
  //   .build();

  // const document = SwaggerModule.createDocument(app, config);

  // SwaggerModule.setup('', app, document);

  // HELMET

  app.use(helmet());

  // COMPRESION

  app.use(compression());

  // RATE LIMIT
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100, // Límite de solicitudes por IP
    }),
  );

  // PIPES

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );


  app.use(
    session({
      // Hay que pasar el secreto de sesión a una variable de entorno
      secret: configService.get<string>('COOKIE_SECRET'),
      resave: false,
      saveUninitialized: false,
    }),
  );

  app.use(cookieParser());
  app.use(passport.initialize());
  app.use(bodyParser.json());
  app.use(passport.session());

  const PORT = process.env.PORT || 3000;

  await app.listen(PORT);
}
bootstrap();
