import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '@authify/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '@authify/email/email.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;

  const mockUserService = {
    findOneByEmail: jest.fn(),
    create: jest.fn(),
    verifyPasswordHash: jest.fn(),
    createPasswordResetToken: jest.fn(),
    verifyPasswordResetToken: jest.fn(),
    updatePassword: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockEmailService = {
    send: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should call userService.create and return user', async () => {
      const registerDto = {
        name: 'John',
        email: 'john@example.com',
        password: 'password123',
      };
      const user = { id: 1, ...registerDto, password: 'hashedPassword' };

      mockUserService.create.mockResolvedValue(user);

      const result = await service.register(registerDto);

      expect(mockUserService.create).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(user);
    });
  });

  describe('login', () => {
    it('should throw BadRequestException if user is not found', async () => {
      const loginDto = { email: 'john@example.com', password: 'password123' };

      mockUserService.findOneByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return a token if credentials are valid', async () => {
      const loginDto = { email: 'john@example.com', password: 'password123' };
      const user = {
        id: 1,
        email: 'john@example.com',
        password: 'hashedPassword',
      };
      const token = 'jwtToken';

      mockUserService.findOneByEmail.mockResolvedValue(user);
      mockUserService.verifyPasswordHash.mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue(token);

      const result = await service.login(loginDto);

      expect(result).toBe(token);
      expect(mockUserService.findOneByEmail).toHaveBeenCalledWith(
        loginDto.email,
      );
      expect(mockUserService.verifyPasswordHash).toHaveBeenCalledWith(
        user.password,
        loginDto.password,
      );
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
      });
    });

    it('should throw BadRequestException if password is invalid', async () => {
      const loginDto = { email: 'john@example.com', password: 'wrongPassword' };
      const user = {
        id: 1,
        email: 'john@example.com',
        password: 'hashedPassword',
      };

      mockUserService.findOneByEmail.mockResolvedValue(user);
      mockUserService.verifyPasswordHash.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('forgotPassword', () => {
    it('should throw BadRequestException if user not found', async () => {
      const forgotPasswordDto = { email: 'john@example.com' };

      mockUserService.findOneByEmail.mockResolvedValue(null);

      await expect(service.forgotPassword(forgotPasswordDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should send reset password email', async () => {
      const forgotPasswordDto = { email: 'john@example.com' };
      const user = { id: 1, email: 'john@example.com' };
      const rawToken = '123456';

      mockUserService.findOneByEmail.mockResolvedValue(user);
      mockUserService.createPasswordResetToken.mockResolvedValue(rawToken);

      await service.forgotPassword(forgotPasswordDto);

      expect(mockEmailService.send).toHaveBeenCalledWith(
        forgotPasswordDto.email,
        'Reset your password',
        './forgot-password',
        { user, token: rawToken },
      );
    });
  });

  describe('passwordReset', () => {
    it('should throw BadRequestException if token is invalid', async () => {
      const passwordResetDto = {
        token: 'invalidToken',
        password: 'newPassword123',
      };

      mockUserService.verifyPasswordResetToken.mockResolvedValue(null);

      await expect(service.passwordReset(passwordResetDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reset password if token is valid', async () => {
      const passwordResetDto = {
        token: 'validToken',
        password: 'newPassword123',
      };
      const passwordResetToken = {
        user: { id: 1, email: 'john@example.com' },
        verifiedAt: null,
      };

      mockUserService.verifyPasswordResetToken.mockResolvedValue(
        passwordResetToken,
      );
      mockUserService.updatePassword.mockResolvedValue(undefined);

      const result = await service.passwordReset(passwordResetDto);

      expect(result).toBe(true);
      expect(mockUserService.updatePassword).toHaveBeenCalledWith(
        passwordResetToken.user,
        passwordResetDto.password,
      );
    });
  });
});
