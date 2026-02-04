import { Module } from '@nestjs/common';
import { ScannerService } from './scanner.service';
import { PrismaService } from '../prisma/prisma.service';
import { ScannerController } from './scanner.controller';

@Module({
  controllers: [ScannerController],
  providers: [ScannerService, PrismaService]
})
export class ScannerModule {}
