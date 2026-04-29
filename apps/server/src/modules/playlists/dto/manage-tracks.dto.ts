import { ApiProperty } from '@nestjs/swagger';

export class ManageTracksDto {
  @ApiProperty({ type: [String], example: ['track-id-1', 'track-id-2'] })
  trackIds!: string[];
}
