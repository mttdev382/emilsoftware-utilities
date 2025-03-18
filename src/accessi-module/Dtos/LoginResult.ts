import { ApiProperty } from "@nestjs/swagger";
import { User } from "./User";
import { FiltriUtente } from "./FiltriUtente";
import { AbilitazioneMenu } from "./AbilitazioneMenu";
import { TokenResult } from "./TokenResult";

export class LoginResult {
    @ApiProperty({ description: 'Dati utente' })

    utente?: User;

    @ApiProperty({ description: 'Filtri utente' })

    filtri?: FiltriUtente[];

    @ApiProperty({ description: 'Abilitazioni utente' })

    abilitazioni?: AbilitazioneMenu[];

    @ApiProperty({ description: 'Username utente' })
    token?: TokenResult
}

