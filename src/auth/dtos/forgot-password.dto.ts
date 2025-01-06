import { UserDto } from '@authify/user/dtos/user.dto';
import { PickType } from '@nestjs/swagger';

export class ForgotPasswordDto extends PickType(UserDto, ['email'] as const) {}
