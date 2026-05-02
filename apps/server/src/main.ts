import { NestFactory } from '@nestjs/core';
import { Logger, RequestMethod } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { existsSync } from 'fs';
import { extname, join } from 'path';
import { type NextFunction, type Request, type Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap');

  app.use(cookieParser());

  const frontendRoot =
    process.env.DATASTREAM_FRONTEND_ROOT ?? join(process.cwd(), 'public');
  const frontendIndex = join(frontendRoot, 'index.html');
  const hasFrontend = existsSync(frontendIndex);

  if (hasFrontend) {
    app.useStaticAssets(frontendRoot);
    logger.log(`Serving frontend assets from ${frontendRoot}`);
  }

  app.setGlobalPrefix('api', {
    exclude: [
      { path: 'stream', method: RequestMethod.ALL },
      { path: 'stream/*path', method: RequestMethod.ALL },
      { path: 'docs', method: RequestMethod.ALL },
      { path: 'docs/*path', method: RequestMethod.ALL },
    ],
  });

  if (process.env.NODE_ENV !== 'production') {
    app.enableCors({
      origin: ['http://localhost:5173', 'http://localhost:8080'],
      credentials: true,
    });
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Datastream API')
    .setDescription('API documentation for the Datastream music library server')
    .setVersion('1.0')
    .addCookieAuth('access_token')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);

  if (hasFrontend) {
    app.use((req: Request, res: Response, next: NextFunction) => {
      const isFrontendRoute =
        req.method === 'GET' &&
        req.accepts('html') &&
        !extname(req.path) &&
        !req.path.startsWith('/api') &&
        !req.path.startsWith('/stream') &&
        !req.path.startsWith('/docs') &&
        !req.path.startsWith('/socket.io');

      if (!isFrontendRoute) {
        return next();
      }

      return res.sendFile(frontendIndex);
    });
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
