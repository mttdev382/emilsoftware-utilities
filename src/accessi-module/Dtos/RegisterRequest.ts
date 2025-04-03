import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatoRegistrazione } from './StatoRegistrazione';
import { Permission } from './Permission';
import { TipoAbilitazione } from './TipoAbilitazione';

export class RegisterRequest {
  @ApiProperty({ description: "Email dell'utente.", example: "mario.rossi@dev.it" })
  email: string;

  @ApiPropertyOptional({ description: "Cognome dell'utente.", example: "Rossi" })
  cognome?: string;

  @ApiPropertyOptional({ description: "Nome dell'utente.", example: "Mario" })
  nome?: string;

  @ApiPropertyOptional({ description: "Numero di cellulare.", example: "+393401234567", nullable: true })
  cellulare?: string | null;

  @ApiPropertyOptional({ description: "Flag superutente.", example: false })
  flagSuper?: boolean;

  @ApiPropertyOptional({ description: "Ruoli assegnati all'utente.", example: ["admin", "editor"] })
  roles?: string[];

  @ApiPropertyOptional({ description: "Permessi assegnati all'utente.", type: [Permission], example: [{ codiceMenu: "MNUOFFICINA", tipoAbilitazione: TipoAbilitazione.SCRITTURA }] })
  permissions?: Permission[];
}
