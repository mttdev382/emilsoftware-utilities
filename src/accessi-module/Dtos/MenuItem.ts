import { ApiProperty } from "@nestjs/swagger";
import { TipoAbilitazione } from "./TipoAbilitazione";

export class MenuItem {
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