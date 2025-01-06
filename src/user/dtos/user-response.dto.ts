import { BaseResponse } from '@authify/common/dtos/base-response.dto';
import { Role } from '@authify/common/enums/role.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class UserResponse extends BaseResponse<UserResponse> {
  @ApiProperty()
  @IsNotEmpty()
  id: number;

  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  roles: Role[];

  @ApiProperty()
  @IsNotEmpty()
  createdAt: Date;
}
