import { ApiProperty } from '@nestjs/swagger';

export class CreateAuthDto {
  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ example: 'strong-password' })
  password!: string;

  @ApiProperty({ example: 'alice' })
  name!: string;
}
