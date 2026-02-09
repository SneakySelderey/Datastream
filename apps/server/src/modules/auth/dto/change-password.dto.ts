import { PartialType } from '@nestjs/mapped-types';
import { CreateAuthDto } from './create-auth.dto';

export class ChangePasswordDto extends PartialType(CreateAuthDto) {
    id: string;
    newPassword: string;
}
