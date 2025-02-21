import { inject, injectable } from "inversify";
import { Orm } from "../../../Orm";
import { CryptUtilities, RestUtilities } from "../../../Utilities";
import { AccessiOptions } from "../../AccessiModule";
import { StatoRegistrazione } from "../../models/StatoRegistrazione";
import { IAuthService, ILoginResult, LoginRequest } from "./IAuthService";
import { IUserService } from "../UserService/IUserService";
import { IPermissionService } from "../PermissionService/IPermissionService";
import { IEmailService } from "../EmailService/IEmailService";

@injectable()
export class AuthService implements IAuthService {

    constructor(
        @inject("IUserService") private userService: IUserService,
        @inject("IPermissionService") private permissionService: IPermissionService,
        @inject("IEmailService") private emailService: IEmailService,
        @inject("IAuthService") private authService: IAuthService,
        @inject("AccessiOptions") private accessiOptions: AccessiOptions
    ) {}
    public getOptions(): AccessiOptions {
        return this.accessiOptions;
    }

    async login(request: LoginRequest): Promise<ILoginResult> {
        if (this.accessiOptions.mockDemoUser && request.username.toLowerCase() === "demo") return this.getDemoUser();
        if (this.accessiOptions.mockDemoUser && request.username.toLowerCase() === "admin") return this.getAdminUser();

        const passwordCifrata = CryptUtilities.encrypt(request.password, this.accessiOptions.encryptionKey);

        // Recupera l'utente dal database
        const utente = await this.userService.getUserByUsername(request.username.toLowerCase());
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
        const isPasswordValid = await this.authService.verifyPassword(utente.codiceUtente, passwordCifrata);
        if (!isPasswordValid) throw new Error("Nome utente o password errata!");

        // Recupera le abilitazioni
        const abilitazioni = await this.permissionService.getAbilitazioniMenu(utente.codiceUtente, utente.flagSuper);

        // Recupera i filtri
        const filtri = await this.userService.getUserFilters(utente.codiceUtente);

        return { utente, filtri, abilitazioni };
    }



    public async setPassword(codiceUtente: string, nuovaPassword: string) {
        try {
            const query = `UPDATE OR INSERT INTO UTENTI_PWD (CODUTE, PWD) VALUES (?, ?)`;
            return await Orm.execute(this.accessiOptions.databaseOptions, query, [codiceUtente, nuovaPassword]);
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


    getAdminUser(): ILoginResult {
        return {
            utente: {
                codiceUtente: "6789",
                username: "admin",
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
            },
            filtri: null,
            abilitazioni: []
        };
    }

    getDemoUser(): ILoginResult {
        return {
            utente: {
                codiceUtente: "12345",
                username: "jdoe",
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
            },
            filtri: null,
            abilitazioni: []
        };
    }
}
