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
    cauMov?: string;
    codiceLingua?: string;
    cellulare?: string;
    flagSuper?: boolean;
    flagMop?: boolean;
    flagPiana?: boolean;
    flagAddetti?: boolean;
    flagOspiti?: boolean;
    flagPianaRfid?: boolean;
    flagConta?: boolean;
    flagTintemi?: boolean;
    flagCubi?: boolean;
    flagCiclPass?: boolean;
    pagDef?: string;

    prog?: number;
    numRep?: number;
    idxPers?: number;
    codiceClienteSuper?: string;
    codiceAge?: string;
    codiceClienteCol?: string;
    codiceClienti?: string;
    tipoFil?: string;
}