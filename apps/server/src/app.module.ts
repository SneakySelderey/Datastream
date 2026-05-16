import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScannerModule } from './modules/scanner/scanner.module';
import { ConfigModule } from '@nestjs/config';
import { StreamController } from './modules/stream/stream.controller';
import { AlbumsModule } from './modules/albums/albums.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/jwt-auth.guard';
import { TracksModule } from './modules/tracks/tracks.module';
import { ArtistsModule } from './modules/artists/artists.module';
import { PlaylistsModule } from './modules/playlists/playlists.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuditLogInterceptor } from './modules/audit/interceptors/audit-log.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScannerModule,
    AlbumsModule,
    PrismaModule,
    AuthModule,
    TracksModule,
    ArtistsModule,
    PlaylistsModule,
    AuditModule,
  ],
  controllers: [AppController, StreamController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule {}
