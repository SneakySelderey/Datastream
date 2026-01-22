import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScannerModule } from './modules/scanner/scanner.module';
import { ConfigModule } from '@nestjs/config';
import { StreamController } from './modules/stream/stream.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScannerModule
  ],
  controllers: [AppController, StreamController],
  providers: [AppService],
})
export class AppModule {}
