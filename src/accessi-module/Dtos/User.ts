import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { StatoRegistrazione } from "./StatoRegistrazione";
import { Permission } from "./Permission";

export class User {
    @ApiPropertyOptional({
        description: "Codice identificativo dell'utente",
        example: "USR12345"
    })
    codiceUtente?: string;

    @ApiPropertyOptional({
        description: "Email per l'autenticazione",
        example: "m.rossi@dev.it"
    })
    email?: string;

    @ApiPropertyOptional({
        description: "Flag per l'accettazione del GDPR",
        example: true
    })
    flagGdpr?: boolean;

    @ApiPropertyOptional({
        description: "Stato della registrazione dell'utente",
        enum: StatoRegistrazione,
        example: StatoRegistrazione.CONF
    })
    statoRegistrazione?: StatoRegistrazione;

    @ApiPropertyOptional({
        description: "Cognome dell'utente",
        example: "Rossi"
    })
    cognome?: string;

    @ApiPropertyOptional({
        description: "Nome dell'utente",
        example: "Mario"
    })
    nome?: string;

    @ApiPropertyOptional({
        description: "URL dell'avatar dell'utente",
        example: "https://example.com/avatar.jpg",
        nullable: true
    })
    avatar?: string | null;

    @ApiPropertyOptional({
        description: "Indica se l'autenticazione a due fattori è attivata",
        example: true
    })
    flagDueFattori?: boolean;

    @ApiPropertyOptional({
        description: "Codice lingua preferito dall'utente",
        example: "it"
    })
    codiceLingua?: string;


    @ApiPropertyOptional({
        description: "Data scadenza password",
        example: "2025-06-01"
    })
    dataScadenzaPassword?: string;


    @ApiPropertyOptional({
        description: "Numero di cellulare dell'utente",
        example: "+393331234567",
        nullable: true
    })
    cellulare?: string | null;

    @ApiPropertyOptional({
        description: "Indica se l'utente ha privilegi di superutente",
        example: false
    })
    flagSuper?: boolean;

    @ApiPropertyOptional({
        description: "Pagina di default visualizzata dall'utente dopo il login",
        example: "/dashboard"
    })
    paginaDefault?: string;

    @ApiPropertyOptional({
        description: "Metadati non relazionali dell'utente",
        example: "{ \"key\": \"value\" }",
    })
    jsonMetadata?: string;

    @ApiPropertyOptional({
        description: "Roles assigned to the user",
        example: ["admin", "editor"],
    })
    roles: string[];

    @ApiPropertyOptional({
        description: "Permissions granted to the user",
        example: [{ action: "read", resource: "posts" }],
    })
    permissions: Permission[];
}
