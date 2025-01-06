import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HttpStatus } from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { PasswordResetDto } from './dtos/password-reset.dto';
import { Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    forgotPassword: jest.fn(),
    passwordReset: jest.fn(),
  };

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a user successfully', async () => {
      const registerDto: RegisterDto = {
        name: 'John Doe',
        email: 'test@example.com',
        password: 'password123',
      };
      const mockUser = { id: 1, email: 'test@example.com' };

      mockAuthService.register.mockResolvedValue(mockUser);

      await controller.register(registerDto, mockResponse);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          statusCode: HttpStatus.CREATED,
        }),
      );
    });

    it('should handle registration errors', async () => {
      const registerDto: RegisterDto = {
        name: 'John Doe',
        email: 'test@example.com',
        password: 'password123',
      };

      mockAuthService.register.mockRejectedValue(
        new Error('Registration failed'),
      );

      await expect(
        controller.register(registerDto, mockResponse),
      ).rejects.toThrow('Registration failed');
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should log in successfully and return an access token', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockToken = 'mockAccessToken';

      mockAuthService.login.mockResolvedValue(mockToken);

      await controller.login(loginDto, mockResponse);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        accessToken: mockToken,
        statusCode: HttpStatus.OK,
      });
    });

    it('should handle login errors', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

      await expect(controller.login(loginDto, mockResponse)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('forgotPassword', () => {
    it('should send a password reset email successfully', async () => {
      const forgotPasswordDto: ForgotPasswordDto = {
        email: 'test@example.com',
      };

      mockAuthService.forgotPassword.mockResolvedValue(undefined);

      await controller.forgotPassword(forgotPasswordDto, mockResponse);

      expect(authService.forgotPassword).toHaveBeenCalledWith(
        forgotPasswordDto,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Password reset link sent to your email',
        statusCode: HttpStatus.OK,
      });
    });

    it('should handle errors when sending reset email', async () => {
      const forgotPasswordDto: ForgotPasswordDto = {
        email: 'test@example.com',
      };

      mockAuthService.forgotPassword.mockRejectedValue(
        new Error('Email not found'),
      );

      await expect(
        controller.forgotPassword(forgotPasswordDto, mockResponse),
      ).rejects.toThrow('Email not found');
      expect(authService.forgotPassword).toHaveBeenCalledWith(
        forgotPasswordDto,
      );
    });
  });

  describe('resetPassword', () => {
    it('should reset the password successfully', async () => {
      const passwordResetDto: PasswordResetDto = {
        token: 'validToken',
        password: 'newPassword123',
      };

      mockAuthService.passwordReset.mockResolvedValue(undefined);

      await controller.resetPassword(passwordResetDto, mockResponse);

      expect(authService.passwordReset).toHaveBeenCalledWith(passwordResetDto);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Password reset completed successfully',
        statusCode: HttpStatus.OK,
      });
    });

    it('should handle errors when resetting the password', async () => {
      const passwordResetDto: PasswordResetDto = {
        token: 'invalidToken',
        password: 'newPassword123',
      };

      mockAuthService.passwordReset.mockRejectedValue(
        new Error('Invalid token'),
      );

      await expect(
        controller.resetPassword(passwordResetDto, mockResponse),
      ).rejects.toThrow('Invalid token');
      expect(authService.passwordReset).toHaveBeenCalledWith(passwordResetDto);
    });
  });
});
