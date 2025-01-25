export interface UserQueryResult {
    codiceUtente: string;
    username: string;
    flagGdpr?: boolean;
    dataGdpr?: string;
    dataInserimento?: string;
    dataScadenzaPassword?: string;
    dataLastLogin?: string;
    statoRegistrazione?: number;
    keyRegistrazione?: string;
    cognome?: string;
    nome?: string;
    avatar?: string;
    flagDueFattori?: boolean;
    codiceLingua?: string;
    cellulare?: string;
    flagSuper?: boolean;
    pagDef?: string;
    jsonMetadata?: string;
    prog?: number;
    numRep?: number;
    idxPers?: number;
    codiceClienteSuper?: string;
    codiceAge?: string;
    codiceClienteCol?: string;
    codiceClienti?: string;
    tipoFil?: string;
}