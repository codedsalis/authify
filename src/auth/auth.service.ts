import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { UserService } from '@authify/user/user.service';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async register(registerDto: RegisterDto) {
    return await this.userService.create(registerDto);
  }
}
