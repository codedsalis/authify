import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';
import { UserDto } from './dtos/user.dto';
import { UserResponse } from './dtos/user-response.dto';
import { plainToInstance } from 'class-transformer';

describe('UserController', () => {
  let controller: UserController;
  let mockResponse: Partial<Response>;

  const mockUserService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('fetchUser', () => {
    it('should fetch and return the authenticated user', async () => {
      const userId = 1;
      const user = { id: userId, name: 'John Doe', email: 'john@example.com' };
      const userDto = plainToInstance(UserDto, user);
      const userResponse = UserResponse.toModel(userDto);

      mockUserService.findOne.mockResolvedValue(user);

      await controller.fetchUser(
        { user: { id: userId } } as any,
        mockResponse as Response,
      );

      expect(mockUserService.findOne).toHaveBeenCalledWith(userId);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(userResponse);
    });
  });
});
