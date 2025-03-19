import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoAbilitazione } from './TipoAbilitazione';

class Menu {
    @ApiProperty({ description: 'Codice univoco del menù' })
    codiceMenu: string;

    @ApiProperty({ description: 'Descrizione del menù' })
    descrizioneMenu: string;

    @ApiProperty({
        description: 'Tipo di abilitazione',
        enum: TipoAbilitazione,
        example: TipoAbilitazione.LETTURA,
    })
    tipoAbilitazione: TipoAbilitazione;
}

export class Role {
    @ApiPropertyOptional({ description: 'Codice univoco del ruolo', required: false })
    codiceRuolo?: string;

    @ApiProperty({ description: 'Descrizione del ruolo' })
    descrizioneRuolo: string;

    @ApiProperty({
        description: 'Lista di menù associati al ruolo',
        type: [Menu]
    })
    menu: Menu[];
}

