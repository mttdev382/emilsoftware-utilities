import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { StatoRegistrazione } from "./StatoRegistrazione";
import { Permission } from "./Permission";
import { TipoAbilitazione } from "./TipoAbilitazione";

export class RegisterRequest {
  @ApiProperty({
    description: "Email dell'utente.",
    example: "mario.rossi@dev.it",
  })
  email: string;

  @ApiPropertyOptional({
    description: "Cognome dell'utente.",
    example: "Rossi",
  })
  cognome?: string;

  @ApiPropertyOptional({ description: "Nome dell'utente.", example: "Mario" })
  nome?: string;

  @ApiPropertyOptional({
    description: "Numero di cellulare.",
    example: "+393401234567",
    nullable: true,
  })
  cellulare?: string | null;

  @ApiPropertyOptional({ description: "Flag superutente.", example: false })
  flagSuper?: boolean;

  @ApiPropertyOptional({
    description: "Ruoli assegnati all'utente.",
    example: ["admin", "editor"],
  })
  roles?: string[];

  @ApiPropertyOptional({
    description: "Permessi assegnati all'utente.",
    type: [Permission],
    example: [
      {
        codiceMenu: "MNUOFFICINA",
        tipoAbilitazione: TipoAbilitazione.SCRITTURA,
      },
    ],
  })
  permissions?: Permission[];

  // Filtri
  @ApiPropertyOptional({
    description: "Numero del report associato.",
    example: 1002,
  })
  numeroReport?: number;

  @ApiPropertyOptional({
    description: "Indice personale dell'utente.",
    example: 15,
  })
  indicePersonale?: number;

  @ApiPropertyOptional({
    description: "Codice del cliente principale (super).",
    example: 123,
  })
  codiceClienteSuper?: number;

  @ApiPropertyOptional({
    description: "Codice dell'agenzia associata.",
    example: 123,
  })
  codiceAgenzia?: number;

  @ApiPropertyOptional({
    description: "Codice del cliente collegato.",
    example: "123",
  })
  codiceClienteCollegato?: number;

  @ApiPropertyOptional({
    description: "Lista di codici clienti separati da virgola.",
    example: "CLT_123,CLT_456,CLT_789",
  })
  codiceClienti?: string;

  @ApiPropertyOptional({
    description: "Tipo di filtro applicato.",
    example: "esclusivo",
  })
  tipoFiltro?: number;

  // Campi aggiuntivi utente
  @ApiPropertyOptional({
    description: "Avatar dell'utente.",
    example: "user.svg",
  })
  avatar?: string;

  @ApiPropertyOptional({
    description: "Flag autenticazione a due fattori.",
    example: false,
  })
  flagDueFattori?: boolean;

  @ApiPropertyOptional({
    description: "Pagina di default dell'utente.",
    example: "/dashboard",
  })
  paginaDefault?: string;

  @ApiPropertyOptional({
    description: "Ragione sociale cliente.",
    example: "ALIVAL STOCK",
  })
  ragSocCli?: string;

  @ApiPropertyOptional({
    description: "HTML mail personalizzato",
    example: "<html></html>",
  })
  htmlMail?: string;
  
  @ApiPropertyOptional({
    description: 'idx della postazione nella tabella ANTENNE_POS di PROLAV',
    example: '12',
  })
  idxPostazione?: number;
}
