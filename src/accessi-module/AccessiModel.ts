import { Options } from "es-node-firebird";
import { CryptUtilities, RestUtilities } from "../Utilities";
import { Orm } from "../Orm";
import { LoginRequest } from "./models/DTO/LoginRequest";
import { UserQueryResult } from "./models/QueryResults/UserQueryResult";
import { LoginResponse } from "./models/DTO/LoginResponse";
import { MenuAbilitazioniResult } from "./models/QueryResults/MenuAbilitazioniResult";
import { StatoRegistrazione } from "./models/StatoRegistrazione";
import { RegisterRequest } from "./models/DTO/RegisterRequest";
import { autobind } from "../autobind";
import { AccessiOptions } from "./AccessiModule";



@autobind
export class AccessiModel {
    constructor(private accessiOptions: AccessiOptions) { }

    getAdminUser(): LoginResponse {
        return {
            user: {
                codiceUtente: "6789",
                username: "admin",
                flagGdpr: true,
                dataGdpr: "2024-05-01T00:00:00Z",
                dataInserimento: "2023-10-15T00:00:00Z",
                dataScadenzaPassword: "2025-01-01T00:00:00Z",
                dataLastLogin: "2025-01-07T15:45:00Z",
                statoRegistrazione: StatoRegistrazione.CONF,
                keyRegistrazione: "a1b2c3d4e5",
                cognome: "Admin",
                nome: "Admin",
                avatar: "/path/to/avatar.jpg",
                flagDueFattori: false,
                codiceLingua: "IT",
                cellulare: "+391234567890",
                flagSuper: true,
                pagDef: "/home",
                prog: 101,
                numRep: 5,
                idxPers: 10,
                codiceClienteSuper: "CLI001",
                codiceAge: "AGE001",
                codiceClienteCol: "COL001",
                codiceClienti: "CLI002",
                tipoFil: "FIL001"
            },
            abilitazioni: []
        }

    }

    getDemoUser(): LoginResponse {
        return {
            user: {
                codiceUtente: "12345",
                username: "jdoe",
                flagGdpr: true,
                dataGdpr: "2024-05-01T00:00:00Z",
                dataInserimento: "2023-10-15T00:00:00Z",
                dataScadenzaPassword: "2025-01-01T00:00:00Z",
                dataLastLogin: "2025-01-07T15:45:00Z",
                statoRegistrazione: StatoRegistrazione.CONF,
                keyRegistrazione: "a1b2c3d4e5",
                cognome: "Doe",
                nome: "John",
                avatar: "/path/to/avatar.jpg",
                flagDueFattori: false,
                codiceLingua: "IT",
                cellulare: "+391234567890",
                flagSuper: true,
                pagDef: "/home",
                prog: 101,
                numRep: 5,
                idxPers: 10,
                codiceClienteSuper: "CLI001",
                codiceAge: "AGE001",
                codiceClienteCol: "COL001",
                codiceClienti: "CLI002",
                tipoFil: "FIL001"
            },
            abilitazioni: []
        }

    }

    /**
     * @region Login Method
     * Metodo per effettuare il login dell'utente.
     * Effettua controlli sulle credenziali fornite, verifica lo stato di registrazione
     * dell'utente e restituisce le abilitazioni e i dettagli dell'utente loggato.
     *
     * @param {LoginRequest} request - Richiesta contenente username e password.
     * @returns {Promise<LoginResponse>} Oggetto contenente i dettagli dell'utente e le abilitazioni.
     * @throws {Error} Se le credenziali non sono valide o l'utente non è autorizzato.
     * @author mttdev382

     */

    //#region Login Method
    public async login(request: LoginRequest): Promise<LoginResponse> {
        try {

            if (this.accessiOptions.mockDemoUser && request.username.toLowerCase() === "demo" && request.password.toLowerCase() === "demo")
                return this.getDemoUser();

            if (this.accessiOptions.mockDemoUser && request.username.toLowerCase() === "admin" && request.password.toLowerCase() === "admin")
                return this.getDemoUser();
            
            let password = CryptUtilities.encrypt(request.password, this.accessiOptions.encryptionKey);
            var userQuery = `
        SELECT
            U.CODUTE        as codice_utente,
            U.USRNAME       as username,
            U.FLGGDPR       as flag_gdpr,
            U.DATGDPR       as data_gdpr,
            U.DATINS        as data_inserimento,
            U.DATSCAPWD     as data_scadenza_password,
            U.DATLASTLOGIN  as data_last_login,
            U.STAREG        as stato_registrazione,
            U.KEYREG        as key_registrazione,
            C.COGNOME       as cognome,
            C.NOME          as nome,
            C.AVATAR        as avatar,
            C.FLG2FATT      as flag_due_fattori,
            C.CODLINGUA     as codice_lingua,
            C.CELLULARE     as cellulare,
            C.FLGSUPER      as flag_super,
            C.PAGDEF        as pag_def,
            C.JSON_METADATA as json_metadata,
            F.PROG          as prog,
            F.NUMREP        as num_rep,
            F.IDXPERS       as idx_pers,
            F.CODCLISUPER   as codice_cliente_super,
            F.CODAGE        as codice_age,
            F.CODCLICOL     as codice_cliente_col, 
            F.CODCLIENTI    as codice_clienti,
            F.TIPFIL        as tipo_fil
        FROM UTENTI U, UTENTI_CONFIG C, FILTRI F
        WHERE LOWER(U.USRNAME) = ?
        AND C.CODUTE=U.CODUTE AND F.CODUTE=U.CODUTE 
        `;

            let userParams = [request.username.toLowerCase()];

            let userResult = (await Orm.query(this.accessiOptions.databaseOptions, userQuery, userParams)) as any[];
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

            if (statoRegistrazione !== StatoRegistrazione.CONF) throw new Error(`Errore generico. Lo stato di registrazione non è ${StatoRegistrazione.CONF}..`);

            let utentiPwdQuery = ` SELECT CODUTE as codice_utente, PWD as password FROM UTENTI_PWD WHERE CODUTE = ? `;
            let utentiPwdParams = [loggedInUser.codiceUtente]
            let utentiPwdResult = (await Orm.query(this.accessiOptions.databaseOptions, utentiPwdQuery, utentiPwdParams)) as any[];
            utentiPwdResult = utentiPwdResult.map(RestUtilities.convertKeysToCamelCase) as { codiceUtente: string, password: string }[];

            if (!utentiPwdResult || utentiPwdResult.length == 0) {
                throw new Error("Nome utente o password non corretti. ");
            }

            let utentePwd = utentiPwdResult[0] as { codiceUtente: string, password: string };

            if (password != utentePwd.password) {
                throw new Error("Nome utente o password errata! " + JSON.stringify(utentePwd));
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
            let abilitazioni = (await Orm.query(this.accessiOptions.databaseOptions, abilitazioniQuery, abilitazioniParams)) as any[];
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
    //#endregion



    /**
     * Restituisce la chiave di crittografia utilizzata dal sistema.
     *
     * @returns {string} La chiave di crittografia.
     * @author mttdev382

     */
    public getOptions(): AccessiOptions {
        return this.accessiOptions;
    }


    /**
     * @region Register Method
     * Metodo per registrare un nuovo utente.
     * Esegue l'inserimento dei dettagli dell'utente nelle tabelle UTENTI e UTENTI_CONFIG.
     *
     * @param {RegisterRequest} request - Richiesta contenente i dettagli dell'utente da registrare.
     * @returns {Promise<any>} Una Promise che rappresenta il completamento dell'operazione.
     * @throws {Error} Se l'inserimento fallisce per qualsiasi motivo.
     * @author mttdev382

     */

    //#region Register Method
    public async register(request: RegisterRequest): Promise<any> {
        try {
            let queryUtenti = ` INSERT INTO UTENTI (CODUTE,USRNAME,STAREG,KEYREG,FLGGDPR) VALUES (?,?,?,?,?) `;
            let paramsUtenti = [request.codiceUtente, request.username.toLowerCase().trim(), request.statoRegistrazione, request.chiaveRegistrazione, '0']

            await Orm.execute(this.accessiOptions.databaseOptions, queryUtenti, paramsUtenti);

            let queryUtentiConfig = ` INSERT INTO UTENTI_CONFIG (CODUTE,COGNOME,NOME,CODLINGUA,FLGSUPER) VALUES (?,?,?,?,?) `;
            let paramsUtentiConfig = [request.codiceUtente, request.cognome, request.nome, request.codiceCausaleMovimento, request.lingua, request.admin, request.valori];

            await Orm.execute(this.accessiOptions.databaseOptions, queryUtentiConfig, paramsUtentiConfig);
        } catch (error) {
            throw error;
        }
    }
    //#endregion



    /**
     * Recupera il codice utente associato a un determinato username.
     * 
     * @param {string} username - Lo username dell'utente di cui si vuole ottenere il codice utente.
     * @returns {Promise<{ codiceUtente: string }>} - Un oggetto contenente il codice utente dell'utente richiesto.
     * @throws {Error} - Lancia un errore in caso di problemi con la query o la connessione al database.
     * @author mttdev382

     */
    // #region getCodiceUtenteByUsername Method
    public async getCodiceUtenteByUsername(username: string) {
        try {
            var query = ` SELECT CODUTE as codice_utente FROM UTENTI WHERE LOWER(USRNAME) = ? `;

            let params = [username.trim().toLowerCase()];
            let result = (await Orm.query(this.accessiOptions.databaseOptions, query, params)) as any[];
            result = result.map(RestUtilities.convertKeysToCamelCase) as { codiceUtente: string }[];
            return result[0];
        } catch (error) {
            throw error;
        }
    }
    // #endregion



    /**
     * Recupera una lista di profili utente con informazioni dettagliate.
     * 
     * @returns {Promise<Array>} - Una lista di oggetti contenenti i dati dei profili utente.
     * @throws {Error} - Lancia un errore in caso di problemi con la query o la connessione al database.
     * @author mttdev382

     */
    //#region getProfiloLista Method
    public async getProfiloLista() {
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
            G.CODLINGUA as codice_lingua,
            G.CELLULARE as cellulare,
            G.FLGSUPER as flag_super, 
            G.PAGDEF as pagina_default,
            G.JSON_METADATA as json_metadata,
            F.NUMREP as numero_reparto, 
            F.IDXPERS as idx_personale, 
            F.CODCLISUPER as codice_cliente_super, 
            F.CODAGE as codice_agente, 
            F.CODCLICOL as codice_cliente_collegato, 
            F.CODCLIENTI as codice_clienti, 
            F.TIPFIL as tipo_filtro
        
        FROM UTENTI U, UTENTI_CONFIG G, FILTRI F 
        WHERE U.CODUTE = G.CODUTE AND F.CODUTE = U.CODUTE 
        ORDER BY G.COGNOME, G.NOME 
        ` ;
            let params = [];
            let result = await Orm.query(this.accessiOptions.databaseOptions, query, params);
            return result.map(RestUtilities.convertKeysToCamelCase);
        } catch (error) {
            throw error;
        }
    }
    //#endregion


    /**
     * Resetta le abilitazioni di un utente eliminando tutte le sue abilitazioni.
     * 
     * @param {string} codiceUtente - Il codice utente per cui resettare le abilitazioni.
     * @returns {Promise<any>} - Il risultato dell'esecuzione della query.
     * @throws {Error} - Lancia un errore in caso di problemi con la query o la connessione al database.
     * @author mttdev382

     */
    //#region Metodo resetAbilitazioni
    public async resetAbilitazioni(codiceUtente: string) {
        try {
            var query = " DELETE FROM ABILITAZIONI WHERE CODUTE= ? ";
            let params = [codiceUtente];
            let result = await Orm.execute(this.accessiOptions.databaseOptions, query, params);
            return result;
        } catch (error) {
            throw error;
        }
    }
    //#endregion


    /**
     * Imposta lo stato di registrazione di un utente.
     * 
     * @param {StatoRegistrazione} statoRegistrazione - Lo stato di registrazione da impostare per l'utente.
     * @param {string} codiceUtente - Il codice utente dell'utente a cui associare lo stato di registrazione.
     * @returns {Promise<any>} - Il risultato dell'esecuzione della query.
     * @throws {Error} - Lancia un errore in caso di problemi con la query o la connessione al database.
     * @author mttdev382

     */
    //#region setStatoRegistrazione Method
    public async setStatoRegistrazione(statoRegistrazione: StatoRegistrazione, codiceUtente: string) {
        try {
            let query = ` UPDATE UTENTI SET STAREG = ? WHERE CODUTE = ? `;

            let params = [statoRegistrazione, codiceUtente];
            let result = await Orm.execute(this.accessiOptions.databaseOptions, query, params);
            return result;
        } catch (error) {
            throw error;
        }
    }
    //#endregion


    /**
     * Imposta o inserisce i dati GDPR per un utente.
     * 
     * @param {string} codiceUtente - Il codice utente a cui associare i dati GDPR.
     * @returns {Promise<any>} - Il risultato dell'esecuzione della query.
     * @throws {Error} - Lancia un errore in caso di problemi con la query o la connessione al database.
     * @author mttdev382

     */
    //#region setGdpr Method
    public async setGdpr(codiceUtente: string) {
        try {
            let query = ` UPDATE OR INSERT UTENTI_GDPR SET CODUTE = ? `;
            let params = [codiceUtente];
            let result = await Orm.execute(this.accessiOptions.databaseOptions, query, params);
            return result;
        } catch (error) {
            throw error;
        }
    }
    //#endregion



    /**
     * Aggiunge le abilitazioni per un utente, prima eliminando quelle esistenti e poi inserendo quelle nuove.
     * 
     * @param {string} codiceUtente - Il codice utente per cui aggiungere le abilitazioni.
     * @param {any[]} menuAbilitazioni - Un array di oggetti che rappresentano le abilitazioni da aggiungere.
     * @returns {Promise<void>} - Una promessa che si risolve quando tutte le operazioni sono completate.
     * @throws {Error} - Lancia un errore in caso di problemi con le operazioni di database.
     * @author mttdev382

     */
    //#region addAbilitazioni Method
    public async addAbilitazioni(codiceUtente: string, menuAbilitazioni: any[]) {
        try {
            const deleteQuery = `DELETE FROM ABILITAZIONI WHERE CODUTE = ?`;
            await Orm.execute(this.accessiOptions.databaseOptions, deleteQuery, [codiceUtente]);

            const abilitazioniToInsert = menuAbilitazioni
                .flatMap(menuGrp => menuGrp.menu)
                .filter(menu => menu.flgChk)
                .map(menu => [codiceUtente, menu.codMnu, menu.codAbi]);

            const insertQuery = `UPDATE OR INSERT INTO ABILITAZIONI (CODUTE, CODMNU, TIPABI) VALUES (?, ?, ?)`;

            for (const params of abilitazioniToInsert) {
                await Orm.execute(this.accessiOptions.databaseOptions, insertQuery, params);
            }
        } catch (error) {
            throw error;
        }
    }
    //#endregion


    /**
     * Imposta o aggiorna la password per un utente.
     * 
     * @param {string} codiceUtente - Il codice utente a cui associare la nuova password.
     * @param {string} nuovaPassword - La nuova password da impostare per l'utente.
     * @returns {Promise<any>} - Il risultato dell'esecuzione della query.
     * @throws {Error} - Lancia un errore in caso di problemi con la query o la connessione al database.
     * @author mttdev382

     */
    //#region setPassword Method
    public async setPassword(codiceUtente: string, nuovaPassword: string) {
        try {

            let query = ` UPDATE OR INSERT INTO UTENTI_PWD (CODUTE, PWD) VALUES (?, ?) `;

            let params = [codiceUtente, nuovaPassword];
            let result = await Orm.execute(this.accessiOptions.databaseOptions, query, params);
            return result;
        } catch (error) {
            throw error;
        }
    }
    //#endregion


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


}