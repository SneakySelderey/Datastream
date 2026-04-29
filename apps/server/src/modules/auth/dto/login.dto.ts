import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'alice' })
  name!: string;

  @ApiProperty({ example: 'strong-password' })
  password!: string;
}
