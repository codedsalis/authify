import { Body, Controller, HttpStatus, Patch, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { SkipAuth } from '@authify/common/decorators/skip-auth.decorator';
import { LoginDto } from './dtos/login.dto';
import { LoginResponse } from './dtos/login-response.dto';
import { Response } from 'express';
import { RegistrationResponse } from './dtos/registration-response.dto';
import { plainToInstance } from 'class-transformer';
import { UserDto } from '@authify/user/dtos/user.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { Throttle } from '@nestjs/throttler';
import { ForgotPasswordResponse } from './dtos/forgot-password-response.dto';
import { PasswordResetDto } from './dtos/password-reset.dto';
import { PasswordResetResponse } from './dtos/password-reset-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SkipAuth()
  @Post('register')
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ type: RegistrationResponse, status: HttpStatus.CREATED })
  async register(@Body() registerDto: RegisterDto, @Res() response: Response) {
    const user = await this.authService.register(registerDto);

    return response
      .status(HttpStatus.CREATED)
      .json(
        RegistrationResponse.toModel(
          plainToInstance(UserDto, user),
          HttpStatus.CREATED,
        ),
      );
  }

  @SkipAuth()
  @Post('login')
  @ApiBody({ type: LoginDto })
  @ApiResponse({ type: LoginResponse, status: HttpStatus.OK })
  async login(@Body() loginDto: LoginDto, @Res() response: Response) {
    const accessToken: string = await this.authService.login(loginDto);

    return response
      .status(HttpStatus.OK)
      .json(LoginResponse.toModel({ accessToken }));
  }

  @Throttle({ default: { limit: 3, ttl: 60 } })
  @SkipAuth()
  @Post('forgot-password')
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ type: ForgotPasswordResponse, status: HttpStatus.OK })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Res() response: Response,
  ) {
    await this.authService.forgotPassword(forgotPasswordDto);

    return response
      .status(HttpStatus.OK)
      .json(
        ForgotPasswordResponse.toModel(
          { message: 'Password reset link sent to your email' },
          HttpStatus.OK,
        ),
      );
  }

  @SkipAuth()
  @Throttle({ default: { ttl: 10, limit: 2 } })
  @Patch('reset-password')
  @ApiBody({ type: PasswordResetDto })
  @ApiResponse({ type: ForgotPasswordResponse, status: HttpStatus.OK })
  async resetPassword(
    @Body() passwordResetDto: PasswordResetDto,
    @Res() response: Response,
  ) {
    await this.authService.passwordReset(passwordResetDto);

    return response
      .status(HttpStatus.OK)
      .json(
        PasswordResetResponse.toModel(
          { message: 'Password reset completed successfully' },
          HttpStatus.OK,
        ),
      );
  }
}
