import { ApiProperty } from '@nestjs/swagger';

export type ScanRequestStatus = 'started' | 'already-running';

export class ScanRequestResultDto {
  @ApiProperty({ enum: ['started', 'already-running'], example: 'started' })
  status!: ScanRequestStatus;
}
