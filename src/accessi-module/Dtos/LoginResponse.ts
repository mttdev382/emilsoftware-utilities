import { ApiProperty } from "@nestjs/swagger";
import { BaseResponse } from "./BaseResponse";
import { FiltriUtente } from "./FiltriUtente";
import { AbilitazioneMenu } from "./AbilitazioneMenu";
import { TokenResult } from "./TokenResult";
import { UserDto } from "./UserDto";
import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";
import { UserGrantsDto } from "./UserGrantsDto";

export class LoginResult {
  @ApiProperty({ description: 'Dati utente', type: UserDto })
  @ValidateNested()
  @Type(() => UserDto)
  utente?: UserDto;

  @ApiProperty({ description: 'Filtri utente', type: [FiltriUtente] })
  @ValidateNested({ each: true })
  @Type(() => FiltriUtente)
  filtri?: FiltriUtente[];

  @ApiProperty({ description: 'Abilitazioni e ruoli utente', type: UserGrantsDto })
  @ValidateNested()
  @Type(() => UserGrantsDto)
  userGrants?: UserGrantsDto;

  @ApiProperty({ description: 'Extension Fields', type: Object})
  extensionFields?: any;

  @ApiProperty({ description: 'Token', type: TokenResult })
  @ValidateNested()
  @Type(() => TokenResult)
  token?: TokenResult;
}

export class LoginResponse extends BaseResponse {
  @ApiProperty({ type: LoginResult })
  @ValidateNested()
  @Type(() => LoginResult)
  Result: LoginResult;
}
