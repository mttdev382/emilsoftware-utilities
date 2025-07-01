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

  // Filtri
  @ApiPropertyOptional({ description: "Numero del report associato.", example: 1002 })
  numeroReport?: number;

  @ApiPropertyOptional({ description: "Indice personale dell'utente.", example: 15 })
  indicePersonale?: number;

  @ApiPropertyOptional({ description: "Codice del cliente principale (super).", example: "CLT_SUP_1234" })
  codiceClienteSuper?: string;

  @ApiPropertyOptional({ description: "Codice dell'agenzia associata.", example: "AGZ_5678" })
  codiceAgenzia?: string;

  @ApiPropertyOptional({ description: "Codice del cliente collegato.", example: "CLT_COL_8765" })
  codiceClienteCollegato?: string;

  @ApiPropertyOptional({ description: "Lista di codici clienti separati da virgola.", example: "CLT_123,CLT_456,CLT_789" })
  codiceClienti?: string;

  @ApiPropertyOptional({ description: "Tipo di filtro applicato.", example: "esclusivo" })
  tipoFiltro?: string;
}
