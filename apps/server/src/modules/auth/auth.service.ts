import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  
  async create(createAuthDto: CreateAuthDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { name: createAuthDto.name },
    });

    if (existingUser) {
      throw new ConflictException('User with this name already exists');
    }

    const hashedPassword = await bcrypt.hash(createAuthDto.password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        name: createAuthDto.name,
        password: hashedPassword,
      },
    });

    const { password, ...result } = newUser;

    return result;
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  async updatePassword(changePasswordDto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: changePasswordDto.id }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword = bcrypt.hashSync(changePasswordDto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: changePasswordDto.id },
      data: { password: hashedPassword }
    });

    return { message: 'Password updated successfully' };
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
