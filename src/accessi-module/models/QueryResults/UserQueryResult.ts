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
    json_metadata?: string;
    /* VECCHI CAMPI ELIMINATI DA ACCESSI
    cauMov?: string;
    flagMop?: boolean;
    flagPiana?: boolean;
    flagAddetti?: boolean;
    flagOspiti?: boolean;
    flagPianaRfid?: boolean;
    flagConta?: boolean;
    flagTintemi?: boolean;
    flagCubi?: boolean;
    flagCiclPass?: boolean;
    */
    prog?: number;
    numRep?: number;
    idxPers?: number;
    codiceClienteSuper?: string;
    codiceAge?: string;
    codiceClienteCol?: string;
    codiceClienti?: string;
    tipoFil?: string;
}