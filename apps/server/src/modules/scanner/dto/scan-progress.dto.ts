import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type ScanStatus =
  | 'idle'
  | 'running'
  | 'finalizing'
  | 'completed'
  | 'failed';

export class ScanProgressDto {
  @ApiProperty({
    enum: ['idle', 'running', 'finalizing', 'completed', 'failed'],
    example: 'running',
  })
  status!: ScanStatus;

  @ApiProperty({ example: 12 })
  foldersScanned!: number;

  @ApiProperty({ example: 40 })
  totalFolders!: number;

  @ApiPropertyOptional({ example: 'Scan failed: permission denied' })
  message?: string;

  @ApiPropertyOptional({ example: '2026-04-29T12:00:00.000Z' })
  startedAt?: string;

  @ApiPropertyOptional({ example: '2026-04-29T12:05:00.000Z' })
  finishedAt?: string;
}
