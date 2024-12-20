import { Options } from "es-node-firebird";
import autobind from "autobind-decorator";
import { Logger } from "../Logger";
import { CryptUtilities, RestUtilities } from "../Utilities";
import { Orm } from "../Orm";
import { LoginRequest } from "./models/DTO/LoginRequest";
import { UserQueryResult } from "./models/QueryResults/UserQueryResult";
import { LoginResponse } from "./models/DTO/LoginResponse";
import { MenuAbilitazioniResult } from "./models/QueryResults/MenuAbilitazioniResult";
import { StatoRegistrazione } from "./models/StatoRegistrazione";
import { RegisterRequest } from "./models/DTO/RegisterRequest";

@autobind
export class AccessiModel {
    private logger: Logger = new Logger(AccessiModel.name);

    constructor(private databaseOptions: Options, private encryptionKey: string) { }


    public async login(request: LoginRequest): Promise<LoginResponse> {
        try {
            let password = CryptUtilities.encrypt(request.password, this.encryptionKey);
            var userQuery = `
            SELECT
                U.CODUTE       as codice_utente,
                U.USRNAME      as username,
                U.FLGGDPR      as flag_gdpr,
                U.DATGDPR      as data_gdpr,
                U.DATINS       as data_inserimento,
                U.DATSCAPWD    as data_scadenza_password,
                U.DATLASTLOGIN as data_last_login,
                U.STAREG       as stato_registrazione,
                U.KEYREG       as key_registrazione,
                C.COGNOME      as cognome,
                C.NOME         as nome,
                C.AVATAR       as avatar,
                C.FLG2FATT     as flag_due_fattori,
                C.CAUMOV       as cau_mov,
                C.CODLINGUA    as codice_lingua,
                C.CELLULARE    as cellulare,
                C.FLGSUPER     as flag_super,
                C.FLGMOP       as flag_mop,
                C.FLGPIANA     as flag_piana,
                C.FLGADDETTI   as flag_addetti,
                C.FLGOSPITI    as flag_ospiti,
                C.FLGPIANARFID as flag_piana_rfid,
                C.FLGCONTA     as flag_conta,
                C.FLGTINTEMI   as flag_tintemi,
                C.FLGCUBI      as flag_cubi,
                C.FLGCICLPASS  as flag_cicl_pass,
                C.PAGDEF       as pag_def,
                F.PROG         as prog,
                F.NUMREP       as num_rep,
                F.IDXPERS      as idx_pers,
                F.CODCLISUPER  as codice_cliente_super,
                F.CODAGE       as codice_age
                F.CODCLICOL    as codice_cliente_col, 
                F.CODCLIENTI   as codice_clienti,
                F.TIPFIL       as tipo_fil

            FROM UTENTI U, UTENTI_CONFIG C, FILTRI F
            WHERE LOWER(U.USRNAME) = ?
            AND C.CODUTE=U.CODUTE AND F.CODUTE=U.CODUTE 
            `;

            let userParams = [request.username];

            let userResult = (await Orm.query(this.databaseOptions, userQuery, userParams)) as any[];
            userResult = userResult.map(RestUtilities.convertKeysToCamelCase) as UserQueryResult[];

            if (!userResult || userResult.length == 0) throw new Error("Username o password non validi!");

            let loggedInUser = userResult[0] as UserQueryResult;

            let statoRegistrazione = loggedInUser.statoRegistrazione;


            switch (statoRegistrazione) {
                case undefined:
                    throw new Error("Struttura dati compromessa:  STAREG inesistente.");
                case StatoRegistrazione.BLOCC,
                    StatoRegistrazione.DELETE:
                    throw new Error("utente non abilitato");
                case StatoRegistrazione.INVIO:
                    throw new Error("Rinnovo password");
            }

            if (statoRegistrazione !== StatoRegistrazione.CONF) throw new Error("Errore generico. Lo stato di registrazione non è 'CONF'..");

            let utentiPwdQuery = ` 
            SELECT 
                CODUTE as codice_utente,
                PWD as password,
            FROM UTENTI_PWD 
            WHERE CODUTE = ? `;
            let utentiPwdParams = [loggedInUser.codiceUtente]
            let utentiPwdResult = (await Orm.query(this.databaseOptions, utentiPwdQuery, utentiPwdParams)) as any[];
            utentiPwdResult = utentiPwdParams.map(RestUtilities.convertKeysToCamelCase) as { codiceUtente: string, password: string }[];


            if (!utentiPwdResult || utentiPwdResult.length == 0) {
                throw new Error("Nome utente o password non corretti. ");
            }

            let utentePwd = utentiPwdResult[0] as { codiceUtente: string, password: string };

            if (password != utentePwd.password) {
                throw new Error("Nome utente o password errata! ");
            }

            let abilitazioniQuery = "";
            let abilitazioniParams = [];

            if (loggedInUser.flagSuper) {
                abilitazioniQuery =
                    `SELECT 
                        M.CODMNU,
                        10 AS TIPABI, 
                        M.DESMNU, 
                        G.DESGRP, 
                        G.CODGRP, 
                        M.ICON, 
                        M.CODTIP AS TIPO, 
                        M.PAGINA
                    FROM MENU M, MENU_GRP G 
                    WHERE G.CODGRP = M.CODGRP AND M.FLGENABLED=1 AND G.FLGENABLED=1 
                    ORDER BY G.ORDINE, M.ORDINE `;
                abilitazioniParams = [];
            } else {
                abilitazioniQuery =
                    `SELECT 
                        A.CODMNU as codice_mnu, 
                        A.TIPABI as tipo_abilitazione, 
                        M.DESMNU as descrizione_mnu, 
                        G.DESGRP as descrizione_grp, 
                        G.CODGRP as codice_grp, 
                        M.ICON as icon, 
                        M.CODTIP AS codice_tipo, 
                        M.PAGINA as pagina
                    FROM ABILITAZIONI A, MENU M, MENU_GRP G 
                    WHERE A.CODUTE = ? AND A.CODMNU = M.CODMNU AND G.CODGRP = M.CODGRP  AND M.FLGENABLED=1 AND G.FLGENABLED=1 
                    ORDER BY G.ORDINE, M.ORDINE 
                    `;
                abilitazioniParams = [loggedInUser.codiceUtente];
            }
            let abilitazioni = (await Orm.query(this.databaseOptions, abilitazioniQuery, abilitazioniParams)) as any[];
            abilitazioni = abilitazioni.map(RestUtilities.convertKeysToCamelCase) as MenuAbilitazioniResult[];

            let result: LoginResponse = {
                user: loggedInUser,
                abilitazioni: abilitazioni
            }
            return result;

        } catch (error) {
            throw error;
        }
    }



    public async register(request: RegisterRequest): Promise<any> {
        try {
            let queryUtenti = "INSERT INTO UTENTI (CODUTE,USRNAME,STAREG,KEYREG,FLGGDPR) VALUES (?,?,?,?,?)";
            let paramsUtenti = [request.codiceUtente, request.username.toLowerCase().trim(), request.statoRegistrazione, request.chiaveRegistrazione, '0']

            await Orm.execute(this.databaseOptions, queryUtenti, paramsUtenti);

            let queryUtentiConfig = "INSERT INTO UTENTI_CONFIG (CODUTE,COGNOME,NOME,CAUMOV,CODLINGUA,FLGSUPER) VALUES (?,?,?,?,?,?)";
            let paramsUtentiConfig = [request.codiceUtente, request.cognome, request.nome, request.codiceCausaleMovimento, request.lingua, request.admin, request.valori];

            await Orm.execute(this.databaseOptions, queryUtentiConfig, paramsUtentiConfig);
        } catch (error) {
            throw error;
        }
    }



    public async getCodiceUtenteByUsername(username: string) {
        try {
            var query = ` 
            SELECT
                CODUTE as codice_utente 
            FROM UTENTI 
            WHERE LOWER(USRNAME)= ? 
            `;

            let params = [username.trim().toLowerCase()];
            let result = (await Orm.query(this.databaseOptions, query, params)) as any[];
            result = result.map(RestUtilities.convertKeysToCamelCase) as { codiceUtente: string }[];
            return result[0];
        } catch (error) {
            throw error;
        }
    }



    public async profiloLista() {
        try {
            var query = ` 
            SELECT  
                U.CODUTE as codice_utente, 
                U.USRNAME as username, 
                U.FLGGDPR as flag_gdpr, 
                U.DATGDPR as data_gdpr, 
                U.DATINS as data_inserimento, 
                U.DATSCAPWD as data_scadenza_password, 
                U.DATLASTLOGIN as data_last_login, 
                U.STAREG as stato_registrazione, 
                G.COGNOME as cognome, 
                G.NOME as nome, 
                G.AVATAR as avatar, 
                G.FLG2FATT as flag_due_fattori, 
                G.CAUMOV as cau_mov, 
                G.CODLINGUA as codice_lingua, 
                G.FLGSUPER as flag_super, 
                G.FLGMOP as flag_mop, 
                G.FLGPIANA as flag_piana, 
                G.FLGADDETTI as flag_addetti, 
                G.FLGOSPITI as flag_ospiti, 
                G.FLGPIANARFID as flag_piana_rfid, 
                G.FLGCONTA as flag_contabilita, 
                G.FLGCUBI as flag_cubi, 
                G.FLGCICLPASS as flag_ciclo_passivo, 
                F.NUMREP as numero_reparto, 
                F.IDXPERS as idx_personale, 
                F.CODCLISUPER as codice_cliente_super, 
                F.CODAGE as codice_agente, 
                F.CODCLICOL as codice_cliente_collegato, 
                F.CODCLIENTI as codice_clienti, 
                F.TIPFIL as tipo_filtro, 
                G.PAGDEF as pagina_default
            
            FROM UTENTI U, UTENTI_CONFIG G, FILTRI F 
            WHERE U.CODUTE = G.CODUTE AND F.CODUTE = U.CODUTE 
            ORDER BY G.COGNOME, G.NOME 
            ` ;
            let params = [];
            let result = await Orm.query(this.databaseOptions, query, params);
            return result.map(RestUtilities.convertKeysToCamelCase);
        } catch (error) {
            throw error;
        }
    }

    public async resetAbilitazioni(codiceUtente: string) {
        try {
            var query = " DELETE FROM ABILITAZIONI WHERE CODUTE= ? ";
            let params = [codiceUtente];
            let result = await Orm.execute(this.databaseOptions, query, params);
            return result;
        } catch (error) {
            throw error;
        }
    }

    /**
     * 

    public async addFiltri(params) {
    try {
        let iCodUte = params.codUte;
        let iFiltro = params.filtro;
        let sCodCli = params.codCli;
        let iNumRep = params.numRep;
        let iSuper = params.codSuper;
        let iAgente = params.agente;

        var sSql = "";
        switch (iFiltro) {
            case this.ID_TUTTICLIENTI: {
                //uno o più clienti selezionati
                sSql = "INSERT INTO FILTRI (CODUTE,TIPFIL) VALUES (";
                sSql += iCodUte + "," + this.ID_TUTTICLIENTI.toString() + ")";
                break;
            }
            case this.ID_SELCLIENTE: {
                //uno o più clienti selezionati
                sSql = "INSERT INTO FILTRI (CODUTE,CODCLIENTI,NUMREP,TIPFIL) VALUES (";
                sSql += iCodUte + ",'" + sCodCli + "'," + iNumRep + "," + iFiltro + ")";
                break;
            }
            case this.ID_SELSUPER: {
                //cliente padre
                sSql = "INSERT INTO FILTRI (CODUTE,CODCLISUPER,TIPFIL) VALUES (";
                sSql += iCodUte + "," + iSuper + "," + iFiltro + ")";
                break;
            }
            case this.ID_SELAGENTE: {
                //agente
                sSql = "INSERT INTO FILTRI (CODUTE,CODAGE,TIPFIL) VALUES (";
                sSql += iCodUte + "," + iAgente + "," + iFiltro + ")";
                break;
            }
            default: {
                //è un admin super utente
                sSql = "INSERT INTO FILTRI (CODUTE,TIPFIL) VALUES (";
                sSql += iCodUte + ",99)";
                break;
            }
        }
        let result = await Orm.execute(optionsAccessi, sSql);
        return result;
    } catch (error) {
        throw error;
    }
}
         */

    public async setStatoRegistrazione(statoRegistrazione: StatoRegistrazione, codiceUtente: string) {
        try {
            let query = " UPDATE UTENTI SET STAREG = ? WHERE CODUTE = ? ";

            let params = [statoRegistrazione, codiceUtente];
            let result = await Orm.execute(this.databaseOptions, query, params);
            return result;
        } catch (error) {
            throw error;
        }
    }

    public async setGdpr(codiceUtente: string) {
        try {
            let query = " UPDATE OR INSERT UTENTI_GDPR SET CODUTE = ? ";
            let params = [codiceUtente];
            let result = await Orm.execute(this.databaseOptions, query, params);
            return result;
        } catch (error) {
            throw error;
        }
    }


    public async addAbilitazioni(codiceUtente: string, menuAbilitazioni: any[]) {
        try {
            const deleteQuery = "DELETE FROM ABILITAZIONI WHERE CODUTE = ?";
            await Orm.execute(this.databaseOptions, deleteQuery, [codiceUtente]);

            const abilitazioniToInsert = menuAbilitazioni
                .flatMap(menuGrp => menuGrp.menu)
                .filter(menu => menu.flgChk)
                .map(menu => [codiceUtente, menu.codMnu, menu.codAbi]);

            const insertQuery = "UPDATE OR INSERT INTO ABILITAZIONI (CODUTE, CODMNU, TIPABI) VALUES (?, ?, ?)";

            for (const params of abilitazioniToInsert) {
                await Orm.execute(this.databaseOptions, insertQuery, params);
            }
        } catch (error) {
            throw error;
        }
    }


    public async setPassword(codiceUtente: string, nuovaPassword: string) {
        try {

            let query = " UPDATE OR INSERT INTO UTENTI_PWD (CODUTE, PWD) VALUES (?, ?) ";

            let params = [codiceUtente, nuovaPassword];
            let result = await Orm.execute(this.databaseOptions, query, params);
            return result;
        } catch (error) {
            throw error;
        }
    }



}