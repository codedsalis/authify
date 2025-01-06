import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from '@authify/common/dtos/base-response.dto';

export class LoginResponse extends BaseResponse<LoginResponse> {
  @ApiProperty()
  accessToken: string;
}
