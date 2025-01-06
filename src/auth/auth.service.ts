import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { UserService } from '@authify/user/user.service';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { EmailService } from '@authify/email/email.service';
import { PasswordResetDto } from './dtos/password-reset.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    return await this.userService.create(registerDto);
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findOneByEmail(loginDto.email);

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const verifyPassword = await this.userService.verifyPasswordHash(
      user.password,
      loginDto.password,
    );

    if (verifyPassword) {
      const payload = {
        sub: user.id,
        email: user.email,
      };

      return await this.jwtService.signAsync(payload);
    }

    throw new BadRequestException('Invalid credentials');
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userService.findOneByEmail(forgotPasswordDto.email);

    if (!user) {
      throw new BadRequestException('Invalid Email address supplied');
    }

    const rawToken = await this.userService.createPasswordResetToken(user);

    this.emailService.send(
      forgotPasswordDto.email,
      'Reset your password',
      './forgot-password',
      {
        user: user,
        token: rawToken,
      },
    );
  }

  async passwordReset(passwordResetDto: PasswordResetDto): Promise<boolean> {
    const passwordResetToken = await this.userService.verifyPasswordResetToken(
      passwordResetDto.token,
    );

    if (!passwordResetToken) {
      throw new BadRequestException('Invalid token supplied');
    }

    await this.userService.updatePassword(
      passwordResetToken.user,
      passwordResetDto.password,
    );

    return true;
  }
}
