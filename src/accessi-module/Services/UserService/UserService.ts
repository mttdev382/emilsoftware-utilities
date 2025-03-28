import { Inject, Injectable } from "@nestjs/common";
import { autobind } from "../../../autobind";
import { Orm } from "../../../Orm";
import { RestUtilities } from "../../../Utilities";
import { AccessiOptions } from "../../AccessiModule";
import { StatoRegistrazione } from "../../Dtos/StatoRegistrazione";
import { EmailService } from "../EmailService/EmailService";
import { FiltriUtente } from "../../Dtos/FiltriUtente";
import { GetUsersResponse } from "../../Dtos/GetUsersResponse";
import { PermissionService } from "../PermissionService/PermissionService";
import { UserDto } from "../../Dtos";

@autobind
@Injectable()
export class UserService  {

    constructor(
        @Inject('ACCESSI_OPTIONS') private readonly accessiOptions: AccessiOptions, private readonly emailService: EmailService, private readonly permissionService: PermissionService
    ) { }
    async getUsers(): Promise<GetUsersResponse[]> {
        try {
            const query = ` 
            SELECT  
                U.CODUTE as codice_utente, 
                U.USRNAME as email, 
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
                G.JSON_METADATA as json_metadata
            FROM UTENTI U INNER JOIN UTENTI_CONFIG G ON U.CODUTE = G.CODUTE  
            WHERE STAREG <> ?
            ORDER BY U.CODUTE`;

            const result = await Orm.query(this.accessiOptions.databaseOptions, query, [StatoRegistrazione.DELETE]);
            return result.map(RestUtilities.convertKeysToCamelCase);
        } catch (error) {
            throw error;
        }
    }

    async getCodiceUtenteByEmail(email: string): Promise<{ codiceUtente: number }> {
        try {
            const query = `SELECT CODUTE as codice_utente FROM UTENTI WHERE LOWER(USRNAME) = ?`;
            const result = await Orm.query(this.accessiOptions.databaseOptions, query, [email.trim().toLowerCase()]);
            return result.map(RestUtilities.convertKeysToCamelCase)[0];
        } catch (error) {
            throw error;
        }
    }

    async getUserByEmail(email: string): Promise<UserDto | null> {
        const query = `
            SELECT 
                U.CODUTE AS codice_utente, 
                U.USRNAME AS email, 
                U.FLGGDPR AS flag_gdpr,
                U.DATSCAPWD as data_scadenza_password,
                U.STAREG AS stato_registrazione, 
                C.COGNOME AS cognome, 
                C.NOME AS nome, 
                C.AVATAR AS avatar, 
                C.FLG2FATT AS flag_due_fattori,
                C.CODLINGUA AS codice_lingua, 
                C.CELLULARE AS cellulare, 
                C.FLGSUPER AS flag_super, 
                C.PAGDEF AS pagina_default
            FROM UTENTI U
            INNER JOIN UTENTI_CONFIG C ON C.CODUTE = U.CODUTE
            WHERE LOWER(U.USRNAME) = ?
        `;

        const utenti = await Orm.query(this.accessiOptions.databaseOptions, query, [email])
            .then(results => results.map(RestUtilities.convertKeysToCamelCase)) as UserDto[];

        return utenti.length > 0 ? utenti[0] : null;
    }

    async getUserFilters(codiceUtente: number): Promise<FiltriUtente[]> {
        const query = `
            SELECT 
                F.PROG AS progressivo, 
                F.NUMREP AS numero_report, 
                F.IDXPERS AS indice_personale,
                F.CODCLISUPER AS codice_cliente_super, 
                F.CODAGE AS codice_agenzia, 
                F.CODCLICOL AS codice_cliente_collegato,
                F.CODCLIENTI AS codice_clienti, 
                F.TIPFIL AS tipo_filtro
            FROM FILTRI F
            WHERE F.CODUTE = ?
        `;

        return await Orm.query(this.accessiOptions.databaseOptions, query, [codiceUtente])
            .then(results => results.map(RestUtilities.convertKeysToCamelCase)) as FiltriUtente[];
    }

    async register(registrationData: UserDto): Promise<void> {
        try {
            const existingUser = await Orm.query(
                this.accessiOptions.databaseOptions,
                "SELECT CODUTE FROM UTENTI WHERE USRNAME = ?",
                [registrationData.email]
            );
    
            if (existingUser.length > 0) {
                throw new Error("Questa e-mail è già stata utilizzata!");
            }


            const queryUtenti = `INSERT INTO UTENTI (USRNAME, STAREG) VALUES (?,?) RETURNING CODUTE`;
            const paramsUtenti = [registrationData.email, StatoRegistrazione.INVIO];

            const codiceUtente = (await Orm.query(this.accessiOptions.databaseOptions, queryUtenti, paramsUtenti)).CODUTE;

            const queryUtentiConfig = `INSERT INTO UTENTI_CONFIG (CODUTE,COGNOME,NOME,CODLINGUA) VALUES (?,?,?,?)`;
            const paramsUtentiConfig = [codiceUtente, registrationData.cognome, registrationData.nome, registrationData.codiceLingua];
            await Orm.execute(this.accessiOptions.databaseOptions, queryUtentiConfig, paramsUtentiConfig);

            if(!!registrationData.roles && registrationData.roles.length > 0) {
                await this.permissionService.assignRolesToUser(codiceUtente, registrationData.roles);
            }

            if(!!registrationData.permissions && registrationData.permissions.length > 0) {
                await this.permissionService.assignPermissionsToUser(codiceUtente, registrationData.permissions);
            }

            return codiceUtente;

        } catch (error) {
            throw error;
        }
    }

    async updateUser(codiceUtente: number, user: UserDto): Promise<void> {
        try {
            if (!codiceUtente) throw new Error("Impossibile aggiornare senza codice utente.");
    
            // Costruzione dinamica della query per UTENTI
            const utentiUpdates = [];
            const utentiParams = [];
    
            if (user.email !== undefined) {
                utentiUpdates.push("usrname = ?");
                utentiParams.push(user.email);
            }
            if (user.flagGdpr !== undefined) {
                utentiUpdates.push("flggdpr = ?");
                utentiParams.push(user.flagGdpr);
            }
            if (user.statoRegistrazione !== undefined) {
                utentiUpdates.push("stareg = ?");
                utentiParams.push(user.statoRegistrazione);
            }
    
            if (utentiUpdates.length > 0) {
                const queryUtenti = `UPDATE UTENTI SET ${utentiUpdates.join(", ")} WHERE CODUTE = ?`;
                utentiParams.push(codiceUtente);
                await Orm.execute(this.accessiOptions.databaseOptions, queryUtenti, utentiParams);
            }
    
            // Costruzione dinamica della query per UTENTI_CONFIG
            const utentiConfigUpdates = [];
            const utentiConfigParams = [];
    
            if (user.cognome !== undefined) {
                utentiConfigUpdates.push("cognome = ?");
                utentiConfigParams.push(user.cognome);
            }
            if (user.nome !== undefined) {
                utentiConfigUpdates.push("nome = ?");
                utentiConfigParams.push(user.nome);
            }
            if (user.avatar !== undefined) {
                utentiConfigUpdates.push("avatar = ?");
                utentiConfigParams.push(user.avatar);
            }
            if (user.flagDueFattori !== undefined) {
                utentiConfigUpdates.push("flg2fatt = ?");
                utentiConfigParams.push(user.flagDueFattori);
            }
            if (user.codiceLingua !== undefined) {
                utentiConfigUpdates.push("codlingua = ?");
                utentiConfigParams.push(user.codiceLingua);
            }
            if (user.cellulare !== undefined) {
                utentiConfigUpdates.push("cellulare = ?");
                utentiConfigParams.push(user.cellulare);
            }
            if (user.flagSuper !== undefined) {
                utentiConfigUpdates.push("flgsuper = ?");
                utentiConfigParams.push(user.flagSuper);
            }
            if (user.paginaDefault !== undefined) {
                utentiConfigUpdates.push("pagdef = ?");
                utentiConfigParams.push(user.paginaDefault);
            }
            if (user.jsonMetadata !== undefined) {
                utentiConfigUpdates.push("json_metadata = ?");
                utentiConfigParams.push(user.jsonMetadata);
            }
    
            if (utentiConfigUpdates.length > 0) {
                const queryUtentiConfig = `UPDATE UTENTI_CONFIG SET ${utentiConfigUpdates.join(", ")} WHERE CODUTE = ?`;
                utentiConfigParams.push(codiceUtente);
                await Orm.execute(this.accessiOptions.databaseOptions, queryUtentiConfig, utentiConfigParams);
            }
        } catch (error) {
            throw error;
        }
    }
    

    async deleteUser(codiceCliente: number): Promise<void> {
        try {
            const query = `UPDATE UTENTI SET STAREG = ? WHERE CODUTE = ?`;
            await Orm.execute(this.accessiOptions.databaseOptions, query, [StatoRegistrazione.DELETE, codiceCliente]);
        } catch (error) {
            throw error;
        }
    }

    public async setGdpr(codiceUtente: number) {
        try {
            let query = ` UPDATE OR INSERT UTENTI_GDPR SET CODUTE = ?, GDPR = ? `;
            let params = [codiceUtente, true];
            let result = await Orm.execute(this.accessiOptions.databaseOptions, query, params);
            return result;
        } catch (error) {
            throw error;
        }
    }

}

