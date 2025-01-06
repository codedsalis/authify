import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString } from 'class-validator';

export class PasswordResetDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  token: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;
}
