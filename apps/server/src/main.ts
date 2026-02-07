import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

   app.use(cookieParser());

  const corsOriginEnv = process.env.CORS_ORIGIN;
  const corsOrigins = corsOriginEnv
    ? corsOriginEnv.split(',').map((origin) => origin.trim()).filter(Boolean)
    : ['http://localhost:5173', 'http://localhost:8085', 'https://localhost'];

  app.enableCors({
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
