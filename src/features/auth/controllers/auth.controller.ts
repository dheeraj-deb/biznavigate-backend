import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from '../application/services/auth.service';
import { SignupDto } from '../application/dto/signup.dto';
import { LoginDto } from '../application/dto/login.dto';
import { RefreshTokenDto } from '../application/dto/refresh-token.dto';
import { AuthResponseDto } from '../application/dto/auth-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @Throttle({ short: { ttl: 60000, limit: 5 } }) // 5 signups per minute
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() signupDto: SignupDto): Promise<AuthResponseDto> {
    console.log('[CONTROLLER] Signup endpoint called with:', signupDto);
    const result = await this.authService.signup(signupDto);
    console.log('[CONTROLLER] Signup completed successfully');
    return result;
  }

  @Post('login')
  @Throttle({ short: { ttl: 60000, limit: 5 } }) // 5 login attempts per minute to prevent brute force
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @Throttle({ short: { ttl: 60000, limit: 10 } }) // 10 token refreshes per minute
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthResponseDto> {
    return this.authService.refreshTokens(refreshTokenDto.refresh_token);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req): Promise<{ message: string }> {
    await this.authService.logout(req.user.user_id);
    return { message: 'Logged out successfully' };
  }
}
