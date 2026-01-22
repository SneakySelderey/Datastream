import { Module } from '@nestjs/common';
import { ScannerService } from './scanner.service';
import { PrismaService } from '../../prisma.service';

@Module({
  providers: [ScannerService, PrismaService]
})
export class ScannerModule {}
