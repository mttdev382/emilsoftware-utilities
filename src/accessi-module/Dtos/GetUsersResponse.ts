import { ApiProperty } from '@nestjs/swagger';

export class GetUsersResponse {
    @ApiProperty({
        description: "Codice identificativo univoco dell'utente.",
        type: String,
        example: "USR123"
    })
    codiceUtente: string;

    @ApiProperty({
        description: "Username dell'utente.",
        type: String,
        example: "mario.rossi"
    })
    username: string;

    @ApiProperty({
        description: "Flag che indica se l'utente ha accettato il GDPR.",
        type: Boolean,
        example: true,
        required: false
    })
    flagGdpr?: boolean;

    @ApiProperty({
        description: "Data di accettazione del GDPR.",
        type: String,
        format: "date-time",
        example: "2024-03-18T12:34:56Z",
        required: false
    })
    dataGdpr?: string;

    @ApiProperty({
        description: "Data di inserimento dell'utente nel sistema.",
        type: String,
        format: "date-time",
        example: "2023-01-01T08:30:00Z",
        required: false
    })
    dataInserimento?: string;

    @ApiProperty({
        description: "Data di scadenza della password dell'utente.",
        type: String,
        format: "date-time",
        example: "2024-06-30T23:59:59Z",
        required: false
    })
    dataScadenzaPassword?: string;

    @ApiProperty({
        description: "Ultima data di accesso dell'utente.",
        type: String,
        format: "date-time",
        example: "2024-03-15T14:45:00Z",
        required: false
    })
    dataLastLogin?: string;

    @ApiProperty({
        description: "Stato della registrazione dell'utente (es. 1 = attivo, 0 = inattivo).",
        type: Number,
        example: 1,
        required: false
    })
    statoRegistrazione?: number;

    @ApiProperty({
        description: "Chiave di registrazione dell'utente.",
        type: String,
        example: "abc123xyz",
        required: false
    })
    keyRegistrazione?: string;

    @ApiProperty({
        description: "Cognome dell'utente.",
        type: String,
        example: "Rossi",
        required: false
    })
    cognome?: string;

    @ApiProperty({
        description: "Nome dell'utente.",
        type: String,
        example: "Mario",
        required: false
    })
    nome?: string;

    @ApiProperty({
        description: "Avatar dell'utente (URL o base64).",
        type: String,
        example: "https://example.com/avatar.jpg",
        required: false
    })
    avatar?: string;

    @ApiProperty({
        description: "Flag che indica se l'utente ha attivato l'autenticazione a due fattori.",
        type: Boolean,
        example: true,
        required: false
    })
    flagDueFattori?: boolean;

    @ApiProperty({
        description: "Codice lingua preferito dall'utente.",
        type: String,
        example: "it",
        required: false
    })
    codiceLingua?: string;

    @ApiProperty({
        description: "Numero di cellulare dell'utente.",
        type: String,
        example: "+393401234567",
        required: false
    })
    cellulare?: string;

    @ApiProperty({
        description: "Flag che indica se l'utente è un super utente.",
        type: Boolean,
        example: false,
        required: false
    })
    flagSuper?: boolean;

    @ApiProperty({
        description: "Pagina di default dell'utente all'accesso.",
        type: String,
        example: "/dashboard",
        required: false
    })
    pagDef?: string;

    @ApiProperty({
        description: "Metadata JSON personalizzato dell'utente.",
        type: String,
        example: "{\"theme\": \"dark\", \"notifications\": true}",
        required: false
    })
    jsonMetadata?: string;

    @ApiProperty({
        description: "Progressivo interno dell'utente.",
        type: Number,
        example: 1001,
        required: false
    })
    prog?: number;

    @ApiProperty({
        description: "Numero di report associati all'utente.",
        type: Number,
        example: 5,
        required: false
    })
    numRep?: number;

    @ApiProperty({
        description: "Indice personalizzato dell'utente.",
        type: Number,
        example: 200,
        required: false
    })
    idxPers?: number;

    @ApiProperty({
        description: "Codice cliente super associato all'utente.",
        type: String,
        example: "CLI001",
        required: false
    })
    codiceClienteSuper?: string;

    @ApiProperty({
        description: "Codice agente associato all'utente.",
        type: String,
        example: "AGT456",
        required: false
    })
    codiceAge?: string;

    @ApiProperty({
        description: "Codice cliente collettivo associato all'utente.",
        type: String,
        example: "CLCOL789",
        required: false
    })
    codiceClienteCol?: string;

    @ApiProperty({
        description: "Codice clienti multipli associati all'utente.",
        type: String,
        example: "CLI001, CLI002",
        required: false
    })
    codiceClienti?: string;

    @ApiProperty({
        description: "Tipo di filiale a cui appartiene l'utente.",
        type: String,
        example: "HQ",
        required: false
    })
    tipoFil?: string;
}
