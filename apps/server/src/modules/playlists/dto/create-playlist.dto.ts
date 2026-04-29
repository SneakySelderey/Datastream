import { ApiProperty } from '@nestjs/swagger';

export class CreatePlaylistDto {
  @ApiProperty({ example: 'Favorites' })
  title!: string;

  @ApiProperty({ type: [String], example: ['track-id-1', 'track-id-2'] })
  trackIds!: string[];
}
