import { autobind } from "../../autobind";
import { Orm } from "../../Orm";
import { RestUtilities } from "../../Utilities";
import { AccessiOptions } from "../AccessiModule";
import { UserQueryResult } from "../models/QueryResults/UserQueryResult";
import { StatoRegistrazione } from "../models/StatoRegistrazione";
import { IFiltriUtente, IUser, IUserService } from "./IUserService";
import nodemailer from 'nodemailer';

@autobind
export class UserService implements IUserService {




    constructor(private accessiOptions: AccessiOptions) { }

    async getUsers(): Promise<UserQueryResult[]> {
        try {
            const query = ` 
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
                G.JSON_METADATA as json_metadata
            FROM UTENTI U INNER JOIN UTENTI_CONFIG G ON U.CODUTE = G.CODUTE  
            ORDER BY U.CODUTE`;

            const result = await Orm.query(this.accessiOptions.databaseOptions, query, []);
            return result.map(RestUtilities.convertKeysToCamelCase);
        } catch (error) {
            throw error;
        }
    }

    async getCodiceUtenteByUsername(username: string): Promise<{ codiceUtente: string }> {
        try {
            const query = `SELECT CODUTE as codice_utente FROM UTENTI WHERE LOWER(USRNAME) = ?`;
            const result = await Orm.query(this.accessiOptions.databaseOptions, query, [username.trim().toLowerCase()]);
            return result.map(RestUtilities.convertKeysToCamelCase)[0];
        } catch (error) {
            throw error;
        }
    }

    async getUserByUsername(username: string): Promise<IUser | null> {
        const query = `
            SELECT 
                U.CODUTE AS codice_utente, 
                U.USRNAME AS username, 
                U.FLGGDPR AS flag_gdpr,
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

        const utenti = await Orm.query(this.accessiOptions.databaseOptions, query, [username])
            .then(results => results.map(RestUtilities.convertKeysToCamelCase)) as IUser[];

        return utenti.length > 0 ? utenti[0] : null;
    }

    async verifyPassword(codiceUtente: string, passwordCifrata: string): Promise<boolean> {
        const query = `SELECT PWD AS password FROM UTENTI_PWD WHERE CODUTE = ?`;
        const result = await Orm.query(this.accessiOptions.databaseOptions, query, [codiceUtente])
            .then(results => results.map(RestUtilities.convertKeysToCamelCase)) as { password: string }[];

        return result.length > 0 && result[0].password === passwordCifrata;
    }

    async getUserFilters(codiceUtente: string): Promise<IFiltriUtente[]> {
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
            .then(results => results.map(RestUtilities.convertKeysToCamelCase)) as IFiltriUtente[];
    }

    async register(request: IUser): Promise<void> {
        try {
            const queryUtenti = `INSERT INTO UTENTI (USRNAME, STAREG, FLGGDPR) VALUES (?,?,?,?) RETURNING CODUTE`;
            const paramsUtenti = [request.username, request.statoRegistrazione, false];

            const codiceUtente = (await Orm.query(this.accessiOptions.databaseOptions, queryUtenti, paramsUtenti)).CODUTE;
            const queryUtentiConfig = `INSERT INTO UTENTI_CONFIG (CODUTE,COGNOME,NOME,CODLINGUA,FLGSUPER) VALUES (?,?,?,?,?)`;
            const paramsUtentiConfig = [codiceUtente, request.cognome, request.nome, request.codiceLingua, request.flagSuper];

            await this.sendVerificationEmail(request.username, codiceUtente, "");
            await Orm.execute(this.accessiOptions.databaseOptions, queryUtentiConfig, paramsUtentiConfig);
        } catch (error) {
            throw error;
        }
    }

    async sendVerificationEmail(email: string, codiceUtente: string, baseUrl: string) {

        const transporter = nodemailer.createTransport({
            host: 'smtp.example.com',
            port: 587,
            secure: false,
            auth: {
                user: 'tuo@email.com',
                pass: 'tuaPassword'
            }
        });
        const userKey = uuidv4();

        await Orm.query(this.accessiOptions.databaseOptions, "UPDATE UTENTI SET KEYREG = ? WHERE CODUTE = ?", [userKey, codiceUtente]);

        // Creazione dell'URL di verifica
        const verificationUrl = `${baseUrl}/${userKey}`;

        // Configurazione dell'email
        const mailOptions = {
            from: '"Supporto" <noreply@example.com>', // Cambia con il tuo indirizzo email
            to: email,
            subject: 'Verifica la tua email',
            text: `Clicca sul seguente link per verificare il tuo account: ${verificationUrl}`,
            html: `<p>Clicca sul seguente link per verificare il tuo account:</p><a href="${verificationUrl}">${verificationUrl}</a>`
        };

        // Invio dell'email
        await transporter.sendMail(mailOptions);
    }

    async setRegistrazioneConfermata(userKey: string): Promise<void> {
        try {
            const result = await Orm.query(
                this.accessiOptions.databaseOptions,
                "UPDATE UTENTI SET STAREG = ? WHERE KEYREG = ?",
                [StatoRegistrazione.CONF, userKey]
            );

            if (result.affectedRows === 0) {
                throw new Error("Nessun account trovato con la chiave fornita.");
            }

            console.log(`Registrazione confermata per la chiave: ${userKey}`);
        } catch (error) {
            console.error("Errore nell'aggiornamento dello stato di registrazione:", error);
            throw new Error("Errore durante la conferma della registrazione.");
        }
    }

    async updateUser(user: UserQueryResult): Promise<void> {
        try {
            if (!user.codiceUtente) throw new Error("Impossibile aggiornare senza codice utente.");

            const queryUtenti = `
                UPDATE UTENTI 
                SET usrname = ?, flggdpr = ?, datgdpr=?, datins=?, datscapwd=?, stareg=? 
                WHERE CODUTE = ?`;
            const paramsUtenti = [user.username, user.flagGdpr, user.dataGdpr, user.dataInserimento, user.dataScadenzaPassword, user.statoRegistrazione, user.codiceUtente];

            await Orm.execute(this.accessiOptions.databaseOptions, queryUtenti, paramsUtenti);

            const queryUtentiConfig = `
                UPDATE UTENTI_CONFIG 
                SET cognome = ?, nome = ?, avatar=?, flg2fatt=?, codlingua=?, cellulare=?, flgsuper=?, pagdef=?, json_metadata=? 
                WHERE CODUTE = ?`;
            const paramsUtentiConfig = [user.cognome, user.nome, user.avatar, user.flagDueFattori, user.codiceLingua, user.cellulare, user.flagSuper, user.pagDef, user.jsonMetadata, user.codiceUtente];

            await Orm.execute(this.accessiOptions.databaseOptions, queryUtentiConfig, paramsUtentiConfig);
        } catch (error) {
            throw error;
        }
    }

    async deleteUser(codiceCliente: string): Promise<void> {
        try {
            const query = `DELETE FROM UTENTI WHERE CODUTE = ?`;
            await Orm.execute(this.accessiOptions.databaseOptions, query, [codiceCliente]);
        } catch (error) {
            throw error;
        }
    }

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
}
function uuidv4() {
    throw new Error("Function not implemented.");
}

