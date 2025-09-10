import { ApiProperty } from '@nestjs/swagger';
import { StatoRegistrazione } from './StatoRegistrazione';

export class SetStatoRegistrazioneDto {
  @ApiProperty({
    description: "Codice identificativo dell'utente",
    example: 123,
  })
  codiceUtente: number;

  @ApiProperty({
    description: 'Nuovo stato di registrazione',
    enum: StatoRegistrazione,
    example: StatoRegistrazione.DELETE,
  })
  statoRegistrazione: StatoRegistrazione;
}
