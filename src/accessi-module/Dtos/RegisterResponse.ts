import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from './BaseResponse';

export class RegisterResponse extends BaseResponse {
  @ApiProperty({
    description: 'Codice identificativo univoco dell’utente registrato',
    example: 'USR-123456'
  })
  Result: string;
}
