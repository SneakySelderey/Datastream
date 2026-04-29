import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateAuthDto } from './create-auth.dto';

export class ChangePasswordDto extends PartialType(CreateAuthDto) {
  @ApiProperty({ example: 'user-id' })
  id!: string;

  @ApiProperty({ example: 'new-strong-password' })
  newPassword!: string;
}
