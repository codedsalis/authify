import { Controller, Get, HttpStatus, Req, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { Role } from '@authify/common/enums/role.enum';
import { Roles } from '@authify/common/decorators/roles.decorator';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { UserResponse } from './dtos/user-response.dto';
import { UserDto } from './dtos/user.dto';
import { plainToInstance } from 'class-transformer';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  @Roles(Role.User)
  @ApiBearerAuth()
  @ApiResponse({
    type: UserResponse,
    status: HttpStatus.OK,
    description: 'Fetches the authenticated user',
  })
  async fetchUser(@Req() request: Request, @Res() response: Response) {
    const user = await this.userService.findOne(request['user'].id);

    return response
      .status(HttpStatus.OK)
      .json(UserResponse.toModel(plainToInstance(UserDto, user)));
  }
}
