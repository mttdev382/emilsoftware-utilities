import { ApiProperty } from "@nestjs/swagger";

export class GetMenusResponse {
    menus: MenuEntity[];
}


export class MenuEntity {

    @ApiProperty({
        description: "Codice univoco del menù.",
        type: String,
        example: "MNU001"
    })
    codiceMenu: string;

    @ApiProperty({
        description: "Descrizione del menù.",
        type: String,
        example: "Gestione Utenti"
    })
    descrizioneMenu: string;

    @ApiProperty({
        description: "Codice del gruppo a cui appartiene il menù.",
        type: String,
        example: "GRP01",
        required: false
    })
    codiceGruppo?: string;

    @ApiProperty({
        description: "Descrizione del gruppo a cui appartiene il menù.",
        type: String,
        example: "Gestione Accessi",
        required: false
    })
    descrizioneGruppo?: string;

    @ApiProperty({
        description: "Percorso dell'icona associata al menù.",
        type: String,
        example: "fa-users",
        required: false
    })
    icona?: string;

    @ApiProperty({
        description: "Tipo di menù.",
        type: String,
        example: "admin",
        required: false
    })
    tipo?: string;

    @ApiProperty({
        description: "Percorso della pagina associata al menù.",
        type: String,
        example: "/accessi/gestione-utenti",
        required: false
    })
    pagina?: string;
}