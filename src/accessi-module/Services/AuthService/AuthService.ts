import { Orm } from "../../../Orm";
import { CryptUtilities, RestUtilities } from "../../../Utilities";
import { AccessiOptions } from "../../AccessiModule";
import { StatoRegistrazione } from "../../Dtos/StatoRegistrazione";
import { Inject, Injectable } from "@nestjs/common";
import { UserService } from "../UserService/UserService";
import { PermissionService } from "../PermissionService/PermissionService";
import { LoginRequest } from "../../Dtos/LoginRequest";
import { LoginResponse } from "../../Dtos/LoginResponse";

@Injectable()
export class AuthService {

    constructor(
        private userService: UserService,
        private permissionService: PermissionService,
        @Inject('ACCESSI_OPTIONS') private readonly accessiOptions: AccessiOptions
    ) { }

    async login(request: LoginRequest): Promise<LoginResponse> {


        if (this.accessiOptions.mockDemoUser && request.email.toLowerCase() === "demo") return this.getDemoUser();
        if (this.accessiOptions.mockDemoUser && request.email.toLowerCase() === "admin") return this.getAdminUser();

        const passwordCifrata = CryptUtilities.encrypt(request.password, this.accessiOptions.encryptionKey);

        // Recupera l'utente dal database
        const utente = await this.userService.getUserByEmail(request.email.toLowerCase());
        if (!utente) throw new Error("Nome utente o password errata!");

        // Verifica lo stato della registrazione
        switch (utente.statoRegistrazione) {
            case undefined:
                throw new Error("Struttura dati compromessa: Stato Registrazione inesistente.");
            case StatoRegistrazione.BLOCC:
            case StatoRegistrazione.DELETE:
                throw new Error("Utente non abilitato");
            case StatoRegistrazione.INVIO:
                throw new Error("Rinnovo password necessario.");
        }

        if (utente.statoRegistrazione !== StatoRegistrazione.CONF) {
            throw new Error(`Errore generico. Stato di registrazione non valido: ${utente.statoRegistrazione}.`);
        }

        // Verifica la password
        const isPasswordValid = await this.verifyPassword(utente.codiceUtente, passwordCifrata);
        if (!isPasswordValid) throw new Error("Nome utente o password errata!");

        const today = new Date();
        const targetDate = new Date(utente.dataScadenzaPassword);

        if (today >= targetDate) {
            throw new Error("Password scaduta!");
        }

        // Recupera le abilitazioni
        const abilitazioni = await this.permissionService.getAbilitazioniMenu(utente.codiceUtente, utente.flagSuper);

        // Recupera i filtri
        const filtri = await this.userService.getUserFilters(utente.codiceUtente);

        const updateLastAccessDateQuery = "UPDATE UTENTI SET DATLASTLOGIN = CURRENT_TIMESTAMP WHERE CODUTE = ?";
        await Orm.query(this.accessiOptions.databaseOptions, updateLastAccessDateQuery, [utente.codiceUtente]);

        const extensionFields: any[] = [];
        this.accessiOptions.extensionFieldsOptions.forEach(async (ext) => {
            extensionFields.push(
                await Orm.query(ext.databaseOptions, `SELECT ${ext.tableFields.join(",")} FROM ${ext.tableName} WHERE ${ext.tableJoinFieldName} = ?`, [utente.codiceUtente])
            );
        });

        return { utente, filtri, abilitazioni, extensionFields };
    }

    public async setPassword(codiceUtente: string, nuovaPassword: string) {
        try {
            const query = `UPDATE OR INSERT INTO UTENTI_PWD (CODUTE, PWD) VALUES (?, ?)`;
            const hashedPassword = CryptUtilities.encrypt(nuovaPassword, this.accessiOptions.encryptionKey);

            return await Orm.execute(this.accessiOptions.databaseOptions, query, [codiceUtente, hashedPassword]);
        } catch (error) {
            throw error;
        }
    }

    async verifyPassword(codiceUtente: string, passwordCifrata: string): Promise<boolean> {
        const query = `SELECT PWD AS password FROM UTENTI_PWD WHERE CODUTE = ?`;
        const result = await Orm.query(this.accessiOptions.databaseOptions, query, [codiceUtente])
            .then(results => results.map(RestUtilities.convertKeysToCamelCase)) as { password: string }[];

        return result.length > 0 && result[0].password === passwordCifrata;
    }


    async getAdminUser(): Promise<LoginResponse> {

        const abilitazioni = await this.permissionService.getAbilitazioniMenu("6789", true);
        const filtri = await this.userService.getUserFilters("6789");
        return {
            utente: {
                codiceUtente: "6789",
                email: "admin",
                statoRegistrazione: StatoRegistrazione.CONF,
                cognome: "Admin",
                nome: "Admin",
                flagGdpr: true,
                avatar: "/path/to/avatar.jpg",
                flagDueFattori: false,
                codiceLingua: "IT",
                cellulare: "+391234567890",
                flagSuper: true,
                paginaDefault: "/home",
                roles: [],
                permissions: []
            },
            filtri,
            abilitazioni
        };
    }

    getDemoUser(): LoginResponse {
        return {
            utente: {
                codiceUtente: "12345",
                email: "jdoe",
                statoRegistrazione: StatoRegistrazione.CONF,
                cognome: "Doe",
                nome: "John",
                flagGdpr: true,
                avatar: "/path/to/avatar.jpg",
                flagDueFattori: false,
                codiceLingua: "IT",
                cellulare: "+391234567890",
                flagSuper: false,
                paginaDefault: "/home",
                roles: [],
                permissions: []
            },
            filtri: null,
            abilitazioni: []
        };
    }


    public async confirmResetPassword(token: string, newPassword: string): Promise<void> {
        try {
            // Controlliamo se il token esiste
            const result = await Orm.query(
                this.accessiOptions.databaseOptions,
                "SELECT CODUTE FROM UTENTI WHERE KEYREG = ?",
                [token]
            );

            if (result.length === 0) {
                throw new Error("Token non valido o già usato.");
            }

            // Hashiamo la nuova password
            const hashedPassword = CryptUtilities.encrypt(newPassword, this.accessiOptions.encryptionKey);

            // Aggiorniamo la password e rimuoviamo il token di reset
            await Orm.query(
                this.accessiOptions.databaseOptions,
                "UPDATE UTENTI SET KEYREG = NULL, STAREG = ? WHERE CODUTE = ?",
                [StatoRegistrazione.CONF, result[0].CODUTE]
            );

            await Orm.query(
                this.accessiOptions.databaseOptions,
                "UPDATE OR INSERT INTO UTENTI_PWD (CODUTE, PWD) VALUES (?, ?)",
                [result[0].CODUTE, hashedPassword]
            );
        } catch (error) {
            throw error;
        }
    }
}
