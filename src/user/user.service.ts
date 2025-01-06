import * as crypto from 'crypto';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './models/user.entity';
import { RegisterDto } from '@authify/auth/dtos/register.dto';
import * as bcrypt from 'bcrypt';
import { EmailService } from '@authify/email/email.service';
import { ConfigService } from '@nestjs/config';
import { PasswordResetToken } from './models/password_reset_token.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PasswordResetToken)
    private readonly passwordResetTokenRepository: Repository<PasswordResetToken>,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  findOne(id: number): Promise<User> {
    return this.userRepository.findOneBy({ id });
  }

  findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  async create(data: RegisterDto): Promise<User | null> {
    const isEmailExist = await this.userRepository.existsBy({
      email: data.email,
    });

    if (isEmailExist) {
      throw new BadRequestException('This email address is already taken');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    const user = new User();
    user.name = data.name;
    user.email = data.email;
    user.password = hashedPassword;

    await this.userRepository.save(user);

    this.emailService
      .send(
        `"${user.name}" <${user.email}>`,
        `Welcome to ${this.configService.get('appConfig.name')} app`,
        './welcome',
        {
          name: user.name,
        },
      )
      .catch((error) => {
        Logger.debug(error);
      });

    return user;
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async verifyPasswordHash(
    password: string,
    plainPassword: string,
  ): Promise<boolean> {
    if (await bcrypt.compare(plainPassword, password)) {
      return true;
    }
    return false;
  }

  async createPasswordResetToken(user: User): Promise<string> {
    const TOKEN_TTL = 1800000; // 30 minutes

    const rawToken = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit random number
    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const passwordResetToken = new PasswordResetToken();
    passwordResetToken.token = hashedToken;
    passwordResetToken.user = user;
    passwordResetToken.expiresAt = new Date(Date.now() + TOKEN_TTL);

    await this.passwordResetTokenRepository.save(passwordResetToken);

    return rawToken;
  }

  async verifyPasswordResetToken(
    rawToken: string,
  ): Promise<PasswordResetToken | false> {
    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const passwordResetToken =
      await this.passwordResetTokenRepository.findOneBy({
        token: hashedToken,
      });

    // Check if the token is valid, not expired, and not already verified
    if (
      !passwordResetToken ||
      passwordResetToken.expiresAt < new Date() ||
      passwordResetToken.verifiedAt !== null
    ) {
      return false;
    }

    // Mark the token as verified so it can not be reused within the expiration period
    passwordResetToken.verifiedAt = new Date();
    await this.passwordResetTokenRepository.save(passwordResetToken);

    return passwordResetToken;
  }

  async updatePassword(user: User, password: string): Promise<void> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    user.password = hashedPassword;

    await this.userRepository.save(user);
  }
}
