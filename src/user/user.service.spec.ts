import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './models/user.entity';
import { PasswordResetToken } from './models/password_reset_token.entity';
import { EmailService } from '@authify/email/email.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';

describe('UserService', () => {
  let userService: UserService;
  let emailService: EmailService;

  const mockUserRepository = {
    find: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    existsBy: jest.fn(),
  };

  const mockPasswordResetTokenRepository = {
    save: jest.fn(),
    findOneBy: jest.fn(),
  };

  const mockEmailService = {
    send: jest.fn().mockResolvedValue(undefined),
  };

  const mockConfigService = {
    get: jest.fn((key) => {
      if (key === 'appConfig.name') return 'Test App';
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        {
          provide: getRepositoryToken(PasswordResetToken),
          useValue: mockPasswordResetTokenRepository,
        },
        { provide: EmailService, useValue: mockEmailService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    emailService = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('should create a user and send a welcome email', async () => {
    const registerDto = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password123',
    };
    const savedUser = { id: 1, ...registerDto, password: 'hashedPassword' };

    mockUserRepository.existsBy.mockResolvedValue(false);
    mockUserRepository.save.mockResolvedValue(savedUser);

    await userService.create(registerDto);

    expect(mockUserRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'John Doe',
        email: 'john.doe@example.com',
      }),
    );
    expect(mockEmailService.send).toHaveBeenCalledWith(
      `"John Doe" <john.doe@example.com>`,
      'Welcome to Test App app',
      './welcome',
      { name: 'John Doe' },
    );
  });

  it('should throw an error if email is already taken', async () => {
    const registerDto = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password123',
    };

    mockUserRepository.existsBy.mockResolvedValue(true);

    await expect(userService.create(registerDto)).rejects.toThrow(
      new BadRequestException('This email address is already taken'),
    );
  });
});
