import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseResponse } from './BaseResponse';
import { UserDto } from './UserDto';

export class GetUsersResponse extends BaseResponse {
  @ApiProperty({ type: [UserDto] })
  @ValidateNested({ each: true })
  @Type(() => UserDto)
  Result: UserDto[];
}
