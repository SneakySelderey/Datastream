import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

   app.use(cookieParser());

  if (process.env.NODE_ENV !== 'production') {
    app.enableCors({
      origin: ['http://localhost:5173', 'http://localhost:8080'],
      credentials: true,
    });
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
