import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, ValidateNested, IsObject } from 'class-validator';

export class StatusDto {
  @ApiProperty({ example: '0', description: 'Codice di errore, "0" se tutto ok' })
  @IsString()
  errorCode: string;

  @ApiProperty({ example: 'Success', description: 'Descrizione dell\'errore o successo' })
  @IsString()
  errorDescription: string;
}

export class BaseResponse<T> {
  @ApiProperty({ type: StatusDto })
  @ValidateNested()
  @Type(() => StatusDto)
  @IsObject()
  Status: StatusDto;

  @ApiProperty({ description: 'Risultato della richiesta', required: false })
  Result: T;
}
