import { ApiProperty } from "@nestjs/swagger";

export class Permission {
    @ApiProperty({
        description: "Codice identificativo del menu a cui assegnare l'abilitazione.",
        type: String,
        example: "MNU001"
    })
    codiceMenu: string;

    @ApiProperty({
        description: "Tipo di abilitazione assegnata all'utente per il menu specificato.",
        type: Number,
        example: 30
    })
    tipoAbilitazione: number;
}