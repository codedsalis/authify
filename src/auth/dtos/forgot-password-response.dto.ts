import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from '@authify/common/dtos/base-response.dto';

export class ForgotPasswordResponse extends BaseResponse<ForgotPasswordResponse> {
  @ApiProperty({ example: 'Password reset link sent to your email' })
  message: string;
}
