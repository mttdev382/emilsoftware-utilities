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
    enum: [0, 5, 10, 20, 50, 99],
    example: 20,
  })
  statoRegistrazione: StatoRegistrazione;
}
