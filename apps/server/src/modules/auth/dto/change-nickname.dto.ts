import { ApiProperty } from '@nestjs/swagger';

export class ChangeNicknameDto {
  @ApiProperty({ example: 'user-id' })
  id!: string;

  @ApiProperty({ example: 'new-alice' })
  newName!: string;
}
