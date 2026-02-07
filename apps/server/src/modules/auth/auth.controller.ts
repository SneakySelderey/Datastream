import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UnauthorizedException } from '@nestjs/common';
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

  private resolveSecureCookie() {
    return process.env.COOKIE_SECURE === 'true';
  }

  @Public()
  @Post('register')
  async create(@Body() createAuthDto: CreateAuthDto, @Res({ passthrough: true }) res: Response) {
    await this.authService.create(createAuthDto);

    const loginResult = await this.authService.login({
      name: createAuthDto.name,
      password: createAuthDto.password,
    });

    const secureCookie = this.resolveSecureCookie();

    res.cookie('access_token', loginResult.access_token, {
      httpOnly: true,
      secure: secureCookie,
      sameSite: 'lax',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return loginResult;
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(loginDto);
    const secureCookie = this.resolveSecureCookie();

    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: secureCookie,
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

  @Patch('change-password')
  update(@Body() updateAuthDto: ChangePasswordDto) {
    return this.authService.updatePassword(updateAuthDto);
  }

  @Patch('change-nickname')
  updateNickname(@Body() changeNicknameDto: ChangeNicknameDto) {
    return this.authService.updateNickname(changeNicknameDto);
  }

  @Delete('me')
  async removeMe(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const userId = req.user && typeof req.user === 'object' ? (req.user as { id?: string }).id : undefined;
    if (!userId) {
      throw new UnauthorizedException('User not found');
    }
    const result = await this.authService.removeUser(userId);
    res.clearCookie('access_token');
    return result;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.removeUser(id);
  }
}
