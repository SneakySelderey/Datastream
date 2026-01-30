import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}
  
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

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { name: loginDto.name },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const payload = { sub: user.id, name: user.name };
    const token = this.jwtService.sign(payload);

    const { password, ...userWithoutPassword } = user;

    return { 
      access_token: token,
      user: userWithoutPassword
    };
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
