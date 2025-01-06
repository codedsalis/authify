import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from '@authify/common/dtos/base-response.dto';

export class PasswordResetResponse extends BaseResponse<PasswordResetResponse> {
  @ApiProperty({ example: 'Password reset saved successfully' })
  message: string;
}
