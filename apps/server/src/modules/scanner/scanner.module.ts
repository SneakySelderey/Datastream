import { Module } from '@nestjs/common';
import { ScannerService } from './scanner.service';
import { PrismaService } from '../prisma/prisma.service';
import { ScannerController } from './scanner.controller';
import { ScannerGateway } from './scanner.gateway';

@Module({
  controllers: [ScannerController],
  providers: [ScannerService, PrismaService, ScannerGateway],
})
export class ScannerModule {}
