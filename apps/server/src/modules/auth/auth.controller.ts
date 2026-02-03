import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangeNicknameDto } from './dto/change-nickname.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './public.decorator';
import { Res } from '@nestjs/common';
import { type Response, type Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async create(@Body() createAuthDto: CreateAuthDto, @Res({ passthrough: true }) res: Response) {
    await this.authService.create(createAuthDto);

    const loginResult = await this.authService.login({
      name: createAuthDto.name,
      password: createAuthDto.password,
    });

    res.cookie('access_token', loginResult.access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return loginResult;
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(loginDto);

    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return result;
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    return { message: 'Logged out' };
  }

  @Get('me')
  async me(@Req() req: Request) {
    return { user: req.user };
  }

  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch('change-password')
  update(@Body() updateAuthDto: ChangePasswordDto) {
    return this.authService.updatePassword(updateAuthDto);
  }

  @Patch('change-nickname')
  updateNickname(@Body() changeNicknameDto: ChangeNicknameDto) {
    return this.authService.updateNickname(changeNicknameDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
