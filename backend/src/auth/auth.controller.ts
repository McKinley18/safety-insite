import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

class PasswordResetRequestDto {
  @IsEmail()
  email: string;
}

class DeleteAccountDto {
  @IsString()
  password: string;
}

class PasswordResetDto {
  @IsString()
  @MinLength(32)
  token: string;

  @IsString()
  @MinLength(8)
  @Matches(/[A-Z]/)
  @Matches(/[a-z]/)
  @Matches(/[0-9]/)
  @Matches(/[!@#$%^&*(),.?":{}|<>]/)
  newPassword: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register')
  register(@Body() dto: RegisterDto, @Req() req: any) {
    return this.authService.register(dto, req);
  }

  @Get('verify-invite/:token')
  verifyInvite(@Param('token') token: string) {
    return this.authService.verifyInvite(token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req: any) {
    return req.user;
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseGuards(JwtAuthGuard)
  @Delete('me')
  deleteAccount(@Body() dto: DeleteAccountDto, @Req() req: any) {
    return this.authService.deleteAccount(req.user.userId, dto.password);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  login(@Body() dto: LoginDto, @Req() req: any) {
    return this.authService.login(dto.email, dto.password, req);
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('password-reset/request')
  requestPasswordReset(@Body() dto: PasswordResetRequestDto) {
    return this.authService.requestPasswordReset(dto.email);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('password-reset/complete')
  resetPassword(@Body() dto: PasswordResetDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }
}
